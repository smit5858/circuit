import axios from "axios";

const normalizeComponent = (component) => ({
  ...component,
  name: component.partName ?? component.name,
  value: component.partNumber ?? component.value,
  voltage: component.partValue ?? component.voltage,
  published: component.status ? component.status === "verified" : component.published,
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

export const getModuleParts = async ({ carModelId, side, name }) => {
  const res = await axios.get(`${import.meta.env.VITE_APP_BASE_URL}/modules/parts`, {
    params: { carModelId, side, ...(name ? { name } : {}) },
  });
  return res.data.map(normalizeComponent);
};

export const addComponent = async (payload) => {
  const res = await axios.post(`${import.meta.env.VITE_APP_BASE_URL}/modules/parts/add`,  payload );
  return normalizeComponent(res.data);
};

export const updateComponent = async (id, payload) => {
  const res = await axios.patch(`${import.meta.env.VITE_APP_BASE_URL}/modules/parts/${id}`, payload);
  return normalizeComponent(res.data);
};