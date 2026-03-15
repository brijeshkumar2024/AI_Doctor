import swaggerJsdoc from "swagger-jsdoc";

const definition = {
  openapi: "3.0.3",
  info: {
    title: "AI Health Report Analyzer & Assistant API",
    version: "1.0.0",
    description:
      "Production-ready API documentation for the AI Health Report Analyzer & Assistant platform. Authentication uses a secure HttpOnly cookie named `token`."
  },
  servers: [
    {
      url: process.env.APP_URL ? `${process.env.APP_URL}/api` : "http://localhost:5000/api",
      description: "Primary API server"
    }
  ],
  tags: [
    { name: "System", description: "Operational endpoints" },
    { name: "Auth", description: "Authentication and account recovery" },
    { name: "Reports", description: "Medical report upload and analysis" },
    { name: "Prescriptions", description: "Prescription upload and explanation" },
    { name: "Symptoms", description: "AI symptom checker" },
    { name: "Chat", description: "AI health assistant chat" },
    { name: "Profile", description: "User profile and language settings" },
    { name: "Dashboard", description: "Dashboard analytics and trends" }
  ],
  components: {
    securitySchemes: {
      cookieAuth: {
        type: "apiKey",
        in: "cookie",
        name: "token",
        description: "Session JWT stored in an HttpOnly cookie."
      }
    },
    schemas: {
      ErrorResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          message: { type: "string", example: "Not authorized" },
          timestamp: { type: "string", format: "date-time" },
          path: { type: "string", example: "/api/reports" },
          requestId: { type: "string", example: "7d552f6f-4bd8-4c51-a2a3-f74e73a3d6d1" }
        }
      },
      AuthUser: {
        type: "object",
        properties: {
          _id: { type: "string", example: "67fd0c1da47ff193b46bcb4f" },
          name: { type: "string", example: "Aarav" },
          email: { type: "string", format: "email", example: "aarav@example.com" },
          age: { type: "integer", example: 29, nullable: true },
          gender: { type: "string", example: "male" },
          height: { type: "string", example: "175 cm" },
          weight: { type: "string", example: "72 kg" },
          medicalHistory: { type: "string", example: "Mild anemia" },
          allergies: { type: "string", example: "Penicillin" },
          preferredLanguage: { type: "string", enum: ["en", "hi", "bn"], example: "en" }
        }
      },
      SignupRequest: {
        type: "object",
        required: ["name", "email", "password"],
        properties: {
          name: { type: "string", example: "Aarav" },
          email: { type: "string", format: "email", example: "aarav@example.com" },
          password: { type: "string", format: "password", example: "secret123" },
          age: { type: "integer", example: 29 },
          gender: { type: "string", enum: ["male", "female", "other", ""], example: "male" },
          height: { type: "string", example: "175 cm" },
          weight: { type: "string", example: "72 kg" },
          medicalHistory: { type: "string", example: "Mild anemia" },
          allergies: { type: "string", example: "Penicillin" },
          preferredLanguage: { type: "string", enum: ["en", "hi", "bn"], example: "en" }
        }
      },
      LoginRequest: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email", example: "aarav@example.com" },
          password: { type: "string", format: "password", example: "secret123" }
        }
      },
      ForgotPasswordRequest: {
        type: "object",
        required: ["email"],
        properties: {
          email: { type: "string", format: "email", example: "aarav@example.com" }
        }
      },
      ResetPasswordRequest: {
        type: "object",
        required: ["token", "password"],
        properties: {
          token: { type: "string", example: "raw-reset-token" },
          password: { type: "string", format: "password", example: "newSecret123" }
        }
      },
      ReportValue: {
        type: "object",
        properties: {
          parameter: { type: "string", example: "Hemoglobin" },
          value: { type: "number", example: 10.2 },
          rawValue: { type: "string", example: "10.2 g/dL" },
          unit: { type: "string", example: "g/dL" },
          status: { type: "string", example: "Low" },
          normalRange: { type: "string", example: "13-17" },
          warning: { type: "string", example: "Critical value detected. Please consult a doctor." },
          detectedText: { type: "string", example: "Hemoglobin 10.2 g/dL" },
          confidence: { type: "number", example: 0.91 },
          notes: {
            type: "array",
            items: { type: "string" },
            example: ["Matched from table row", "Reference range ignored"]
          }
        }
      },
      AIAnalysis: {
        type: "object",
        properties: {
          summary: { type: "string", example: "Hemoglobin is below the usual range and blood sugar is elevated." },
          abnormalFindings: {
            type: "array",
            items: { type: "string" },
            example: ["Hemoglobin is low", "Blood Sugar is high"]
          },
          possibleReasons: {
            type: "array",
            items: { type: "string" },
            example: ["Dietary deficiency", "Poor glycemic control"]
          },
          recommendations: {
            type: "array",
            items: { type: "string" },
            example: ["Consult a physician", "Repeat the test if advised"]
          }
        }
      },
      Report: {
        type: "object",
        properties: {
          _id: { type: "string", example: "67fd0c1da47ff193b46bcb4f" },
          user: { type: "string", example: "67fd0c1da47ff193b46bcb50" },
          fileName: { type: "string", example: "cbc-report.pdf" },
          fileUrl: { type: "string", format: "uri", example: "https://res.cloudinary.com/demo/raw/upload/v1/report.pdf" },
          fileType: { type: "string", enum: ["pdf", "image"], example: "pdf" },
          extractedText: { type: "string" },
          cleanedText: { type: "string" },
          reportType: { type: "string", example: "CBC Report" },
          riskScore: { type: "number", example: 62 },
          structuredValues: {
            type: "array",
            items: { $ref: "#/components/schemas/ReportValue" }
          },
          aiAnalysis: { $ref: "#/components/schemas/AIAnalysis" },
          doctorSummary: {
            type: "array",
            items: { type: "string" },
            example: ["Hemoglobin is slightly low", "Blood sugar is elevated"]
          },
          alerts: {
            type: "array",
            items: { type: "string" },
            example: ["Platelets: Critical value detected. Please consult a doctor."]
          },
          parserMetadata: {
            type: "object",
            properties: {
              tableRowsDetected: { type: "integer", example: 6 },
              extractedValueCount: { type: "integer", example: 4 },
              averageConfidence: { type: "number", example: 0.88 }
            }
          },
          disclaimer: {
            type: "string",
            example:
              "This platform provides informational health insights only and is not a medical diagnosis. Please consult a licensed doctor."
          },
          createdAt: { type: "string", format: "date-time" }
        }
      },
      PrescriptionMedicine: {
        type: "object",
        properties: {
          name: { type: "string", example: "Paracetamol" },
          dosage: { type: "string", example: "500 mg twice daily" },
          purpose: { type: "string", example: "Pain and fever relief" }
        }
      },
      Prescription: {
        type: "object",
        properties: {
          _id: { type: "string", example: "67fd0c1da47ff193b46bcb61" },
          fileName: { type: "string", example: "prescription.png" },
          fileUrl: { type: "string", format: "uri" },
          extractedText: { type: "string" },
          medicines: {
            type: "array",
            items: { $ref: "#/components/schemas/PrescriptionMedicine" }
          },
          aiExplanation: {
            type: "string",
            example: "This medicine is commonly used for fever relief. Please confirm the exact dosage with your doctor."
          },
          createdAt: { type: "string", format: "date-time" }
        }
      },
      SymptomResult: {
        type: "object",
        properties: {
          followUpQuestions: {
            type: "array",
            items: { type: "string" },
            example: ["How long have you had the fever?", "Do you have body pain?"]
          },
          possibleConditions: {
            type: "array",
            items: { type: "string" },
            example: ["Common viral illness", "Flu-like infection"]
          },
          advice: {
            type: "string",
            example: "Stay hydrated and consult a doctor if symptoms worsen or persist."
          },
          riskScore: { type: "number", example: 35 },
          disclaimer: {
            type: "string",
            example:
              "This platform provides informational health insights only and is not a medical diagnosis. Please consult a licensed doctor."
          }
        }
      },
      ChatMessage: {
        type: "object",
        properties: {
          role: { type: "string", enum: ["user", "assistant"], example: "assistant" },
          content: { type: "string", example: "Please share how long the fever has lasted." }
        }
      },
      DashboardData: {
        type: "object",
        properties: {
          totals: {
            type: "object",
            properties: {
              reports: { type: "integer", example: 4 },
              prescriptions: { type: "integer", example: 2 },
              alerts: { type: "integer", example: 1 }
            }
          },
          reports: {
            type: "array",
            items: { $ref: "#/components/schemas/Report" }
          },
          abnormalValues: {
            type: "array",
            items: { $ref: "#/components/schemas/ReportValue" }
          },
          alerts: {
            type: "array",
            items: { type: "string" }
          },
          prescriptions: {
            type: "array",
            items: { $ref: "#/components/schemas/Prescription" }
          },
          trends: {
            type: "array",
            items: {
              type: "object",
              properties: {
                parameter: { type: "string", example: "Hemoglobin" },
                insight: { type: "string", example: "Hemoglobin levels are decreasing over time." }
              }
            }
          },
          chartSeries: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: true
            }
          },
          riskScore: { type: "number", example: 62 },
          latestReportType: { type: "string", example: "CBC Report" },
          insights: {
            type: "array",
            items: { type: "string" }
          },
          disclaimer: {
            type: "string",
            example:
              "This platform provides informational health insights only and is not a medical diagnosis. Please consult a licensed doctor."
          }
        }
      }
    }
  },
  paths: {
    "/health": {
      get: {
        tags: ["System"],
        summary: "Get service health",
        responses: {
          200: {
            description: "Current health snapshot",
            content: {
              "application/json": {
                example: {
                  success: true,
                  status: "ok",
                  uptime: 412.22,
                  database: { state: "connected", readyState: 1 }
                }
              }
            }
          }
        }
      }
    },
    "/api/health": {
      get: {
        tags: ["System"],
        summary: "Get API health (legacy path)",
        responses: {
          200: {
            description: "Current health snapshot",
            content: {
              "application/json": {
                example: {
                  success: true,
                  status: "ok",
                  uptime: 412.22,
                  database: { state: "connected", readyState: 1 }
                }
              }
            }
          }
        }
      }
    },
    "/metrics": {
      get: {
        tags: ["System"],
        summary: "Prometheus metrics",
        responses: {
          200: {
            description: "Prometheus text exposition format",
            content: {
              "text/plain": {
                schema: {
                  type: "string"
                }
              }
            }
          }
        }
      }
    },
    "/api/auth/signup": {
      post: {
        tags: ["Auth"],
        summary: "Create a user account",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SignupRequest" }
            }
          }
        },
        responses: {
          201: {
            description: "User created and auth cookie set",
            content: {
              "application/json": {
                example: {
                  success: true,
                  user: {
                    _id: "67fd0c1da47ff193b46bcb4f",
                    name: "Aarav",
                    email: "aarav@example.com",
                    preferredLanguage: "en"
                  }
                }
              }
            }
          },
          409: {
            description: "User already exists",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" }
              }
            }
          }
        }
      }
    },
    "/api/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Authenticate a user and set the auth cookie",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LoginRequest" }
            }
          }
        },
        responses: {
          200: {
            description: "Login successful",
            content: {
              "application/json": {
                example: {
                  success: true,
                  user: {
                    _id: "67fd0c1da47ff193b46bcb4f",
                    name: "Aarav",
                    email: "aarav@example.com",
                    preferredLanguage: "en"
                  }
                }
              }
            }
          },
          401: {
            description: "Invalid credentials",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" }
              }
            }
          }
        }
      }
    },
    "/api/auth/me": {
      get: {
        tags: ["Auth"],
        summary: "Get current authenticated user",
        security: [{ cookieAuth: [] }],
        responses: {
          200: {
            description: "Authenticated user profile",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    user: { $ref: "#/components/schemas/AuthUser" }
                  }
                }
              }
            }
          },
          401: {
            description: "Not authenticated",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" }
              }
            }
          }
        }
      }
    },
    "/api/auth/logout": {
      post: {
        tags: ["Auth"],
        summary: "Clear the authentication cookie",
        responses: {
          200: {
            description: "Logout successful",
            content: {
              "application/json": {
                example: {
                  success: true,
                  message: "Logged out successfully."
                }
              }
            }
          }
        }
      }
    },
    "/api/auth/forgot-password": {
      post: {
        tags: ["Auth"],
        summary: "Generate and send a password reset link",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ForgotPasswordRequest" }
            }
          }
        },
        responses: {
          200: {
            description: "Always returns a neutral response",
            content: {
              "application/json": {
                example: {
                  success: true,
                  message: "If the email exists, a reset link has been generated."
                }
              }
            }
          }
        }
      }
    },
    "/api/auth/reset-password": {
      post: {
        tags: ["Auth"],
        summary: "Reset password using a one-time token",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ResetPasswordRequest" }
            }
          }
        },
        responses: {
          200: {
            description: "Password reset successful",
            content: {
              "application/json": {
                example: {
                  success: true,
                  message: "Password has been reset successfully."
                }
              }
            }
          },
          400: {
            description: "Invalid or expired token",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" }
              }
            }
          }
        }
      }
    },
    "/api/reports": {
      get: {
        tags: ["Reports"],
        summary: "List reports for the current user",
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            in: "query",
            name: "page",
            schema: { type: "integer", default: 1 },
            description: "Pagination page number"
          },
          {
            in: "query",
            name: "limit",
            schema: { type: "integer", default: 10, maximum: 50 },
            description: "Results per page"
          }
        ],
        responses: {
          200: {
            description: "Paginated report list",
            content: {
              "application/json": {
                example: {
                  success: true,
                  reports: [],
                  pagination: {
                    page: 1,
                    limit: 10,
                    total: 0,
                    totalPages: 0
                  }
                }
              }
            }
          }
        }
      },
      post: {
        tags: ["Reports"],
        summary: "Upload and analyze a medical report",
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                required: ["report"],
                properties: {
                  report: {
                    type: "string",
                    format: "binary"
                  }
                }
              }
            }
          }
        },
        responses: {
          201: {
            description: "Report uploaded and analyzed",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    report: { $ref: "#/components/schemas/Report" }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/api/reports/{id}": {
      get: {
        tags: ["Reports"],
        summary: "Fetch a single analyzed report",
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string" }
          }
        ],
        responses: {
          200: {
            description: "Report detail",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    report: { $ref: "#/components/schemas/Report" }
                  }
                }
              }
            }
          },
          404: {
            description: "Report not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" }
              }
            }
          }
        }
      }
    },
    "/api/prescriptions": {
      get: {
        tags: ["Prescriptions"],
        summary: "List prescriptions for the current user",
        security: [{ cookieAuth: [] }],
        responses: {
          200: {
            description: "Prescription list",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    prescriptions: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Prescription" }
                    }
                  }
                }
              }
            }
          }
        }
      },
      post: {
        tags: ["Prescriptions"],
        summary: "Upload and analyze a prescription",
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                required: ["prescription"],
                properties: {
                  prescription: {
                    type: "string",
                    format: "binary"
                  }
                }
              }
            }
          }
        },
        responses: {
          201: {
            description: "Prescription uploaded and processed",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    prescription: { $ref: "#/components/schemas/Prescription" }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/api/symptoms/check": {
      post: {
        tags: ["Symptoms"],
        summary: "Run the AI symptom checker",
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["symptoms"],
                properties: {
                  symptoms: { type: "string", example: "fever, fatigue, headache" },
                  followUpAnswers: { type: "string", example: "Symptoms started 2 days ago." }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: "Structured symptom result",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    result: { $ref: "#/components/schemas/SymptomResult" }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/api/chat": {
      get: {
        tags: ["Chat"],
        summary: "Get chat history for the authenticated user",
        security: [{ cookieAuth: [] }],
        responses: {
          200: {
            description: "Chat history",
            content: {
              "application/json": {
                example: {
                  success: true,
                  messages: [{ role: "assistant", content: "How long have you had the fever?" }],
                  disclaimer:
                    "This platform provides informational health insights only and is not a medical diagnosis. Please consult a licensed doctor."
                }
              }
            }
          }
        }
      },
      post: {
        tags: ["Chat"],
        summary: "Send a message to the AI health assistant",
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["message"],
                properties: {
                  message: { type: "string", example: "I have had fever for 3 days." }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: "Updated conversation",
            content: {
              "application/json": {
                example: {
                  success: true,
                  messages: [
                    { role: "user", content: "I have had fever for 3 days." },
                    { role: "assistant", content: "Do you also have body pain?" }
                  ],
                  disclaimer:
                    "This platform provides informational health insights only and is not a medical diagnosis. Please consult a licensed doctor."
                }
              }
            }
          }
        }
      }
    },
    "/api/profile": {
      put: {
        tags: ["Profile"],
        summary: "Update profile details or change password",
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string", example: "Aarav" },
                  email: { type: "string", format: "email", example: "aarav@example.com" },
                  age: { type: "integer", example: 29 },
                  gender: { type: "string", example: "male" },
                  height: { type: "string", example: "175 cm" },
                  weight: { type: "string", example: "72 kg" },
                  medicalHistory: { type: "string", example: "Mild anemia" },
                  allergies: { type: "string", example: "Penicillin" },
                  preferredLanguage: { type: "string", enum: ["en", "hi", "bn"], example: "en" },
                  currentPassword: { type: "string", format: "password", example: "secret123" },
                  newPassword: { type: "string", format: "password", example: "newSecret123" }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: "Updated user profile",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    user: { $ref: "#/components/schemas/AuthUser" }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/api/profile/language": {
      put: {
        tags: ["Profile"],
        summary: "Update preferred language",
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["preferredLanguage"],
                properties: {
                  preferredLanguage: {
                    type: "string",
                    enum: ["en", "hi", "bn"],
                    example: "hi"
                  }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: "Updated language preference",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    user: { $ref: "#/components/schemas/AuthUser" }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/api/dashboard": {
      get: {
        tags: ["Dashboard"],
        summary: "Get dashboard analytics, trends, and report summaries",
        security: [{ cookieAuth: [] }],
        responses: {
          200: {
            description: "Dashboard data",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: { $ref: "#/components/schemas/DashboardData" }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
};

export const swaggerSpec = swaggerJsdoc({
  definition,
  apis: []
});

export const swaggerUiOptions = {
  customSiteTitle: "AI Health Report Analyzer API Docs",
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true
  }
};
