const express = require('express');
const Project = require('../models/Project');
const Resource = require('../models/Resource');
const User = require('../models/User');
const auth = require('../middleware/auth');
const rbac = require('../middleware/rbac');

const router = express.Router();

router.post('/', auth, async (req, res) => {
  try {
    const { name, description, tags } = req.body;
    const user = await User.findById(req.userId);

    const projectCount = await Project.countDocuments({ ownerId: req.userId });
    if (projectCount >= user.features.projectLimit) {
      return res.status(403).json({
        success: false,
        message: `Project limit reached. Upgrade to create more.`,
      });
    }

    const project = new Project({
      name,
      description,
      ownerId: req.userId,
      tags: tags || [],
    });

    await project.save();
    res.status(201).json({ success: true, message: 'Project created', project });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [
        { ownerId: req.userId },
        { 'collaborators.userId': req.userId },
      ],
    })
      .select('name description ownerId tags createdAt')
      .limit(50);

    res.status(200).json({ success: true, projects });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/:projectId', auth, rbac, async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId)
      .populate('ownerId', 'name email')
      .populate('collaborators.userId', 'name email');

    res.status(200).json({ success: true, project });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/:projectId', auth, rbac, async (req, res) => {
  try {
    if (req.userRole !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only admin can update' });
    }

    const project = await Project.findByIdAndUpdate(
      req.params.projectId,
      req.body,
      { new: true }
    );

    res.status(200).json({ success: true, message: 'Project updated', project });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/:projectId/collaborators', auth, rbac, async (req, res) => {
  try {
    if (req.userRole !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only admin can add collaborators' });
    }

    const { userId, role } = req.body;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    req.project.collaborators.push({ userId, role });
    await req.project.save();

    res.status(200).json({ success: true, message: 'Collaborator added', project: req.project });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/:projectId', auth, rbac, async (req, res) => {
  try {
    if (req.userRole !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only admin can delete' });
    }

    await Project.findByIdAndDelete(req.params.projectId);
    res.status(200).json({ success: true, message: 'Project deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
