const swaggerJSDoc = require("swagger-jsdoc");
const { version } = require("../../package.json");

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Expense Tracker API",
    version,
    description:
      "A RESTful API for personal finance tracking with JWT authentication, transaction CRUD, aggregation pipelines for summaries, monthly breakdowns, and category analytics.",
    contact: {
      name: "Serkanby",
      url: "https://serkanbayraktar.com/",
    },
    license: {
      name: "MIT",
      url: "https://opensource.org/licenses/MIT",
    },
  },
  servers: [
    {
      url: "/api",
      description: "API base path",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Enter your JWT token obtained from /auth/login or /auth/register",
      },
    },
    schemas: {
      User: {
        type: "object",
        properties: {
          id: { type: "string", example: "664a1f2e8b1c4a001e3d5678" },
          name: { type: "string", example: "John Doe" },
          email: { type: "string", format: "email", example: "john@example.com" },
        },
      },
      AuthResponse: {
        type: "object",
        properties: {
          user: { $ref: "#/components/schemas/User" },
          token: {
            type: "string",
            example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
          },
        },
      },
      RegisterInput: {
        type: "object",
        required: ["name", "email", "password"],
        properties: {
          name: {
            type: "string",
            maxLength: 50,
            example: "John Doe",
          },
          email: {
            type: "string",
            format: "email",
            example: "john@example.com",
          },
          password: {
            type: "string",
            minLength: 8,
            maxLength: 128,
            example: "securePass123",
          },
        },
      },
      LoginInput: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: {
            type: "string",
            format: "email",
            example: "john@example.com",
          },
          password: {
            type: "string",
            maxLength: 128,
            example: "securePass123",
          },
        },
      },
      Transaction: {
        type: "object",
        properties: {
          _id: { type: "string", example: "664a2b3c9d1e5f002a7b8901" },
          type: { type: "string", enum: ["income", "expense"], example: "expense" },
          amount: { type: "number", minimum: 0.01, example: 42.5 },
          category: {
            type: "string",
            enum: [
              "food",
              "salary",
              "transport",
              "entertainment",
              "health",
              "education",
              "shopping",
              "bills",
              "other",
            ],
            example: "food",
          },
          description: { type: "string", maxLength: 200, example: "Lunch at cafe" },
          date: {
            type: "string",
            format: "date-time",
            example: "2026-03-15T12:00:00.000Z",
          },
          userId: { type: "string", example: "664a1f2e8b1c4a001e3d5678" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      CreateTransactionInput: {
        type: "object",
        required: ["type", "amount", "category"],
        properties: {
          type: { type: "string", enum: ["income", "expense"], example: "expense" },
          amount: {
            type: "number",
            minimum: 0.01,
            maximum: 999999999.99,
            example: 42.5,
          },
          category: {
            type: "string",
            enum: [
              "food",
              "salary",
              "transport",
              "entertainment",
              "health",
              "education",
              "shopping",
              "bills",
              "other",
            ],
            example: "food",
          },
          description: { type: "string", maxLength: 200, example: "Lunch at cafe" },
          date: {
            type: "string",
            format: "date-time",
            description: "ISO 8601 date. Cannot be in the future. Defaults to now.",
            example: "2026-03-15T12:00:00.000Z",
          },
        },
      },
      UpdateTransactionInput: {
        type: "object",
        properties: {
          type: { type: "string", enum: ["income", "expense"] },
          amount: { type: "number", minimum: 0.01, maximum: 999999999.99 },
          category: {
            type: "string",
            enum: [
              "food",
              "salary",
              "transport",
              "entertainment",
              "health",
              "education",
              "shopping",
              "bills",
              "other",
            ],
          },
          description: { type: "string", maxLength: 200 },
          date: { type: "string", format: "date-time" },
        },
      },
      TransactionList: {
        type: "object",
        properties: {
          transactions: {
            type: "array",
            items: { $ref: "#/components/schemas/Transaction" },
          },
          pagination: {
            type: "object",
            properties: {
              currentPage: { type: "integer", example: 1 },
              totalPages: { type: "integer", example: 5 },
              totalCount: { type: "integer", example: 47 },
              limit: { type: "integer", example: 10 },
              hasNextPage: { type: "boolean", example: true },
              hasPrevPage: { type: "boolean", example: false },
            },
          },
        },
      },
      Summary: {
        type: "object",
        properties: {
          totalIncome: { type: "number", example: 5000 },
          totalExpense: { type: "number", example: 3200 },
          netBalance: { type: "number", example: 1800 },
        },
      },
      MonthlyBreakdownItem: {
        type: "object",
        properties: {
          month: { type: "integer", minimum: 1, maximum: 12, example: 3 },
          year: { type: "integer", example: 2026 },
          type: { type: "string", enum: ["income", "expense"], example: "expense" },
          total: { type: "number", example: 1200 },
        },
      },
      CategoryBreakdownItem: {
        type: "object",
        properties: {
          category: { type: "string", example: "food" },
          total: { type: "number", example: 850 },
        },
      },
      Error: {
        type: "object",
        properties: {
          message: { type: "string", example: "Error description" },
        },
      },
      ValidationError: {
        type: "object",
        properties: {
          errors: {
            type: "array",
            items: {
              type: "object",
              properties: {
                field: { type: "string" },
                message: { type: "string" },
              },
            },
          },
        },
      },
      HealthCheck: {
        type: "object",
        properties: {
          status: { type: "string", example: "ok" },
          timestamp: { type: "integer", example: 1712345678901 },
        },
      },
    },
    responses: {
      Unauthorized: {
        description: "Missing or invalid JWT token",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/Error" },
            example: { message: "Not authorized, no token provided" },
          },
        },
      },
      NotFound: {
        description: "Resource not found",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/Error" },
            example: { message: "Transaction not found" },
          },
        },
      },
      ValidationFailed: {
        description: "Input validation failed",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ValidationError" },
          },
        },
      },
      TooManyRequests: {
        description: "Rate limit exceeded",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/Error" },
            example: { message: "Too many requests, please try again later" },
          },
        },
      },
      InternalError: {
        description: "Internal server error",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/Error" },
            example: { message: "Internal server error" },
          },
        },
      },
    },
  },
  paths: {
    "/health": {
      get: {
        tags: ["Health"],
        summary: "Health check",
        description: "Returns API health status and current timestamp for deployment monitoring.",
        responses: {
          200: {
            description: "API is healthy",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/HealthCheck" },
              },
            },
          },
        },
      },
    },
    "/auth/register": {
      post: {
        tags: ["Authentication"],
        summary: "Register a new user",
        description:
          "Create a new user account with name, email, and password. Returns user data and JWT token.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RegisterInput" },
            },
          },
        },
        responses: {
          201: {
            description: "User registered successfully",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AuthResponse" },
              },
            },
          },
          409: {
            description: "Email already in use",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
                example: { message: "Email already in use" },
              },
            },
          },
          422: { $ref: "#/components/responses/ValidationFailed" },
          429: { $ref: "#/components/responses/TooManyRequests" },
          500: { $ref: "#/components/responses/InternalError" },
        },
      },
    },
    "/auth/login": {
      post: {
        tags: ["Authentication"],
        summary: "Login user",
        description:
          "Authenticate with email and password. Returns user data and JWT token on success.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LoginInput" },
            },
          },
        },
        responses: {
          200: {
            description: "Login successful",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AuthResponse" },
              },
            },
          },
          401: {
            description: "Invalid credentials",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
                example: { message: "Invalid credentials" },
              },
            },
          },
          422: { $ref: "#/components/responses/ValidationFailed" },
          429: { $ref: "#/components/responses/TooManyRequests" },
          500: { $ref: "#/components/responses/InternalError" },
        },
      },
    },
    "/auth/me": {
      get: {
        tags: ["Authentication"],
        summary: "Get current user",
        description: "Retrieve the authenticated user's profile using their JWT token.",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Current user profile",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    user: { $ref: "#/components/schemas/User" },
                  },
                },
              },
            },
          },
          401: { $ref: "#/components/responses/Unauthorized" },
          500: { $ref: "#/components/responses/InternalError" },
        },
      },
    },
    "/transactions": {
      get: {
        tags: ["Transactions"],
        summary: "List transactions",
        description:
          "Get paginated list of the authenticated user's transactions with optional filtering by month, category, and type.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "query",
            name: "page",
            schema: { type: "integer", minimum: 1, default: 1 },
            description: "Page number",
          },
          {
            in: "query",
            name: "limit",
            schema: { type: "integer", minimum: 1, maximum: 100, default: 50 },
            description: "Items per page (max 100)",
          },
          {
            in: "query",
            name: "month",
            schema: { type: "string", pattern: "^\\d{4}-(0[1-9]|1[0-2])$" },
            description: "Filter by month (YYYY-MM format)",
            example: "2026-03",
          },
          {
            in: "query",
            name: "category",
            schema: {
              type: "string",
              enum: [
                "food",
                "salary",
                "transport",
                "entertainment",
                "health",
                "education",
                "shopping",
                "bills",
                "other",
              ],
            },
            description: "Filter by category",
          },
          {
            in: "query",
            name: "type",
            schema: { type: "string", enum: ["income", "expense"] },
            description: "Filter by transaction type",
          },
        ],
        responses: {
          200: {
            description: "Paginated transaction list",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/TransactionList" },
              },
            },
          },
          400: {
            description: "Invalid filter parameters",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          401: { $ref: "#/components/responses/Unauthorized" },
          500: { $ref: "#/components/responses/InternalError" },
        },
      },
      post: {
        tags: ["Transactions"],
        summary: "Create transaction",
        description: "Create a new income or expense transaction for the authenticated user.",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateTransactionInput" },
            },
          },
        },
        responses: {
          201: {
            description: "Transaction created",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    transaction: { $ref: "#/components/schemas/Transaction" },
                  },
                },
              },
            },
          },
          422: { $ref: "#/components/responses/ValidationFailed" },
          401: { $ref: "#/components/responses/Unauthorized" },
          500: { $ref: "#/components/responses/InternalError" },
        },
      },
    },
    "/transactions/summary": {
      get: {
        tags: ["Transactions"],
        summary: "Get financial summary",
        description:
          "Get total income, total expense, and net balance for the authenticated user. Optionally filter by month.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "query",
            name: "month",
            schema: { type: "string", pattern: "^\\d{4}-(0[1-9]|1[0-2])$" },
            description: "Filter by month (YYYY-MM format)",
            example: "2026-03",
          },
        ],
        responses: {
          200: {
            description: "Financial summary",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Summary" },
              },
            },
          },
          400: {
            description: "Invalid month format",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          401: { $ref: "#/components/responses/Unauthorized" },
          500: { $ref: "#/components/responses/InternalError" },
        },
      },
    },
    "/transactions/monthly": {
      get: {
        tags: ["Transactions"],
        summary: "Get monthly breakdown",
        description:
          "Get monthly income and expense totals grouped by month and type. Used for bar chart visualizations.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "query",
            name: "type",
            schema: { type: "string", enum: ["income", "expense"] },
            description: "Filter by transaction type",
          },
          {
            in: "query",
            name: "year",
            schema: { type: "integer", minimum: 2000, maximum: 2100 },
            description: "Filter by year",
            example: 2026,
          },
        ],
        responses: {
          200: {
            description: "Monthly breakdown",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    breakdown: {
                      type: "array",
                      items: { $ref: "#/components/schemas/MonthlyBreakdownItem" },
                    },
                  },
                },
              },
            },
          },
          400: {
            description: "Invalid parameters",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          401: { $ref: "#/components/responses/Unauthorized" },
          500: { $ref: "#/components/responses/InternalError" },
        },
      },
    },
    "/transactions/categories": {
      get: {
        tags: ["Transactions"],
        summary: "Get category breakdown",
        description:
          "Get spending totals grouped by category, sorted by highest total. Used for pie chart visualizations.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "query",
            name: "type",
            schema: { type: "string", enum: ["income", "expense"] },
            description: "Filter by transaction type",
          },
          {
            in: "query",
            name: "month",
            schema: { type: "string", pattern: "^\\d{4}-(0[1-9]|1[0-2])$" },
            description: "Filter by month (YYYY-MM format)",
            example: "2026-03",
          },
        ],
        responses: {
          200: {
            description: "Category breakdown",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    breakdown: {
                      type: "array",
                      items: { $ref: "#/components/schemas/CategoryBreakdownItem" },
                    },
                  },
                },
              },
            },
          },
          400: {
            description: "Invalid parameters",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          401: { $ref: "#/components/responses/Unauthorized" },
          500: { $ref: "#/components/responses/InternalError" },
        },
      },
    },
    "/transactions/{id}": {
      get: {
        tags: ["Transactions"],
        summary: "Get transaction by ID",
        description: "Retrieve a single transaction by its ID. Only the owner can access it.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string" },
            description: "Transaction MongoDB ObjectId",
          },
        ],
        responses: {
          200: {
            description: "Transaction details",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    transaction: { $ref: "#/components/schemas/Transaction" },
                  },
                },
              },
            },
          },
          400: {
            description: "Invalid transaction ID",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
                example: { message: "Invalid transaction ID" },
              },
            },
          },
          401: { $ref: "#/components/responses/Unauthorized" },
          404: { $ref: "#/components/responses/NotFound" },
          500: { $ref: "#/components/responses/InternalError" },
        },
      },
      put: {
        tags: ["Transactions"],
        summary: "Update transaction",
        description:
          "Update an existing transaction's fields. Only the owner can update it. All fields are optional.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string" },
            description: "Transaction MongoDB ObjectId",
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateTransactionInput" },
            },
          },
        },
        responses: {
          200: {
            description: "Transaction updated",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    transaction: { $ref: "#/components/schemas/Transaction" },
                  },
                },
              },
            },
          },
          400: {
            description: "Invalid transaction ID",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          401: { $ref: "#/components/responses/Unauthorized" },
          404: { $ref: "#/components/responses/NotFound" },
          422: { $ref: "#/components/responses/ValidationFailed" },
          500: { $ref: "#/components/responses/InternalError" },
        },
      },
      delete: {
        tags: ["Transactions"],
        summary: "Delete transaction",
        description: "Permanently delete a transaction. Only the owner can delete it.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string" },
            description: "Transaction MongoDB ObjectId",
          },
        ],
        responses: {
          200: {
            description: "Transaction deleted",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string", example: "Transaction deleted" },
                  },
                },
              },
            },
          },
          400: {
            description: "Invalid transaction ID",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          401: { $ref: "#/components/responses/Unauthorized" },
          404: { $ref: "#/components/responses/NotFound" },
          500: { $ref: "#/components/responses/InternalError" },
        },
      },
    },
  },
  tags: [
    {
      name: "Health",
      description: "API health monitoring",
    },
    {
      name: "Authentication",
      description: "User registration, login, and session management",
    },
    {
      name: "Transactions",
      description: "Income and expense transaction CRUD and analytics",
    },
  ],
};

const swaggerSpec = swaggerJSDoc({
  swaggerDefinition,
  apis: [],
});

module.exports = swaggerSpec;
