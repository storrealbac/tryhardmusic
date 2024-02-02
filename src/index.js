// Discord.js
const {
  Client,
  GatewayIntentBits,
} = require("discord.js");

// Youtube & Player
const { videoSearch } = require("./youtube.js");

// Embeds and actions
const { Embed_Playing, videoControlButtons } = require("./embeds.js");

const { GuildManager } = require("./guildmanager.js");

const Manager = new GuildManager();

// Load commands
const { loadSlashCommands } = require("./commands.js");
loadSlashCommands();

// client (bot)
const client = new Client({
  autoReconnnect: true,
  retryLimit: Infinity,
  presence: {
    status: "idle",
  },
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates
  ]
});


client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

// Comandos
client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName, options } = interaction;

  switch (commandName) {
    case "ping":
      await interaction.reply("🏓");
      break;
    case "tmusic":
      await interaction.reply("📻 Searching for your song...");

      const channel = interaction.member.voice.channel;
      if (!channel) {
        interaction.followUp("⚠️ You must be in a voice channel to play music ⚠️");
        return;
      }

      // video is always required as parameter
      const video_name = options.get("video").value;

      if (typeof (video_name) != "string") return;

      const searched_video = await videoSearch(video_name);

      if (searched_video == undefined) {
        interaction.followUp("We were unable to find a video that matched your search 😔");
        return;
      }

      const guild_id = interaction.member.guild.id;

      // update to the user
      await interaction.followUp({
        embeds: [
          Embed_Playing(interaction, {
            song_name: searched_video.title,
            artist_name: searched_video.channel.name,
            artist_img_url: searched_video.thumbnail,
            song_duration: searched_video.durationString,
            video_url: searched_video.link,
            embed_title: (Manager.isPlaying(guild_id, channel)) ? "Added to the queue" : "Now playing"
          })
        ],
        components: [videoControlButtons]
      });

      Manager.enqueueVideo(guild_id, channel, searched_video);
      break;
  }

});

// Botones
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isButton()) return;
  const button_data = interaction.customId.split("-")
  const clicker_author = interaction.member.user.username;

  const guild_id = interaction.member.guild.id;
  const channel = interaction.member.voice.channel;

  if (!channel) {
    interaction.followUp("⚠️ You must be in a voice channel to touch the buttons ⚠️");
    return;
  }

  switch (button_data[0]) {
    case "Playing":
      switch (button_data[1]) {
        case "Play":
          interaction.reply(`${clicker_author} - ha reproducido la canción`);
          //buttonEventHandler.emit("play", interaction.guild.id);
          Manager.resumeVideo(guild_id, channel);
          break;

        case "Stop":
          interaction.reply(`${clicker_author} - ha detenido la canción`)
          //buttonEventHandler.emit("stop", interaction.guild.id);
          Manager.pauseVideo(guild_id, channel);
          break;

        case "Next":
          if (Manager.queueLength(guild_id, channel) == 0)
            await interaction.reply("No hay canciones disponibles")
          else
            await interaction.reply(`${clicker_author} - ha avanzado a la siguiente canción`)
          Manager.skipVideo(guild_id, channel);
          break

      }

      break;
  }

});

client.login(process.env.DISCORD_TOKEN);