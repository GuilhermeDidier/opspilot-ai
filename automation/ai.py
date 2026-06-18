import json
import os


DEFAULT_MODEL = os.getenv("OPENAI_MODEL", "gpt-5.5")


def openai_enabled():
    return bool(os.getenv("OPENAI_API_KEY"))


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


def generate_recommendation(workflow, payload):
    if not openai_enabled():
        return fallback_recommendation(workflow, payload)

    from openai import OpenAI

    client = OpenAI()
    prompt = {
        "workflow": {
            "key": workflow.key,
            "title": workflow.title,
            "description": workflow.description,
        },
        "input": payload,
        "required_json_schema": {
            "title": "string",
            "body": "string",
            "confidence": "integer 0-100",
            "risk": "Low | Medium | High",
            "time_saved": "integer minutes",
            "next_action": "string",
            "evidence": ["string", "string", "string"],
            "draft": "string",
        },
    }

    response = client.responses.create(
        model=DEFAULT_MODEL,
        input=[
            {
                "role": "system",
                "content": (
                    "You generate concise business automation recommendations for a human-in-the-loop operations dashboard. "
                    "Return only valid JSON matching the requested schema."
                ),
            },
            {"role": "user", "content": json.dumps(prompt)},
        ],
    )

    try:
        data = json.loads(response.output_text)
    except (json.JSONDecodeError, AttributeError):
        data = fallback_recommendation(workflow, payload)
        data["provider"] = "fallback"
        return data

    data["confidence"] = max(0, min(int(data.get("confidence", workflow.confidence)), 100))
    data["time_saved"] = max(1, int(data.get("time_saved", 20)))
    data["risk"] = data.get("risk") if data.get("risk") in {"Low", "Medium", "High"} else "Medium"
    data["evidence"] = data.get("evidence") or []
    data["provider"] = "openai"
    return data
