import {
    useCallback,
    useEffect,
    useState,
} from "react";

import {
    Link,
} from "react-router-dom";

import {
    FaArrowLeft,
    FaCheck,
    FaEdit,
    FaHome,
    FaMapMarkerAlt,
    FaPlus,
    FaSave,
    FaTimes,
    FaTrash,
} from "react-icons/fa";

import {
    toast,
} from "react-toastify";

import addressService from "../../services/addressService";

import "./AddressPage.css";

// ============================================================
// EMPTY FORM
// ============================================================

const EMPTY_FORM = {
    fullName: "",
    phone: "",
    province: "",
    district: "",
    ward: "",
    addressDetail: "",
    isDefault: false,
};

// ============================================================
// NORMALIZE ADDRESS
// ============================================================

const normalizeAddress = (
    address
) => ({
    id:
        address.id ??
        address.address_id ??
        address.addressId,

    fullName:
        address.receiverName ??
        address.receiver_name ??
        address.fullName ??
        address.full_name ??
        "",

    phone:
        address.receiverPhone ??
        address.receiver_phone ??
        address.phone ??
        "",

    province:
        address.province ??
        "",

    district:
        address.district ??
        "",

    ward:
        address.ward ??
        "",

    addressDetail:
        address.addressDetail ??
        address.address_detail ??
        "",

    isDefault:
        Boolean(
            address.isDefault ??
            address.is_default ??
            false
        ),
});

// ============================================================
// EXTRACT LIST
// ============================================================

const extractAddresses = (
    response
) => {
    if (
        Array.isArray(
            response
        )
    ) {
        return response;
    }

    if (
        Array.isArray(
            response?.data
        )
    ) {
        return response.data;
    }

    if (
        Array.isArray(
            response?.data?.addresses
        )
    ) {
        return response.data.addresses;
    }

    if (
        Array.isArray(
            response?.addresses
        )
    ) {
        return response.addresses;
    }

    return [];
};

// ============================================================
// ADDRESS PAGE
// ============================================================

function AddressPage() {
    const [
        addresses,
        setAddresses,
    ] = useState([]);

    const [
        loading,
        setLoading,
    ] = useState(true);

    const [
        showForm,
        setShowForm,
    ] = useState(false);

    const [
        editingId,
        setEditingId,
    ] = useState(null);

    const [
        formData,
        setFormData,
    ] = useState(
        EMPTY_FORM
    );

    const [
        saving,
        setSaving,
    ] = useState(false);

    const [
        deletingId,
        setDeletingId,
    ] = useState(null);

    const [
        defaultingId,
        setDefaultingId,
    ] = useState(null);

    // ========================================================
    // LOAD ADDRESSES
    // ========================================================

    const loadAddresses =
        useCallback(
            async () => {
                try {
                    setLoading(
                        true
                    );

                    const response =
                        await addressService.getAddresses();

                    const list =
                        extractAddresses(
                            response
                        ).map(
                            normalizeAddress
                        );

                    setAddresses(
                        list
                    );
                } catch (error) {
                    console.error(
                        "LOAD ADDRESSES ERROR:",
                        error
                    );

                    toast.error(
                        error.response
                            ?.data
                            ?.message ||
                            "Không thể tải sổ địa chỉ."
                    );
                } finally {
                    setLoading(
                        false
                    );
                }
            },
            []
        );

    useEffect(() => {
        loadAddresses();
    }, [
        loadAddresses,
    ]);

    // ========================================================
    // OPEN CREATE
    // ========================================================

    const openCreate =
        () => {
            setEditingId(
                null
            );

            setFormData({
                ...EMPTY_FORM,

                isDefault:
                    addresses.length ===
                    0,
            });

            setShowForm(
                true
            );
        };

    // ========================================================
    // OPEN EDIT
    // ========================================================

    const openEdit = (
        address
    ) => {
        setEditingId(
            address.id
        );

        setFormData({
            fullName:
                address.fullName,

            phone:
                address.phone,

            province:
                address.province,

            district:
                address.district,

            ward:
                address.ward,

            addressDetail:
                address.addressDetail,

            isDefault:
                address.isDefault,
        });

        setShowForm(
            true
        );
    };

    // ========================================================
    // CLOSE FORM
    // ========================================================

    const closeForm =
        () => {
            if (saving) {
                return;
            }

            setShowForm(
                false
            );

            setEditingId(
                null
            );

            setFormData(
                EMPTY_FORM
            );
        };

    // ========================================================
    // CHANGE FORM
    // ========================================================

    const handleChange = (
        event
    ) => {
        const {
            name,
            value,
            type,
            checked,
        } =
            event.target;

        // Chỉ cho phép nhập số ở ô điện thoại và tối đa 10 chữ số
        if (
            name ===
            "phone"
        ) {
            const digitsOnly =
                value
                    .replace(
                        /\D/g,
                        ""
                    )
                    .slice(
                        0,
                        10
                    );

            setFormData(
                (
                    current
                ) => ({
                    ...current,
                    phone:
                        digitsOnly,
                })
            );

            return;
        }

        setFormData(
            (
                current
            ) => ({
                ...current,

                [name]:
                    type ===
                    "checkbox"
                        ? checked
                        : value,
            })
        );
    };

    // ========================================================
    // VALIDATE
    // ========================================================

    const validateForm =
        () => {
            const fullName =
                formData.fullName.trim();

            const phone =
                formData.phone.trim();

            const province =
                formData.province.trim();

            const district =
                formData.district.trim();

            const ward =
                formData.ward.trim();

            const addressDetail =
                formData.addressDetail.trim();

            if (
                fullName.length <
                2
            ) {
                toast.warning(
                    "Họ tên người nhận phải có ít nhất 2 ký tự."
                );

                return false;
            }

            if (
                !/^0\d{9}$/.test(
                    phone
                )
            ) {
                toast.warning(
                    "Số điện thoại phải gồm đúng 10 chữ số và bắt đầu bằng 0."
                );

                return false;
            }

            if (
                !province ||
                !district ||
                !ward ||
                !addressDetail
            ) {
                toast.warning(
                    "Vui lòng nhập đầy đủ địa chỉ."
                );

                return false;
            }

            return true;
        };

    // ========================================================
    // SAVE
    // ========================================================

    const handleSubmit =
        async (
            event
        ) => {
            event.preventDefault();

            if (
                !validateForm()
            ) {
                return;
            }

            const payload = {
                receiverName:
                    formData.fullName.trim(),

                receiverPhone:
                    formData.phone.trim(),

                province:
                    formData.province.trim(),

                district:
                    formData.district.trim(),

                ward:
                    formData.ward.trim(),

                addressDetail:
                    formData.addressDetail.trim(),

                isDefault:
                    Boolean(
                        formData.isDefault
                    ),
            };

            console.log(
                "ADDRESS PAYLOAD:",
                payload
            );

            try {
                setSaving(
                    true
                );

                let response;

                if (
                    editingId
                ) {
                    response =
                        await addressService.updateAddress(
                            editingId,
                            payload
                        );

                    toast.success(
                        response?.message ||
                        "Cập nhật địa chỉ thành công."
                    );
                } else {
                    response =
                        await addressService.createAddress(
                            payload
                        );

                    toast.success(
                        response?.message ||
                        "Thêm địa chỉ thành công."
                    );
                }

                // Không gọi closeForm() tại đây vì saving đang là true.
                // Reset trực tiếp để modal đóng ngay sau khi lưu thành công.
                setShowForm(
                    false
                );

                setEditingId(
                    null
                );

                setFormData(
                    EMPTY_FORM
                );

                await loadAddresses();
            } catch (error) {
                console.error(
                    "SAVE ADDRESS ERROR:",
                    error
                );

                const responseData =
                    error.response
                        ?.data;

                console.log(
                    "VALIDATION RESPONSE:",
                    responseData
                );

                const validationErrors =
                    responseData
                        ?.errors;

                let message =
                    responseData
                        ?.message ||
                    "Không thể lưu địa chỉ.";

                if (
                    Array.isArray(
                        validationErrors
                    ) &&
                    validationErrors.length >
                        0
                ) {
                    message =
                        validationErrors
                            .map(
                                (
                                    item
                                ) =>
                                    item?.msg ||
                                    item?.message ||
                                    item?.error ||
                                    "Dữ liệu không hợp lệ"
                            )
                            .join(
                                " • "
                            );
                }

                toast.error(
                    message
                );
            } finally {
                setSaving(
                    false
                );
            }
        };

    // ========================================================
    // DELETE
    // ========================================================

    const handleDelete =
        async (
            address
        ) => {
            if (
                address.isDefault
            ) {
                toast.warning(
                    "Không nên xóa địa chỉ mặc định. Hãy đặt địa chỉ khác làm mặc định trước."
                );

                return;
            }

            const confirmed =
                window.confirm(
                    "Bạn có chắc muốn xóa địa chỉ này?"
                );

            if (!confirmed) {
                return;
            }

            try {
                setDeletingId(
                    address.id
                );

                const response =
                    await addressService.deleteAddress(
                        address.id
                    );

                toast.success(
                    response?.message ||
                    "Đã xóa địa chỉ."
                );

                await loadAddresses();
            } catch (error) {
                console.error(
                    "DELETE ADDRESS ERROR:",
                    error
                );

                toast.error(
                    error.response
                        ?.data
                        ?.message ||
                        "Không thể xóa địa chỉ."
                );
            } finally {
                setDeletingId(
                    null
                );
            }
        };

    // ========================================================
    // SET DEFAULT
    // ========================================================

    const handleSetDefault =
        async (
            address
        ) => {
            if (
                address.isDefault
            ) {
                return;
            }

            try {
                setDefaultingId(
                    address.id
                );

                const payload = {
                    receiverName:
                        address.fullName,

                    receiverPhone:
                        address.phone,

                    province:
                        address.province,

                    district:
                        address.district,

                    ward:
                        address.ward,

                    addressDetail:
                        address.addressDetail,

                    isDefault:
                        true,
                };

                const response =
                    await addressService.updateAddress(
                        address.id,
                        payload
                    );

                toast.success(
                    response?.message ||
                    "Đã đặt làm địa chỉ mặc định."
                );

                await loadAddresses();
            } catch (error) {
                console.error(
                    "DEFAULT ADDRESS ERROR:",
                    error
                );

                toast.error(
                    error.response
                        ?.data
                        ?.message ||
                        "Không thể đặt địa chỉ mặc định."
                );
            } finally {
                setDefaultingId(
                    null
                );
            }
        };

    // ========================================================
    // LOADING
    // ========================================================

    if (loading) {
        return (
            <div className="address-loading">
                <div
                    className="spinner-border"
                    role="status"
                />

                <span>
                    Đang tải địa chỉ...
                </span>
            </div>
        );
    }

    // ========================================================
    // UI
    // ========================================================

    return (
        <div className="address-page">
            <div className="container">
                {/* ==================================================
                    TOP
                ================================================== */}

                <div className="address-top">
                    <div>
                        <Link
                            to="/profile"
                            className="address-back"
                        >
                            <FaArrowLeft />

                            Hồ sơ
                        </Link>

                        <span className="address-eyebrow">
                            TÀI KHOẢN
                        </span>

                        <h1>
                            Sổ địa chỉ
                        </h1>

                        <p>
                            Quản lý địa chỉ giao hàng của bạn.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="address-add-btn"
                        onClick={
                            openCreate
                        }
                    >
                        <FaPlus />

                        Thêm địa chỉ
                    </button>
                </div>

                {/* ==================================================
                    EMPTY
                ================================================== */}

                {addresses.length ===
                    0 && (
                    <div className="address-empty">
                        <FaMapMarkerAlt />

                        <h2>
                            Chưa có địa chỉ
                        </h2>

                        <p>
                            Thêm địa chỉ nhận hàng để quá trình thanh toán nhanh hơn.
                        </p>

                        <button
                            type="button"
                            onClick={
                                openCreate
                            }
                        >
                            <FaPlus />

                            Thêm địa chỉ đầu tiên
                        </button>
                    </div>
                )}

                {/* ==================================================
                    GRID
                ================================================== */}

                {addresses.length >
                    0 && (
                    <div className="address-grid">
                        {addresses.map(
                            (
                                address
                            ) => (
                                <article
                                    className={
                                        address.isDefault
                                            ? "address-card default"
                                            : "address-card"
                                    }
                                    key={
                                        address.id
                                    }
                                >
                                    <div className="address-card-header">
                                        <div className="address-icon">
                                            <FaHome />
                                        </div>

                                        <div>
                                            <h2>
                                                {
                                                    address.fullName
                                                }
                                            </h2>

                                            {address.isDefault && (
                                                <span className="address-default-badge">
                                                    <FaCheck />

                                                    Mặc định
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="address-card-body">
                                        <p className="address-phone">
                                            {
                                                address.phone
                                            }
                                        </p>

                                        <p>
                                            {
                                                address.addressDetail
                                            }
                                        </p>

                                        <p>
                                            {[
                                                address.ward,
                                                address.district,
                                                address.province,
                                            ]
                                                .filter(
                                                    Boolean
                                                )
                                                .join(
                                                    ", "
                                                )}
                                        </p>
                                    </div>

                                    <div className="address-actions">
                                        {!address.isDefault && (
                                            <button
                                                type="button"
                                                className="address-default-btn"
                                                disabled={
                                                    defaultingId ===
                                                    address.id
                                                }
                                                onClick={() =>
                                                    handleSetDefault(
                                                        address
                                                    )
                                                }
                                            >
                                                {defaultingId ===
                                                address.id ? (
                                                    <span className="spinner-border spinner-border-sm" />
                                                ) : (
                                                    <FaCheck />
                                                )}

                                                Đặt mặc định
                                            </button>
                                        )}

                                        <button
                                            type="button"
                                            className="address-edit-btn"
                                            onClick={() =>
                                                openEdit(
                                                    address
                                                )
                                            }
                                        >
                                            <FaEdit />

                                            Sửa
                                        </button>

                                        <button
                                            type="button"
                                            className="address-delete-btn"
                                            disabled={
                                                deletingId ===
                                                address.id
                                            }
                                            onClick={() =>
                                                handleDelete(
                                                    address
                                                )
                                            }
                                        >
                                            {deletingId ===
                                            address.id ? (
                                                <span className="spinner-border spinner-border-sm" />
                                            ) : (
                                                <FaTrash />
                                            )}

                                            Xóa
                                        </button>
                                    </div>
                                </article>
                            )
                        )}
                    </div>
                )}
            </div>

            {/* ======================================================
                MODAL
            ====================================================== */}

            {showForm && (
                <div
                    className="address-modal-backdrop"
                    onMouseDown={
                        closeForm
                    }
                >
                    <div
                        className="address-modal"
                        onMouseDown={(
                            event
                        ) =>
                            event.stopPropagation()
                        }
                    >
                        <div className="address-modal-header">
                            <div>
                                <span>
                                    {editingId
                                        ? "CẬP NHẬT"
                                        : "ĐỊA CHỈ MỚI"}
                                </span>

                                <h2>
                                    {editingId
                                        ? "Sửa địa chỉ"
                                        : "Thêm địa chỉ"}
                                </h2>
                            </div>

                            <button
                                type="button"
                                onClick={
                                    closeForm
                                }
                                disabled={
                                    saving
                                }
                            >
                                <FaTimes />
                            </button>
                        </div>

                        <form
                            onSubmit={
                                handleSubmit
                            }
                        >
                            <div className="address-form-grid">
                                <div className="address-field">
                                    <label>
                                        Họ tên người nhận *
                                    </label>

                                    <input
                                        type="text"
                                        name="fullName"
                                        value={
                                            formData.fullName
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        maxLength={
                                            100
                                        }
                                        required
                                    />
                                </div>

                                <div className="address-field">
                                    <label>
                                        Số điện thoại *
                                    </label>

                                    <input
                                        type="tel"
                                        name="phone"
                                        value={
                                            formData.phone
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        inputMode="numeric"
                                        autoComplete="tel"
                                        maxLength={
                                            10
                                        }
                                        pattern="0[0-9]{9}"
                                        title="Số điện thoại phải gồm 10 chữ số và bắt đầu bằng 0"
                                        required
                                    />
                                </div>

                                <div className="address-field">
                                    <label>
                                        Tỉnh / Thành phố *
                                    </label>

                                    <input
                                        type="text"
                                        name="province"
                                        value={
                                            formData.province
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        maxLength={
                                            100
                                        }
                                        required
                                    />
                                </div>

                                <div className="address-field">
                                    <label>
                                        Quận / Huyện *
                                    </label>

                                    <input
                                        type="text"
                                        name="district"
                                        value={
                                            formData.district
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        maxLength={
                                            100
                                        }
                                        required
                                    />
                                </div>

                                <div className="address-field">
                                    <label>
                                        Phường / Xã *
                                    </label>

                                    <input
                                        type="text"
                                        name="ward"
                                        value={
                                            formData.ward
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        maxLength={
                                            100
                                        }
                                        required
                                    />
                                </div>

                                <div className="address-field address-field-full">
                                    <label>
                                        Địa chỉ chi tiết *
                                    </label>

                                    <input
                                        type="text"
                                        name="addressDetail"
                                        value={
                                            formData.addressDetail
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        maxLength={
                                            255
                                        }
                                        placeholder="Số nhà, tên đường..."
                                        required
                                    />
                                </div>
                            </div>

                            <label className="address-checkbox">
                                <input
                                    type="checkbox"
                                    name="isDefault"
                                    checked={
                                        formData.isDefault
                                    }
                                    onChange={
                                        handleChange
                                    }
                                />

                                <span>
                                    Đặt làm địa chỉ mặc định
                                </span>
                            </label>

                            <div className="address-modal-actions">
                                <button
                                    type="button"
                                    className="address-cancel-btn"
                                    onClick={
                                        closeForm
                                    }
                                    disabled={
                                        saving
                                    }
                                >
                                    Hủy
                                </button>

                                <button
                                    type="submit"
                                    className="address-save-btn"
                                    disabled={
                                        saving
                                    }
                                >
                                    {saving ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm" />

                                            Đang lưu...
                                        </>
                                    ) : (
                                        <>
                                            <FaSave />

                                            Lưu địa chỉ
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AddressPage;