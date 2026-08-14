const { Client, GatewayIntentBits, EmbedBuilder, REST, Routes } = require('discord.js');
const { joinVoiceChannel, getVoiceConnection } = require('@discordjs/voice');

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.GuildMessages]
});

client.once('ready', async () => {
  console.log(`Online: ${client.user.tag}`);
  const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
  await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), {
    body: [
      { name: 'sese gir', description: 'Botu bulunduğun sese çeker' },
      { name: 'sesten-cik', description: 'Botu sesten çıkarır' },
      { name: 'yaz', description: 'Embed duyuru atar' },
      { name: 'spoof', description: 'Fotoğraflı duyuru atar' }
    ]
  });
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'sese-gel') {
    const voiceChannel = interaction.member.voice.channel;
    if (!voiceChannel) return interaction.reply({ content: 'Önce bir ses kanalına girmen lazım kanka!', ephemeral: true });

    joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: interaction.guild.id,
      adapterCreator: interaction.guild.voiceAdapterCreator,
      selfDeaf: false,
      selfMute: false
    });

    return interaction.reply(`✅ ${voiceChannel.name} kanalına girdim, artık AFK düşmem.`);
  }

  if (interaction.commandName === 'sesten-cik') {
    const conn = getVoiceConnection(interaction.guild.id);
    if (conn) conn.destroy();
    return interaction.reply('👋 Sesten çıktım.');
  }

  if (interaction.commandName === 'yaz') {
    const embed = new EmbedBuilder().setTitle('Başlık').setDescription('Açıklama').setColor(0x8A2BE2);
    await interaction.reply({ embeds: [embed] });
  }

  if (interaction.commandName === 'spoof') {
    const embed = new EmbedBuilder().setTitle('Başlık 2').setDescription('Açıklama 2').setImage('https://i.imgur.com/örnek.jpg');
    await interaction.reply({ embeds: [embed] });
  }
});

client.login(process.env.TOKEN);
