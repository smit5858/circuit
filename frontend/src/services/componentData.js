import axios from "axios";

const normalizeComponent = (component) => ({
  ...component,
  x: Number(component.x),
  y: Number(component.y),
  width: Number(component.width),
  height: Number(component.height),
});

export const resolveModule = async ({ company, model, moduler, side }) => {
  const res = await axios.post(`${import.meta.env.VITE_APP_BASE_URL}/car-modules/resolve`, {
    company,
    model,
    moduler,
    side,
  }, {headers: {"Content-Type" : "application/json"}});
  return res.data;
};

export const getComponentsByModule = async (moduleId) => {
  const res = await axios.get(`${import.meta.env.VITE_APP_BASE_URL}/parts/module/${moduleId}`);
  return res.data.map(normalizeComponent);
};

export const addComponent = async (moduleId, payload) => {
  const res = await axios.post(`${import.meta.env.VITE_APP_BASE_URL}/parts`, { ...payload, module_id: moduleId });
  return normalizeComponent(res.data);
};

export const updateComponent = async (id, payload) => {
  const res = await axios.put(`${import.meta.env.VITE_APP_BASE_URL}/parts/${id}`, payload);
  return normalizeComponent(res.data);
};