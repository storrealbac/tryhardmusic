const { 
    EmbedBuilder,
    ButtonBuilder,
    ActionRowBuilder,
    ButtonStyle
} = require("discord.js");

const Button_PlayingStop = new ButtonBuilder()
  .setCustomId("Playing-Stop")
  .setLabel("౹౹")
  .setStyle(ButtonStyle.Danger);

const Button_PlayingPlay = new ButtonBuilder()
  .setCustomId("Playing-Play")
  .setLabel("▶")
  .setStyle(ButtonStyle.Success);

const Button_PlayingNext = new ButtonBuilder()
  .setCustomId("Playing-Next")
  .setLabel("▶|")
  .setStyle(ButtonStyle.Primary);

const Embed_Playing = (interaction, config) => {
  console.log(config)
    return new EmbedBuilder()
      .setColor([255, 255, 255]) // Establece el color del embed
      .setTitle(config.embed_title) // Establece el título
      .setDescription("ㅤ") // Establece una descripción. "ㅤ" es un espacio invisible.
      .addFields(
        { name: "Artist", value: config.artist_name, inline: true },
        { name: "Song", value: config.song_name, inline: true },
        { name: "Duration", value: config.song_duration, inline: true },
        { name: "URL", value: `*${config.video_url}*`, inline: false }
      )
      .setImage(config.artist_img_url) // Establece la imagen del embed
      .setFooter({
        text: interaction.member.displayName,
        iconURL: interaction.member.displayAvatarURL({ size: 256, dynamic: true }) 
      })
      .setTimestamp(); // Añade una marca de tiempo al embed
};

const videoControlButtons = new ActionRowBuilder()
    .addComponents(
      Button_PlayingPlay,
      Button_PlayingStop,
      Button_PlayingNext,
    );
  
module.exports = {
    Embed_Playing,
    Button_PlayingStop,
    Button_PlayingPlay,
    Button_PlayingNext,
    videoControlButtons
};
  