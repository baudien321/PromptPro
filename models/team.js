/**
 * Team data model and validation functions
 */

import mongoose, { Schema, models } from 'mongoose';

// Define default limits based on plan
const PLAN_LIMITS = {
  Free: { promptLimit: 50 },
  Pro: { promptLimit: 1000 }
};

const MemberSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    role: {
        type: String,
        required: true,
        enum: ['owner', 'admin', 'member'], // Define allowed roles
        default: 'member'
    },
    joinedAt: {
        type: Date,
        default: Date.now
    }
}, { _id: false }); // No separate _id for members sub-document

const TeamSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Team name is required.'],
        trim: true,
        maxlength: [100, 'Team name cannot exceed 100 characters.']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'Team description cannot exceed 500 characters.']
    },
    creator: { // Changed from userId for clarity, represents the initial owner
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Team creator is required.']
    },
    members: [MemberSchema], // Array of members with roles
    // --- Plan & Limits ---
    plan: {
        type: String,
        enum: Object.keys(PLAN_LIMITS), // Use keys from PLAN_LIMITS
        default: 'Free'
    },
    promptLimit: {
        type: Number,
        // Default limit set based on plan via pre-save hook
    },
    // --- Stripe Integration Fields ---
    stripeCustomerId: {
        type: String,
        index: true, // Index if looking up teams by customer ID
        sparse: true // Allow null/undefined values in the index
    },
    stripeSubscriptionId: {
        type: String,
        index: true,
        sparse: true
    },
    // Could add other limits here later (e.g., apiCallLimit)
}, {
    timestamps: true // Automatically add createdAt and updatedAt
});

// --- Indexing ---
TeamSchema.index({ name: 1 });
// Ensure efficient querying for members
TeamSchema.index({ "members.user": 1 });
TeamSchema.index({ plan: 1 }); // Index the plan field

// --- Pre-save Hook ---
// Automatically add the creator as the initial 'owner' member when a team is created
TeamSchema.pre('save', function(next) {
    // Set default members
    if (this.isNew) {
        if (!this.members) {
            this.members = [];
        }
        const creatorExists = this.members.some(member => member.user.equals(this.creator));
        if (!creatorExists) {
            this.members.push({ user: this.creator, role: 'owner' });
        }
    }

    // Set default promptLimit based on plan if not already set or if plan changes
    if (this.isNew || this.isModified('plan')) {
        const limits = PLAN_LIMITS[this.plan];
        if (limits) {
            this.promptLimit = limits.promptLimit;
        }
    }

    next();
});


// --- Model Creation ---
// Use 'Team' as the model name following Mongoose convention
const Team = models.Team || mongoose.model('Team', TeamSchema);

export default Team;

/**
 * Team member schema
 * @typedef {Object} TeamMember
 * @property {string} userId - User ID
 * @property {string} role - Member role (owner, admin, member)
 * @property {string} joinedAt - Timestamp when member joined
 */

// Removed helper functions (validateTeam, sanitizeTeam, getMemberRole, isTeamAdmin, isTeamMember)
// These have been moved to lib/teamUtils.js to avoid including Mongoose model code in the client bundle.