const fs =
    require(
        "fs"
    );

const path =
    require(
        "path"
    );

const ApiError =
    require(
        "../utils/ApiError"
    );

const {
    getProfileById,
    updateProfile,
    updateAvatar,
} = require(
    "../models/user.model"
);

// ============================================================
// CONSTANTS
// ============================================================

const avatarDirectory =
    path.resolve(
        __dirname,
        "../../uploads/avatars"
    );

// ============================================================
// SAFE DELETE
// ============================================================

const safeDeleteAvatarFile =
    async (
        filePath
    ) => {
        if (!filePath) {
            return;
        }

        const resolvedPath =
            path.resolve(
                filePath
            );

        const allowedPrefix =
            avatarDirectory +
            path.sep;

        // Không bao giờ cho phép xóa file
        // bên ngoài uploads/avatars.
        if (
            !resolvedPath.startsWith(
                allowedPrefix
            )
        ) {
            return;
        }

        try {
            await fs.promises.unlink(
                resolvedPath
            );
        } catch (error) {
            if (
                error.code !==
                "ENOENT"
            ) {
                console.error(
                    "Failed to delete avatar file"
                );
            }
        }
    };

// ============================================================
// DETECT REAL IMAGE TYPE
// ============================================================

const detectImageType =
    async (
        filePath
    ) => {
        const fileHandle =
            await fs.promises.open(
                filePath,
                "r"
            );

        try {
            const buffer =
                Buffer.alloc(
                    12
                );

            await fileHandle.read(
                buffer,
                0,
                12,
                0
            );

            // JPEG
            if (
                buffer[0] === 0xff &&
                buffer[1] === 0xd8 &&
                buffer[2] === 0xff
            ) {
                return "jpeg";
            }

            // PNG
            if (
                buffer[0] === 0x89 &&
                buffer[1] === 0x50 &&
                buffer[2] === 0x4e &&
                buffer[3] === 0x47 &&
                buffer[4] === 0x0d &&
                buffer[5] === 0x0a &&
                buffer[6] === 0x1a &&
                buffer[7] === 0x0a
            ) {
                return "png";
            }

            // WEBP:
            // RIFF....WEBP
            if (
                buffer
                    .subarray(
                        0,
                        4
                    )
                    .toString() ===
                    "RIFF" &&
                buffer
                    .subarray(
                        8,
                        12
                    )
                    .toString() ===
                    "WEBP"
            ) {
                return "webp";
            }

            return null;
        } finally {
            await fileHandle.close();
        }
    };

// ============================================================
// VALIDATE UPLOADED IMAGE
// ============================================================

const validateRealImage =
    async (
        file
    ) => {
        const uploadedPath =
            path.resolve(
                file.path
            );

        const allowedPrefix =
            avatarDirectory +
            path.sep;

        if (
            !uploadedPath.startsWith(
                allowedPrefix
            )
        ) {
            throw new ApiError(
                400,
                "Invalid upload path"
            );
        }

        const detectedType =
            await detectImageType(
                uploadedPath
            );

        if (!detectedType) {
            throw new ApiError(
                400,
                "Uploaded file is not a valid image"
            );
        }

        const ext =
            path.extname(
                file.filename
            )
                .toLowerCase();

        const extensionMap = {
            jpeg: [
                ".jpg",
                ".jpeg",
            ],

            png: [
                ".png",
            ],

            webp: [
                ".webp",
            ],
        };

        if (
            !extensionMap[
                detectedType
            ]?.includes(
                ext
            )
        ) {
            throw new ApiError(
                400,
                "Image content does not match file extension"
            );
        }
    };

// ============================================================
// GET PROFILE
// ============================================================

const getProfile =
    async (
        userId
    ) => {
        const user =
            await getProfileById(
                userId
            );

        if (!user) {
            throw new ApiError(
                404,
                "User not found"
            );
        }

        return user;
    };

// ============================================================
// UPDATE PROFILE
// ============================================================

const updateProfileService =
    async (
        userId,
        data
    ) => {
        const user =
            await getProfileById(
                userId
            );

        if (!user) {
            throw new ApiError(
                404,
                "User not found"
            );
        }

        return updateProfile(
            userId,
            data
        );
    };

// ============================================================
// UPDATE AVATAR
// ============================================================

const updateAvatarService =
    async (
        userId,
        file
    ) => {
        if (!file) {
            throw new ApiError(
                400,
                "Avatar file is required"
            );
        }

        const newFilePath =
            path.resolve(
                file.path
            );

        try {
            // =================================================
            // VERIFY REAL FILE CONTENT
            // =================================================

            await validateRealImage(
                file
            );

            // =================================================
            // USER
            // =================================================

            const user =
                await getProfileById(
                    userId
                );

            if (!user) {
                throw new ApiError(
                    404,
                    "User not found"
                );
            }

            // =================================================
            // DATABASE UPDATE
            // =================================================

            const avatarPath =
                `/uploads/avatars/${file.filename}`;

            await updateAvatar(
                userId,
                avatarPath
            );

            // =================================================
            // DELETE OLD AVATAR SAFELY
            // =================================================

            if (
                user.avatar &&
                user.avatar.startsWith(
                    "/uploads/avatars/"
                )
            ) {
                const oldFilename =
                    path.basename(
                        user.avatar
                    );

                const oldFilePath =
                    path.resolve(
                        avatarDirectory,
                        oldFilename
                    );

                await safeDeleteAvatarFile(
                    oldFilePath
                );
            }

            // =================================================
            // RETURN UPDATED PROFILE
            // =================================================

            return getProfileById(
                userId
            );
        } catch (error) {
            // Nếu bất kỳ bước nào thất bại,
            // xóa file vừa upload để tránh file rác.
            await safeDeleteAvatarFile(
                newFilePath
            );

            throw error;
        }
    };

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
    getProfile,

    updateProfile:
        updateProfileService,

    updateAvatar:
        updateAvatarService,
};