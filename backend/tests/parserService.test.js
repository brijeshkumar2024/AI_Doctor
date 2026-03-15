import { describe, expect, it } from "@jest/globals";
import { parseMedicalValues } from "../services/parserService.js";

describe("parserService", () => {
  it("extracts robust values from cleaned OCR text", () => {
    const result = parseMedicalValues({
      cleanedText: "Hemoglobin 10.2 g/dL\nHDL 42 mg/dL\nTriglycerides 220 mg/dL",
      tableRows: [
        { raw: "Hemoglobin 10.2 g/dL", columns: ["Hemoglobin", "10.2", "g/dL"] },
        { raw: "HDL 42 mg/dL", columns: ["HDL", "42", "mg/dL"] },
        { raw: "Triglycerides 220 mg/dL", columns: ["Triglycerides", "220", "mg/dL"] }
      ],
      gender: "male"
    });

    expect(result.structuredValues.find((item) => item.parameter === "Hemoglobin")?.status).toBe("Low");
    expect(result.structuredValues.find((item) => item.parameter === "HDL")?.value).toBe(42);
    expect(result.structuredValues.find((item) => item.parameter === "Triglycerides")?.status).toBe("High");
  });
});

