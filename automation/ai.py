import json
import os


DEFAULT_MODEL = os.getenv("ANTHROPIC_MODEL", "claude-opus-4-8")


def claude_enabled():
    return bool(os.getenv("ANTHROPIC_API_KEY"))


def fallback_recommendation(workflow, payload):
    source_text = " ".join(str(value) for value in payload.values()) if payload else workflow.description
    lowered = source_text.lower()

    risk = "High" if any(word in lowered for word in ["urgent", "angry", "churn", "switch", "refund"]) else "Medium"
    if workflow.key == "revenue" and any(word in lowered for word in ["budget", "demo", "pricing", "enterprise"]):
        risk = "Low"

    confidence = min(workflow.confidence, 90 if risk == "High" else 88)
    time_saved = 34 if workflow.key == "revenue" else 26 if workflow.key == "support" else 22
    next_action = {
        "revenue": "Draft a personalized discovery reply and create a same-day follow-up task.",
        "support": "Escalate to the account owner with a suggested response and customer context.",
        "documents": "Extract structured fields, hold exceptions, and request human approval before export.",
    }.get(workflow.key, "Route the recommendation for human approval.")

    return {
        "title": f"AI recommendation for {workflow.title}",
        "body": f"{workflow.title} processed the request and prepared a controlled automation action.",
        "confidence": confidence,
        "risk": risk,
        "time_saved": time_saved,
        "next_action": next_action,
        "evidence": [
            "Input matched the selected workflow pattern",
            "Action requires human approval before external sync",
            "Audit trail will capture the reviewer decision",
        ],
        "draft": build_fallback_draft(workflow, payload),
        "provider": "fallback",
    }


def build_fallback_draft(workflow, payload):
    company = payload.get("company") or payload.get("customer") or "the customer"
    if workflow.key == "revenue":
        return (
            f"Hi {company}, thanks for the context. Based on your request, I would start with a short discovery call, "
            "map the workflow, and deliver a controlled AI automation with approval steps before anything is sent externally."
        )
    if workflow.key == "support":
        return (
            f"Hi {company}, I reviewed the issue and I am escalating it with the relevant account context. "
            "The next reply should acknowledge the problem, confirm ownership, and provide a concrete resolution path."
        )
    return (
        f"Hi {company}, I reviewed the document flow. The clean records can be prepared for export, while exceptions should "
        "stay in review with field-level evidence attached."
    )


RECOMMENDATION_SCHEMA = {
    "type": "object",
    "properties": {
        "title": {"type": "string"},
        "body": {"type": "string"},
        "confidence": {"type": "integer"},
        "risk": {"type": "string", "enum": ["Low", "Medium", "High"]},
        "time_saved": {"type": "integer"},
        "next_action": {"type": "string"},
        "evidence": {"type": "array", "items": {"type": "string"}},
        "draft": {"type": "string"},
    },
    "required": [
        "title",
        "body",
        "confidence",
        "risk",
        "time_saved",
        "next_action",
        "evidence",
        "draft",
    ],
    "additionalProperties": False,
}

SYSTEM_PROMPT = (
    "You generate concise business automation recommendations for a human-in-the-loop "
    "operations dashboard. Every action you suggest is reviewed and approved by a human "
    "before it touches an external system. Be specific, ground the recommendation in the "
    "provided workflow context, and keep the draft reply short and professional."
)


def generate_recommendation(workflow, payload):
    if not claude_enabled():
        return fallback_recommendation(workflow, payload)

    import anthropic

    prompt = {
        "workflow": {
            "key": workflow.key,
            "title": workflow.title,
            "description": workflow.description,
        },
        "input": payload,
    }

    try:
        client = anthropic.Anthropic()
        response = client.messages.create(
            model=DEFAULT_MODEL,
            max_tokens=1024,
            system=SYSTEM_PROMPT,
            messages=[{"role": "user", "content": json.dumps(prompt)}],
            output_config={"format": {"type": "json_schema", "schema": RECOMMENDATION_SCHEMA}},
        )
        text = next(block.text for block in response.content if block.type == "text")
        data = json.loads(text)
    except (anthropic.APIError, json.JSONDecodeError, StopIteration, ValueError):
        data = fallback_recommendation(workflow, payload)
        data["provider"] = "fallback"
        return data

    data["confidence"] = max(0, min(int(data.get("confidence", workflow.confidence)), 100))
    data["time_saved"] = max(1, int(data.get("time_saved", 20)))
    data["risk"] = data.get("risk") if data.get("risk") in {"Low", "Medium", "High"} else "Medium"
    data["evidence"] = data.get("evidence") or []
    data["provider"] = "claude"
    return data
