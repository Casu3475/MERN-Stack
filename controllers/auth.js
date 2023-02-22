import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user.js";

/* REGISTER USER */
// when you call MongoDB, you have to use async/await
export const register = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      picturePath,
      friends,
      location,
      occupation,
    } = req.body;

    const salt = await bcrypt.genSalt(); // generate a salt
    const hashedPassword = await bcrypt.hash(password, salt); // hash the password
    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      picturePath,
      friends,
      location,
      occupation,
      viewedProfile: Math.floor(Math.random() * 10000),
      impressions: Math.floor(Math.random() * 10000),
    });
    const savedUser = await newUser.save(); // save the user to the database
    res.status(200).json(savedUser); // send the user back to the client
  } catch (error) {
    res.status(500).json(error); // send the error back to the client
  }
};

/* LOGGING IN */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body; // grab the email & password from the request body
    const user = await User.findOne({ email: email }); // find the user in the database

    if (!user) return res.status(400).json({ msg: "User does not exist." });

    const isMatch = await bcrypt.compare(password, user.password); // compare the password with the hashed password
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials. " });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET); // create a token
    delete user.password; // delete the password from the user object
    res.status(200).json({ token, user }); // send the user & token back to the client
  } catch (error) {
    res.status(500).json(error);
  }
};
