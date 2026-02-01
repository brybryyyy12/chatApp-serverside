import Conversations from '../models/conversation.model.js';
import Messages from '../models/message.model.js';
import mongoose from 'mongoose';
import Users from '../models/user.model.js';



//creating a conversation between two users if not exists
export const createConversation = async (req, res) => {
  try {
    const senderId = new mongoose.Types.ObjectId(req.user.id);
    const { receiverId } = req.body;

    console.log("==== CREATE CONVERSATION ====");
    console.log("Sender ID:", senderId);
    console.log("Receiver ID:", receiverId);

    if (!receiverId) {
      return res.status(400).json({ message: "ReceiverId is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(receiverId)) {
      return res.status(400).json({ message: "Invalid receiverId format" });
    }

    if (req.user.id === receiverId) {
      return res.status(400).json({ message: "Cannot chat with yourself" });
    }

    const receiverObjectId = new mongoose.Types.ObjectId(receiverId);

    const receiver = await Users.findById(receiverObjectId);
    if (!receiver) {
      return res.status(400).json({ message: "Receiver does not exist" });
    }

    // Make sure both members are ObjectIds for MongoDB
    let conversation = await Conversations.findOne({
      members: { $all: [senderId, receiverObjectId], $size: 2 },
    });

    if (!conversation) {
      conversation = await Conversations.create({
        members: [senderId, receiverObjectId],
      });
    }

    console.log("Conversation found/created:", conversation._id);

    return res.status(200).json(conversation);
  } catch (err) {
    console.error("Create conversation error:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};





//sending a message
export const sendMessage = async (req, res) => {
  try {
    const senderId = req.user.id;
    const { conversationId, text, imageUrl } = req.body;

    if (!conversationId) {
      return res.status(400).json({ message: "conversationId is required" });
    }

    // Verify if sender is part of the conversation
    const conversation = await Conversations.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    if (!conversation.members.some(m => m.toString() === senderId)) {
      return res.status(403).json({ message: "You are not part of this conversation" });
    }

    // Create message
    const newMessage = await Messages.create({
      conversationId,
      senderId,
      text,
      imageUrl,
    });

    // Update last message
    conversation.lastMessage = text || "Image";
    await conversation.save();

    // EMIT TO SOCKET.IO FOR REAL-TIME
    const io = req.app.get("io"); // make sure io is attached to express app
    io.to(conversationId).emit("newMessage", newMessage);

    return res.status(201).json(newMessage);
  } catch (err) {
    console.error("Send message error:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};



//get all messages in a conversation 
export const getMessages = async(req,res)=>{
  try{
    const userId = req.user.id;
    const {conversationId} = req.params;

    //check if conversationId is valid
    if(!mongoose.Types.ObjectId.isValid(conversationId)){
      return res.status(400).json({message:"Invalid conversation"})
    }

    //check if the user is part of the conversation
    const conversation = await Conversations.findById(conversationId);
    if(!conversation){
      return res.status(404).json({message:"Conversation not found"});
    }
if (!conversation.members.some(m => m.toString() === userId)) {
  return res.status(403).json({ message: "You are not part of this conversation" });
}


    //fetch the message ..sorted
    const messages = await Messages.find({conversationId}).sort({createdAt:1});
    return res.status(200).json(messages);
  }catch(err){
    console.error("Get messages error:", err);
    return res.status(500).json({message:"Internal Server Error"});

  }
}


export const getConversationDetails = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const convo = await Conversations.findById(id)
      .populate("members", "username avatar");

    if (!convo) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    // make sure user belongs to conversation
    const isMember = convo.members.some(
      m => m._id.toString() === userId
    );

    if (!isMember) {
      return res.status(403).json({ message: "Forbidden" });
    }

    // receiver = the other user
    const receiver = convo.members.find(
      m => m._id.toString() !== userId
    );

    res.json({
      conversationId: convo._id,
      receiver,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
