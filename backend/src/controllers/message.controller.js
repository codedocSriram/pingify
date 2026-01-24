import User from "../models/user.model";

export const getUsersForSidebar = async (req, res) => {
    try {
        const loggedInUserId = req.user_id;
        const filteredUsers = await User.find({
            _id: { $ne: loggedInUserId },
        }).select("-password");

        res.status(200).json(filteredUsers);
    } catch (error) {
        console.error("Error in getUsersForSidebar: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getMessages = async (req, res) => {
    try {
    } catch (error) {}
};
