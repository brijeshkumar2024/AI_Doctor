const statusBadgeClass = {
  normal: "bg-emerald-100 text-emerald-800",
  low: "bg-amber-100 text-amber-800",
  high: "bg-orange-100 text-orange-800",
  critical: "bg-red-100 text-red-800"
};

const severityBadgeClass = {
  low: "bg-emerald-100 text-emerald-800",
  medium: "bg-amber-100 text-amber-800",
  high: "bg-red-100 text-red-800"
};

const ConfidenceRing = ({ score = 0 }) => {
  const safeScore = Math.max(0, Math.min(100, Number(score) || 0));

  return (
    <div
      className="grid h-16 w-16 place-items-center rounded-full text-xs font-semibold text-slate-700"
      style={{
        background: `conic-gradient(#2563eb ${safeScore}%, #e2e8f0 ${safeScore}% 100%)`
      }}
    >
      <div className="grid h-12 w-12 place-items-center rounded-full bg-white">{safeScore}%</div>
    </div>
  );
};

const ModelColumn = ({ title, badge, data }) => (
  <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
    <div className="mb-4 flex items-center justify-between gap-3">
      <div>
        <p className="text-sm font-semibold text-slate-900">{title}</p>
        <span className="mt-1 inline-block rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
          {badge}
        </span>
      </div>
      <ConfidenceRing score={data?.confidenceScore} />
    </div>

    <p className="text-sm text-slate-700">{data?.summary || "No summary available."}</p>

    <div className="mt-4">
      <h3 className="text-sm font-semibold text-slate-900">Key Findings</h3>
      <div className="mt-2 overflow-x-auto">
        <table className="min-w-full text-left text-xs">
          <thead className="text-slate-500">
            <tr>
              <th className="py-2">Parameter</th>
              <th className="py-2">Value</th>
              <th className="py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {(data?.keyFindings || []).map((item, index) => (
              <tr key={`${item.parameter}-${index}`} className="border-t border-slate-100">
                <td className="py-2 pr-3 text-slate-700">{item.parameter}</td>
                <td className="py-2 pr-3 text-slate-700">{item.value}</td>
                <td className="py-2">
                  <span className={`rounded-full px-2 py-1 text-[11px] font-medium ${statusBadgeClass[item.status] || statusBadgeClass.normal}`}>
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>

    <div className="mt-4">
      <h3 className="text-sm font-semibold text-slate-900">Risk Flags</h3>
      <div className="mt-2 space-y-2">
        {(data?.riskFlags || []).map((item, index) => (
          <div key={`${item.risk}-${index}`} className="rounded-xl bg-slate-50 p-2">
            <div className="mb-1 flex items-center justify-between gap-2">
              <p className="text-xs font-semibold text-slate-800">{item.risk}</p>
              <span className={`rounded-full px-2 py-1 text-[11px] font-medium ${severityBadgeClass[item.severity] || severityBadgeClass.low}`}>
                {item.severity}
              </span>
            </div>
            <p className="text-xs text-slate-600">{item.explanation}</p>
          </div>
        ))}
      </div>
    </div>

    <div className="mt-4">
      <h3 className="text-sm font-semibold text-slate-900">Recommendations</h3>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-slate-700">
        {(data?.recommendations || []).map((item, index) => (
          <li key={`${item}-${index}`}>{item}</li>
        ))}
      </ul>
    </div>
  </article>
);

const ModelComparison = ({ gemini, groq }) => (
  <section className="grid gap-4 lg:grid-cols-2">
    <ModelColumn title="Gemini 1.5 Flash" badge="Google Gemini" data={gemini} />
    <ModelColumn title="LLaMA 3 70B" badge="Groq" data={groq} />
  </section>
);

export default ModelComparison;
