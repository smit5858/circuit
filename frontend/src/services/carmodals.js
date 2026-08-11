import axios from "axios";

export const carCompanies = async () => {
  const res = await axios.get(`${import.meta.env.VITE_APP_BASE_URL}/cars/companies`);
  return res.data;
}

export const carModals = async (company) => {
  const res = await axios.get(`${import.meta.env.VITE_APP_BASE_URL}/cars/models`, {
    params: { company },
  });
  return res.data;
};

export const getModulePhotoUrl = (moduleId) =>
  moduleId ? `${import.meta.env.VITE_APP_BASE_URL}/car-modules/${moduleId}/photo` : null;
