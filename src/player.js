const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus
} = require('@discordjs/voice');

const playdl = require("play-dl");

const { EventEmitter } = require("events");

// Play music
class MediaPlayer extends EventEmitter {
  constructor(channel, url) {
    super();
    this.channel = channel;
    this.url = url;
    this.play();
  }

  async play() {
    try {
      this.connection = joinVoiceChannel({
        channelId: this.channel.id,
        guildId: this.channel.guild.id,
        adapterCreator: this.channel.guild.voiceAdapterCreator,
      });
  
      this.source = await playdl.stream(this.url, {
        seek: 10,
        language: "en-US",
        quality: 2
      });
      
      this.stream = this.source.stream;
  
      this.resource = createAudioResource(this.stream, {
        inputType: this.source.type
      });
  
      this.player = createAudioPlayer();
      this.player.play(this.resource);
      this.connection.subscribe(this.player);
  
      this.player.on(AudioPlayerStatus.Idle, () => {
        console.log("Song ended!");
        
        // Send the signal of the video ended
        this.emit("videoEnd");
      });
    } catch(e) {
      console.log("Fallo! Volviendo a intentar")
      this.play();
    }

  }

  pause() {
    this.player.pause();
  }

  resume() {
    this.player.unpause();
  }

  kill() {
    if (this.player == undefined) return;
    this.player.stop();
  }

};

module.exports = {
  MediaPlayer
};