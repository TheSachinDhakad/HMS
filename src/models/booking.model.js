import mongoose, { Schema } from 'mongoose';

const BookingSchema = new Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',

        },
        user_details: {
            name: { type: String },
            email: { type: String },
            phone: { type: String }
        },
        room: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Room',
            required: true,
        },
        bed_number: {
            type: String,
            required: true,
        },
        price_per_bed: {
            type: Number,
            required: true,
        },
        booking_date: {
            type: Date,
            default: Date.now,
        },
        checkin_date: {
            type: Date,
            required: true,
        },
        checkout_date: {
            type: Date,
            required: true,
        },
        status: {
            type: String,
            enum: ['confirmed', 'pending', 'canceled'],
            default: 'pending',
        },
        // New Payment Fields
        payment_status: {
            type: String,
            enum: ['completed', 'pending', 'failed'],
            default: 'pending', // Default is pending until payment is confirmed
        },
        payment_date: {
            type: Date,
        },
        payment_method: {
            type: String, // Options for payment method
            enum: ['cash', 'online'], // 'S' can represent any custom payment method, replace it if needed
            default: 'online', // Default payment method can be set to 'online' or 'cash'
        },
        transaction_id: {
            type: String, // Unique identifier for the payment transaction
        },
    },
    { timestamps: true }
);

// Exporting the Booking model
const Booking = mongoose.model('Booking', BookingSchema);

export default Booking;