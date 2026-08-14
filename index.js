const { Client, GatewayIntentBits, EmbedBuilder, REST, Routes } = require('discord.js');
const { joinVoiceChannel, getVoiceConnection } = require('@discordjs/voice');
const express = require('express');

// 1 - PORT FIX (Render Live olması için)
const app = express();
app.get('/', (req, res) => res.send('Slawes Online'));
app.listen(process.env.PORT || 10000, '0.0.0.0', () => console.log('WEB SERVER ACIK'));

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.once('ready', async () => {
  console.log(`Online: ${client.user.tag}`);
  const commands = [
    { name: 'sese-gel', description: 'Botu sese çeker' },
    { name: 'sesten-cik', description: 'Botu sesten çıkarır' },
    { name: 'yaz', description: 'Embed duyuru' },
    { name: 'spoof', description: 'Fotoğraflı duyuru' }
  ];
  const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
  await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands });
  console.log('Komutlar yüklendi');
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'sese-gel') {
    await interaction.deferReply();
    const vc = interaction.member?.voice?.channel;
    if (!vc) return interaction.editReply('❌ Önce sese gir kanki!');
    try {
      joinVoiceChannel({
        channelId: vc.id,
        guildId: interaction.guild.id,
        adapterCreator: interaction.guild.voiceAdapterCreator,
        selfDeaf: false,
        selfMute: false
      });
      return interaction.editReply(`✅ **${vc.name}** girdim kanki`);
    } catch (e) {
      return interaction.editReply(`Hata: ${e.message}`);
    }
  }

  if (interaction.commandName === 'sesten-cik') {
    const conn = getVoiceConnection(interaction.guild.id);
    if (conn) conn.destroy();
    return interaction.reply('👋 Sesten çıktım');
  }

  if (interaction.commandName === 'yaz') {
    const embed = new EmbedBuilder().setTitle('Slawes Store').setDescription('Buraya yazını yaz').setColor(0x8A2BE2);
    return interaction.reply({ embeds: [embed] });
  }

  if (interaction.commandName === 'spoof') {
    const embed = new EmbedBuilder().setTitle('Spoofer').setDescription('Açıklama').setColor(0x8A2BE2);
    return interaction.reply({ embeds: [embed] });
  }
});

// SA-AS ÖZELLİĞİ
client.on('messageCreate', async message => {
  if (message.author.bot) return;
  const msg = message.content.toLowerCase().trim();
  if (['sa', 'sea', 's.a', 'selamun aleyküm', 'selamün aleyküm', 'selam'].includes(msg)) {
    message.reply('as kanki hoşgeldin 🖤');
  }
});

client.login(process.env.TOKEN);
