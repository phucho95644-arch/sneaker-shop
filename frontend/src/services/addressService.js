import axiosClient from "../api/axiosClient";

// ============================================================
// GET ADDRESSES
// ============================================================

const getAddresses = async () => {
    const response =
        await axiosClient.get(
            "/users/addresses"
        );

    return response.data;
};

// ============================================================
// CREATE ADDRESS
// ============================================================

const createAddress = async (
    payload
) => {
    const response =
        await axiosClient.post(
            "/users/addresses",
            payload
        );

    return response.data;
};

// ============================================================
// UPDATE ADDRESS
// ============================================================

const updateAddress = async (
    id,
    payload
) => {
    const response =
        await axiosClient.put(
            `/users/addresses/${id}`,
            payload
        );

    return response.data;
};

// ============================================================
// DELETE ADDRESS
// ============================================================

const deleteAddress = async (
    id
) => {
    const response =
        await axiosClient.delete(
            `/users/addresses/${id}`
        );

    return response.data;
};

const addressService = {
    getAddresses,
    createAddress,
    updateAddress,
    deleteAddress,
};

export default addressService;