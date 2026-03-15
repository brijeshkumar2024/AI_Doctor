import Report from "../models/Report.js";
import asyncHandler from "../utils/asyncHandler.js";
import { deleteCloudinaryAsset, uploadBufferToCloudinary } from "../services/cloudinaryService.js";
import { DEFAULT_PAGE_LIMIT, DEFAULT_SHARE_LINK_HOURS, HEALTH_DISCLAIMER, MAX_PAGE_LIMIT, REPORT_PROCESSING_STATUS } from "../utils/constants.js";
import { buildReportSummaryPdf } from "../services/pdfExportService.js";
import { createSignedReportToken, verifySignedReportToken } from "../services/shareService.js";
import { enqueueReportProcessingJob } from "../services/jobProcessorService.js";
import { processReportRecord } from "../services/reportProcessingService.js";
import { isQueueEnabled } from "../config/queue.js";

const shouldProcessAsync = () =>
  isQueueEnabled() && process.env.ASYNC_REPORT_PROCESSING !== "false";

export const uploadReport = asyncHandler(async (req, res) => {
  if (!req.file) {
    const error = new Error("Report file is required");
    error.statusCode = 400;
    throw error;
  }

  let cloudinaryFile;
  let report;

  try {
    cloudinaryFile = await uploadBufferToCloudinary(
      req.file.buffer,
      "ai-health/reports",
      `${Date.now()}-${req.file.originalname}`,
      req.file.mimetype === "application/pdf" ? "raw" : "image"
    );

    report = await Report.create({
      user: req.user._id,
      fileName: req.file.originalname,
      fileUrl: cloudinaryFile.secure_url,
      cloudinaryPublicId: cloudinaryFile.public_id,
      fileType: req.file.mimetype === "application/pdf" ? "pdf" : "image",
      processingStatus: shouldProcessAsync()
        ? REPORT_PROCESSING_STATUS.PENDING
        : REPORT_PROCESSING_STATUS.PROCESSING,
      disclaimer: HEALTH_DISCLAIMER
    });

    if (shouldProcessAsync()) {
      try {
        await enqueueReportProcessingJob({
          reportId: report._id.toString(),
          file: {
            buffer: req.file.buffer,
            mimetype: req.file.mimetype,
            originalname: req.file.originalname
          },
          requestId: req.id
        });
      } catch (_queueError) {
        const processedReport = await processReportRecord({
          reportId: report._id,
          file: req.file
        });

        res.status(201).json({
          success: true,
          queued: false,
          report: processedReport
        });
        return;
      }

      res.status(202).json({
        success: true,
        queued: true,
        message: "Report uploaded and queued for analysis.",
        report
      });
      return;
    }

    const processedReport = await processReportRecord({
      reportId: report._id,
      file: req.file
    });

    res.status(201).json({
      success: true,
      queued: false,
      report: processedReport
    });
  } catch (error) {
    if (!report && cloudinaryFile?.public_id) {
      await deleteCloudinaryAsset(
        cloudinaryFile.public_id,
        req.file.mimetype === "application/pdf" ? "raw" : "image"
      );
    }

    throw error;
  }
});

export const getReports = asyncHandler(async (req, res) => {
  const page = Number(req.query.page || 1);
  const limit = Math.min(Number(req.query.limit || DEFAULT_PAGE_LIMIT), MAX_PAGE_LIMIT);
  const skip = (page - 1) * limit;
  const status = req.query.status;

  const query = { user: req.user._id };
  if (status) {
    query.processingStatus = status;
  }

  const [reports, total] = await Promise.all([
    Report.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Report.countDocuments(query)
  ]);

  res.json({
    success: true,
    reports,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  });
});

export const getReportById = asyncHandler(async (req, res) => {
  const report = await Report.findOne({ _id: req.params.id, user: req.user._id }).lean();

  if (!report) {
    const error = new Error("Report not found");
    error.statusCode = 404;
    throw error;
  }

  res.json({
    success: true,
    report
  });
});

export const createReportShareLink = asyncHandler(async (req, res) => {
  const report = await Report.findOne({ _id: req.params.id, user: req.user._id });
  if (!report) {
    const error = new Error("Report not found");
    error.statusCode = 404;
    throw error;
  }

  const expiresInHours = Number(req.body?.expiresInHours || DEFAULT_SHARE_LINK_HOURS);
  const { token, expiresAt } = createSignedReportToken({
    reportId: report._id.toString(),
    userId: report.user.toString(),
    shareVersion: report.shareVersion,
    expiresInHours
  });
  const appUrl = process.env.APP_URL || process.env.CLIENT_URL || "http://localhost:5173";

  res.json({
    success: true,
    shareUrl: `${appUrl.replace(/\/$/, "")}/shared-report/${token}`,
    expiresAt
  });
});

export const getSharedReport = asyncHandler(async (req, res) => {
  let payload;
  try {
    payload = verifySignedReportToken(req.params.token);
  } catch (error) {
    error.statusCode = 401;
    throw error;
  }
  const report = await Report.findOne({
    _id: payload.reportId,
    user: payload.userId,
    shareVersion: payload.shareVersion
  }).lean();

  if (!report) {
    const error = new Error("Shared report not found");
    error.statusCode = 404;
    throw error;
  }

  res.json({
    success: true,
    report: {
      _id: report._id,
      fileName: report.fileName,
      fileUrl: report.fileUrl,
      fileType: report.fileType,
      createdAt: report.createdAt,
      reportType: report.reportType,
      riskScore: report.riskScore,
      structuredValues: report.structuredValues,
      aiAnalysis: report.aiAnalysis,
      doctorSummary: report.doctorSummary,
      timelineSummary: report.timelineSummary,
      alerts: report.alerts,
      disclaimer: report.disclaimer
    }
  });
});

export const exportReportSummary = asyncHandler(async (req, res) => {
  const report = await Report.findOne({ _id: req.params.id, user: req.user._id }).lean();

  if (!report) {
    const error = new Error("Report not found");
    error.statusCode = 404;
    throw error;
  }

  const pdfBuffer = await buildReportSummaryPdf(report);

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${report.fileName}-summary.pdf"`);
  res.send(pdfBuffer);
});
