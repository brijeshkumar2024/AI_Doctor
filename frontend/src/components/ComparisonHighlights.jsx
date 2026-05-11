const agreementColor = (rate) => {
  if (rate > 80) {
    return "text-emerald-700";
  }
  if (rate >= 60) {
    return "text-amber-700";
  }
  return "text-red-700";
};

const ComparisonHighlights = ({ comparison = {} }) => {
  const rate = Number(comparison?.agreementRate || 0);
  const consensusFindings = comparison?.consensusFindings || [];
  const divergentFindings = comparison?.divergentFindings || [];
  const processingTime = comparison?.processingTime || {};

  return (
    <section className="card">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.15em] text-slate-500">Agreement Rate</p>
          <p className={`text-4xl font-semibold ${agreementColor(rate)}`}>{rate.toFixed(1)}%</p>
        </div>
        <div className="flex gap-2 text-xs">
          <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">
            Gemini: {Math.round(processingTime.gemini || 0)} ms
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">
            Groq: {Math.round(processingTime.groq || 0)} ms
          </span>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Consensus Findings</h3>
          <div className="mt-2 space-y-2">
            {consensusFindings.length === 0 ? (
              <p className="text-sm text-slate-600">No consensus findings yet.</p>
            ) : (
              consensusFindings.map((item, index) => (
                <div key={`${item.parameter}-${index}`} className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-900">
                  <p className="font-medium">✓ {item.parameter} ({item.status})</p>
                  <p className="mt-1 text-xs">Gemini: {item.geminiInterpretation}</p>
                  <p className="text-xs">Groq: {item.groqInterpretation}</p>
                </div>
              ))
            )}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-slate-900">Divergent Findings</h3>
          <div className="mt-2 space-y-2">
            {divergentFindings.length === 0 ? (
              <p className="text-sm text-slate-600">No divergence found between models.</p>
            ) : (
              divergentFindings.map((item, index) => (
                <div key={`${item.parameter}-${index}`} className="rounded-xl bg-amber-50 p-3 text-sm text-amber-950">
                  <p className="font-medium">⚠ {item.parameter}</p>
                  <p className="mt-1 text-xs">Gemini: {item.gemini.status} — {item.gemini.interpretation}</p>
                  <p className="text-xs">Groq: {item.groq.status} — {item.groq.interpretation}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ComparisonHighlights;
