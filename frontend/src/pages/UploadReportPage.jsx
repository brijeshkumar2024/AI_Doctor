import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DisclaimerBanner from "../components/DisclaimerBanner";
import FileUploadField from "../components/FileUploadField";
import PageHeader from "../components/PageHeader";
import { uploadReport } from "../services/reportService";

const UploadReportPage = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!file) {
      setError("Please choose a PDF or image file.");
      return;
    }

    setLoading(true);
    setError("");
    setInfo("");

    try {
      const formData = new FormData();
      formData.append("report", file);
      const response = await uploadReport(formData);
      if (response.queued) {
        setInfo("Your report was uploaded and queued for AI analysis. You can track progress on the report page.");
      }
      navigate(`/reports/${response.report._id}`);
    } catch (submitError) {
      setError(submitError.response?.data?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <PageHeader
        title="Upload Medical Report"
        subtitle="Upload a medical report in PDF, JPG, or PNG format."
      />
      <DisclaimerBanner />
      <form className="card space-y-4" onSubmit={handleSubmit}>
        <FileUploadField
          label="Report file"
          accept=".pdf,.png,.jpg,.jpeg"
          onChange={(event) => setFile(event.target.files?.[0] || null)}
        />
        {file ? <p className="text-sm text-slate-600">Selected file: {file.name}</p> : null}
        {info ? <p className="text-sm text-primary-700">{info}</p> : null}
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button type="submit" className="button-primary" disabled={loading}>
          {loading ? "Processing..." : "Upload and Analyze"}
        </button>
      </form>
    </div>
  );
};

export default UploadReportPage;
