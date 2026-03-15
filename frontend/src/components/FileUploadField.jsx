const FileUploadField = ({ label, accept, onChange }) => (
  <label className="block">
    <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span>
    <input className="input file:mr-4 file:rounded-md file:border-0 file:bg-primary-50 file:px-3 file:py-2 file:text-primary-700" type="file" accept={accept} onChange={onChange} />
  </label>
);

export default FileUploadField;

