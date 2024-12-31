import express from 'express';
import { bookBed, createBookingForAnonymousUser, generateReceipt, getAllAvailableBeds, getAllBookings, updateBookingStatus,  getBookingsByStatus, updatePaymentStatus } from '../controllers/booking.controller.js';

import { authorizeAdmin, verifyAccessToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Route to book a bed
router.post('/book-bed', verifyAccessToken, bookBed);
router.get('/all/booking', verifyAccessToken, authorizeAdmin, getAllBookings);
router.put('/booking/status', verifyAccessToken, authorizeAdmin, updateBookingStatus);
router.put('/booking/:bookingId/payment-status', verifyAccessToken, authorizeAdmin, updatePaymentStatus);
router.get('/generate-receipt/:bookingId', verifyAccessToken, authorizeAdmin, generateReceipt);
router.post('/admin/anonymous-booking', verifyAccessToken, authorizeAdmin, createBookingForAnonymousUser);
router.get('/available-beds', getAllAvailableBeds);
router.get('/status-bookings', verifyAccessToken, getBookingsByStatus);

// router.get('/user-bookings/:userId', verifyAccessToken, getUserBookings);

export default router;