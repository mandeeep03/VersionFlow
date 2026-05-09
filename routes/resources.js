const express = require('express');
const Resource = require('../models/Resource');
const Project = require('../models/Project');
const User = require('../models/User');
const auth = require('../middleware/auth');
const rbac = require('../middleware/rbac');

const router = express.Router();

router.post('/:projectId/upload', auth, rbac, async (req, res) => {
  try {
    if (req.userRole === 'viewer') {
      return res.status(403).json({ success: false, message: 'Viewers cannot upload' });
    }

    const { title, type, size, url, metadata } = req.body;
    const user = await User.findById(req.userId);

    const totalStorageUsed = await Resource.aggregate([
      { $match: { projectId: req.project._id } },
      { $group: { _id: null, totalSize: { $sum: '$size' } } },
    ]);

    const usedStorage = totalStorageUsed[0]?.totalSize || 0;
    if (usedStorage + size > user.features.storageLimit) {
      return res.status(403).json({
        success: false,
        message: 'Storage limit exceeded',
        currentUsage: usedStorage,
        limit: user.features.storageLimit,
      });
    }

    const resource = new Resource({
      title,
      type,
      size,
      url,
      metadata,
      projectId: req.params.projectId,
      ownerId: req.userId,
      versions: [
        {
          versionNumber: 1,
          timestamp: new Date(),
          changeLog: 'Initial upload',
        },
      ],
    });

    await resource.save();
    res.status(201).json({ success: true, message: 'Resource uploaded', resource });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/:projectId/resources', auth, rbac, async (req, res) => {
  try {
    const resources = await Resource.find({ projectId: req.params.projectId })
      .select('title type size createdAt versions')
      .limit(100);

    res.status(200).json({ success: true, resources });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/:projectId/resources/:resourceId/version', auth, rbac, async (req, res) => {
  try {
    if (req.userRole === 'viewer') {
      return res.status(403).json({ success: false, message: 'Viewers cannot create versions' });
    }

    const resource = await Resource.findById(req.params.resourceId);
    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }

    const newVersion = {
      versionNumber: (resource.versions[resource.versions.length - 1]?.versionNumber || 0) + 1,
      timestamp: new Date(),
      changeLog: req.body.changeLog || 'No changes documented',
    };

    resource.versions.push(newVersion);
    await resource.save();

    res.status(200).json({ success: true, message: 'Version created', resource });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/:projectId/resources/:resourceId', auth, rbac, async (req, res) => {
  try {
    if (req.userRole === 'viewer') {
      return res.status(403).json({ success: false, message: 'Viewers cannot delete resources' });
    }

    const resource = await Resource.findByIdAndDelete(req.params.resourceId);
    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }
    res.status(200).json({ success: true, message: 'Resource deleted', freed: resource.size });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
