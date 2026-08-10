import React, { useState } from "react";
import LOGO from "../../assets/logo.svg";
import { CompanyName } from "../../data/company";
import { carModals } from "../../services/carmodals";

const Sidebar = () => {
    const initialFormData = {
        company: "",
        model: "",
        moduler: "",
        mode: "Side 1",
    };

 const [formData, setFormData] = useState(initialFormData);
 const [models, setModels] = useState([]);
 const [loading, setLoading] = useState(false);

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

    const handleCompanyChange = (e) => {
        const company = e.target.value;

        setFormData((prev) => ({ ...prev, company, model: "" }));

        if (company) {
            fetchModels(company);
        } else {
            setModels([]);
        }
    };

    return (
        <aside className="w-72 min-h-screen bg-white border-r border-gray-200 shadow-sm">
            {/* Logo */}
            <div className="px-6 py-6 border-b border-gray-100">
                <img
                    src={LOGO}
                    alt="Madhuram Motors"
                    className="w-full h-auto object-contain"
                />
            </div>

            {/* Form */}
            <div className="px-6 py-8">
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

                            {CompanyName.map((item) => (
                                <option key={item} value={item}>
                                    {item}
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
                                    key={item.Model_ID}
                                    value={item.Model_ID}
                                >
                                    {item.Model_Name}
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

                            {/* {models.map((item) => (
                                <option
                                    key={item.Model_ID}
                                    value={item.Model_ID}
                                >
                                    {item.Model_Name}
                                </option>
                            ))} */}

                            <option value="Airbag Control Module">Airbag Control Module</option>
                            <option value="ADAS Module">ADAS Module</option>
                            <option value="Parking Assistance Module">Parking Assistance Module</option>
                        </select>
                    </div>

                    <div className="flex flex-col gap-2">
                        {/* Tabs */}
                        <label
                            htmlFor="company"
                            className="text-sm font-medium text-gray-700"
                        >
                            Select Module Side
                        </label>
                        <div className="inline-flex items-center rounded-full bg-gray-100 p-1">
                            {["Side 1", "Side 2"].map((tab) => (
                                <button
                                    key={tab}
                                    type="button"
                                    onClick={() => setFormData((prev) => ({ ...prev, mode: tab }))}
                                    className={`px-6 py-2 w-full rounded-full text-sm font-medium transition-all ${
                                        formData.mode === tab
                                            ? "bg-white text-gray-900 shadow-sm"
                                            : "text-gray-500 hover:text-gray-900"
                                    }`}
                                >
                                    {tab}
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