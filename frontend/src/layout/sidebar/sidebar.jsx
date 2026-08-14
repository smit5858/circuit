import React, { useState } from "react";
import LOGO from "../../assets/logo.svg";
import { carCompanies, carModals, getModulePhoto } from "../../services/carmodals";
import { useModuleSelection } from "../../context/ModuleSelectionContext";
import { useEffect } from "react";

const Sidebar = () => {
    const { formData, setFormData, setModulePhoto, setModuleId } = useModuleSelection();
    const [company, setCompany] = useState([]);
    const [models, setModels] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filtersOpen, setFiltersOpen] = useState(false);

    const fetchModels = async (company) => {
        try {
            setLoading(true);
            setModels([]);
            setFormData((prev) => ({ ...prev, model: "" }));

            const res = await carModals(company);
            setModels(res || []);
        } catch (error) {
            console.error(error);
            setModels([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchComapny  = async () => {
        try {
            setLoading(true);
            const res = await carCompanies();
            setCompany(res || []);
        } catch (error) {
            console.error(error);
            setCompany([]);            
        } finally {
            setLoading(false);
        }
    }

    const handleCompanyChange = (e) => {
        const company = e.target.value;

        setFormData((prev) => ({ ...prev, company, model: "" }));

        if (company) {
            fetchModels(company);
        } else {
            setModels([]);
        }
    };

    useEffect(() => {
        fetchComapny();
    }, [])

    useEffect(() => {
        const { company: c, model, moduler, mode } = formData || {};
        if (!c || !model || !moduler || !mode) {
            setModulePhoto && setModulePhoto(null);
            setModuleId && setModuleId(null);
            return;
        }

        (async () => {
            try {
                const photoData = await getModulePhoto({ carModelId: model, name: moduler, side: mode });
                setModulePhoto && setModulePhoto(photoData.image || null);
                setModuleId && setModuleId(photoData.carModuleId || null);
            } catch (err) {
                console.error("Failed to fetch module photo:", err);
                setModulePhoto && setModulePhoto(null);
            }
        })();
    }, [formData.company, formData.model, formData.moduler, formData.mode, setModulePhoto]);

    return (
        <aside className="w-full md:w-72 md:min-h-screen bg-white border-r border-gray-200 shadow-sm">
            {/* Logo */}
            <div className="px-6 py-6 border-b border-gray-100 flex items-center justify-between">
                <img
                    src={LOGO}
                    alt="Madhuram Motors"
                    className="h-10 w-auto object-contain md:w-full md:h-auto"
                />
                <button
                    type="button"
                    onClick={() => setFiltersOpen((v) => !v)}
                    className="md:hidden px-3 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700"
                >
                    {filtersOpen ? "Close" : "Filters"}
                </button>
            </div>

            {/* Form */}
            <div className={`px-6 py-8 ${filtersOpen ? "block" : "hidden"} md:block`}>
                <form className="flex flex-col gap-6">

                    {/* Company */}
                    <div className="flex flex-col gap-2">
                        <label
                            htmlFor="company"
                            className="text-sm font-medium text-gray-700"
                        >
                            Select company
                        </label>

                        <select
                            id="company"
                            value={formData.company}
                            onChange={handleCompanyChange}
                            className="
                                w-full
                                h-11
                                px-3
                                bg-white
                                border border-gray-300
                                rounded-lg
                                text-sm text-gray-700
                                outline-none
                                cursor-pointer
                                transition
                                focus:border-gray-500
                                focus:ring-2
                                focus:ring-gray-100
                            "
                        >
                            <option value="">Select company</option>

                            {company.map((item) => (
                                <option key={item.id} value={item.id}>
                                    {item.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Model */}
                    <div className="flex flex-col gap-2">
                        <label
                            htmlFor="model"
                            className="text-sm font-medium text-gray-700"
                        >
                            Select model
                        </label>

                        <select
                            id="model"
                            value={formData.model}
                            onChange={(e) => setFormData((prev) => ({ ...prev, model: e.target.value }))}
                            disabled={!formData.company || loading}
                            className="
                                w-full
                                h-11
                                px-3
                                bg-white
                                border border-gray-300
                                rounded-lg
                                text-sm text-gray-700
                                outline-none
                                transition
                                focus:border-gray-500
                                focus:ring-2
                                focus:ring-gray-100
                                disabled:bg-gray-100
                                disabled:text-gray-400
                                disabled:cursor-not-allowed
                            "
                        >
                            <option value="">
                                {loading ? "Loading models..." : "Select model"}
                            </option>

                            {models.map((item) => (
                                <option
                                    key={item.id}
                                    value={item.id}
                                >
                                    {item.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    
                    {/* Moduler */}
                    <div className="flex flex-col gap-2">
                        <label
                            htmlFor="Moduler"
                            className="text-sm font-medium text-gray-700"
                        >
                            Select Moduler
                        </label>

                        <select
                            id="moduler"
                            value={formData.moduler}
                            onChange={(e) => setFormData((prev) => ({ ...prev, moduler: e.target.value }))}
                            disabled={!formData.company}
                            className="
                                w-full
                                h-11
                                px-3
                                bg-white
                                border border-gray-300
                                rounded-lg
                                text-sm text-gray-700
                                outline-none
                                transition
                                focus:border-gray-500
                                focus:ring-2
                                focus:ring-gray-100
                                disabled:bg-gray-100
                                disabled:text-gray-400
                                disabled:cursor-not-allowed
                            "
                        >
                            <option value="">
                                {/* {loading ? "Loading models..." : "Select model"} */}
                                Select model
                            </option>

                            <option value="Airbag Control Module">Airbag Control Module</option>
                            <option value="Engine ECU">Engine ECU</option>
                            <option value="ADAS Module">ADAS Module</option>
                            <option value="Parking Assistance Module">Parking Assistance Module</option>
                        </select>
                    </div>

                    {/* Part Number */}
                    <div className="flex flex-col gap-2">
                        <label
                            htmlFor="Part Number"
                            className="text-sm font-medium text-gray-700"
                        >
                            Part Number
                        </label>

                        <input 
                            type="text" 
                            name="partNumber" 
                            id="partNumber" 
                            onChange={(e) => setFormData((prev) => ({...prev, partNumber: e.target.value}))}
                            placeholder="Enter Part number"
                            disabled={!formData.company}
                            className="
                                w-full
                                h-11
                                px-3
                                bg-white
                                border border-gray-300
                                rounded-lg
                                text-sm text-gray-700
                                outline-none
                                cursor-pointer
                                transition
                                focus:border-gray-500
                                focus:ring-2
                                focus:ring-gray-100
                                disabled:bg-[#f3f4f6]
                            "
                        />
                    </div>

                    {/* Tabs */}
                    <div className="flex flex-col gap-2">
                        <label
                            htmlFor="company"
                            className="text-sm font-medium text-gray-700"
                        >
                            Select Module Side
                        </label>
                        <div className="inline-flex items-center rounded-full bg-gray-100 p-1">
                            {[{ id: "side1", label: "Side 1" }, { id: "side2", label: "Side 2" }].map((tab) => (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => setFormData((prev) => ({ ...prev, mode: tab.id }))}
                                    className={`px-6 py-2 w-full rounded-full text-sm font-medium transition-all ${
                                        formData.mode === tab.id ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                </form>
            </div>
        </aside>
    );
};

export default Sidebar;