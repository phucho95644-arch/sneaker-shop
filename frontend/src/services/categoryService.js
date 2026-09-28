import axiosClient from "../api/axiosClient";

const getCategories = async () => {
    const response =
        await axiosClient.get(
            "/categories"
        );

    return response.data;
};

const categoryService = {
    getCategories,
};

export default categoryService;