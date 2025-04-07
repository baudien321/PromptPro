import mongoose, { Schema, models } from 'mongoose';

const AuditLogSchema = new Schema({
    timestamp: {
        type: Date,
        default: Date.now,
        index: true,
        required: true,
    },
    userId: { // The user who performed the action (if applicable)
        type: Schema.Types.ObjectId,
        ref: 'User',
        index: true,
        // required: true, // Not strictly required if action is system-related?
    },
    action: { // A specific identifier for the action performed
        type: String,
        required: [true, 'Action identifier is required.'],
        trim: true,
        index: true,
        // Examples: 'login', 'logout', 'create_prompt', 'delete_prompt', 
        //           'update_team_role', 'add_team_member', 'remove_team_member',
        //           'upgrade_plan', 'cancel_subscription'
    },
    targetType: { // The type of entity affected by the action
        type: String,
        trim: true,
        index: true,
        // Examples: 'user', 'prompt', 'team', 'comment', 'subscription', 'system'
    },
    targetId: { // The specific ID of the entity affected (can be ObjectId or other string ID)
        type: String, 
        trim: true,
        index: true,
    },
    details: { // Additional context about the event
        type: Schema.Types.Mixed, // Allows storing objects with varying structures
        default: {}
        // Examples: 
        // For login: { ipAddress: '1.2.3.4', userAgent: '...' }
        // For update: { field: 'role', oldValue: 'member', newValue: 'admin' }
        // For delete: { deletedObjectName: 'My Old Prompt' }
    }
}, {
    timestamps: { createdAt: 'timestamp', updatedAt: false } // Use timestamp as createdAt, disable updatedAt
});

// Compound indexes for common audit queries
AuditLogSchema.index({ userId: 1, timestamp: -1 });
AuditLogSchema.index({ action: 1, timestamp: -1 });
AuditLogSchema.index({ targetType: 1, targetId: 1, timestamp: -1 });

// Consider adding TTL index if logs should expire automatically
// AuditLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 365 * 24 * 60 * 60 }); // 1 year

const AuditLog = models.AuditLog || mongoose.model('AuditLog', AuditLogSchema);

export default AuditLog;

// Helper function to simplify logging (can be placed in a lib file)
export async function logAuditEvent(data) {
    try {
        // Ensure required fields are present
        if (!data.action) {
            throw new Error('Audit log requires an action.');
        }
        // Add timestamp if not provided (should be handled by default, but safety check)
        if (!data.timestamp) {
            data.timestamp = new Date();
        }
        
        const logEntry = new AuditLog(data);
        await logEntry.save();
        console.log(`[Audit Log] Action: ${data.action}, User: ${data.userId || 'System'}, Target: ${data.targetType || 'N/A'}:${data.targetId || 'N/A'}`);
    } catch (error) {
        console.error('Failed to save audit log:', error, 'Data:', data);
        // Decide how to handle logging failures (e.g., log to console, metrics)
        // Avoid throwing error here to prevent disruption of the main API flow
    }
} 