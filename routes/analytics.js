const express = require('express');
const mongoose = require('mongoose');
const Analytics = require('../models/Analytics');
const Project = require('../models/Project');
const Resource = require('../models/Resource');
const auth = require('../middleware/auth');

const router = express.Router();

const logEvent = async (userId, eventType, metadata, projectId = null) => {
  const event = new Analytics({
    userId,
    eventType,
    metadata,
    projectId,
  });
  await event.save();
};

router.get('/user-insights', auth, async (req, res) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const insights = await Analytics.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(req.userId),
          timestamp: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: '$eventType',
          count: { $sum: 1 },
          avgDuration: { $avg: '$metadata.duration' },
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    const projectCount = await Project.countDocuments({ ownerId: req.userId });
    const resourceCount = await Resource.countDocuments({ ownerId: req.userId });

    res.status(200).json({
      success: true,
      insights: {
        eventBreakdown: insights,
        totalProjects: projectCount,
        totalResources: resourceCount,
        period: '30 days',
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/project-analytics/:projectId', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }
    if (project.ownerId.toString() !== req.userId) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const analytics = await Analytics.aggregate([
      {
        $match: {
          projectId: project._id,
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$timestamp' },
          },
          count: { $sum: 1 },
          collaborators: { $addToSet: '$userId' },
        },
      },
      {
        $sort: { _id: -1 },
      },
      {
        $limit: 30,
      },
    ]);

    const resources = await Resource.find({ projectId: req.params.projectId });
    const totalSize = resources.reduce((sum, r) => sum + r.size, 0);

    res.status(200).json({
      success: true,
      analytics: {
        dailyActivity: analytics,
        totalResources: resources.length,
        totalStorageUsed: totalSize,
        collaboratorCount: project.collaborators.length + 1,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/log-event', auth, async (req, res) => {
  try {
    const { eventType, metadata, projectId } = req.body;
    await logEvent(req.userId, eventType, metadata, projectId);
    res.status(201).json({ success: true, message: 'Event logged' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
