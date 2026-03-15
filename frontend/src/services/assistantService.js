import api from "./api";

export const checkSymptoms = async (payload) => {
  const { data } = await api.post("/symptoms/check", payload);
  return data.result;
};

export const fetchChatHistory = async () => {
  const { data } = await api.get("/chat");
  return data;
};

export const sendChatMessage = async (payload) => {
  const { data } = await api.post("/chat", payload);
  return data;
};

