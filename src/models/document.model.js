
import mongoose from "mongoose";

const documentSchema = new mongoose.Schema({
    type: { type: String, required: true },
    file_url: { type: String, required: true },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    uploaded_at: { type: Date, default: Date.now },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Reference to User
});

export const Document = mongoose.model("Document", documentSchema);
