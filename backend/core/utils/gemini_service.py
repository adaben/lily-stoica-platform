"""
Gemini AI Service for the LiLy Stoica platform.

Uses Vertex AI endpoint (same as SNF Gateway Hub):
- Model: gemini-2.0-flash
- Auth: x-goog-api-key header
- Endpoint: us-central1-aiplatform.googleapis.com
"""
import json
import logging
import requests

from typing import Tuple

logger = logging.getLogger("core")

VERTEX_URL = (
    "https://us-central1-aiplatform.googleapis.com/v1"
    "/projects/perennix-experiments/locations/us-central1"
    "/publishers/google/models/gemini-2.0-flash:generateContent"
)


def call_gemini(
    user_message: str,
    system_prompt: str,
    api_key: str,
    max_tokens: int = 512,
) -> Tuple[str, int]:
    """
    Call Gemini 2.0 Flash via Vertex AI and return (response_text, tokens_used).
    """
    payload = {
        "contents": [
            {
                "role": "user",
                "parts": [{"text": f"{system_prompt}\n\nUser: {user_message}"}],
            }
        ],
        "generationConfig": {
            "temperature": 0.7,
            "topK": 40,
            "topP": 0.95,
            "maxOutputTokens": max_tokens,
        },
    }

    headers = {
        "Content-Type": "application/json",
        "x-goog-api-key": api_key,
    }

    response = requests.post(
        VERTEX_URL, json=payload, headers=headers, timeout=30,
    )

    try:
        data = json.loads(response.text)
    except json.JSONDecodeError:
        logger.error("Gemini returned non-JSON: %s", response.text[:500])
        raise RuntimeError(f"Gemini returned non-JSON response (HTTP {response.status_code})")

    if not response.ok:
        error_msg = data.get("error", {}).get("message", response.text[:300])
        logger.error("Gemini API error %s: %s", response.status_code, error_msg)
        raise RuntimeError(f"Gemini API error ({response.status_code}): {error_msg}")

    text = ""
    tokens = 0

    candidates = data.get("candidates", [])
    if candidates:
        parts = candidates[0].get("content", {}).get("parts", [])
        if parts:
            text = parts[0].get("text", "")

    usage = data.get("usageMetadata", {})
    tokens = usage.get("totalTokenCount", 0)

    return text, tokens


def test_connection(api_key: str) -> str:
    """Send a simple test prompt to verify the Vertex AI key works."""
    text, _ = call_gemini(
        user_message="Hello, please respond with exactly: Connection successful.",
        system_prompt="You are a test assistant. Respond briefly.",
        api_key=api_key,
        max_tokens=50,
    )
    return text.strip() or "Connection successful."
