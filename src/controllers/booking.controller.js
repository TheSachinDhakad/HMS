import Booking from '../models/booking.model.js';
import Room from '../models/room.model.js';
import { ApiError } from '../utils/ApiError.js';


// export const bookBed = async (req, res, next) => {
//     const { room_number, bed_number, checkin_date, checkout_date } = req.body; // room_number, bed_number, checkin, and checkout date from the request body
//     const userId = req.user.id; // User making the booking

//     try {
//         // Ensure that the dates are valid
//         if (new Date(checkin_date) >= new Date(checkout_date)) {
//             return next(new ApiError(400, "Check-out date must be after check-in date"));
//         }

//         // Find the room by room_number
//         const room = await Room.findOne({ room_number });
//         if (!room) {
//             return next(new ApiError(404, "Room not found"));
//         }

//         // Find the specific bed by bed_number in the room's beds array
//         const bed = room.beds.find(bed => bed.bed_number === bed_number);
//         if (!bed) {
//             return next(new ApiError(404, "Bed not found"));
//         }

//         // Check if the bed is available
//         if (bed.status !== 'available') {
//             return next(new ApiError(400, ` Bed ${bed_number} is not available for booking`));
//         }

//         // Check if any existing booking for this specific bed overlaps with the requested dates
//         const overlappingBookings = await Booking.find({
//             room: room._id,
//             bed_number: bed_number,
//             status: { $in: ['pending', 'confirmed'] },
//             $or: [
//                 { checkin_date: { $lte: new Date(checkout_date) }, checkout_date: { $gte: new Date(checkin_date) } },
//                 { checkin_date: { $gte: new Date(checkin_date) }, checkout_date: { $lte: new Date(checkout_date) } }
//             ]
//         });

//         if (overlappingBookings.length > 0) {
//             return next(new ApiError(400, "The selected bed is not available for the selected dates"));
//         }

//         // Create the booking
//         const booking = new Booking({
//             user: userId,
//             room: room._id,
//             bed_number: bed_number,
//             price_per_bed: bed.price_per_bed,
//             checkin_date,
//             checkout_date,
//             status: 'pending', // Initially set to pending
//         });

//         // Save the booking
//         await booking.save();

//         // Update the bed status to 'occupied' after booking
//         bed.status = 'occupied';
//         await room.save();

//         return res.status(201).json({
//             message: "Booking successful",
//             booking,
//         });
//     } catch (error) {
//         console.error("Error booking bed:", error);
//         return next(new ApiError(500, "An error occurred while booking the bed"));
//     }
// }

export const bookBed = async (req, res, next) => {
    const { room_number, bed_number, checkin_date, checkout_date } = req.body; // Booking details from request body
    const userId = req.user.id; // User making the booking

    try {
        // Validate the check-in and check-out dates
        if (new Date(checkin_date) >= new Date(checkout_date)) {
            return next(new ApiError(400, "Check-out date must be after check-in date"));
        }

        // Find the room by room_number
        const room = await Room.findOne({ room_number });
        if (!room) {
            return next(new ApiError(404, "Room not found"));
        }

        // Find the specific bed by bed_number in the room's beds array
        const bed = room.beds.find((bed) => bed.bed_number === bed_number);
        if (!bed) {
            return next(new ApiError(404, "Bed not found"));
        }

        // Fetch the latest booking for this bed
        const latestBooking = await Booking.findOne({
            room: room._id,
            bed_number: bed_number,
            status: { $in: ['pending', 'confirmed'] },
        }).sort({ checkout_date: -1 }); // Sort by latest checkout date

        // Check if the requested check-in date is after the latest booking's checkout date
        if (latestBooking && new Date(checkin_date) <= new Date(latestBooking.checkout_date)) {
            return next(new ApiError(400, `Bed ${bed_number} is not available until after ${latestBooking.checkout_date}`));
        }

        // Create the booking
        const booking = new Booking({
            user: userId,
            room: room._id,
            bed_number: bed_number,
            price_per_bed: bed.price_per_bed,
            checkin_date,
            checkout_date,
            status: 'pending', // Initially set to pending
        });

        // Save the booking
        await booking.save();

        // Update the bed status to 'occupied' after booking
        bed.status = 'occupied';
        await room.save();

        return res.status(201).json({
            message: "Booking successful",
            booking,
        });
    } catch (error) {
        console.error("Error booking bed:", error);
        return next(new ApiError(500, "An error occurred while booking the bed"));
    }
};


export const getAllBookings = async (req, res, next) => {
    try {
        // Retrieve all bookings from the database
        const bookings = await Booking.find()
            .populate('room', 'room_number type') // Populate room details
            .populate('user', 'username email'); // Populate user details

        if (!bookings || bookings.length === 0) {
            return next(new ApiError(404, "No bookings found"));
        }

        return res.status(200).json({
            message: "All bookings retrieved successfully",
            bookings,
        });
    } catch (error) {
        console.error("Error fetching bookings:", error);
        return next(new ApiError(500, "An error occurred while retrieving bookings"));
    }
};


export const updateBookingStatus = async (req, res, next) => {
    const { bookingId, status } = req.body; // bookingId and new status from the request body

    try {
        // Ensure that the status is one of the allowed values
        if (!['confirmed', 'pending', 'canceled'].includes(status)) {
            return next(new ApiError(400, "Invalid status"));
        }

        // Check if the user is an admin
        const user = req.user; // Assuming req.user contains the logged-in user details
        if (user.role !== 'admin') {
            return next(new ApiError(403, "You are not authorized to update booking status"));
        }

        // Find the booking by its ID
        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return next(new ApiError(404, "Booking not found"));
        }

        // Update the status of the booking
        booking.status = status;

        // Save the updated booking
        await booking.save();

        return res.status(200).json({
            message: "Booking status updated successfully",
            booking,
        });
    } catch (error) {
        console.error("Error updating booking status:", error);
        return next(new ApiError(500, "An error occurred while updating the booking status"));
    }
};


export const updatePaymentStatus = async (req, res, next) => {
    const { bookingId } = req.params;
    const { payment_status, transaction_id, payment_method } = req.body;

    try {
        if (req.user.role !== 'admin') {
            return next(new ApiError(403, "You are not authorized to update payment status"));
        }

        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return next(new ApiError(404, "Booking not found"));
        }

        if (!['completed', 'pending', 'failed'].includes(payment_status)) {
            return next(new ApiError(400, "Invalid payment status"));
        }

        booking.payment_status = payment_status;
        booking.transaction_id = transaction_id || booking.transaction_id;
        booking.payment_method = payment_method || booking.payment_method;

        await booking.save();

        return res.status(200).json({
            message: "Payment status updated successfully",
            booking,
        });
    } catch (error) {
        console.error("Error updating payment status:", error);
        return next(new ApiError(500, "An error occurred while updating payment status"));
    }
};






export const generateReceipt = async (req, res, next) => {
    const { bookingId } = req.params; // Booking ID from URL params

    try {
        // Find the booking by ID and populate user and room details
        const booking = await Booking.findById(bookingId).populate('user room');
        if (!booking) {
            return next(new ApiError(404, "Booking not found"));
        }

        // Extract user information (handle both 'user' and 'user_details' cases)
        const userInfo = booking.user
            ? {
                username: booking.user.username || "N/A",
                fullname: booking.user.fullName || "N/A",
                email: booking.user.email || "N/A",
            }
            : {

                fullname: booking.user_details?.name || "N/A",
                email: booking.user_details?.email || "N/A",
            };

        // Calculate the number of days between checkin and checkout
        const checkinDate = new Date(booking.checkin_date);
        const checkoutDate = new Date(booking.checkout_date);
        const timeDifference = checkoutDate.getTime() - checkinDate.getTime();
        const days = Math.ceil(timeDifference / (1000 * 3600 * 24)); // Round up to the nearest integer

        // Calculate the total price (days * price_per_bed)
        const totalPrice = days * booking.price_per_bed;

        // Create receipt data
        const receipt = {
            booking_id: booking._id,
            user: userInfo,
            room: {
                room_number: booking.room.room_number || "N/A",
                type: booking.room.type || "N/A",
                bed_number: booking.bed_number,
            },
            checkin_date: checkinDate.toLocaleDateString(),
            checkout_date: checkoutDate.toLocaleDateString(),
            price_per_bed: booking.price_per_bed,
            total_days: days,
            total_price: totalPrice,
            payment_method: booking.payment_method,
            payment_status: booking.payment_status,
            transaction_id: booking.transaction_id || "N/A",
            status: booking.status || "N/A",
            booking_date: new Date(booking.booking_date).toLocaleDateString(),
        };

        // Send the receipt as JSON
        return res.status(200).json({
            message: "Receipt generated successfully",
            receipt,
        });
    } catch (error) {
        console.error("Error generating receipt:", error);
        return next(new ApiError(500, "An error occurred while generating the receipt"));
    }
};





export const createBookingForAnonymousUser = async (req, res, next) => {
    const {
        user_details, // Anonymous user details (e.g., name, email)
        room_number,
        bed_number,
        checkin_date,
        checkout_date,
        price_per_bed,
        status,
    } = req.body;

    try {
        // Validate user details
        if (!user_details || !user_details.name || !user_details.email) {
            return next(new ApiError(400, "User details (name and email) are required for anonymous booking"));
        }

        // Ensure that the dates are valid
        if (new Date(checkin_date) >= new Date(checkout_date)) {
            return next(new ApiError(400, "Check-out date must be after check-in date"));
        }

        // Find the room by room_number
        const room = await Room.findOne({ room_number });
        if (!room) {
            return next(new ApiError(404, "Room not found"));
        }

        // Find the specific bed by bed_number in the room's beds array
        const bed = room.beds.find((bed) => bed.bed_number === bed_number);
        if (!bed) {
            return next(new ApiError(404, "Bed not found"));
        }

        // Check if any existing booking for this specific bed overlaps with the requested dates
        const overlappingBookings = await Booking.find({
            room: room._id,
            bed_number: bed_number,
            status: { $in: ['pending', 'confirmed'] },
            $or: [
                { checkin_date: { $lte: new Date(checkout_date) }, checkout_date: { $gte: new Date(checkin_date) } },
                { checkin_date: { $gte: new Date(checkin_date) }, checkout_date: { $lte: new Date(checkout_date) } },
            ],
        });

        if (overlappingBookings.length > 0) {
            return next(new ApiError(400, "The selected bed is not available for the selected dates"));
        }

        // Create the booking with anonymous user details
        const booking = new Booking({
            user_details, // Store anonymous user details
            room: room._id,
            bed_number: bed_number,
            price_per_bed,
            checkin_date,
            checkout_date,
            status: status || 'confirmed', // Default to 'confirmed' if no status is provided
        });

        // Save the booking
        await booking.save();

        // Update the bed status to 'occupied' after booking
        bed.status = 'occupied';
        await room.save();

        return res.status(201).json({
            message: "Booking created successfully for the anonymous user",
            booking,
        });
    } catch (error) {
        console.error("Error creating booking for anonymous user:", error);
        return next(new ApiError(500, "An error occurred while creating the booking"));
    }
};


// export const getAllAnonymousBookings = async (req, res, next) => {
//     try {
//         // Find all bookings where user_details is populated (i.e., created by admin for an anonymous user)
//         const bookings = await Booking.find({ 'user_details.name': { $exists: true } })
//             .populate('room', 'room_number') // Populate the room data
//             .sort({ booking_date: -1 }); // Sort by booking date in descending order

//         if (!bookings || bookings.length === 0) {
//             return next(new ApiError(404, "No bookings found for anonymous users"));
//         }

//         return res.status(200).json({
//             message: "Anonymous user bookings retrieved successfully",
//             bookings,
//         });
//     } catch (error) {
//         console.error("Error fetching anonymous bookings:", error);
//         return next(new ApiError(500, "An error occurred while retrieving the bookings"));
//     }
// };
