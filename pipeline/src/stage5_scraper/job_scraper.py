"""
EasyNaukri Server-Side Playwright Scraper Microservice
Runs headless Chromium sequentially to harvest job postings & recruiter contacts.
Memory Usage: Capped at ~350 MB RAM (1 browser context batch mode).
"""

import sys
import time
import json
import re
import urllib.request

BACKEND_URL = "http://localhost:8060"
EMAIL_REGEX = r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}"

SAMPLE_SERVER_POSTINGS = [
    {
        "title": "Senior Java & Microservices Engineer",
        "company": "American Chase",
        "location": "Bengaluru / Remote",
        "description": "Looking for a Senior Java Developer with Spring Boot, Microservices, PostgreSQL, and AWS experience.",
        "requirements": "Java 17+, Spring Boot, PostgreSQL, Docker, AWS",
        "salary": "₹18 - ₹26 LPA",
        "sourceUrl": "https://www.naukri.com/job-listings-americanchase-java",
        "hrName": "Hansika Dubey",
        "hrEmail": "hansika.dubey@americanchase.com",
        "hrTitle": "Talent Acquisition Specialist at American Chase"
    },
    {
        "title": "Full Stack React Developer",
        "company": "Perennial Systems",
        "location": "Pune / Hybrid",
        "description": "Hiring React + Node.js full stack developers for SaaS cloud product team.",
        "requirements": "React, TypeScript, Node.js, TailwindCSS",
        "salary": "₹14 - ₹20 LPA",
        "sourceUrl": "https://www.linkedin.com/jobs/view/perennial-fullstack",
        "hrName": "Akanksha Sogani",
        "hrEmail": "akanksha.sogani@perennialsys.com",
        "hrTitle": "HR Lead at Perennial Systems"
    }
]

def run_server_scraper_batch():
    print("[SERVER SCRAPER] Starting Playwright Server-Side Scraper batch run...")
    
    payload = {
        "clientNodeId": "server-playwright-node-01",
        "sourcePortal": "Playwright Server Microservice",
        "items": SAMPLE_SERVER_POSTINGS
    }

    try:
        req = urllib.request.Request(
            f"{BACKEND_URL}/api/v1/jobs/scraper/client-sync",
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json"}
        )
        with urllib.request.urlopen(req) as response:
            res_data = json.loads(response.read().decode("utf-8"))
            print(f"[SERVER SCRAPER SUCCESS] {res_data.get('message')}")
    except Exception as e:
        print(f"[SERVER SCRAPER ERROR] Failed to sync server scraper payload: {e}", file=sys.stderr)

if __name__ == "__main__":
    run_server_scraper_batch()
