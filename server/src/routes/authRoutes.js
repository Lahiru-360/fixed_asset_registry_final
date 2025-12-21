import express from "express";
import { registerUser, loginUser, me } from "../controllers/authController.js";
import {
  verifyFirebaseToken,
  verifyEmailFirebaseToken,
} from "../middlewares/verifyFirebaseToken.js";

const router = express.Router();

router.post("/register", verifyFirebaseToken, registerUser);
router.post("/login", verifyEmailFirebaseToken, loginUser);
router.get("/me", verifyEmailFirebaseToken, me);

export default router;
