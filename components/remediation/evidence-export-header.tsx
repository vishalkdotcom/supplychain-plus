"use client";

interface EvidenceExportHeaderProps {
  title: string;
  supplierName: string;
  status: string;
  exportDate: string;
  remediationId: number;
}

export function EvidenceExportHeader({
  title,
  supplierName,
  status,
  exportDate,
  remediationId,
}: EvidenceExportHeaderProps) {
  return (
    <>
      {/* Print button — hidden in print */}
      <div className="no-print mb-6 flex items-center gap-3">
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium"
        >
          Print / Save as PDF
        </button>
        <a
          href={`/remediation/${remediationId}`}
          className="text-sm text-slate-500 hover:text-slate-700 underline"
        >
          Back to remediation
        </a>
      </div>

      {/* Header */}
      <div className="border-b-2 border-indigo-600 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Evidence Package
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              WOVO+ Ethical Supply Chain Intelligence
            </p>
          </div>
          <div className="text-right text-sm text-slate-500">
            <div>Remediation #{remediationId}</div>
            <div>{exportDate}</div>
          </div>
        </div>
        <div className="mt-4">
          <h2 className="text-xl font-semibold text-slate-800">{title}</h2>
          <div className="flex items-center gap-3 mt-1 text-sm text-slate-600">
            <span>{supplierName}</span>
            <span className="text-slate-300">·</span>
            <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-medium">
              {status}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
