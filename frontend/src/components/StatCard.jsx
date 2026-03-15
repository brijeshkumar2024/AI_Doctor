const StatCard = ({ label, value }) => (
  <div className="card">
    <p className="text-sm text-slate-500">{label}</p>
    <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
  </div>
);

export default StatCard;

