import express from "express";
import { addBadToRoom, createRoom, getAllRooms, updateBadStatusAndPrice, updateRoom } from "../controllers/createRoom.controller.js";
import { verifyAccessToken } from "../middlewares/auth.middleware.js";
import { authorizeAdmin } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Only admins can create rooms
router.post('/create', verifyAccessToken, authorizeAdmin, createRoom);
router.get('/all', verifyAccessToken, authorizeAdmin, getAllRooms);
router.put('/:room_number', verifyAccessToken, authorizeAdmin, updateRoom);
router.post('/room/:room_number/add-bad', verifyAccessToken, authorizeAdmin, addBadToRoom);
router.put('/room/:room_number/bad/:bed_number', verifyAccessToken, authorizeAdmin, updateBadStatusAndPrice);


export default router;
