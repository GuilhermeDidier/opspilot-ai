/** Maps a pipeline-card tag to one of the four accent palettes in styles.css. */
export function tagClass(tag: string): "green" | "blue" | "violet" | "amber" {
  if (["High intent", "Priority 1", "Low risk", "Validate", "Audit"].includes(tag)) {
    return "green";
  }
  if (["SaaS", "Gmail", "HubSpot", "Zendesk", "Slack", "Sheets", "ERP"].includes(tag)) {
    return "blue";
  }
  if (["Expansion", "Manager", "Finance", "Batch"].includes(tag)) {
    return "violet";
  }
  return "amber";
}
