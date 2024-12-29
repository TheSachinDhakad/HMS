import Room from '../models/room.model.js';
import { ApiError } from '../utils/ApiError.js';
export const createRoom = async (req, res, next) => {
    console.log("Request Body:", req.body);
    console.log("User creating room:", req.user); // Debugging log

    // Ensure req.user and req.user.id are available
    if (!req.user || !req.user.id) {
        console.error("User ID is missing or invalid in the request");
        return next(new ApiError(401, "User ID is missing or invalid"));
    }

    try {
        const { room_number, type, beds, features } = req.body;

        // Check for required fields
        if (!room_number || !type || !beds || !features) {
            return next(new ApiError(400, "Missing required fields"));
        }

        // Check if room number already exists
        const existingRoom = await Room.findOne({ room_number });
        if (existingRoom) {
            return next(new ApiError(400, "Room number already exists"));
        }

        // Create new room with the correct created_by
        const newRoom = new Room({
            room_number,
            type,
            beds,
            features,
            created_by: req.user.id, // Ensure we use the correct id here
        });

        await newRoom.save();

        return res.status(201).json({
            message: 'Room created successfully',
            room: newRoom,
        });
    } catch (error) {
        console.error("Error creating room:", error);
        return next(new ApiError(500, "An error occurred while creating the room"));
    }
};


export const updateRoom = async (req, res, next) => {
    console.log("Request Body:", req.body);
    console.log("User updating room:", req.user); // Debugging log

    // Ensure req.user and req.user.id are available
    if (!req.user || !req.user.id) {
        console.error("User ID is missing or invalid in the request");
        return next(new ApiError(401, "User ID is missing or invalid"));
    }

    try {
        const { room_number, type, beds, features, bad } = req.body; // Extract `bad` property

        // Check if required fields are provided
        if (!room_number || !type || !beds || !features) {
            return next(new ApiError(400, "Missing required fields"));
        }

        // Find the room by room_number
        const room = await Room.findOne({ room_number });
        if (!room) {
            return next(new ApiError(404, "Room not found"));
        }

        // Update the room with the new values, including `bad`
        room.type = type || room.type;
        room.beds = beds || room.beds;
        room.features = features || room.features;
        room.bad = bad !== undefined ? bad : room.bad; // Update or retain the `bad` property

        await room.save();

        return res.status(200).json({
            message: 'Room updated successfully',
            room,
        });
    } catch (error) {
        console.error("Error updating room:", error);
        return next(new ApiError(500, "An error occurred while updating the room"));
    }
};

export const addBadToRoom = async (req, res, next) => {
    console.log("Request Body:", req.body);
    console.log("User updating room:", req.user);

    // Ensure req.user and req.user.id are available
    if (!req.user || !req.user.id) {
        console.error("User ID is missing or invalid in the request");
        return next(new ApiError(401, "User ID is missing or invalid"));
    }

    try {
        // Extract room_number from URL parameters
        const { room_number } = req.params;
        const { bad } = req.body; // Bad beds information comes from the request body

        // Check if required fields are provided
        if (!room_number || !bad) {
            return next(new ApiError(400, "Missing required fields"));
        }

        // Find the room by room_number
        const room = await Room.findOne({ room_number });
        if (!room) {
            return next(new ApiError(404, "Room not found"));
        }

        // Ensure bad is an array
        if (!Array.isArray(bad)) {
            return next(new ApiError(400, "'bad' should be an array"));
        }

        // Check if the beds already exist and if bed_number is unique
        const existingBedNumbers = room.beds.map(bed => bed.bed_number);
        const badBedsWithCorrectStatus = bad.map(bed => {
            return {
                ...bed,
                status: bed.status || 'maintenance',  // If no status is provided, default to 'maintenance'
            };
        });

        // Add new bad beds to the room's existing beds array
        room.beds = [...room.beds, ...badBedsWithCorrectStatus];

        // Ensure that no duplicate bed numbers exist
        room.beds = Array.from(new Set(room.beds.map(bed => bed.bed_number)))
            .map(bed_number => room.beds.find(bed => bed.bed_number === bed_number));

        await room.save();

        return res.status(200).json({
            message: 'Bad values added successfully',
            room,
        });
    } catch (error) {
        console.error("Error adding bad values to room:", error);
        return next(new ApiError(500, "An error occurred while adding bad values to the room"));
    }
};


export const updateBadStatusAndPrice = async (req, res, next) => {
    console.log("Request Body:", req.body);
    console.log("User updating room:", req.user);

    // Ensure req.user and req.user.id are available
    if (!req.user || !req.user.id) {
        console.error("User ID is missing or invalid in the request");
        return next(new ApiError(401, "User ID is missing or invalid"));
    }

    try {
        const { room_number, bed_number } = req.params;  // Get room_number and bed_number from URL params
        const { status, price_per_bed } = req.body; // Get status and price_per_bed from request body

        // Check if required fields are provided
        if (!status || !price_per_bed) {
            return next(new ApiError(400, "Missing required fields (status, price_per_bed)"));
        }

        // Find the room by room_number
        const room = await Room.findOne({ room_number });
        if (!room) {
            return next(new ApiError(404, "Room not found"));
        }

        // Find the bed with the specified bed_number in the room
        const bedIndex = room.beds.findIndex(bed => bed.bed_number === bed_number);
        if (bedIndex === -1) {
            return next(new ApiError(404, "Bed not found"));
        }

        // Update the status and price_per_bed of the specified bed
        room.beds[bedIndex].status = status;  // Update the status
        room.beds[bedIndex].price_per_bed = price_per_bed;  // Update the price

        // Save the updated room document
        await room.save();

        return res.status(200).json({
            message: 'Bed status and price updated successfully',
            room,
        });
    } catch (error) {
        console.error("Error updating bed status and price:", error);
        return next(new ApiError(500, "An error occurred while updating bed status and price"));
    }
};


export const getAllRooms = async (req, res, next) => {
    try {
        // Extract optional query parameters for filtering, sorting, or pagination
        const { type, beds, features, page = 1, limit = 10 } = req.query;

        // Build the filter object
        const filter = {};
        if (type) filter.type = type;
        if (beds) filter.beds = beds;
        if (features) filter.features = { $all: features.split(',') };

        // Pagination and sorting setup
        const skip = (page - 1) * limit;
        const options = {
            skip: parseInt(skip),
            limit: parseInt(limit),
            sort: { createdAt: -1 }, // Sort by creation date, newest first
        };

        // Query the database
        const rooms = await Room.find(filter, null, options);

        // Get the total count for pagination
        const totalRooms = await Room.countDocuments(filter);

        // Respond with data
        res.status(200).json({
            message: "Rooms fetched successfully",
            total: totalRooms,
            page: parseInt(page),
            pages: Math.ceil(totalRooms / limit),
            rooms,
        });
    } catch (error) {
        console.error("Error fetching rooms:", error);
        return next(new ApiError(500, "An error occurred while fetching rooms"));
    }
};
