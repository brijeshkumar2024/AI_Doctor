const PageHeader = ({ title, subtitle, action }) => (
  <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
    <div>
      <p className="eyebrow">Care workspace</p>
      <h1 className="section-title mt-2 text-3xl font-semibold tracking-[-0.03em] text-slate-900 md:text-[2.4rem]">
        {title}
      </h1>
      {subtitle ? <p className="mt-3 max-w-3xl subtle-text">{subtitle}</p> : null}
    </div>
    {action ? <div>{action}</div> : null}
  </div>
);

export default PageHeader;
