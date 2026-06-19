import { useState } from "react";

import { AuditTrail } from "./components/AuditTrail";
import { ApprovalQueue } from "./components/ApprovalQueue";
import { Blueprint } from "./components/Blueprint";
import { DecisionPacket } from "./components/DecisionPacket";
import { IntegrationHealth } from "./components/IntegrationHealth";
import { LiveConsole } from "./components/LiveConsole";
import { Sidebar } from "./components/Sidebar";
import { StatusGrid } from "./components/StatusGrid";
import { Toast } from "./components/Toast";
import { Topbar } from "./components/Topbar";
import { WorkflowBoard } from "./components/WorkflowBoard";
import { deriveMetrics } from "./metrics";
import type { View } from "./types";
import { useOpsPilot } from "./useOpsPilot";

const VIEW_CONFIG: Record<View, { eyebrow: string; title: string }> = {
  command: { eyebrow: "Production Demo", title: "Business Automation Command Center" },
  approvals: { eyebrow: "Human Review", title: "Approval Queue" },
  workflows: { eyebrow: "Workflow Intelligence", title: "Workflow Builder" },
  audit: { eyebrow: "Audit Trail", title: "Agent Activity Log" },
  integrations: { eyebrow: "Connected Systems", title: "Integration Health" },
};

export default function App() {
  const ops = useOpsPilot();
  const [busy, setBusy] = useState(false);

  // Wrap an async action so the toolbar disables while it is in flight.
  const run = (action: () => Promise<void>) => async () => {
    if (busy) return;
    setBusy(true);
    try {
      await action();
    } finally {
      setBusy(false);
    }
  };

  const config = VIEW_CONFIG[ops.view];
  const shows = (panels: View[]) => panels.includes(ops.view);

  const workflow =
    ops.state.workflows[ops.activeWorkflow] ?? Object.values(ops.state.workflows)[0];
  const metrics = deriveMetrics(ops.state.approvals);
  const selected =
    ops.state.approvals[
      Math.min(ops.selectedApprovalIndex, Math.max(ops.state.approvals.length - 1, 0))
    ];

  return (
    <div className="app-shell">
      <Sidebar
        view={ops.view}
        onNavigate={ops.setView}
        online={ops.online}
        claudeEnabled={ops.claudeEnabled}
      />

      <main className="workspace">
        <Topbar
          eyebrow={config.eyebrow}
          title={config.title}
          busy={busy}
          onExport={run(ops.exportAudit)}
          onSimulate={run(ops.runSimulation)}
        />

        <StatusGrid metrics={metrics} />

        <section
          className={`command-layout${ops.view !== "command" ? " focus-view" : ""}`}
        >
          <div className="main-column">
            {workflow && shows(["command", "workflows"]) && (
              <LiveConsole
                activeWorkflow={ops.activeWorkflow}
                workflowTitle={workflow.title}
                claudeEnabled={ops.claudeEnabled}
                generating={ops.generating}
                onGenerate={ops.generate}
              />
            )}
            {workflow && shows(["command", "workflows"]) && (
              <WorkflowBoard
                workflow={workflow}
                activeWorkflow={ops.activeWorkflow}
                onSelect={ops.selectWorkflow}
              />
            )}
            {workflow && shows(["command", "workflows"]) && (
              <Blueprint workflow={workflow} onOptimize={run(ops.optimize)} busy={busy} />
            )}
          </div>

          <aside className="side-column">
            {shows(["command", "approvals"]) && (
              <ApprovalQueue
                approvals={ops.state.approvals}
                selectedIndex={ops.selectedApprovalIndex}
                busy={busy}
                onInspect={ops.inspect}
                onApprove={(index) => run(() => ops.approve(index))()}
                onReject={(index) => run(() => ops.reject(index))()}
                onApproveAll={run(ops.approveAll)}
              />
            )}
            {shows(["command", "approvals"]) && <DecisionPacket approval={selected} />}
            {shows(["command", "audit"]) && <AuditTrail events={ops.state.events} />}
            {shows(["command", "integrations"]) && <IntegrationHealth />}
          </aside>
        </section>
      </main>

      <Toast message={ops.toast} />
    </div>
  );
}
