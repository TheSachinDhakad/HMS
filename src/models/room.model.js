import mongoose, { Schema } from 'mongoose';

const RoomSchema = new Schema(
    {
        room_number: { type: String, required: true, unique: true },
        type: { type: String, required: true },
        beds: [
            {
                bed_number: { type: String, required: true },
                status: { type: String, enum: ['available', 'occupied', 'maintenance'], default: 'available' },
                price_per_bed: { type: Number, required: true },
            },
        ],
        features: { type: [String], default: [] },
        created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Ensure this is correct
    },
    { timestamps: true }
);

// Exporting the Room model 
const Room = mongoose.model('Room', RoomSchema);

export default Room;
