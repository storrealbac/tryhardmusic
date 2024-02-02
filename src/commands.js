const { 
  REST, 
  SlashCommandBuilder,
  Routes
} = require("discord.js");

const commands = [
  new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Replies with 🏓"),
  new SlashCommandBuilder()
    .setName("tmusic")
    .setDescription("Plays music from the provided video ")
    .addStringOption(option =>
      option.setName("video")
        .setDescription("Name of the video you want to play")
        .setRequired(true)
      ),
].map(command => command.toJSON());

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

// Load slash command
const loadSlashCommands = async () => {
  try {
    console.log("Started refreshing application (/) commands.");

    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands }
    );

    console.log("Successfully reloaded application (/) commands.");
  } catch (error) {
    console.error(error);
  }
};

module.exports = {
  loadSlashCommands
};