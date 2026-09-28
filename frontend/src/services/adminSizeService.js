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

    if (Array.isArray(data?.sizes)) {
        return data.sizes;
    }

    return [];
};

const normalizeSize = (item) => ({
    ...item,

    id:
        item?.id,

    sizeName:
        item?.sizeName ??
        item?.size_name ??
        "",

    sortOrder:
        Number(
            item?.sortOrder ??
            item?.sort_order ??
            0
        ),

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

const adminSizeService = {
    async getSizes(params = {}) {
        const response =
            await axiosClient.get(
                "/admin/sizes",
                {
                    params,
                }
            );

        return normalizeList(
            unwrap(response)
        ).map(normalizeSize);
    },

    async getSize(id) {
        const response =
            await axiosClient.get(
                `/admin/sizes/${id}`
            );

        return normalizeSize(
            unwrap(response)
        );
    },

    async createSize(payload) {
        const response =
            await axiosClient.post(
                "/admin/sizes",
                {
                    sizeName:
                        payload.sizeName,

                    sortOrder:
                        Number(
                            payload.sortOrder
                        ),

                    status:
                        payload.status,
                }
            );

        return normalizeSize(
            unwrap(response)
        );
    },

    async updateSize(
        id,
        payload
    ) {
        const response =
            await axiosClient.put(
                `/admin/sizes/${id}`,
                {
                    sizeName:
                        payload.sizeName,

                    sortOrder:
                        Number(
                            payload.sortOrder
                        ),

                    status:
                        payload.status,
                }
            );

        return normalizeSize(
            unwrap(response)
        );
    },

    async updateStatus(
        id,
        status
    ) {
        const response =
            await axiosClient.patch(
                `/admin/sizes/${id}/status`,
                {
                    status,
                }
            );

        return normalizeSize(
            unwrap(response)
        );
    },

    async deleteSize(id) {
        const response =
            await axiosClient.delete(
                `/admin/sizes/${id}`
            );

        return unwrap(response);
    },
};

export default adminSizeService;