import axiosClient from "../api/axiosClient";

const getBrands = async () => {
    const response =
        await axiosClient.get(
            "/brands"
        );

    return response.data;
};

const brandService = {
    getBrands,
};

export default brandService;