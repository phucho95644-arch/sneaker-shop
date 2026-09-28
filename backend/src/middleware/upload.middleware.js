const fs = require("fs");
const path = require("path");
const multer = require("multer");
const crypto = require("crypto");

const ApiError =
    require(
        "../utils/ApiError"
    );

// ============================================================
// UPLOAD DIRECTORY
// ============================================================

const uploadDir =
    path.resolve(
        __dirname,
        "../../uploads/avatars"
    );

if (
    !fs.existsSync(
        uploadDir
    )
) {
    fs.mkdirSync(
        uploadDir,
        {
            recursive: true,
        }
    );
}

// ============================================================
// ALLOWED TYPES
// ============================================================

const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
];

const allowedExtensions = [
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
];

// ============================================================
// STORAGE
// ============================================================

const storage =
    multer.diskStorage({
        destination: (
            req,
            file,
            cb
        ) => {
            cb(
                null,
                uploadDir
            );
        },

        filename: (
            req,
            file,
            cb
        ) => {
            const ext =
                path.extname(
                    file.originalname
                )
                    .toLowerCase();

            const randomName =
                crypto
                    .randomBytes(16)
                    .toString(
                        "hex"
                    );

            const filename =
                `avatar-${Date.now()}-${randomName}${ext}`;

            cb(
                null,
                filename
            );
        },
    });

// ============================================================
// FILE FILTER
// ============================================================

const fileFilter = (
    req,
    file,
    cb
) => {
    const ext =
        path.extname(
            file.originalname
        )
            .toLowerCase();

    if (
        !allowedMimeTypes.includes(
            file.mimetype
        ) ||
        !allowedExtensions.includes(
            ext
        )
    ) {
        return cb(
            new ApiError(
                400,
                "Only JPG, JPEG, PNG and WEBP images are allowed"
            )
        );
    }

    return cb(
        null,
        true
    );
};

// ============================================================
// MULTER
// ============================================================

const upload =
    multer({
        storage,

        fileFilter,

        limits: {
            fileSize:
                5 *
                1024 *
                1024,

            files: 1,

            fields: 5,
        },
    });

module.exports =
    upload;