import mongoose, { Schema, models } from 'mongoose';

// Prompt model structure

// Define supported AI platforms
export const SUPPORTED_AI_PLATFORMS = [
  'ChatGPT', 
  'Claude', 
  'Gemini', 
  'MidJourney', 
  'DALL-E',
  'Other' // Allow a generic 'Other' category
];

const RatingSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    value: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    }
}, { _id: false }); // Don't create separate _id for subdocuments

const PromptSchema = new Schema({
    title: {
        type: String,
        required: [true, 'Title is required.'],
        trim: true,
        minlength: [3, 'Title must be at least 3 characters.'],
        maxlength: [150, 'Title cannot exceed 150 characters.'] // Increased length slightly
    },
    text: { // Renamed from content
        type: String,
        required: [true, 'Prompt text is required.'],
        trim: true,
        minlength: [10, 'Prompt text must be at least 10 characters.']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'Description cannot exceed 500 characters.']
    },
    creator: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Creator is required.']
    },
    tags: [{
        type: String,
        trim: true,
        lowercase: true, // Store tags consistently
        validate: [arrayLimit, '{PATH} exceeds the limit of 10 tags']
    }],
    platformCompatibility: [{
        type: String,
        enum: SUPPORTED_AI_PLATFORMS // Validate against the list
    }],
    // Basic performance tracking fields
    usageCount: {
        type: Number,
        default: 0,
        min: 0
    },
    ratings: [RatingSchema], // Array to store individual user ratings
    successCount: {
        type: Number,
        default: 0,
        min: 0
    },
    failureCount: {
        type: Number,
        default: 0,
        min: 0
    },
    visibility: {
        type: String,
        enum: ['private', 'team', 'public'], // Define possible visibility states
        default: 'private', // Default to private unless specified
        required: true,
        index: true
    },
    teamId: {
        type: Schema.Types.ObjectId,
        ref: 'Team', // Reference the Team model
        index: true,
        sparse: true
    },
    isEffective: {
        type: Boolean,
        default: null, // Use null to signify unset/unknown status
        index: true
    },
    variables: {
        type: [String], // Array of variable names (e.g., ["customerName", "product"])
        default: []
    },
    version: {
        type: Number,
        default: 1
    },
    // history: [PromptHistorySchema] // If implementing version history later
}, {
    timestamps: true // Automatically add createdAt and updatedAt
});

// --- Indexing --- 
// Index fields that are often queried/sorted
PromptSchema.index({ creator: 1, createdAt: -1 });
PromptSchema.index({ tags: 1 });
PromptSchema.index({ title: 'text', description: 'text' }); // For text search later
PromptSchema.index({ teamId: 1 }); // Add index for teamId
PromptSchema.index({ title: 'text', text: 'text', description: 'text', tags: 'text' });

// --- Virtuals (Example: Average Rating - Calculation might be complex/deferred) ---
/*
PromptSchema.virtual('averageRating').get(function() {
    if (this.ratings && this.ratings.length > 0) {
        const sum = this.ratings.reduce((acc, rating) => acc + rating.value, 0);
        return sum / this.ratings.length;
    }
    return 0;
});

PromptSchema.virtual('successRate').get(function() {
    const totalFeedback = this.successCount + this.failureCount;
    if (totalFeedback === 0) {
        return null; // Or 0, depending on desired representation
    }
    return (this.successCount / totalFeedback) * 100;
});

// Ensure virtuals are included when converting to JSON/Object
PromptSchema.set('toJSON', { virtuals: true });
PromptSchema.set('toObject', { virtuals: true });
*/

// --- Model Creation ---
const Prompt = models.Prompt || mongoose.model('Prompt', PromptSchema);

export default Prompt;

// --- Validation Function ---
export function validatePrompt(data) {
    const errors = {};
    let isValid = true;

    // Check for required fields
    if (!data.title || typeof data.title !== 'string' || data.title.trim().length === 0) {
        errors.title = 'Title is required.';
        isValid = false;
    }
    // Check the actual schema field 'text'
    if (!data.text || typeof data.text !== 'string' || data.text.trim().length === 0) {
        errors.text = 'Prompt text is required.'; // Changed key to 'text'
        isValid = false;
    }

    // Potential future checks: length constraints, tag formats, etc.
    // Note: Mongoose schema validation will handle more detailed checks later.

    return {
        isValid,
        errors
    };
}

// Helper function for array limit validation
function arrayLimit(val) {
  return val.length <= 10;
}

// Ensure teamId is present if visibility is 'team'
PromptSchema.path('teamId').validate(function(value) {
    return this.visibility !== 'team' || value != null;
}, 'Team ID is required when visibility is set to team.');

// Pre-save hook to increment version (Example - adjust if needed)
// PromptSchema.pre('save', function(next) {
//     if (!this.isNew && this.isModified()) {
//         this.version += 1;
//     }
//     next();
// });
