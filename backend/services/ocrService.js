import pdfParse from "pdf-parse";
import Tesseract from "tesseract.js";
import { ocrProcessingDurationMs, ocrProcessingDurationSeconds } from "../config/metrics.js";

const normalizeLine = (line = "") =>
  line
    .replace(/[^\S\r\n]+/g, " ")
    .replace(/[|]/g, " ")
    .replace(/[–—]/g, "-")
    .replace(/mg\/di/gi, "mg/dl")
    .replace(/g\/di/gi, "g/dl")
    .trim();

export const cleanOcrText = (text = "") =>
  text
    .replace(/\r/g, "\n")
    .replace(/\n{2,}/g, "\n")
    .split("\n")
    .map(normalizeLine)
    .filter(Boolean)
    .join("\n");

export const extractTableRows = (text = "") =>
  text
    .split("\n")
    .map(normalizeLine)
    .filter(Boolean)
    .map((line) => ({
      raw: line,
      columns: line
        .split(/\s{2,}|\t+|(?<=\d)\s(?=[A-Za-z/])/)
        .map((column) => column.trim())
        .filter(Boolean)
    }));

export const extractTextFromFile = async (file) => {
  const fileType = file.mimetype === "application/pdf" ? "pdf" : "image";
  const endTimer = ocrProcessingDurationSeconds.startTimer({ file_type: fileType });
  const startTime = Date.now();

  try {
  if (file.mimetype === "application/pdf") {
    const pdfData = await pdfParse(file.buffer);
    const rawText = pdfData.text || "";
    const cleanedText = cleanOcrText(rawText);

    return {
      rawText,
      cleanedText,
      tableRows: extractTableRows(cleanedText),
      averageConfidence: rawText ? 0.92 : 0
    };
  }

  const result = await Tesseract.recognize(file.buffer, "eng");
  const rawText = result.data.text || "";
  const cleanedText = cleanOcrText(rawText);
  const averageConfidence =
    result.data.words?.length > 0
      ? result.data.words.reduce((sum, word) => sum + (word.confidence || 0), 0) /
        result.data.words.length /
        100
      : 0.6;

  return {
    rawText,
    cleanedText,
    tableRows: extractTableRows(cleanedText),
    averageConfidence
  };
  } finally {
    endTimer();
    ocrProcessingDurationMs.observe(Date.now() - startTime);
  }
};
