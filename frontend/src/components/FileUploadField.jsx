const FileUploadField = ({ label, accept, onChange }) => (
  <label className="block">
    <span className="mb-2 block text-sm font-semibold text-slate-700">{label}</span>
    <input
      className="input file:mr-4 file:rounded-full file:border-0 file:bg-primary-50 file:px-4 file:py-2 file:font-semibold file:text-primary-700"
      type="file"
      accept={accept}
      onChange={onChange}
    />
  </label>
);

export default FileUploadField;
