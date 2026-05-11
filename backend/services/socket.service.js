import { verifyAccessToken } from "../utils/token.js";
import { logger } from "../utils/logger.js";
import { activeConnectionsGauge, socketEventsCounter } from "../config/metrics.js";

let _io = null;

export const initSocket = (io) => {
  _io = io;
  setupConnectionHandler(io);
};

export const getIO = () => {
  if (!_io) throw new Error('Socket.IO not initialized');
  return _io;
};

const setupConnectionHandler = (io) => {
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Authentication required'));
    try {
      const decoded = verifyAccessToken(token);
      socket.userId = decoded.userId;
      socket.userName = decoded.firstName;
      next();
    } catch (err) {
      next(new Error('Invalid or expired token'));
    }
  });

  io.on('connection', (socket) => {
    // Join private room for this user
    socket.join(`user:${socket.userId}`);

    // Log connection
    logger.info({ userId: socket.userId, socketId: socket.id },
      'WebSocket client connected');

    // Update Prometheus gauge
    activeConnectionsGauge.inc();

    // Emit confirmation
    socket.emit('connected', {
      message: 'Real-time updates enabled'
    });

    // Handle client requesting report status
    socket.on('subscribe:report', (reportId) => {
      socket.join(`report:${reportId}`);
    });

    socket.on('unsubscribe:report', (reportId) => {
      socket.leave(`report:${reportId}`);
    });

    socket.on('disconnect', (reason) => {
      logger.info({ userId: socket.userId, reason },
        'WebSocket client disconnected');
      activeConnectionsGauge.dec();
    });
  });
};

// Emit helper functions

export const emitReportQueued = (userId, reportId, queuePosition) => {
  try {
    getIO().to(`user:${userId}`).emit('report:queued', {
      reportId,
      status: 'queued',
      queuePosition,
      message: `Report queued at position #${queuePosition}`,
      timestamp: new Date().toISOString()
    });
    socketEventsCounter.inc({ event_name: 'report:queued' });
  } catch (emitErr) {
    logger.warn({ emitErr }, 'Socket emit failed for report:queued');
  }
};

export const emitReportProcessing = (userId, reportId, stage) => {
  const stageMessages = {
    ocr_started: 'Extracting text from your report...',
    ocr_completed: 'Text extraction complete',
    gemini_started: 'Gemini AI analyzing your report...',
    gemini_completed: 'Gemini analysis complete',
    groq_started: 'LLaMA 3 analyzing your report...',
    groq_completed: 'LLaMA 3 analysis complete',
    comparison_started: 'Comparing AI model results...',
    metrics_extraction: 'Extracting health metrics...'
  };
  try {
    getIO().to(`user:${userId}`).emit('report:processing', {
      reportId,
      status: 'processing',
      stage,
      message: stageMessages[stage] || 'Processing...',
      timestamp: new Date().toISOString()
    });
    socketEventsCounter.inc({ event_name: 'report:processing' });
  } catch (emitErr) {
    logger.warn({ emitErr }, 'Socket emit failed for report:processing');
  }
};

export const emitReportCompleted = (userId, reportId, summary) => {
  try {
    getIO().to(`user:${userId}`).emit('report:completed', {
      reportId,
      status: 'completed',
      summary: {
        agreementRate: summary.agreementRate,
        riskCount: summary.riskCount,
        keyFindingsCount: summary.keyFindingsCount
      },
      message: 'Analysis complete! View your results.',
      timestamp: new Date().toISOString()
    });
    socketEventsCounter.inc({ event_name: 'report:completed' });
  } catch (emitErr) {
    logger.warn({ emitErr }, 'Socket emit failed for report:completed');
  }
};

export const emitReportFailed = (userId, reportId, errorMessage) => {
  try {
    getIO().to(`user:${userId}`).emit('report:failed', {
      reportId,
      status: 'failed',
      message: errorMessage || 'Analysis failed. Please try again.',
      timestamp: new Date().toISOString()
    });
    socketEventsCounter.inc({ event_name: 'report:failed' });
  } catch (emitErr) {
    logger.warn({ emitErr }, 'Socket emit failed for report:failed');
  }
};