const Deque = require("collections/deque");
const Map = require("collections/map");

const { MediaPlayer } = require("./player.js")

const { Embed_Playing, videoControlButtons } = require("./embeds.js");

// here we are gonna take care of buttons and interactions
class GuildManager {
  constructor() {
    this.guild_state = new Map;
  };

  ensureExist(guild_id, channel) {
    if (!this.guild_state.has(guild_id))
      this.guild_state.set(guild_id, new StateManager(guild_id, channel));
  }

  enqueueVideo(guild_id, channel, video) {
    this.ensureExist(guild_id, channel);
    this.guild_state.get(guild_id).enqueueVideo(video);
  };

  // If is a actual stream
  isPlaying(guild_id, channel) {
    this.ensureExist(guild_id, channel);
    return this.guild_state.get(guild_id).isCurrentlyPlaying();
  }

  // If the video is skipped, return true and plays the video
  resumeVideo(guild_id, channel) {
    this.ensureExist(guild_id, channel);
    this.guild_state.get(guild_id).resumeActual();
  }

  pauseVideo(guild_id, channel) {
    this.ensureExist(guild_id, channel);
    this.guild_state.get(guild_id).pauseActual();
    
  }

  // return true if can skip the song, false if is not playing a song right now
  async skipVideo(guild_id, channel, interaction) {
    this.ensureExist(guild_id, channel);

    const state = this.guild_state.get(guild_id);
    this.guild_state.get(guild_id).skipActual();
    if (state.videosInQueue() == 0) return false;
    const actual_video = state.video_queue.peek();
    await interaction.followUp({
      embeds: [
        Embed_Playing(interaction, {
          song_name: actual_video.title,
          artist_name: actual_video.channel.name,
          artist_img_url: actual_video.thumbnail,
          song_duration: actual_video.durationString,
          video_url: actual_video.link,
          embed_title: "Now playing"
        })
      ],
      components: [videoControlButtons]
    });

    return true;
  }

  killBot(guild_id, channel) {
    this.ensureExist(guild_id, channel);
    this.guild_state.get(guild_id).kill();
  }

  queueLength(guild_id, channel) {
    this.ensureExist(guild_id, channel);
    return this.guild_state.get(guild_id).videosInQueue();
  }


};

// Guild bot state manager
class StateManager {
  constructor(guild_id, channel) {
    this.guild_id = guild_id
    this.channel = channel;
    this.video_queue = new Deque;
    this.isPlaying = false;
    this.isPaused = false;

    // If is undefined is not setted
    this.actual_mediaplayer = undefined;
  }

  enqueueVideo(video) {
    this.video_queue.push(video);

    //console.log(this.video_queue);

    // start to clear the queue
    if (!this.isPlaying)
      this.playNextInQueue();
  }

  isCurrentlyPlaying() {
    return this.isPlaying;
  }

  videosInQueue() {
    console.log("Videos in queue:", this.video_queue.length);
    return this.video_queue.length;
  }

  skipActual() {
    // Kill the actual stream and this gonna emit the event for the next song if is needed
    if (this.isPlaying)
      this.actual_mediaplayer.kill();
  }

  // If is a stream emitting, returns true, else false
  resumeActual() {
    if (this.actual_mediaplayer === undefined) return false;
    console.log("Resume button touched!")
    this.actual_mediaplayer.resume();
    this.isPaused = false;
    return true;
  }

  pauseActual() {
    if (this.actual_mediaplayer === undefined) return false;
    console.log("Pause button touched!")
    
    this.actual_mediaplayer.pause();
    this.isPaused = true;
    return true;
  }

  playNextInQueue() {
    if (this.videosInQueue() == 0) {
      this.isPlaying = false;
      return;
    }
    const video = this.video_queue.shift();
    this.actual_mediaplayer = new MediaPlayer(this.channel, video.link);
    this.isPlaying = true;

    this.actual_mediaplayer.on("videoEnd", () => {
      this.playNextInQueue();
    });
  }

};

module.exports = {
  GuildManager
};