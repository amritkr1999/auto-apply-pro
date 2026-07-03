import os
import json
import logging
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)

# Telemetry log file path
LOG_DIR = Path("./logs")
TELEMETRY_FILE = LOG_DIR / "llm_usage.jsonl"

# Gemini Pricing rates per 1,000,000 tokens
GEMINI_PRICING = {
    "gemini-1.5-flash": {
        "input_standard": 0.075,  # <= 128k context
        "output_standard": 0.30,
        "input_long": 0.15,       # > 128k context
        "output_long": 0.60
    },
    "gemini-1.5-pro": {
        "input_standard": 3.50,
        "output_standard": 10.50,
        "input_long": 7.00,
        "output_long": 21.00
    }
}

# Fallback mapping from local models to equivalent Gemini models for production cost estimation
MODEL_MAPPINGS = {
    "deepseek-ocr": "gemini-1.5-flash",
    "llama3.1": "gemini-1.5-flash",
    "ollama3.1": "gemini-1.5-flash",
    "deepseek-vision": "gemini-1.5-flash"
}

def get_pricing_for_model(model_name: str) -> Dict[str, float]:
    """Helper to find pricing config for a model."""
    name_lower = model_name.lower()
    for key, val in GEMINI_PRICING.items():
        if key in name_lower:
            return val
    # If it's a local model, check if we map it to a Gemini model for cost estimation
    for local_key, gemini_key in MODEL_MAPPINGS.items():
        if local_key in name_lower:
            return GEMINI_PRICING[gemini_key]
    # Default fallback to Gemini 1.5 Flash rates
    return GEMINI_PRICING["gemini-1.5-flash"]

def estimate_tokens(text: str) -> int:
    """Fallback token estimation: ~4 characters per token."""
    if not text:
        return 0
    return max(1, len(text) // 4)

def record_llm_call(
    model: str,
    purpose: str,
    prompt_text: Optional[str] = None,
    response_text: Optional[str] = None,
    input_tokens: Optional[int] = None,
    output_tokens: Optional[int] = None,
    execution_time: float = 0.0,
    success: bool = True,
    error_message: Optional[str] = None
) -> Dict[str, Any]:
    """Records an LLM call telemetry entry and calculates its production costs."""
    
    # 1. Resolve token counts
    if input_tokens is None:
        input_tokens = estimate_tokens(prompt_text or "")
    if output_tokens is None:
        output_tokens = estimate_tokens(response_text or "")
        
    total_tokens = input_tokens + output_tokens
    
    # 2. Calculate production costs (Gemini rates)
    pricing = get_pricing_for_model(model)
    
    # Standard rates (<= 128k context)
    input_rate = pricing["input_standard"]
    output_rate = pricing["output_standard"]
    
    # Long context rates (> 128k context)
    if input_tokens > 128000:
        input_rate = pricing["input_long"]
        output_rate = pricing["output_long"]
        
    input_cost = (input_tokens / 1_000_000) * input_rate
    output_cost = (output_tokens / 1_000_000) * output_rate
    estimated_cost = input_cost + output_cost
    
    entry = {
        "timestamp": datetime.utcnow().isoformat(),
        "model": model,
        "purpose": purpose,
        "input_tokens": input_tokens,
        "output_tokens": output_tokens,
        "total_tokens": total_tokens,
        "estimated_cost": round(estimated_cost, 6),
        "execution_time_seconds": round(execution_time, 3),
        "success": success,
        "error_message": error_message
    }
    
    # Save entry to JSONL log file
    try:
        # Resolve absolute path for reliability
        target_dir = Path("/Users/amrit/Development/work/auto-apply-pro/pipeline/logs")
        target_dir.mkdir(exist_ok=True)
        with open(target_dir / "llm_usage.jsonl", "a") as f:
            f.write(json.dumps(entry) + "\n")
    except Exception as e:
        logger.error(f"Failed to write to telemetry log file: {e}")
        
    return entry

def get_aggregated_stats() -> Dict[str, Any]:
    """Reads the JSONL log file and calculates aggregated token usage and production cost estimates."""
    telemetry_file_path = Path("/Users/amrit/Development/work/auto-apply-pro/pipeline/logs/llm_usage.jsonl")
    if not telemetry_file_path.exists():
        return {
            "total_requests": 0,
            "total_input_tokens": 0,
            "total_output_tokens": 0,
            "total_tokens": 0,
            "total_estimated_cost": 0.0,
            "success_rate": 100.0,
            "breakdown_by_model": {},
            "breakdown_by_purpose": {},
            "production_cost_projections": {
                "gemini_1_5_flash": 0.0,
                "gemini_1_5_pro": 0.0
            },
            "recent_calls": []
        }
        
    total_requests = 0
    successful_requests = 0
    total_input_tokens = 0
    total_output_tokens = 0
    total_estimated_cost = 0.0
    
    breakdown_by_model = {}
    breakdown_by_purpose = {}
    
    # Projections if all successful requests were run entirely on flash or pro
    projected_cost_flash = 0.0
    projected_cost_pro = 0.0
    
    recent_calls = []
    
    try:
        with open(telemetry_file_path, "r") as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                try:
                    entry = json.loads(line)
                    total_requests += 1
                    if entry.get("success", True):
                        successful_requests += 1
                        
                    in_t = entry.get("input_tokens", 0)
                    out_t = entry.get("output_tokens", 0)
                    total_input_tokens += in_t
                    total_output_tokens += out_t
                    total_estimated_cost += entry.get("estimated_cost", 0.0)
                    
                    # Model breakdown
                    model = entry.get("model", "unknown")
                    if model not in breakdown_by_model:
                        breakdown_by_model[model] = {"calls": 0, "input_tokens": 0, "output_tokens": 0, "cost": 0.0}
                    breakdown_by_model[model]["calls"] += 1
                    breakdown_by_model[model]["input_tokens"] += in_t
                    breakdown_by_model[model]["output_tokens"] += out_t
                    breakdown_by_model[model]["cost"] += entry.get("estimated_cost", 0.0)
                    
                    # Purpose breakdown
                    purpose = entry.get("purpose", "unknown")
                    if purpose not in breakdown_by_purpose:
                        breakdown_by_purpose[purpose] = {"calls": 0, "input_tokens": 0, "output_tokens": 0, "cost": 0.0}
                    breakdown_by_purpose[purpose]["calls"] += 1
                    breakdown_by_purpose[purpose]["input_tokens"] += in_t
                    breakdown_by_purpose[purpose]["output_tokens"] += out_t
                    breakdown_by_purpose[purpose]["cost"] += entry.get("estimated_cost", 0.0)
                    
                    # Projections
                    # Flash
                    flash_in_rate = GEMINI_PRICING["gemini-1.5-flash"]["input_standard"] if in_t <= 128000 else GEMINI_PRICING["gemini-1.5-flash"]["input_long"]
                    flash_out_rate = GEMINI_PRICING["gemini-1.5-flash"]["output_standard"] if out_t <= 128000 else GEMINI_PRICING["gemini-1.5-flash"]["output_long"]
                    projected_cost_flash += (in_t / 1_000_000) * flash_in_rate + (out_t / 1_000_000) * flash_out_rate
                    
                    # Pro
                    pro_in_rate = GEMINI_PRICING["gemini-1.5-pro"]["input_standard"] if in_t <= 128000 else GEMINI_PRICING["gemini-1.5-pro"]["input_long"]
                    pro_out_rate = GEMINI_PRICING["gemini-1.5-pro"]["output_standard"] if out_t <= 128000 else GEMINI_PRICING["gemini-1.5-pro"]["output_long"]
                    projected_cost_pro += (in_t / 1_000_000) * pro_in_rate + (out_t / 1_000_000) * pro_out_rate
                    
                    recent_calls.append(entry)
                except Exception as entry_err:
                    logger.warning(f"Error parsing log entry: {entry_err}")
    except Exception as e:
        logger.error(f"Error reading telemetry file: {e}")
        
    success_rate = (successful_requests / total_requests * 100) if total_requests > 0 else 100.0
    
    # Sort and cap recent calls (e.g. latest 20)
    recent_calls.reverse()
    recent_calls = recent_calls[:20]
    
    return {
        "total_requests": total_requests,
        "total_input_tokens": total_input_tokens,
        "total_output_tokens": total_output_tokens,
        "total_tokens": total_input_tokens + total_output_tokens,
        "total_estimated_cost": round(total_estimated_cost, 4),
        "success_rate": round(success_rate, 2),
        "breakdown_by_model": breakdown_by_model,
        "breakdown_by_purpose": breakdown_by_purpose,
        "production_cost_projections": {
            "gemini_1_5_flash": round(projected_cost_flash, 4),
            "gemini_1_5_pro": round(projected_cost_pro, 4)
        },
        "recent_calls": recent_calls
    }
