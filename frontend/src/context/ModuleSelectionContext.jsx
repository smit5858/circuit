import React, { createContext, useContext, useState } from "react";

const ModuleSelectionContext = createContext(null);

const initialFormData = {
  company: "",
  model: "",
  moduler: "",
  mode: "Side 1",
};

export const ModuleSelectionProvider = ({ children }) => {
  const [formData, setFormData] = useState(initialFormData);

  return (
    <ModuleSelectionContext.Provider value={{ formData, setFormData }}>
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