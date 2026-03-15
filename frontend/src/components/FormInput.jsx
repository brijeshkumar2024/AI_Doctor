const FormInput = ({ label, type = "text", as = "input", ...props }) => (
  <label className="block">
    <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span>
    {as === "textarea" ? <textarea className="input min-h-28" {...props} /> : <input className="input" type={type} {...props} />}
  </label>
);

export default FormInput;

