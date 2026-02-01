import Users from '../models/user.model.js';


//controller to get current user
export const getCurrentUserController = async(req,res)=>{
  try{
    const userId = req.user.id;
    const user = await Users.findById(userId).select("-password");
    if(!user){
      return res.status(404).json({message:"User not found"});

    }
    return res.status(200).json(user);

  }catch(err){
    return res.status(500).json({message:"Internal Server Error"});
  }
}

//get all users except current user
export const getAllUsers = async(req,res)=>{
  try{
    const currentUserId = req.user.id;
    const users = await Users.find({_id:{$ne:currentUserId}}).select("-password");
    return res.status(200).json(users);

  }catch(err){
    return res.status(500).json({message:"Internal Server Error"});
  }
}





//update profile including avatar
export const updateProfile = async(req,res)=>{
  try{
    const userId = req.user.id;
    const {firstName,lastName,username,avatarImage} = req.body;
    const updatedUser = await Users.findByIdAndUpdate(userId,
    {firstName,lastName,username,avatarImage},
    {new:true}).select("-password");
    if(!updatedUser){
      return res.status(404).json({message:"User not found"});
    }
    return res.status(200).json(updatedUser);
    

  }catch(err){
    return res.status(500).json({message:"Internal Server Error"});
  }
}