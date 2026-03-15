import api from "./api";

export const fetchDashboard = async () => {
  const { data } = await api.get("/dashboard");
  return data.data;
};

