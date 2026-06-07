const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: ['admin', 'member'],
      default: 'member',
    },
    avatar: {
      type: String,
      default: null, // null = use UI Avatars fallback
    },
    bio: {
      type: String,
      maxlength: [200, 'Bio cannot exceed 200 characters'],
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// ─── Pre-save Hook: Hash password ─────────────────────────────────────────────
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ─── Instance Method: Compare password ────────────────────────────────────────
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// ─── Instance Method: Get avatar URL ──────────────────────────────────────────
userSchema.methods.getAvatarUrl = function () {
  if (this.avatar) {
    // If it's already a full URL (Cloudinary), return it directly
    if (this.avatar.startsWith('http')) {
      return this.avatar;
    }
    // Fallback for older local files
    return `${process.env.SERVER_URL || ''}/uploads/avatars/${this.avatar}`;
  }
  // Fallback: UI Avatars API
  const name = encodeURIComponent(this.name);
  return `https://ui-avatars.com/api/?name=${name}&background=6366f1&color=fff&size=128&bold=true`;
};

// ─── Transform output (remove sensitive fields) ───────────────────────────────
userSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.password;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('User', userSchema);
