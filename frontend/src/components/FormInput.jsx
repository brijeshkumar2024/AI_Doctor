const FormInput = ({ label, type = "text", as = "input", ...props }) => (
  <label className="block">
    <span className="mb-2 block text-sm font-semibold text-slate-700">{label}</span>
    {as === "textarea" ? <textarea className="input min-h-32 resize-y" {...props} /> : <input className="input" type={type} {...props} />}
  </label>
);

export default FormInput;
