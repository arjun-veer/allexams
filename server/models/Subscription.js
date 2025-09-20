import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  examId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exam',
    required: [true, 'Exam ID is required']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  notificationPreferences: {
    registrationReminder: {
      type: Boolean,
      default: true
    },
    examReminder: {
      type: Boolean,
      default: true
    },
    resultReminder: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true
});

// Compound index to ensure one subscription per user per exam
subscriptionSchema.index({ userId: 1, examId: 1 }, { unique: true });

// Index for better performance
subscriptionSchema.index({ userId: 1 });
subscriptionSchema.index({ examId: 1 });
subscriptionSchema.index({ isActive: 1 });

const Subscription = mongoose.model('Subscription', subscriptionSchema);

export default Subscription;