import { notFound } from "next/navigation";
import { db } from "@/lib/db/drizzle";
import {
  remediationPlans,
  remediationEvidence,
  remediationAuditLog,
  supplierRiskScores,
} from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { STATUS_STEPS } from "@/lib/remediation/status-steps";
import { EvidenceExportHeader } from "@/components/remediation/evidence-export-header";

interface PageProps {
  params: Promise<{ id: string }>;
}

const EVIDENCE_TYPE_LABELS: Record<string, string> = {
  case_resolved: "Case Resolved",
  survey_improvement: "Survey Improvement",
  training_completed: "Training Completed",
  risk_score_drop: "Risk Score Drop",
  anomaly_resolved: "Anomaly Resolved",
  manual_note: "Manual Note",
  engagement_improvement: "Engagement Improved",
  satisfaction_improvement: "Satisfaction Improved",
  case_volume_decrease: "Case Volume Decrease",
};

export default async function EvidenceExportPage({ params }: PageProps) {
  const { id } = await params;
  const remediationId = parseInt(id);

  const [planResult, evidence, auditLog] = await Promise.all([
    db
      .select()
      .from(remediationPlans)
      .where(eq(remediationPlans.id, remediationId))
      .limit(1),
    db
      .select()
      .from(remediationEvidence)
      .where(eq(remediationEvidence.remediationId, remediationId)),
    db
      .select()
      .from(remediationAuditLog)
      .where(eq(remediationAuditLog.remediationId, remediationId))
      .orderBy(desc(remediationAuditLog.createdAt)),
  ]);

  const plan = planResult[0];
  if (!plan) notFound();

  let supplierName = `Supplier ${plan.supplierId}`;
  const supplierResult = await db
    .select({ supplierName: supplierRiskScores.supplierName })
    .from(supplierRiskScores)
    .where(eq(supplierRiskScores.supplierId, plan.supplierId))
    .limit(1);
  if (supplierResult[0]?.supplierName) {
    supplierName = supplierResult[0].supplierName;
  }

  const sortedEvidence = [...evidence].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  const exportDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const statusLabel =
    STATUS_STEPS.find((s) => s.key === plan.status)?.label ?? plan.status;

  return (
    <>
      <style>{`
        @media print {
          body { font-size: 11pt; color: #1e293b; }
          .no-print { display: none !important; }
          .print-page { padding: 0; margin: 0; max-width: 100%; }
          table { page-break-inside: avoid; }
          .evidence-item { page-break-inside: avoid; }
          .section { page-break-before: auto; }
          @page { margin: 1.5cm; }
        }
      `}</style>

      <div className="print-page max-w-4xl mx-auto p-8">
        <EvidenceExportHeader
          title={plan.title}
          supplierName={supplierName}
          status={statusLabel}
          exportDate={exportDate}
          remediationId={remediationId}
        />

        {/* Plan Summary */}
        <div className="section mt-8 border border-slate-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Plan Summary
          </h2>
          <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
            <div>
              <span className="text-slate-500">Supplier:</span>{" "}
              <span className="font-medium">{supplierName}</span>
            </div>
            <div>
              <span className="text-slate-500">Status:</span>{" "}
              <span className="font-medium">{statusLabel}</span>
            </div>
            <div>
              <span className="text-slate-500">Source:</span>{" "}
              <span className="font-medium">
                {plan.sourceType.replace(/_/g, " ")}
              </span>
            </div>
            <div>
              <span className="text-slate-500">Assigned To:</span>{" "}
              <span className="font-medium">
                {plan.assignedTo || "Unassigned"}
              </span>
            </div>
            <div>
              <span className="text-slate-500">Created:</span>{" "}
              <span className="font-medium">
                {new Date(plan.createdAt).toLocaleDateString("en-US")}
              </span>
            </div>
            <div>
              <span className="text-slate-500">
                {plan.closedAt ? "Closed:" : "Target Date:"}
              </span>{" "}
              <span className="font-medium">
                {plan.closedAt
                  ? new Date(plan.closedAt).toLocaleDateString("en-US")
                  : plan.targetDate
                    ? new Date(plan.targetDate).toLocaleDateString("en-US")
                    : "Not set"}
              </span>
            </div>
          </div>
        </div>

        {/* Root Cause */}
        {plan.rootCause && (
          <div className="section mt-6 border border-slate-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-2">
              Root Cause Analysis
            </h2>
            <p className="text-sm text-slate-700 whitespace-pre-wrap">
              {plan.rootCause}
            </p>
          </div>
        )}

        {/* Action Plan */}
        {plan.actionPlan && (
          <div className="section mt-6 border border-slate-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-2">
              Action Plan
            </h2>
            <p className="text-sm text-slate-700 whitespace-pre-wrap">
              {plan.actionPlan}
            </p>
          </div>
        )}

        {/* Evidence Timeline */}
        <div className="section mt-6 border border-slate-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Evidence ({sortedEvidence.length} items)
          </h2>
          {sortedEvidence.length === 0 ? (
            <p className="text-sm text-slate-500">
              No evidence collected yet.
            </p>
          ) : (
            <div className="space-y-4">
              {sortedEvidence.map((item, idx) => (
                <div
                  key={item.id}
                  className="evidence-item flex gap-4 pb-4 border-b border-slate-100 last:border-0"
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {EVIDENCE_TYPE_LABELS[item.evidenceType] ??
                          item.evidenceType}
                      </span>
                      {item.referenceId && (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-blue-50 text-blue-600">
                          Auto
                        </span>
                      )}
                      <span className="text-xs text-slate-400 ml-auto">
                        {new Date(item.date).toLocaleDateString("en-US")}
                      </span>
                    </div>
                    <div className="text-sm font-medium text-slate-800">
                      {item.title}
                    </div>
                    {item.description && (
                      <div className="text-xs text-slate-500 mt-0.5">
                        {item.description}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Audit Trail */}
        <div className="section mt-6 border border-slate-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Audit Trail ({auditLog.length} entries)
          </h2>
          {auditLog.length === 0 ? (
            <p className="text-sm text-slate-500">No audit entries.</p>
          ) : (
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-left">
                  <th className="py-2 pr-3 font-semibold text-slate-600">
                    Timestamp
                  </th>
                  <th className="py-2 pr-3 font-semibold text-slate-600">
                    Action
                  </th>
                  <th className="py-2 pr-3 font-semibold text-slate-600">
                    Field
                  </th>
                  <th className="py-2 pr-3 font-semibold text-slate-600">
                    Previous
                  </th>
                  <th className="py-2 pr-3 font-semibold text-slate-600">
                    New
                  </th>
                  <th className="py-2 font-semibold text-slate-600">Actor</th>
                </tr>
              </thead>
              <tbody>
                {auditLog.map((entry) => (
                  <tr
                    key={entry.id}
                    className="border-b border-slate-100"
                  >
                    <td className="py-1.5 pr-3 text-slate-500 whitespace-nowrap">
                      {new Date(entry.createdAt).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="py-1.5 pr-3 text-slate-700">
                      {entry.action.replace(/_/g, " ")}
                    </td>
                    <td className="py-1.5 pr-3 text-slate-500">
                      {entry.field || "—"}
                    </td>
                    <td className="py-1.5 pr-3 text-slate-500 max-w-[120px] truncate">
                      {entry.previousValue || "—"}
                    </td>
                    <td className="py-1.5 pr-3 text-slate-500 max-w-[120px] truncate">
                      {entry.newValue || "—"}
                    </td>
                    <td className="py-1.5 text-slate-500">
                      {entry.actorType === "system" ||
                      entry.actorType === "auto_evidence_job"
                        ? "System"
                        : entry.actorId}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-slate-200 text-center text-xs text-slate-400">
          <p>
            Confidential — Generated by WOVO+ Ethical Supply Chain Intelligence
          </p>
          <p className="mt-1">
            Remediation #{remediationId} · Exported {exportDate}
          </p>
        </div>
      </div>
    </>
  );
}
