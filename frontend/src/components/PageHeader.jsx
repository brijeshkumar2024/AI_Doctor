const PageHeader = ({ title, subtitle, action }) => (
  <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
      {subtitle ? <p className="mt-1 text-slate-600">{subtitle}</p> : null}
    </div>
    {action ? <div>{action}</div> : null}
  </div>
);

export default PageHeader;

