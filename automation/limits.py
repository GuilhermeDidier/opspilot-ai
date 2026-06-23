"""Input bounds for the public, unauthenticated AI endpoint.

The live demo accepts free text from anonymous visitors and forwards it to the
Claude API, so every field is sanitized and capped before it can inflate token
cost. These limits are mirrored in the frontend (frontend/src/limits.ts) — keep
the two in sync.
"""

MAX_COMPANY_LEN = 200
MAX_REQUEST_LEN = 4000


class PayloadTooLarge(ValueError):
    """Raised when visitor input exceeds the published limits."""


def clean_recommendation_payload(data):
    """Return a bounded ``{"company", "request"}`` dict from raw request data.

    Only the two known fields survive, so arbitrary extra keys can never be
    smuggled into the model prompt (and thus can't be used to drive up token
    cost). Raises :class:`PayloadTooLarge` if either field is longer than its
    cap.
    """
    # DRF may parse a JSON list/primitive into something without ``.get``.
    if not isinstance(data, dict):
        data = {}

    company = str(data.get("company", "") or "").strip()
    request_text = str(data.get("request", "") or "").strip()

    if len(company) > MAX_COMPANY_LEN:
        raise PayloadTooLarge(
            f"Company is too long ({len(company)} chars; max {MAX_COMPANY_LEN})."
        )
    if len(request_text) > MAX_REQUEST_LEN:
        raise PayloadTooLarge(
            f"Request is too long ({len(request_text)} chars; max {MAX_REQUEST_LEN})."
        )

    return {"company": company, "request": request_text}
