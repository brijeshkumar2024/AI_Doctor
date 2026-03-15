import api from "./api";

export const updateProfile = async (payload) => {
  const { data } = await api.put("/profile", payload);
  return data.user;
};

export const updateLanguage = async (preferredLanguage) => {
  const { data } = await api.put("/profile/language", { preferredLanguage });
  return data.user;
};

