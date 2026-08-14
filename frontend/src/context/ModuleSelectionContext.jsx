import React, { createContext, useContext, useState } from "react";

const ModuleSelectionContext = createContext(null);

const initialFormData = {
  company: "",
  model: "",
  moduler: "",
  mode: "side1",
};

export const ModuleSelectionProvider = ({ children }) => {
  const [formData, setFormData] = useState(initialFormData);
  const [modulePhoto, setModulePhoto] = useState(null);
  const [moduleId, setModuleId] = useState(null);


  return (
    <ModuleSelectionContext.Provider value={{ formData, setFormData, modulePhoto, setModulePhoto, moduleId, setModuleId }}>
      {children}
    </ModuleSelectionContext.Provider>
  );
};

export const useModuleSelection = () => {
  const ctx = useContext(ModuleSelectionContext);
  if (!ctx) {
    throw new Error("useModuleSelection must be used within ModuleSelectionProvider");
  }
  return ctx;
};