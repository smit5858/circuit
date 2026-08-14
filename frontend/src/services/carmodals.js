import axios from "axios";

const BASE_URL = import.meta.env.VITE_APP_BASE_URL;

export const carCompanies = async () => {
  const res = await axios.get(`${BASE_URL}/cars`);
  return res.data;
};

export const carModals = async (company) => {
  const res = await axios.get(`${BASE_URL}/cars/${company}/models`);
  return res.data;
};

export const getModulePhoto = async ({ carModelId, name, side }) => {
  const res = await axios.get(`${BASE_URL}/modules/image`, {
    params: { carModelId, name, side },
  });
  // Expecting { carModuleId, side, mimeType, image } where image is base64
  const data = res.data || {};
  if (data.image && data.mimeType) {
    return { ...data, image: `data:${data.mimeType};base64,${data.image}` };
  }
  return data;
};