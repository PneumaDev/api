import express from "express";
import dotenv from "dotenv";
import youtubeRouter from "./routes/youtube.route.js";
import userRouter from "./routes/user.route.js";
import cors from "cors";
import mongoose from "mongoose";
import cron from "node-cron";
import { saveVideos } from "./controllers/youtube.controller.js";
// import { saveVideos } from "./controllers/youtube.controller.js";

// _Initialize dotenv
dotenv.config();

const port = process.env.PORT || 4000;

// _Initialize an express app
const app = express();

// _Enable CORS middleware
app.use(cors({
  origin: ['https://stlc.vercel.app', 'http://localhost:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
}));

// _Needed when sending data to the server as JSON
app.use(express.json());

// _Define routes
app.use("/api/yt", youtubeRouter);
app.use("/api/user", userRouter);

app.get('/', (req, res) => {
  res.send("STLC API Working")
})

app.listen(port, () => {
  console.log('Server up and running on PORT: ' + port);
})
// _Error handling middleware
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    statusCode,
    message: err.message || "Internal Server Error",
  });
});

// _Start the server only after MongoDB connects
mongoose
  .connect(process.env.MONGO)
  .then(() => {
    console.log("✅ Connected to Database");

    // Start the server
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });

    // Schedule cron jobs
    scheduleCronJobs();
  })
  .catch((err) => {
    console.error("❌ Database Connection Error:", err);
  });

// _Define cron jobs
const scheduleCronJobs = () => {
  // Runs at 9 AM, 2 PM, and 7 PM UTC daily
  cron.schedule("0 9,14,19 * * *", async () => {
    console.log("⏳ Running cron job to fetch and save videos...");
    try {
      await saveVideos();
    } catch (error) {
      console.error("❌ Error in cron job:", error);
    }
  });

  console.log("✅ Cron jobs scheduled.");
};
