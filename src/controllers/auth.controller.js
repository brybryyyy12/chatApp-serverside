import Users from '../models/user.model.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';


//cotroller for register
export const registerController = async(req,res)=>{
  try{
    const {firstName,lastName,username,password,avatarImage} = req.body;
    if(!firstName || !lastName || !username || !password){
      return res.status(400).json({message:"all fields are required"});

    }
    const user = await Users.findOne({username:username});
    if(user){
      return res.status(400).json({message:"Username already exists"});
    }
    const newUser = await Users.create({firstName,lastName,username,password,avatarImage});
    console.log("registered successfully");

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET_KEY, { expiresIn: "7d" });
    res.status(201).json({ 
      userId: newUser._id,
      token
    });
    return res.status(201).json({message:"User registered successfully"});
    
  } catch (err) {
  console.error("Register error:", err); // logs full error
  return res.status(500).json({
    message: "Internal Server Error",
    error: err.message // shows the actual problem temporarily
  });
}

}



//controller for login 
export const loginController = async(req,res)=>{
  try{
    const {username,password} = req.body;
    if(!username || !password){
      return res.status(400).json({message:"Username and Password are required"});
    }
    const user = await Users.findOne({username:username});
    if(!user){
      return res.status(400).json({message:"username doesnt exist"});
    }
    const isMatch = await bcrypt.compare(password,user.password);
    if(!isMatch){
      return res.status(400).json({message:"Invalid password"})
    }
    //getting authorization token
    const userId = user._id.toString();
    const token = jwt.sign(
      {id:userId,username:username},
      process.env.JWT_SECRET_KEY,
      {expiresIn:'1d'}
    );
    console.log("logged in user id:", userId);
    return res.status(200).json({message:"Login successful",token,userId});
  }catch(err){
    return res.status(500).json({message:"Internal Server Error",error: err.message,});
    
  }
}


