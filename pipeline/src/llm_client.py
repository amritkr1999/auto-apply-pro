import time
import json
import logging
import aiohttp
from typing import Optional, List, Dict, Any
from src.config import Settings
from src.telemetry import record_llm_call

logger = logging.getLogger(__name__)

async def call_llm(
    config: Settings,
    session: aiohttp.ClientSession,
    model: str,
    purpose: str,
    prompt: str,
    system_prompt: Optional[str] = None,
    json_format: bool = False,
    temperature: float = 0.7,
    images: Optional[List[str]] = None
) -> str:
    """
    Unified LLM call routing.
    If config.gemini_api_key is set and the model contains 'gemini', routes to Gemini API.
    Otherwise, routes to the local Ollama instance.
    """
    start_time = time.time()
    
    # 1. Determine if we route to Gemini API
    # Accept if API key exists and model name contains 'gemini'
    is_gemini = bool(getattr(config, "gemini_api_key", None)) and "gemini" in model.lower()
    
    if is_gemini:
        # Route to Google Gemini REST API
        api_key = config.gemini_api_key
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
        
        # Build contents
        parts = []
        if images:
            for img_b64 in images:
                parts.append({
                    "inlineData": {
                        "mimeType": "image/png",
                        "data": img_b64
                    }
                })
        # Add the main user prompt
        parts.append({"text": prompt})
        
        contents = [{
            "role": "user",
            "parts": parts
        }]
        
        payload: Dict[str, Any] = {
            "contents": contents
        }
        
        # Add system prompt if present
        if system_prompt:
            payload["systemInstruction"] = {
                "parts": [{"text": system_prompt}]
            }
            
        # Add generation configuration
        gen_config: Dict[str, Any] = {
            "temperature": temperature
        }
        if json_format:
            gen_config["responseMimeType"] = "application/json"
            
        payload["generationConfig"] = gen_config
        
        logger.info(f"Routing request to live Gemini API ({model}) for purpose: {purpose}")
        
        try:
            async with session.post(url, json=payload, timeout=config.ollama_timeout_seconds) as resp:
                execution_time = time.time() - start_time
                if resp.status != 200:
                    error_text = await resp.text()
                    logger.error(f"Gemini API returned status {resp.status}: {error_text}")
                    record_llm_call(
                        model=model,
                        purpose=purpose,
                        prompt_text=prompt + (system_prompt or ""),
                        response_text=None,
                        execution_time=execution_time,
                        success=False,
                        error_message=f"Gemini API Status {resp.status}: {error_text}"
                    )
                    raise RuntimeError(f"Gemini API returned status {resp.status}: {error_text}")
                    
                data = await resp.json()
                
                # Parse response text
                try:
                    candidates = data.get("candidates", [])
                    if not candidates:
                        raise ValueError("No candidates returned by Gemini API")
                    
                    response_text = candidates[0].get("content", {}).get("parts", [])[0].get("text", "").strip()
                except (IndexError, KeyError, ValueError) as parse_err:
                    logger.error(f"Failed to parse Gemini response structure: {data}")
                    record_llm_call(
                        model=model,
                        purpose=purpose,
                        prompt_text=prompt + (system_prompt or ""),
                        response_text=None,
                        execution_time=execution_time,
                        success=False,
                        error_message=f"Parse failure: {parse_err}"
                    )
                    raise
                
                # Parse token usage metadata
                usage = data.get("usageMetadata", {})
                input_tokens = usage.get("promptTokenCount")
                output_tokens = usage.get("candidatesTokenCount")
                
                # Record telemetry
                record_llm_call(
                    model=model,
                    purpose=purpose,
                    prompt_text=prompt + (system_prompt or ""),
                    response_text=response_text,
                    input_tokens=input_tokens,
                    output_tokens=output_tokens,
                    execution_time=execution_time,
                    success=True
                )
                
                return response_text
                
        except Exception as e:
            execution_time = time.time() - start_time
            logger.error(f"Gemini API request failed: {e}")
            record_llm_call(
                model=model,
                purpose=purpose,
                prompt_text=prompt + (system_prompt or ""),
                response_text=None,
                execution_time=execution_time,
                success=False,
                error_message=str(e)
            )
            raise
            
    else:
        # Route to local Ollama instance
        use_chat = system_prompt is not None and not images
        
        payload: Dict[str, Any] = {
            "model": model,
            "stream": False,
            "options": {
                "temperature": temperature
            }
        }
        if json_format:
            payload["format"] = "json"
            
        if use_chat:
            endpoint = "/api/chat"
            payload["messages"] = [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt}
            ]
        else:
            endpoint = "/api/generate"
            payload["prompt"] = prompt
            if system_prompt:
                payload["system"] = system_prompt
            if images:
                payload["images"] = images
                
        url = f"{config.ollama_base_url}{endpoint}"
        logger.info(f"Routing request to Ollama local instance ({model}) via {endpoint} for purpose: {purpose}")
        
        try:
            async with session.post(url, json=payload, timeout=config.ollama_timeout_seconds) as resp:
                execution_time = time.time() - start_time
                resp.raise_for_status()
                data = await resp.json()
                
                if use_chat:
                    response_text = data.get("message", {}).get("content", "").strip()
                else:
                    response_text = data.get("response", "").strip()
                    
                input_tokens = data.get("prompt_eval_count")
                output_tokens = data.get("eval_count")
                
                # Record telemetry
                record_llm_call(
                    model=model,
                    purpose=purpose,
                    prompt_text=prompt + (system_prompt or ""),
                    response_text=response_text,
                    input_tokens=input_tokens,
                    output_tokens=output_tokens,
                    execution_time=execution_time,
                    success=True
                )
                
                return response_text
                
        except Exception as e:
            execution_time = time.time() - start_time
            logger.error(f"Ollama request failed: {e}")
            record_llm_call(
                model=model,
                purpose=purpose,
                prompt_text=prompt + (system_prompt or ""),
                response_text=None,
                execution_time=execution_time,
                success=False,
                error_message=str(e)
            )
            raise
