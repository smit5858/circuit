import axios from "axios";

export const carModals = async (company) => {
    try {
        const res = await axios.get(
            `https://vpic.nhtsa.dot.gov/api/vehicles/GetModelsForMake/${company}?format=json`
        );

        return res.data.Results;
    } catch (error) {
        console.error(error);
        return [];
    }
};