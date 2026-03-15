import api from "./api";

export const uploadPrescription = async (formData) => {
  const { data } = await api.post("/prescriptions", formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });
  return data;
};

export const fetchPrescriptions = async () => {
  const { data } = await api.get("/prescriptions");
  return data.prescriptions;
};
