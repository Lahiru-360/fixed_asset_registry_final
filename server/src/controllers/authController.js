import { EmployeeModel } from "../models/employee.model.js";

export const registerUser = async (req, res) => {
  try {
    const firebaseUID = req.firebaseUser.uid;

    const { firstName, lastName, phone, email, department } = req.body;

    // Check if the user already exists
    const existingUser = await EmployeeModel.findByFirebaseUID(firebaseUID);
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Create user in database
    const newUser = await EmployeeModel.create({
      firebaseUID,
      firstName,
      lastName,
      phone,
      email,
      department,
    });

    res.json({
      message: "Registration successful",
      user: newUser,
    });
  } catch (err) {
    console.error("Register Error:", err);
    res.status(500).json({ error: "Server error during registration" });
  }
};

export const loginUser = async (req, res) => {
  try {
    const firebaseUID = req.firebaseUser.uid;

    const user = await EmployeeModel.findByFirebaseUID(firebaseUID);

    if (!user) {
      return res.status(404).json({ error: "User not found in database" });
    }

    res.json({
      message: "Login successful",
      user,
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ error: "Server error during login" });
  }
};

export const me = async (req, res) => {
  try {
    const uid = req.firebaseUser.uid;

    const user = await EmployeeModel.findByFirebaseUID(uid);

    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({ user });
  } catch (err) {
    console.error("Fetch Error:", err);
    res.status(500).json({ error: "Server error during fetching" });
  }
};
