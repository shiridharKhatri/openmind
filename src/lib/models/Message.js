"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Message = void 0;
const mongoose_1 = require("mongoose");
const MessageSchema = new mongoose_1.Schema({
    conversationId: { type: String, required: true, index: true },
    role: { type: String, enum: ['user', 'assistant', 'system'], required: true },
    content: { type: String, required: true },
    attachments: [
        {
            name: String,
            type: String,
            url: String,
            size: Number,
        },
    ],
    modelId: { type: String },
    liked: { type: mongoose_1.Schema.Types.Mixed, default: null },
    tokenUsage: {
        prompt: Number,
        completion: Number,
        total: Number,
    },
}, { timestamps: true });
MessageSchema.index({ conversationId: 1, createdAt: 1 });
exports.Message = mongoose_1.models.Message || (0, mongoose_1.model)('Message', MessageSchema);
