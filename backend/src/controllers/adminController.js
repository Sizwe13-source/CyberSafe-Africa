import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";

const generateToken = (admin) => {
  return jwt.sign(
    {
      id: admin._id,
      email: admin.email,
      role: admin.role
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

export const registerAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "All fields are required."
      });
    }

    const existingAdmin = await Admin.findOne({ email });

    if (existingAdmin) {
      return res.status(400).json({
        message: "Admin already exists."
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await Admin.create({
      name,
      email,
      password: hashedPassword,
      role: "admin"
    });

    return res.status(201).json({
      message: "Admin registered successfully.",
      admin: {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      },
      token: generateToken(admin)
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to register admin.",
      error: error.message
    });
  }
};

export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res.status(401).json({
        message: "Invalid email or password."
      });
    }

    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid email or password."
      });
    }

    return res.status(200).json({
      message: "Login successful.",
      admin: {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      },
      token: generateToken(admin)
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to login admin.",
      error: error.message
    });
  }
};