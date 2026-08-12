"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = connectDB;
const mongoose_1 = require("mongoose");
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/lycoris-ai';
const cached = global.mongooseCache || { conn: null, promise: null };
if (!global.mongooseCache) {
    global.mongooseCache = cached;
}
async function connectDB() {
    if (cached.conn) {
        return cached.conn;
    }
    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
        };
        cached.promise = mongoose_1.default.connect(MONGODB_URI, opts).then((mongoose) => {
            return mongoose;
        });
    }
    try {
        cached.conn = await cached.promise;
    }
    catch (e) {
        cached.promise = null;
        throw e;
    }
    return cached.conn;
}
exports.default = connectDB;
