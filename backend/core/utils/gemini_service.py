"""
Gemini AI service for the LiLy Stoica platform.
Uses the Gemini 2.0 Flash model via REST API.
"""
import logging
import requests

logger = logging.getLogger("core")

GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"


def call_gemini(
    user_message: str,
    system_prompt: str,
    api_key: str,
    max_tokens: int = 512,
) -> tuple[str, int]:
    """
    Call Google Gemini and return (response_text, tokens_used).
    """
    payload = {
        "contents": [
            {
                "role": "user",
                "parts": [{"text": f"{system_prompt}\n\nUser: {user_message}"}],
            }
        ],
        "generationConfig": {
            "maxOutputTokens": max_tokens,
            "temperature": 0.7,
        },
    }

    response = requests.post(
        f"{GEMINI_API_URL}?key={api_key}",
        json=payload,
        timeout=30,
    )
    response.raise_for_status()
    data = response.json()

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
    """Send a simple test prompt to verify the API key works."""
    text, _ = call_gemini(
        user_message="Hello, please respond with exactly: Connection successful.",
        system_prompt="You are a test assistant. Respond briefly.",
        api_key=api_key,
        max_tokens=50,
    )
    return text.strip() or "Connection successful."
