import PDFDocument from "pdfkit";

export const buildReportSummaryPdf = (report) =>
  new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.fontSize(20).text("AI Health Summary", { underline: true });
    doc.moveDown();
    doc.fontSize(12).text(`Report: ${report.fileName}`);
    doc.text(`Uploaded: ${new Date(report.createdAt).toLocaleString()}`);
    doc.text(`Report type: ${report.reportType}`);
    doc.text(`Risk score: ${report.riskScore}%`);
    doc.moveDown();
    doc.text(report.disclaimer || "");
    doc.moveDown();

    doc.fontSize(16).text("Doctor-Style Summary");
    doc.moveDown(0.5);
    (report.doctorSummary || []).forEach((item) => {
      doc.fontSize(12).text(`- ${item}`);
    });
    doc.moveDown();

    doc.fontSize(16).text("Structured Values");
    doc.moveDown(0.5);
    (report.structuredValues || []).forEach((value) => {
      doc
        .fontSize(11)
        .text(
          `${value.parameter}: ${value.value} ${value.unit} | ${value.status} | Range ${value.normalRange}`
        );
    });
    doc.moveDown();

    doc.fontSize(16).text("AI Recommendations");
    doc.moveDown(0.5);
    (report.aiAnalysis?.recommendations || []).forEach((item) => {
      doc.fontSize(11).text(`- ${item}`);
    });
    doc.moveDown();

    doc.fontSize(16).text("Risk Factors");
    doc.moveDown(0.5);
    (report.riskFactors || []).forEach((item) => {
      doc.fontSize(11).text(`- ${item}`);
    });
    doc.moveDown();

    doc.fontSize(16).text("Timeline Summary");
    doc.moveDown(0.5);
    (report.timelineSummary || []).forEach((item) => {
      doc.fontSize(11).text(`- ${item}`);
    });

    doc.end();
  });
