import { useEffect, useState } from "react";
import DisclaimerBanner from "../components/DisclaimerBanner";
import FileUploadField from "../components/FileUploadField";
import PageHeader from "../components/PageHeader";
import { fetchPrescriptions, uploadPrescription } from "../services/prescriptionService";

const PrescriptionUploadPage = () => {
  const [file, setFile] = useState(null);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const loadPrescriptions = async () => {
    try {
      setPrescriptions(await fetchPrescriptions());
    } catch (_error) {
      setError("Could not load prescriptions");
    }
  };

  useEffect(() => {
    loadPrescriptions();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!file) {
      setError("Please choose a prescription image.");
      return;
    }

    setLoading(true);
    setError("");
    setInfo("");

    try {
      const formData = new FormData();
      formData.append("prescription", file);
      const response = await uploadPrescription(formData);
      if (response.queued) {
        setInfo("Prescription uploaded. AI processing is running in the background.");
      }
      setFile(null);
      await loadPrescriptions();
    } catch (submitError) {
      setError(submitError.response?.data?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Prescription Analyzer"
        subtitle="Upload a prescription image and get simple medicine explanations."
      />
      <DisclaimerBanner />
      <form className="card space-y-4" onSubmit={handleSubmit}>
        <FileUploadField
          label="Prescription image"
          accept=".png,.jpg,.jpeg"
          onChange={(event) => setFile(event.target.files?.[0] || null)}
        />
        {info ? <p className="text-sm text-primary-700">{info}</p> : null}
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button type="submit" className="button-primary" disabled={loading}>
          {loading ? "Analyzing..." : "Upload Prescription"}
        </button>
      </form>

      <section className="space-y-4">
        {prescriptions.length === 0 ? (
          <div className="card text-slate-600">No prescriptions uploaded yet.</div>
        ) : (
          prescriptions.map((prescription) => (
            <div key={prescription._id} className="card">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-lg font-semibold">{prescription.fileName}</h2>
                  <p className="text-sm text-slate-500">
                    {new Date(prescription.createdAt).toLocaleString()}
                  </p>
                </div>
                <a
                  href={prescription.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="button-secondary"
                >
                  Open Image
                </a>
              </div>
              <p className="mt-2 text-sm text-slate-600">
                Status: {prescription.processingStatus || "completed"}
              </p>
              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                <div>
                  <h3 className="font-medium">Detected Medicines</h3>
                  <div className="mt-3 space-y-3">
                    {prescription.medicines.length === 0 ? (
                      <p className="text-sm text-slate-600">No medicine names were detected.</p>
                    ) : (
                      prescription.medicines.map((medicine, index) => (
                        <div key={`${medicine.name}-${index}`} className="rounded-lg bg-slate-50 p-3 text-sm">
                          <p className="font-medium">{medicine.name}</p>
                          <p>Dosage: {medicine.dosage}</p>
                          <p>Purpose: {medicine.purpose}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="font-medium">Simple Explanation</h3>
                  <div className="mt-3 rounded-lg bg-primary-50 p-4 text-sm text-slate-700">
                    {prescription.aiExplanation}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
};

export default PrescriptionUploadPage;
