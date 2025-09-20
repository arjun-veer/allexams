import express from 'express';
import { Exam, PendingExam, User, Document, Subscription } from '../models/index.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { examSchema, validateRequest } from '../utils/validation.js';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticateToken, requireAdmin);

// Dashboard statistics
router.get('/dashboard/stats', async (req, res) => {
  try {
    const [
      totalUsers,
      totalExams,
      totalDocuments,
      totalSubscriptions,
      pendingExams,
      recentUsers
    ] = await Promise.all([
      User.countDocuments(),
      Exam.countDocuments({ status: 'active' }),
      Document.countDocuments(),
      Subscription.countDocuments({ isActive: true }),
      PendingExam.countDocuments({ status: 'pending' }),
      User.find().sort({ createdAt: -1 }).limit(5).select('name email createdAt role')
    ]);

    res.json({
      success: true,
      data: {
        stats: {
          totalUsers,
          totalExams,
          totalDocuments,
          totalSubscriptions,
          pendingExams
        },
        recentUsers
      }
    });
  } catch (error) {
    console.error('Admin dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics'
    });
  }
});

// Get all users
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 20, search, role } = req.query;
    
    // Build query
    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    if (role && role !== 'all') {
      query.role = role;
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get users with pagination
    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-password -refreshToken');

    // Get total count
    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users'
    });
  }
});

// Update user role
router.patch('/users/:id/role', async (req, res) => {
  try {
    const { role } = req.body;
    
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be "user" or "admin"'
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.role = role;
    await user.save();

    res.json({
      success: true,
      message: 'User role updated successfully',
      data: { user: user.toJSON() }
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user role'
    });
  }
});

// Create new exam
router.post('/exams', validateRequest(examSchema), async (req, res) => {
  try {
    const exam = new Exam({
      ...req.body,
      isVerified: true,
      status: 'active'
    });

    await exam.save();

    res.status(201).json({
      success: true,
      message: 'Exam created successfully',
      data: { exam }
    });
  } catch (error) {
    console.error('Create exam error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create exam'
    });
  }
});

// Update exam
router.patch('/exams/:id', validateRequest(examSchema), async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found'
      });
    }

    Object.assign(exam, req.body);
    await exam.save();

    res.json({
      success: true,
      message: 'Exam updated successfully',
      data: { exam }
    });
  } catch (error) {
    console.error('Update exam error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update exam'
    });
  }
});

// Delete exam
router.delete('/exams/:id', async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found'
      });
    }

    // Soft delete - mark as archived
    exam.status = 'archived';
    await exam.save();

    // Also deactivate all subscriptions
    await Subscription.updateMany(
      { examId: exam._id },
      { isActive: false }
    );

    res.json({
      success: true,
      message: 'Exam archived successfully'
    });
  } catch (error) {
    console.error('Delete exam error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to archive exam'
    });
  }
});

// Get pending exams
router.get('/exams/pending', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const pendingExams = await PendingExam.find({ status: 'pending' })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await PendingExam.countDocuments({ status: 'pending' });

    res.json({
      success: true,
      data: {
        exams: pendingExams,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get pending exams error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending exams'
    });
  }
});

// Create pending exam
router.post('/exams/pending', async (req, res) => {
  try {
    const {
      name,
      category,
      description,
      registrationStartDate,
      registrationEndDate,
      examDate,
      resultDate,
      websiteUrl,
      eligibility,
      applicationFee
    } = req.body;

    // Check for duplicates
    const existingPending = await PendingExam.findOne({
      name: { $regex: new RegExp(name, 'i') },
      status: 'pending'
    });

    if (existingPending) {
      return res.status(400).json({
        success: false,
        message: 'A pending exam with similar name already exists'
      });
    }

    const pendingExam = new PendingExam({
      name,
      category,
      description,
      registrationStartDate: new Date(registrationStartDate),
      registrationEndDate: new Date(registrationEndDate),
      examDate: examDate ? new Date(examDate) : null,
      resultDate: resultDate ? new Date(resultDate) : null,
      websiteUrl,
      eligibility,
      applicationFee,
      status: 'pending'
    });

    await pendingExam.save();

    res.status(201).json({
      success: true,
      message: 'Pending exam created successfully',
      data: { pendingExam }
    });
  } catch (error) {
    console.error('Create pending exam error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create pending exam'
    });
  }
});

// Approve pending exam
router.post('/exams/pending/:id/approve', async (req, res) => {
  try {
    const pendingExam = await PendingExam.findById(req.params.id);
    if (!pendingExam || pendingExam.status !== 'pending') {
      return res.status(404).json({
        success: false,
        message: 'Pending exam not found'
      });
    }

    // Create approved exam
    const exam = new Exam({
      name: pendingExam.name,
      category: pendingExam.category,
      description: pendingExam.description,
      registrationStartDate: pendingExam.registrationStartDate,
      registrationEndDate: pendingExam.registrationEndDate,
      examDate: pendingExam.examDate,
      resultDate: pendingExam.resultDate,
      answerKeyDate: pendingExam.answerKeyDate,
      websiteUrl: pendingExam.websiteUrl,
      eligibility: pendingExam.eligibility,
      applicationFee: pendingExam.applicationFee,
      isVerified: true,
      status: 'active'
    });

    await exam.save();

    // Update pending exam status
    pendingExam.status = 'approved';
    pendingExam.reviewedBy = req.user._id;
    pendingExam.reviewedAt = new Date();
    await pendingExam.save();

    res.json({
      success: true,
      message: 'Exam approved successfully',
      data: { exam }
    });
  } catch (error) {
    console.error('Approve exam error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve exam'
    });
  }
});

// Reject pending exam
router.post('/exams/pending/:id/reject', async (req, res) => {
  try {
    const { rejectionReason } = req.body;
    
    const pendingExam = await PendingExam.findById(req.params.id);
    if (!pendingExam || pendingExam.status !== 'pending') {
      return res.status(404).json({
        success: false,
        message: 'Pending exam not found'
      });
    }

    pendingExam.status = 'rejected';
    pendingExam.reviewedBy = req.user._id;
    pendingExam.reviewedAt = new Date();
    pendingExam.rejectionReason = rejectionReason;
    await pendingExam.save();

    res.json({
      success: true,
      message: 'Exam rejected successfully'
    });
  } catch (error) {
    console.error('Reject exam error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject exam'
    });
  }
});

export default router;