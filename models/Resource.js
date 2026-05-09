const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['document', 'image', 'video', 'data'],
    required: true,
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  size: {
    type: Number,
    required: true,
  },
  url: String,
  metadata: {
    duration: Number,
    dimensions: { width: Number, height: Number },
    format: String,
  },
  tags: [String],
  accessControl: {
    type: String,
    enum: ['private', 'project', 'public'],
    default: 'project',
  },
  versions: [{
    versionNumber: Number,
    timestamp: Date,
    changeLog: String,
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

resourceSchema.index({ projectId: 1, createdAt: -1 });
resourceSchema.index({ ownerId: 1 });

module.exports = mongoose.model('Resource', resourceSchema);
