import api from "./api";

export const signupUser = async (payload) => {
  const { data } = await api.post("/auth/signup", payload);
  return data.user;
};

export const loginUser = async (payload) => {
  const { data } = await api.post("/auth/login", payload);
  return data.user;
};

export const getCurrentUser = async () => {
  const { data } = await api.get("/auth/me");
  return data.user;
};

export const logoutUser = async () => {
  const { data } = await api.post("/auth/logout");
  return data;
};

export const forgotPassword = async (email) => {
  const { data } = await api.post("/auth/forgot-password", { email });
  return data;
};

export const resetPassword = async (payload) => {
  const { data } = await api.post("/auth/reset-password", payload);
  return data;
};
