import mongoose, { Schema, models } from 'mongoose';

const PromptUsageSchema = new Schema({
    promptId: {
        type: Schema.Types.ObjectId,
        ref: 'Prompt',
        required: [true, 'Prompt ID is required.'],
        index: true,
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required.'],
        index: true,
    },
    teamId: { // Optional: Log usage within a team context
        type: Schema.Types.ObjectId,
        ref: 'Team',
        index: true,
        sparse: true // Allow null/undefined in index
    },
    timestamp: {
        type: Date,
        default: Date.now,
        index: true,
    },
    eventType: { // Track different types of interactions
        type: String,
        enum: ['view', 'copy', 'execute', 'share', 'edit', 'create', 'delete'],
        default: 'execute',
        required: true,
    },
    metadata: { // Flexible field for additional context
        type: Schema.Types.Mixed, // Allows any object structure
        default: {}
    }
}, {
    timestamps: { createdAt: 'timestamp' } // Use 'timestamp' as the creation field
});

// Compound index for common queries (e.g., usage per prompt over time)
PromptUsageSchema.index({ promptId: 1, timestamp: -1 });
PromptUsageSchema.index({ userId: 1, timestamp: -1 });
PromptUsageSchema.index({ teamId: 1, timestamp: -1 });

const PromptUsage = models.PromptUsage || mongoose.model('PromptUsage', PromptUsageSchema);

export default PromptUsage; 