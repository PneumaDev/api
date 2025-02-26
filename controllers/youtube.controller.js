// _Handle Imports
// const axios = process.env.NODE_ENV === 'production'
//   ? await import('axios/dist/node/axios.cjs')
//   : await import('axios');

// export default axios.default;

import axios from "axios";

// import { ytmp3 } from 'ruhend-scraper'

import { Video } from "../models/videosList.js";

// _Handle Retrieving videos
export const saveVideos = async () => {
  try {
    const channelId = "UCqYGnYVOfB9bd3CUirZPjEQ";
    const apiKey = process.env.YOUTUBE_API_KEY;

    if (!apiKey) {
      throw new Error("YouTube API key is missing! Set it in the .env file.");
    }

    console.log(apiKey);

    // Fetch latest 12 videos from YouTube API
    const response = await axios.get(
      `https://www.googleapis.com/youtube/v3/search?key=AIzaSyCoYI7mWAs3XrQv0DCeB0eCETym-eGv0Js&channelId=${channelId}&part=snippet,id&order=date&maxResults=12`
    );


    if (response.status !== 200) {
      throw new Error(`YouTube API Error: ${response.statusText}`);
    }

    // Extract & filter valid videos
    const videos = response.data.items
      .filter((item) => item.id.videoId) // Ensure it's a video, not a playlist
      .map((item) => ({
        id: item.id.videoId,
        title: item.snippet.title.replace("&amp;", "AND"),
        description:
          item.snippet.description ||
          "For whatever was written in former days was written for our instruction...",
        publishedAt: item.snippet.publishedAt,
        thumbnails: item.snippet.thumbnails || {}, // ✅ Ensure thumbnails exist
      }));

    if (videos.length === 0) {
      console.log("No new videos found.");
      return;
    }

    // Delete old videos & insert new ones efficiently
    try {
      await Video.deleteMany({});
    } catch (error) {
      console.log(error.message)
      throw error;
    }
    try {
      await Video.insertMany(videos);
    } catch (error) {
      console.log(error.message);
      throw error;

    }


    console.log(`✅ Saved ${videos.length} videos to the database.`);
  } catch (error) {
    console.error("❌ Error fetching and saving videos:", error.message);
    throw error.message;
  }
};

export const getVideos = async (req, res) => {
  try {
    const videos = await Video.find().sort({ publishedAt: -1 }).limit(12);
    res.json(videos);
  } catch (error) {
    console.error("Error fetching videos from database:", error);
    res.status(500).json({ error: "Error fetching videos from database" });
  }
};

// export const downloadVideo = async (req, res) => {
//   const videoId = req.query.videoId;
//   const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

//   // Fetch download link using ruhend-scraper
//   let audioDownloadLink;
//   let audioTitle

//   const data = await ytmp3(videoUrl)
//   audioDownloadLink = data.audio
//   audioTitle = data.title

//   // console.log(`Download link: ${audioDownloadLink}`);

//   try {
//     const response = await axios.get(audioDownloadLink, {
//       responseType: 'stream',
//       headers: {
//         'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
//       },
//     });


//     const fileSizeInBytes = response.headers['content-length'];
//     const contentType = response.headers['content-type'];

//     // console.log(`File Size: ${fileSizeInBytes} bytes`);
//     // console.log(`Content Type: ${contentType}`);

//     const fileSizeInMB = fileSizeInBytes / (1024 * 1024);
//     // console.log(`Audio file size: ${fileSizeInMB.toFixed(2)} MB`);

//     res.set({
//       'Content-Disposition': `attachment; filename="${audioTitle}"`,
//       'Content-Length': fileSizeInBytes,
//       'Content-Type': contentType || 'application/octet-stream',
//     });

//     response.data.pipe(res);

//     response.data.on('end', () => {
//       console.log('Download completed successfully.');
//     });

//     response.data.on('error', (err) => {
//       console.error('Error in piping data:', err);
//       res.status(500).send('Failed to download audio file.');
//     });

//   } catch (error) {
//     console.error('Error downloading file:', error.response ? error.response.data : error.message);
//     res.status(500).send('Failed to download audio file. Check the server logs for details.');
//   }
// };
