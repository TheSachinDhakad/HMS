import mongoose from 'mongoose';

const housekeepingSchema = new mongoose.Schema({
    staff_name: {
        type: String,
        required: true,
        trim: true,
    },
    staff_id: {
        type: mongoose.Schema.Types.ObjectId, // Reference to User collection
        ref: 'User', // Assuming the User model is named 'User'
        required: true,
        unique: true,
    },

    assigned_tasks: [
        {
            room_number: {
                type: Number,
                required: true,
            },
            bed_number: {
                type: String,
                required: true,
            },
            task: {
                type: String,
                enum: ["cleaning", "laundry", "maintenance", "inspection"],
                required: true,
            },
            task_status: {
                type: String,
                enum: ["pending", "in-progress", "completed"],
                default: "pending",
            },
            assigned_date: {
                type: Date,
                default: Date.now,
            },
            completion_date: {
                type: Date,
            },
        },
    ],
    shift: {
        type: String,
        enum: ["morning", "evening", "night"],
        required: true,
    },
    status: {
        type: String,
        enum: ["active", "inactive"],
        default: "active",
    },
});
// housekeepingSchema.pre("save", function (next) {
//     this.assigned_tasks.forEach(task => {
//         if (!task.room_number || !task.bed_number || !task.task) {
//             throw new Error("Invalid task data in assigned_tasks");
//         }
//     });
//     next();
// });


const Housekeeping = mongoose.model("Housekeeping", housekeepingSchema);

export default Housekeeping;
