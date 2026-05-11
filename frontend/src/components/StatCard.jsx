const StatCard = ({ label, value }) => (
  <div className="card hero-panel">
    <div className="flex items-center justify-between gap-3">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <span className="h-2.5 w-2.5 rounded-full bg-primary-500" />
    </div>
    <p className="mt-6 text-3xl font-semibold tracking-[-0.04em] text-slate-900">{value}</p>
  </div>
);

export default StatCard;
