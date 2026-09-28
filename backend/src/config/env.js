const VALID_NODE_ENVS = [
    "development",
    "test",
    "production",
];

// ============================================================
// HELPERS
// ============================================================

const requireValue = (
    key
) => {
    const value =
        process.env[key];

    if (
        value === undefined ||
        String(value).trim() === ""
    ) {
        throw new Error(
            `Missing required environment variable: ${key}`
        );
    }

    return String(
        value
    ).trim();
};

const parsePort = (
    key,
    defaultValue
) => {
    const value =
        Number(
            process.env[key] ||
            defaultValue
        );

    if (
        !Number.isInteger(value) ||
        value < 1 ||
        value > 65535
    ) {
        throw new Error(
            `${key} must be a valid port number`
        );
    }

    return value;
};

const parsePositiveInteger = (
    key,
    defaultValue
) => {
    const value =
        Number(
            process.env[key] ||
            defaultValue
        );

    if (
        !Number.isInteger(value) ||
        value <= 0
    ) {
        throw new Error(
            `${key} must be a positive integer`
        );
    }

    return value;
};

// ============================================================
// VALIDATE CLIENT ORIGINS
// ============================================================

const validateClientUrls =
    (
        value
    ) => {
        if (!value) {
            return [];
        }

        const origins =
            String(value)
                .split(",")
                .map(
                    (item) =>
                        item.trim()
                )
                .filter(Boolean);

        for (
            const origin
            of origins
        ) {
            let parsed;

            try {
                parsed =
                    new URL(
                        origin
                    );
            } catch {
                throw new Error(
                    `Invalid CLIENT_URL origin: ${origin}`
                );
            }

            if (
                ![
                    "http:",
                    "https:",
                ].includes(
                    parsed.protocol
                )
            ) {
                throw new Error(
                    `CLIENT_URL must use http or https: ${origin}`
                );
            }
        }

        return origins;
    };

// ============================================================
// ENV VALIDATION
// ============================================================

const validateEnv = () => {
    const nodeEnv =
        String(
            process.env.NODE_ENV ||
            "development"
        )
            .trim()
            .toLowerCase();

    if (
        !VALID_NODE_ENVS.includes(
            nodeEnv
        )
    ) {
        throw new Error(
            `NODE_ENV must be one of: ${VALID_NODE_ENVS.join(", ")}`
        );
    }

    const port =
        parsePort(
            "PORT",
            5000
        );

    const dbPort =
        parsePort(
            "DB_PORT",
            3306
        );

    requireValue(
        "DB_HOST"
    );

    requireValue(
        "DB_USER"
    );

    requireValue(
        "DB_NAME"
    );

    const jwtSecret =
        requireValue(
            "JWT_SECRET"
        );

    // Production phải dùng secret đủ mạnh.
    if (
        nodeEnv ===
            "production" &&
        jwtSecret.length < 32
    ) {
        throw new Error(
            "JWT_SECRET must contain at least 32 characters in production"
        );
    }

    // Local MySQL có thể không có password.
    // Production thì không chấp nhận password rỗng.
    if (
        nodeEnv ===
            "production" &&
        !String(
            process.env.DB_PASSWORD ||
            ""
        ).trim()
    ) {
        throw new Error(
            "DB_PASSWORD is required in production"
        );
    }

    const clientOrigins =
        validateClientUrls(
            process.env.CLIENT_URL
        );

    if (
        nodeEnv ===
            "production" &&
        clientOrigins.length === 0
    ) {
        throw new Error(
            "CLIENT_URL is required in production"
        );
    }

    parsePositiveInteger(
        "API_RATE_LIMIT",
        1000
    );

    parsePositiveInteger(
        "LOGIN_RATE_LIMIT",
        10
    );

    parsePositiveInteger(
        "REGISTER_RATE_LIMIT",
        20
    );

    return {
        nodeEnv,
        port,
        dbPort,
        clientOrigins,
    };
};

module.exports = {
    validateEnv,
};