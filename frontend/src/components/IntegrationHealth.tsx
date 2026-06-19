const INTEGRATIONS: { name: string; note: string; status: "healthy" | "warning" }[] = [
  { name: "HubSpot", note: "CRM sync ready", status: "healthy" },
  { name: "Gmail", note: "Draft mode only", status: "healthy" },
  { name: "Zendesk", note: "Webhook pending", status: "warning" },
  { name: "Google Sheets", note: "Export queue active", status: "healthy" },
];

export function IntegrationHealth() {
  return (
    <section className="panel">
      <div className="section-header">
        <div>
          <span className="eyebrow">Connected Systems</span>
          <h2>Integration Health</h2>
        </div>
      </div>
      <div className="integration-list">
        {INTEGRATIONS.map((integration) => (
          <div key={integration.name}>
            <span className={`status-dot ${integration.status}`} />
            <strong>{integration.name}</strong>
            <small>{integration.note}</small>
          </div>
        ))}
      </div>
    </section>
  );
}
