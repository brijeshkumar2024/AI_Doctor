import api from "./api";

export const uploadReport = async (formData) => {
  const { data } = await api.post("/reports", formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });
  return data;
};

export const fetchReports = async (params = {}) => {
  const { data } = await api.get("/reports", { params });
  return data;
};

export const fetchReportById = async (id) => {
  const { data } = await api.get(`/reports/${id}`);
  return data.data?.report || data.report;
};

export const createShareLink = async (id, payload = {}) => {
  const { data } = await api.post(`/reports/${id}/share-link`, payload);
  return data;
};

export const fetchSharedReport = async (token) => {
  const { data } = await api.get(`/shared/reports/${token}`);
  return data.data?.report || data.report;
};

export const getReportExportUrl = (id) =>
  `${(import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/$/, "")}/reports/${id}/export-summary`;
