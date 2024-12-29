import Housekeeping from "../models/housekeeping.model.js";
import { User } from "../models/user.model.js"; // Assuming User model has the staff details
import { ApiError } from "../utils/ApiError.js";

// Create a new housekeeping task for the staff


// export const createHousekeepingTask = async (req, res, next) => {
//     const { staff_id, room_number, bed_number, task, shift, task_status } = req.body;

//     try {
//         // Check if the staff exists
//         const staff = await User.findById(staff_id);
//         if (!staff || staff.role !== 'staff') {
//             return next(new ApiError(404, "Staff member not found or is not a staff role"));
//         }

//         // Create a new housekeeping task
//         const newTask = {
//             room_number,
//             bed_number,
//             task,
//             task_status: task_status || 'pending',
//             assigned_date: new Date(),
//             shift: shift || 'morning', // Default shift if not provided
//         };

//         // Check if the staff already has any tasks assigned, if so, add to their tasks array
//         const housekeeping = await Housekeeping.findOne({ staff_id });
//         if (housekeeping) {
//             // Add new task to the assigned_tasks array
//             housekeeping.assigned_tasks.push(newTask);
//             await housekeeping.save();
//         } else {
//             // If no housekeeping entry for the staff, create a new one
//             const newHousekeeping = new Housekeeping({
//                 staff_id,
//                 staff_name: staff.fullName,
//                 assigned_tasks: [newTask],
//                 shift: shift,
//                 status: 'active',
//             });
//             await newHousekeeping.save();
//         }

//         // Return the task along with its taskId (MongoDB automatically generates the _id)
//         return res.status(201).json({
//             message: "Housekeeping task created successfully",
//             task: {
//                 ...newTask
//             },
//         });
//     } catch (error) {
//         console.error("Error creating housekeeping task:", error);
//         return next(new ApiError(500, "An error occurred while creating the housekeeping task"));
//     }
// };
export const createHousekeepingTask = async (req, res, next) => {
    const { staff_id, tasks } = req.body;

    try {
        console.log("Request Body:", req.body); // Debugging input

        // Validate input
        if (!Array.isArray(tasks) || tasks.length === 0) {
            return next(new ApiError(400, "Tasks array is missing or empty"));
        }

        // Check if the staff exists
        const staff = await User.findById(staff_id);
        if (!staff || staff.role !== 'staff') {
            return next(new ApiError(404, "Staff member not found or is not a staff role"));
        }

        // Prepare tasks and validate each
        const newTasks = tasks.map(task => {
            const { room_number, bed_number, task: taskName, shift, task_status } = task;

            if (!room_number || !bed_number || !taskName) {
                throw new ApiError(400, "Each task must include room_number, bed_number, and task");
            }

            return {
                room_number,
                bed_number,
                task: taskName,
                task_status: task_status || 'pending',
                assigned_date: new Date(),
                shift: shift || 'morning',
            };
        });

        // Check if the staff already has a housekeeping record
        const housekeeping = await Housekeeping.findOne({ staff_id });

        if (housekeeping) {
            console.log("Existing Housekeeping Record Found:", housekeeping);

            // Add new tasks to the assigned_tasks array
            housekeeping.assigned_tasks.push(...newTasks);
            await housekeeping.save();
        } else {
            console.log("Creating a New Housekeeping Record");

            // Create a new entry
            const newHousekeeping = new Housekeeping({
                staff_id,
                staff_name: staff.fullName,
                assigned_tasks: newTasks,
                shift: tasks[0].shift || 'morning',
                status: 'active',
            });

            await newHousekeeping.save();
        }

        // Return success response
        return res.status(201).json({
            message: "Housekeeping tasks created successfully",
            tasks: newTasks,
        });
    } catch (error) {
        console.error("Error creating housekeeping tasks:", error);
        return next(new ApiError(500, "An error occurred while creating housekeeping tasks"));
    }
};



export const updateHousekeepingTaskStatus = async (req, res, next) => {
    const { taskId } = req.params; // Extract the taskId from the URL parameter
    const { task_status, completion_date } = req.body; // Extract status and completion date from the request body

    try {
        // Find the housekeeping record containing the task
        const housekeeping = await Housekeeping.findOne({ "assigned_tasks._id": taskId });
        if (!housekeeping) {
            return next(new ApiError(404, "Housekeeping task not found"));
        }

        // Find the task by taskId in the assigned tasks array
        const task = housekeeping.assigned_tasks.id(taskId);
        if (!task) {
            return next(new ApiError(404, "Task not found"));
        }

        // Update task status and completion date
        task.task_status = task_status || task.task_status; // Keep the existing status if not provided
        task.completion_date = completion_date || task.completion_date; // Update completion date if provided

        // Save the updated housekeeping record
        await housekeeping.save();

        return res.status(200).json({
            message: "Housekeeping task status updated successfully",
            task,
        });
    } catch (error) {
        console.error("Error updating housekeeping task status:", error);
        return next(new ApiError(500, "An error occurred while updating the housekeeping task status"));
    }
};

export const getAllHousekeepingTasks = async (req, res, next) => {
    const { task_status } = req.query; // Query parameter for filtering task status
    const { staff_id } = req.params; // Route parameter for specific staff ID

    try {
        // Fetch the housekeeping record for the specified staff ID
        const housekeepingRecord = await Housekeeping.findOne({ staff_id }).populate('staff_id', 'fullName role');

        // If no record is found, return a 404 error
        if (!housekeepingRecord) {
            return next(new ApiError(404, "No housekeeping tasks found for the specified staff member"));
        }

        // Filter tasks based on task_status if provided
        const tasks = task_status
            ? housekeepingRecord.assigned_tasks.filter(task => task.task_status === task_status)
            : housekeepingRecord.assigned_tasks;

        // If no tasks are found after filtering, return a 404 error
        if (tasks.length === 0) {
            return next(new ApiError(404, `No housekeeping tasks found with status '${task_status}'`));
        }

        // Return the filtered tasks
        return res.status(200).json({
            message: "Housekeeping tasks fetched successfully",
            tasks,
        });
    } catch (error) {
        console.error("Error fetching housekeeping tasks:", error);
        return next(new ApiError(500, "An error occurred while fetching housekeeping tasks"));
    }
};


