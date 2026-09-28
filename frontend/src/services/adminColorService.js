import axiosClient from "../api/axiosClient";

const unwrap = (response) =>
    response?.data?.data ??
    response?.data ??
    null;

const normalizeList = (data) => {
    if (Array.isArray(data)) {
        return data;
    }

    if (Array.isArray(data?.items)) {
        return data.items;
    }

    if (Array.isArray(data?.colors)) {
        return data.colors;
    }

    return [];
};

const normalizeColor = (item) => ({
    ...item,

    id:
        item?.id,

    name:
        item?.name ??
        "",

    hexCode:
        item?.hexCode ??
        item?.hex_code ??
        "#000000",

    status:
        item?.status ??
        "active",

    variantCount:
        Number(
            item?.variantCount ??
            item?.variant_count ??
            0
        ),
});

const adminColorService = {
    async getColors(params = {}) {
        const response =
            await axiosClient.get(
                "/admin/colors",
                {
                    params,
                }
            );

        return normalizeList(
            unwrap(response)
        ).map(normalizeColor);
    },

    async getColor(id) {
        const response =
            await axiosClient.get(
                `/admin/colors/${id}`
            );

        return normalizeColor(
            unwrap(response)
        );
    },

    async createColor(payload) {
        const response =
            await axiosClient.post(
                "/admin/colors",
                {
                    name:
                        payload.name,

                    hex_code:
                        payload.hexCode,

                    status:
                        payload.status,
                }
            );

        return normalizeColor(
            unwrap(response)
        );
    },

    async updateColor(
        id,
        payload
    ) {
        const response =
            await axiosClient.put(
                `/admin/colors/${id}`,
                {
                    name:
                        payload.name,

                    hex_code:
                        payload.hexCode,

                    status:
                        payload.status,
                }
            );

        return normalizeColor(
            unwrap(response)
        );
    },

    async updateStatus(
        id,
        status
    ) {
        const response =
            await axiosClient.patch(
                `/admin/colors/${id}/status`,
                {
                    status,
                }
            );

        return normalizeColor(
            unwrap(response)
        );
    },

    async deleteColor(id) {
        const response =
            await axiosClient.delete(
                `/admin/colors/${id}`
            );

        return unwrap(response);
    },
};

export default adminColorService;