import express from "express";
const router = express.Router();
import {
  // downloadVideo,
  // download,
  // getDownloadProgress,
  getVideos,
  // listFormats,
  // searchVideos,
} from "../controllers/youtube.controller.js";

// Endpoint to list all formats of a YouTube video
// router.get("/formats", listFormats);

// Endpoint to download a YouTube video
// router.get("/download", download);

// Endpoint to search videos from a specific channel
// router.get("/search", searchVideos);

router.get("/videos", getVideos);
// router.get("/download", downloadVideo)

// router.get("/progress", getDownloadProgress);

export default router;
