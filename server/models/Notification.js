const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    type: {
      type: String,
      enum: [
        'task_assigned',
        'task_updated',
        'task_completed',
        'task_overdue',
        'project_added',
        'project_updated',
        'comment_added',
        'member_added',
        'member_removed',
        'general',
      ],
      required: true,
    },
    message: {
      type: String,
      required: [true, 'Notification message is required'],
      maxlength: [500, 'Message cannot exceed 500 characters'],
    },
    link: {
      type: String, // e.g., /tasks/:id or /projects/:id
      default: null,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
      default: null,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed, // Extra data (taskId, projectId, etc.)
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// ─── Pre-save Hook: Set readAt when isRead is set to true ─────────────────────
notificationSchema.pre('save', function (next) {
  if (this.isModified('isRead') && this.isRead && !this.readAt) {
    this.readAt = new Date();
  }
  next();
});

// ─── Indexes ──────────────────────────────────────────────────────────────────
notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ createdAt: -1 });

// ─── Auto-delete notifications older than 90 days ────────────────────────────
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 });

notificationSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('Notification', notificationSchema);
