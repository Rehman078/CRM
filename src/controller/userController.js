import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/User/userModel.js";
import { httpResponse } from "../utils/httpResponse.js";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1d" });
};

// Register User
const registerUser = async (req, res) => {
 try{
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) {
    return httpResponse.NOT_FOUND(res, null, "Please provide all fields")
  }
  const userExists = await User.findOne({ email });
  if (userExists) {
    return httpResponse.CONFLICT(res, null, "User already exist")
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role,
  });
  return httpResponse.CREATED(res, user)
 } catch(err){
  return httpResponse.BAD_REQUEST(res, err)
 }
};

// Login User
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user && (await bcrypt.compare(password, user.password))) {
      const responseData = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user.id),
      };
      return httpResponse.CREATED(res, responseData);
    } else {
      return httpResponse.UNAUTHORIZED(res, null, "Invalid email or password")
    }
  } catch (err) {
    return httpResponse.INTERNAL_SERVER_ERROR(res, err)
  }
};

// Get All Users (Admin Only)
const getUsers = async (req, res) => {
  try{
    const users = await User.find({});
    return httpResponse.SUCCESS(res, users, "User Retrived Successfully")
  }
  catch(err){
    return httpResponse.INTERNAL_SERVER_ERROR(res, err)
  }
  
};

export default {
  registerUser,
  loginUser,
  getUsers
}