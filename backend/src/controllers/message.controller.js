import User from "../models/user.model.js";
import Message from "../models/message.model.js";
export const getUsersForSidebar = async (req, res) => {
    try {
        const loggedInUserId = req.user_id;
        const filteredUsers = await User.find({
            _id: { $ne: loggedInUserId },
        }).select("-password");

        res.status(200).json(filteredUsers);
    } catch (error) {
        console.log("Error in getUsersForSidebar: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getMessages = async (req, res) => {
    try {
        const { id: userToChatId } = req.params;
        const myId = req.user._id;

        const messages = await Message.find({
            $or: [
                { senderId: myId, recieverId: userToChatId }, // get all the messages I've ever sent to which only has a reciever ID of this mentioned person that I want to chat to
                { senderId: userToChatId, recieverId: myId }, // get all the messages of the person I want to chat to ever sent, but... not all, just the one's that he sent to me
            ],
        });
        res.status(200).json(messages);
    } catch (error) {
        console.log("Error in getMessages router: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};
