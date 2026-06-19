import type { LogEntry } from "../types";

export function AuditTrail({ events }: { events: LogEntry[] }) {
  return (
    <section className="panel">
      <div className="section-header">
        <div>
          <span className="eyebrow">Audit Trail</span>
          <h2>Agent Log</h2>
        </div>
      </div>
      <ol className="event-log">
        {events.slice(0, 6).map(([time, title, body], index) => (
          <li key={`${time}-${title}-${index}`}>
            <span>{time}</span>
            <div>
              <strong>{title}</strong>
              <p>{body}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
