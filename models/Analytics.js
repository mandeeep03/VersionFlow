const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
  },
  eventType: {
    type: String,
    enum: ['login', 'project_create', 'resource_upload', 'collaboration', 'export'],
    required: true,
  },
  metadata: {
    duration: Number,
    resourceCount: Number,
    storageUsed: Number,
    collaboratorCount: Number,
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

analyticsSchema.index({ userId: 1, timestamp: -1 });
analyticsSchema.index({ projectId: 1, timestamp: -1 });

module.exports = mongoose.model('Analytics', analyticsSchema);
