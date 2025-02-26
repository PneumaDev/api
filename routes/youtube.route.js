import express from "express";
const router = express.Router();
import {
  getVideos,
} from "../controllers/youtube.controller.js";

router.get("/videos", getVideos);


export default router;
