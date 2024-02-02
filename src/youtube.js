const youtube = require("scrape-youtube");

// Scrapper
const videoSearch = async (video_name) => {
  const result = await youtube.search(video_name);
  return result.videos[0];
}

module.exports = {
    videoSearch
};
  