const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: String,
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  collaborators: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    role: {
      type: String,
      enum: ['admin', 'editor', 'viewer'],
      default: 'viewer',
    },
  }],
  resources: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resource',
  }],
  tags: [String],
  isPublic: {
    type: Boolean,
    default: false,
  },
  settings: {
    allowComments: { type: Boolean, default: true },
    versionControl: { type: Boolean, default: true },
    autoSave: { type: Boolean, default: true },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

projectSchema.index({ ownerId: 1, createdAt: -1 });
projectSchema.index({ tags: 1 });

module.exports = mongoose.model('Project', projectSchema);
