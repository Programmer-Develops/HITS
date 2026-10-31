// services/duplicateReport.js

const Report = require('../models/Report');

async function checkDuplicateReport({
  workerPhone,
  blockId,
  caption
}) {
  // Look back 30 minutes
  const thirtyMinutesAgo = new Date(
    Date.now() - 30 * 60 * 1000
  );

  // Find recent reports from the same worker
  // in the same block
  const recentReports = await Report.find({
    workerPhone,
    blockId: blockId || null,
    timestamp: {
      $gte: thirtyMinutesAgo
    }
  }).sort({ timestamp: -1 });

  // If there are no recent reports
  if (recentReports.length === 0) {
    return {
      isDuplicate: false,
      existingReport: null
    };
  }

  const newCaption = (caption || '')
    .trim()
    .toLowerCase();

  // Compare captions
  for (const report of recentReports) {
    const oldCaption = (report.caption || '')
      .trim()
      .toLowerCase();

    // Exact caption match
    if (
      newCaption &&
      oldCaption &&
      newCaption === oldCaption
    ) {
      return {
        isDuplicate: true,
        existingReport: report
      };
    }
  }

  return {
    isDuplicate: false,
    existingReport: null
  };
}

module.exports = {
  checkDuplicateReport
};