import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { QRCodeSVG as QRCode } from "qrcode.react";

const ShareReportModal = ({ reportId, isOpen, onClose }) => {
  const [step, setStep] = useState("config"); // config or generated
  const [config, setConfig] = useState({
    expiresInDays: 7,
    maxAccess: 10,
    doctorNote: ""
  });
  const [generatedData, setGeneratedData] = useState(null);
  const [copied, setCopied] = useState(false);

  const queryClient = useQueryClient();

  const createShareMutation = useMutation({
    mutationFn: async (data) => {
      const response = await fetch(`/api/reports/${reportId}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error("Failed to create share link");
      return response.json();
    },
    onSuccess: (data) => {
      setGeneratedData(data.data);
      setStep("generated");
      queryClient.invalidateQueries({ queryKey: ["shareLinks", reportId] });
    }
  });

  const revokeShareMutation = useMutation({
    mutationFn: async (token) => {
      const response = await fetch(`/api/reports/${reportId}/share/${token}`, {
        method: "DELETE"
      });
      if (!response.ok) throw new Error("Failed to revoke share link");
      return response.json();
    },
    onSuccess: () => {
      setStep("config");
      setGeneratedData(null);
      queryClient.invalidateQueries({ queryKey: ["shareLinks", reportId] });
    }
  });

  const handleCreate = () => {
    createShareMutation.mutate(config);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generatedData.shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQR = () => {
    const canvas = document.querySelector("canvas");
    const link = document.createElement("a");
    link.download = "share-qr.png";
    link.href = canvas.toDataURL();
    link.click();
  };

  const handleRevoke = () => {
    if (window.confirm("Are you sure you want to revoke this share link?")) {
      revokeShareMutation.mutate(generatedData.token);
    }
  };

  const handleShareAnother = () => {
    setStep("config");
    setGeneratedData(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Share with Doctor</h2>

          {step === "config" && (
            <>
              <p className="text-gray-600 mb-4">
                Generate a secure, time-limited link for your doctor to view this report.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Link expiry
                  </label>
                  <div className="flex gap-2">
                    {[1, 3, 7, 30].map(days => (
                      <button
                        key={days}
                        onClick={() => setConfig(prev => ({ ...prev, expiresInDays: days }))}
                        className={`px-3 py-2 rounded-lg text-sm ${
                          config.expiresInDays === days
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {days} day{days > 1 ? "s" : ""}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maximum views
                  </label>
                  <select
                    value={config.maxAccess}
                    onChange={(e) => setConfig(prev => ({ ...prev, maxAccess: parseInt(e.target.value) }))}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  >
                    <option value={1}>1 view</option>
                    <option value={5}>5 views</option>
                    <option value={10}>10 views</option>
                    <option value={100}>Unlimited</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Note to doctor (optional)
                  </label>
                  <textarea
                    value={config.doctorNote}
                    onChange={(e) => setConfig(prev => ({ ...prev, doctorNote: e.target.value }))}
                    placeholder="e.g. Please review my latest blood test results and advise on the flagged values."
                    maxLength={500}
                    className="w-full p-2 border border-gray-300 rounded-lg resize-none"
                    rows={3}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {config.doctorNote.length}/500 characters
                  </p>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  disabled={createShareMutation.isPending}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {createShareMutation.isPending ? "Generating..." : "Generate Secure Link"}
                </button>
              </div>
            </>
          )}

          {step === "generated" && generatedData && (
            <>
              <div className="text-center mb-4">
                <div className="text-green-600 text-2xl mb-2">✅</div>
                <p className="font-medium text-green-800">Secure link generated!</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Share URL
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={generatedData.shareUrl}
                      readOnly
                      className="flex-1 p-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
                    />
                    <button
                      onClick={handleCopy}
                      className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                    >
                      {copied ? "Copied!" : "Copy"}
                    </button>
                  </div>
                </div>

                {generatedData.qrCode && (
                  <div className="text-center">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Or scan QR code
                    </label>
                    <QRCode value={generatedData.shareUrl} size={128} />
                    <button
                      onClick={handleDownloadQR}
                      className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                    >
                      Download QR
                    </button>
                  </div>
                )}

                <div className="bg-gray-50 p-3 rounded-lg text-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-gray-600">Expires:</span>
                      <div className="font-medium">
                        {new Date(generatedData.expiresAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Max views:</span>
                      <div className="font-medium">
                        {generatedData.maxAccess === 100 ? "Unlimited" : generatedData.maxAccess}
                      </div>
                    </div>
                  </div>
                  <div className="mt-2">
                    <span className="text-gray-600">Views used:</span>
                    <div className="font-medium">0 / {generatedData.maxAccess === 100 ? "∞" : generatedData.maxAccess}</div>
                  </div>
                </div>

                {generatedData.doctorNote && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Note to doctor:</strong> {generatedData.doctorNote}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleShareAnother}
                  className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Share another
                </button>
                <button
                  onClick={handleRevoke}
                  disabled={revokeShareMutation.isPending}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  {revokeShareMutation.isPending ? "Revoking..." : "Revoke this link"}
                </button>
              </div>
            </>
          )}

          {createShareMutation.isError && (
            <p className="text-red-600 text-sm mt-2">
              {createShareMutation.error.message}
            </p>
          )}

          {revokeShareMutation.isError && (
            <p className="text-red-600 text-sm mt-2">
              {revokeShareMutation.error.message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShareReportModal;