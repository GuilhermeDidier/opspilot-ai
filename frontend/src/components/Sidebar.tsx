import type { View } from "../types";

const NAV_ITEMS: { view: View; label: string }[] = [
  { view: "command", label: "Command Center" },
  { view: "approvals", label: "Approvals" },
  { view: "workflows", label: "Workflows" },
  { view: "audit", label: "Audit Trail" },
  { view: "integrations", label: "Integrations" },
];

interface SidebarProps {
  view: View;
  onNavigate: (view: View) => void;
  online: boolean;
  claudeEnabled: boolean;
}

export function Sidebar({ view, onNavigate, online, claudeEnabled }: SidebarProps) {
  const engine = !online
    ? "Offline demo data"
    : claudeEnabled
      ? "Claude live"
      : "Deterministic fallback";

  return (
    <aside className="sidebar" aria-label="Primary navigation">
      <div className="brand">
        <div className="brand-mark" aria-hidden="true">
          OP
        </div>
        <div>
          <strong>OpsPilot AI</strong>
          <span>Automation Command</span>
        </div>
      </div>

      <nav className="nav-list">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.view}
            className={`nav-item${view === item.view ? " active" : ""}`}
            type="button"
            onClick={() => onNavigate(item.view)}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <div className="sidebar-panel">
        <span className="eyebrow">Active Client</span>
        <strong>Northstar SaaS</strong>
        <p>Revenue, support, and back office workflows under human review.</p>
        <p style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            className={`status-dot ${online ? "healthy" : "warning"}`}
            style={{ flexShrink: 0 }}
          />
          AI engine: {engine}
        </p>
      </div>
    </aside>
  );
}
