import { beforeAll, afterAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

jest.unstable_mockModule("../services/cloudinaryService.js", () => ({
  uploadBufferToCloudinary: jest.fn(async () => ({
    secure_url: "https://example.com/report.png",
    public_id: "ai-health/reports/report-1"
  })),
  deleteCloudinaryAsset: jest.fn(async () => undefined),
  getCloudinaryStatus: jest.fn(() => ({
    configured: true,
    cloudName: "test-cloud"
  }))
}));

jest.unstable_mockModule("../services/ocrService.js", () => ({
  extractTextFromFile: jest.fn(async () => ({
    rawText: "Hemoglobin 10.2 g/dL\nPlatelets 40000 /uL\nBlood Sugar 180 mg/dL",
    cleanedText: "Hemoglobin 10.2 g/dL\nPlatelets 40000 /uL\nBlood Sugar 180 mg/dL",
    tableRows: [
      { raw: "Hemoglobin 10.2 g/dL", columns: ["Hemoglobin", "10.2", "g/dL"] },
      { raw: "Platelets 40000 /uL", columns: ["Platelets", "40000", "/uL"] },
      { raw: "Blood Sugar 180 mg/dL", columns: ["Blood Sugar", "180", "mg/dL"] }
    ],
    averageConfidence: 0.85
  }))
}));

jest.unstable_mockModule("../services/aiService.js", () => ({
  analyzeReportWithAI: jest.fn(async () => ({
    summary: "Abnormal findings detected.",
    abnormalFindings: ["Hemoglobin is low."],
    possibleReasons: ["May be related to nutritional deficiency."],
    recommendations: ["Consult a doctor."]
  })),
  analyzePrescriptionWithAI: jest.fn(async () => "Medicine explanation"),
  checkSymptomsWithAI: jest.fn(async () => ({
    followUpQuestions: ["How long have you had the symptoms?"],
    possibleConditions: ["Common viral illness"],
    advice: "Consult a doctor if symptoms persist."
  })),
  chatWithHealthAssistant: jest.fn(async () => "Please share more details.")
}));

jest.unstable_mockModule("../services/emailService.js", () => ({
  sendPasswordResetLink: jest.fn(async () => undefined),
  getEmailServiceStatus: jest.fn(() => ({
    configured: true,
    host: "smtp.test",
    secure: false,
    port: 587
  })),
  verifyEmailService: jest.fn(async () => ({
    configured: true,
    verified: true
  }))
}));

const { default: app } = await import("../app.js");
const { default: User } = await import("../models/User.js");

let mongoServer;
let agent;

const pngBuffer = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  Buffer.from("valid png data")
]);

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  process.env.JWT_SECRET = "test-secret";
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await mongoose.connection.db.dropDatabase();
  agent = request.agent(app);

  await agent.post("/api/auth/signup").send({
    name: "Test User",
    email: "test@example.com",
    password: "secret123",
    preferredLanguage: "en"
  });
});

describe("authentication", () => {
  it("stores optional profile fields during signup", async () => {
    const response = await request(app).post("/api/auth/signup").send({
      name: "Profile User",
      email: "profile@example.com",
      password: "secret123",
      age: 29,
      gender: "female",
      height: "165 cm",
      weight: "60 kg",
      medicalHistory: "Seasonal allergies",
      allergies: "Dust",
      preferredLanguage: "hi"
    });

    expect(response.status).toBe(201);
    expect(response.body.user.age).toBe(29);
    expect(response.body.user.gender).toBe("female");
    expect(response.body.user.height).toBe("165 cm");
    expect(response.body.user.weight).toBe("60 kg");
    expect(response.body.user.medicalHistory).toBe("Seasonal allergies");
    expect(response.body.user.allergies).toBe("Dust");
    expect(response.body.user.preferredLanguage).toBe("hi");
  });

  it("returns field-level validation details for invalid signup input", async () => {
    const response = await request(app).post("/api/auth/signup").send({
      name: "",
      email: "not-an-email",
      password: "short"
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Name is required");
    expect(response.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          field: "name",
          location: "body",
          message: "Name is required"
        })
      ])
    );
  });

  it("logs a user in", async () => {
    const response = await request(app).post("/api/auth/login").send({
      email: "test@example.com",
      password: "secret123"
    });

    expect(response.status).toBe(200);
    expect(response.body.user.email).toBe("test@example.com");
    expect(response.body.user.token).toBeUndefined();
    expect(response.headers["set-cookie"]?.join(";")).toContain("token=");
  });

  it("generates and consumes a password reset token", async () => {
    const forgotResponse = await request(app).post("/api/auth/forgot-password").send({
      email: "test@example.com"
    });

    expect(forgotResponse.status).toBe(200);
    const user = await User.findOne({ email: "test@example.com" });
    expect(user.resetPasswordToken).toBeTruthy();
  });
});

describe("report upload and ai analysis", () => {
  it("uploads a report and stores parsed values", async () => {
    const response = await agent
      .post("/api/reports")
      .attach("report", pngBuffer, "report.png");

    expect(response.status).toBe(201);
    expect(response.body.report.reportType).toBeTruthy();
    expect(response.body.report.structuredValues.length).toBeGreaterThan(0);
    expect(response.body.report.aiAnalysis.summary).toBe("Abnormal findings detected.");
  });
});

describe("symptom checker", () => {
  it("returns a structured symptom response", async () => {
    const response = await agent
      .post("/api/symptoms/check")
      .send({ symptoms: "fever and headache", followUpAnswers: "2 days" });

    expect(response.status).toBe(200);
    expect(response.body.result.followUpQuestions.length).toBeGreaterThan(0);
    expect(response.body.result.riskScore).toBeGreaterThan(0);
  });
});
