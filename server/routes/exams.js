import express from 'express';
import { Exam, Subscription } from '../models/index.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';
import { examSchema, validateRequest } from '../utils/validation.js';

const router = express.Router();

// Get all exams (public route with optional auth for subscription status)
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { 
      category, 
      page = 1, 
      limit = 10, 
      search,
      sortBy = 'registrationEndDate',
      sortOrder = 'asc'
    } = req.query;

    // Build query
    const query = { status: 'active', isVerified: true };
    
    if (category && category !== 'all') {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get exams with pagination
    const exams = await Exam.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Exam.countDocuments(query);

    // Get user subscriptions if authenticated
    let userSubscriptions = [];
    if (req.user) {
      const subscriptions = await Subscription.find({ 
        userId: req.user._id,
        isActive: true 
      });
      userSubscriptions = subscriptions.map(sub => sub.examId.toString());
    }

    // Add subscription status to exams
    const examsWithSubscription = exams.map(exam => ({
      ...exam.toJSON(),
      isSubscribed: userSubscriptions.includes(exam._id.toString())
    }));

    res.json({
      success: true,
      data: {
        exams: examsWithSubscription,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get exams error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch exams'
    });
  }
});

// Get exam by ID
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    
    if (!exam || exam.status !== 'active' || !exam.isVerified) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found'
      });
    }

    // Check if user is subscribed
    let isSubscribed = false;
    if (req.user) {
      const subscription = await Subscription.findOne({
        userId: req.user._id,
        examId: exam._id,
        isActive: true
      });
      isSubscribed = !!subscription;
    }

    res.json({
      success: true,
      data: {
        exam: {
          ...exam.toJSON(),
          isSubscribed
        }
      }
    });
  } catch (error) {
    console.error('Get exam error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch exam'
    });
  }
});

// Subscribe to exam
router.post('/:id/subscribe', authenticateToken, async (req, res) => {
  try {
    const examId = req.params.id;
    const userId = req.user._id;

    // Check if exam exists
    const exam = await Exam.findById(examId);
    if (!exam || exam.status !== 'active' || !exam.isVerified) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found'
      });
    }

    // Check if already subscribed
    const existingSubscription = await Subscription.findOne({
      userId,
      examId,
      isActive: true
    });

    if (existingSubscription) {
      return res.status(409).json({
        success: false,
        message: 'Already subscribed to this exam'
      });
    }

    // Create subscription
    const subscription = new Subscription({
      userId,
      examId,
      notificationPreferences: req.body.notificationPreferences || {}
    });

    await subscription.save();

    res.status(201).json({
      success: true,
      message: 'Successfully subscribed to exam',
      data: { subscription }
    });
  } catch (error) {
    console.error('Subscribe error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to subscribe to exam'
    });
  }
});

// Unsubscribe from exam
router.delete('/:id/subscribe', authenticateToken, async (req, res) => {
  try {
    const examId = req.params.id;
    const userId = req.user._id;

    const subscription = await Subscription.findOne({
      userId,
      examId,
      isActive: true
    });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    // Soft delete - mark as inactive
    subscription.isActive = false;
    await subscription.save();

    res.json({
      success: true,
      message: 'Successfully unsubscribed from exam'
    });
  } catch (error) {
    console.error('Unsubscribe error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to unsubscribe from exam'
    });
  }
});

// Get user's subscribed exams
router.get('/user/subscriptions', authenticateToken, async (req, res) => {
  try {
    const subscriptions_data = await Subscription.find({
      userId: req.user._id,
      isActive: true
    }).populate('examId');

    const subscriptions = subscriptions_data
      .filter(sub => sub.examId && sub.examId.status === 'active')
      .map(sub => ({
        id: sub._id,
        userId: sub.userId,
        examId: sub.examId._id,
        subscriptionType: sub.subscriptionType || 'basic',
        createdAt: sub.createdAt,
        exam: {
          ...sub.examId.toJSON(),
          isSubscribed: true
        }
      }));

    res.json({
      success: true,
      data: {
        subscriptions: subscriptions
      }
    });
  } catch (error) {
    console.error('Get subscriptions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subscribed exams'
    });
  }
});

// Get exam categories
router.get('/meta/categories', async (req, res) => {
  try {
    const categories = [
      'Engineering', 
      'Medical', 
      'Civil Services',
      'Banking',
      'Railways',
      'Defence',
      'Teaching',
      'State Services',
      'School Board',
      'Law',
      'Management',
      'Other'
    ];

    res.json({
      success: true,
      data: { categories }
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories'
    });
  }
});

export default router;