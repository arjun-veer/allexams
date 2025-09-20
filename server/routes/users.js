import express from 'express';
import { User } from '../models/index.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        user: {
          id: req.user._id,
          email: req.user.email,
          name: req.user.name,
          role: req.user.role,
          verified: req.user.verified,
          createdAt: req.user.createdAt,
          lastLogin: req.user.lastLogin
        }
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile'
    });
  }
});

// Update user profile
router.patch('/profile', authenticateToken, async (req, res) => {
  try {
    const { name } = req.body;

    if (name !== undefined) {
      if (typeof name !== 'string' || name.length < 2 || name.length > 100) {
        return res.status(400).json({
          success: false,
          message: 'Name must be between 2 and 100 characters'
        });
      }
      req.user.name = name.trim();
    }

    await req.user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: req.user._id,
          email: req.user.email,
          name: req.user.name,
          role: req.user.role,
          verified: req.user.verified
        }
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
});

// Get user statistics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    // Import here to avoid circular dependencies
    const { Document, Subscription } = await import('../models/index.js');
    
    const [documentCount, subscriptionCount] = await Promise.all([
      Document.countDocuments({ userId: req.user._id }),
      Subscription.countDocuments({ userId: req.user._id, isActive: true })
    ]);

    res.json({
      success: true,
      data: {
        stats: {
          documentsCount: documentCount,
          subscriptionsCount: subscriptionCount,
          joinDate: req.user.createdAt,
          lastLogin: req.user.lastLogin
        }
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user statistics'
    });
  }
});

export default router;