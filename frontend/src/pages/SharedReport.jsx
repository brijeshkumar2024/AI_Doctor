import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import DisclaimerBanner from "../components/DisclaimerBanner";
import ModelComparison from "../components/ModelComparison";
import Layout from "../components/Layout";

const SharedReport = () => {
  const { token } = useParams();

  const { data, isLoading, error } = useQuery({
    queryKey: ["sharedReport", token],
    queryFn: async () => {
      const response = await fetch(`/api/shared/${token}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to load shared report");
      }
      return response.json();
    },
    retry: false
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading shared report...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center max-w-md mx-auto">
            <div className="text-red-600 text-4xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
            <p className="text-gray-600 mb-4">
              {error.message === "Share link has expired"
                ? "This share link has expired and is no longer accessible."
                : error.message === "Share link has reached maximum access limit"
                ? "This share link has reached its maximum number of views."
                : error.message === "Share link has been revoked"
                ? "This share link has been revoked by the owner."
                : "This share link is invalid or has been removed."}
            </p>
            <p className="text-sm text-gray-500">
              Please contact the report owner for a new share link.
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  const { report, doctorNote } = data.data;

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white shadow rounded-lg overflow-hidden">
            {/* Header */}
            <div className="bg-blue-600 text-white px-6 py-4">
              <h1 className="text-2xl font-bold">Shared Medical Report</h1>
              <p className="text-blue-100 mt-1">
                This report has been shared with you by the patient for review.
              </p>
            </div>

            {/* Doctor Note */}
            {doctorNote && (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mx-6 mt-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-800">
                      <strong>Note from patient:</strong> {doctorNote}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Report Content */}
            <div className="p-6">
              <ModelComparison report={report} isShared={true} />
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 border-t">
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div>
                  Report ID: {report._id}
                </div>
                <div>
                  Generated: {new Date(report.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>

          <DisclaimerBanner />
        </div>
      </div>
    </Layout>
  );
};

export default SharedReport;