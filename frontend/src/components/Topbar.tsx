interface TopbarProps {
  eyebrow: string;
  title: string;
  busy: boolean;
  onExport: () => void;
  onSimulate: () => void;
}

export function Topbar({ eyebrow, title, busy, onExport, onSimulate }: TopbarProps) {
  return (
    <header className="topbar">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
      </div>
      <div className="topbar-actions">
        <button className="ghost-button" type="button" onClick={onExport} disabled={busy}>
          Export Audit
        </button>
        <button
          className="primary-button"
          type="button"
          onClick={onSimulate}
          disabled={busy}
        >
          {busy ? "Running…" : "Run Simulation"}
        </button>
      </div>
    </header>
  );
}
