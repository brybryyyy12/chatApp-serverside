import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  conversationId:{type: mongoose.Schema.Types.ObjectId,ref:"Conversations",required:true},
  senderId:{type: mongoose.Schema.Types.ObjectId,ref:"Users",required:true},
  text:{type:String,required:true},
  imageUrl:{type:String,default:""},
},{timestamps:true});

messageSchema.pre("save", async function() {
  if (!this.text && !this.imageUrl) {
    throw new Error("Message must have text or image");
  }
});

export default mongoose.model("Messages",messageSchema);