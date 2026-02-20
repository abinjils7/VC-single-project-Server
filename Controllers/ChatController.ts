import { Request, Response } from "express";
import Chat from "../Models/Chat";
import Message from "../Models/Messege"; // Using the existing filename even if typo
import User from "../Models/User";

// Get all chats for the current user
export const getUserChats = async (req: Request, res: Response) => {
  try {
    
    const userId = (req as any).user.id || (req as any).user._id;

    const chats = await Chat.find({
      participants: { $in: [userId] },
    })
      .populate("participants", "name displayName avatar email role")
      .sort({ updatedAt: -1 });

    res.status(200).json(chats);
  } catch (error) {
    console.error("Error fetching chats:", error);
    res.status(500).json({ message: "Error fetching chats", error });
  }
};

// Get messages for a specific chat
export const getChatMessages = async (req: Request, res: Response) => {
  try {
    const { chatId } = req.params;

    const messages = await Message.find({ chatId }).sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: "Error fetching messages", error });
  }
};

// Create a new message via HTTP (for persistence + socket emission)
export const createMessage = async (req: Request, res: Response) => {
  try {
    const { chatId, message } = req.body;
    const senderId = (req as any).user.id || (req as any).user._id;

    if (!chatId || !message) {
      return res
        .status(400)
        .json({ message: "Chat ID and message content are required" });
    }

    const newMessage = new Message({
      chatId,
      senderId,
      message,
    });

    const savedMessage = await newMessage.save();

    // Update the Chat's last message info
    await Chat.findByIdAndUpdate(chatId, {
      lastMessage: message,
      lastMessageTime: new Date(),
    });

    res.status(201).json(savedMessage);
  } catch (error) {
    console.error("Error creating message:", error);
    res.status(500).json({ message: "Error creating message", error });
  }
};
