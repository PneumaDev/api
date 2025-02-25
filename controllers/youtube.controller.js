// _Handle Imports
const axios = process.env.NODE_ENV === 'production'
  ? await import('axios/dist/node/axios.cjs')
  : await import('axios');

export default axios.default;

import { ytmp3 } from 'ruhend-scraper'

import { Video } from "../models/videosList.js";

// _Handle Retrieving videos
export const saveVideos = async () => {
  try {
    const channelId = "UCqYGnYVOfB9bd3CUirZPjEQ"; // Replace with the ID of your YouTube channel

    // Make a request to the YouTube Data API to fetch videos from the channel
    const response = await axios.get(
      `https://www.googleapis.com/youtube/v3/search?key=AIzaSyCoYI7mWAs3XrQv0DCeB0eCETym-eGv0Js&channelId=${channelId}&part=snippet,id&order=date&maxResults=12`
    );

    if (response.status !== 200) {
      throw new Error(response.statusText);
    }

    // Extract relevant data from the response, including download links
    const videos = await Promise.all(response.data.items.map(async (item) => {
      const videoId = item.id.videoId;
      const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

      // Fetch download link using ruhend-scraper
      let audioDownloadLink;
      let videoDownloadLink;
      let videoSize;
      let audioSize;

      // try {
      //   try {
      //     const data = await ytmp3(videoUrl)
      //     audioDownloadLink = data.audio
      //   } catch (error) {
      //     console.log(error);
      //   }
      // } catch (error) {
      //   console.error('Error fetching download link:', error);
      //   audioDownloadLink = 'Download link not available';
      // }

      return {
        id: videoId,
        title: (item.snippet.title).replace('&amp;', "AND"),
        description: item.snippet.description || `For whatever was written in former days was written for our instruction, that through endurance and through the encouragement of the Scriptures we might have hope.`,
        publishedAt: item.snippet.publishedAt,
        // downloadLink: audioDownloadLink,
      };
    }));

    // Delete all existing videos from the database
    await Video.deleteMany({});

    // Save new videos to the database
    for (const video of videos) {
      await Video.updateOne({ id: video.id }, video, { upsert: true });
    }

    console.log(`Saved ${videos.length} videos to database.`);
  } catch (error) {
    console.error("Error fetching and saving videos:", error);
    throw error;
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

export const downloadVideo = async (req, res) => {
  const videoId = req.query.videoId;
  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

  // Fetch download link using ruhend-scraper
  let audioDownloadLink;
  let audioTitle

  const data = await ytmp3(videoUrl)
  audioDownloadLink = data.audio
  audioTitle = data.title

  // console.log(`Download link: ${audioDownloadLink}`);

  try {
    const response = await axios.get(audioDownloadLink, {
      responseType: 'stream',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
      },
    });


    const fileSizeInBytes = response.headers['content-length'];
    const contentType = response.headers['content-type'];

    // console.log(`File Size: ${fileSizeInBytes} bytes`);
    // console.log(`Content Type: ${contentType}`);

    const fileSizeInMB = fileSizeInBytes / (1024 * 1024);
    // console.log(`Audio file size: ${fileSizeInMB.toFixed(2)} MB`);

    res.set({
      'Content-Disposition': `attachment; filename="${audioTitle}"`,
      'Content-Length': fileSizeInBytes,
      'Content-Type': contentType || 'application/octet-stream',
    });

    response.data.pipe(res);

    response.data.on('end', () => {
      console.log('Download completed successfully.');
    });

    response.data.on('error', (err) => {
      console.error('Error in piping data:', err);
      res.status(500).send('Failed to download audio file.');
    });

  } catch (error) {
    console.error('Error downloading file:', error.response ? error.response.data : error.message);
    res.status(500).send('Failed to download audio file. Check the server logs for details.');
  }
};
