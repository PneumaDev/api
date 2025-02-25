import express from "express";
import { partnerWithMpesa, sendEmail } from "../controllers/user.controller.js";
const router = express.Router();

router.post("/mpesa", partnerWithMpesa)
router.post("/send-email", sendEmail)

export default router;
