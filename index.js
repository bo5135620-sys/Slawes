const { Client, GatewayIntentBits, EmbedBuilder, REST, Routes } = require('discord.js');
const { joinVoiceChannel, getVoiceConnection } = require('@discordjs/voice');
const express = require('express');

// 1 - PORT FIX (Render Live olması için)
const app = express();
app.get('/', (req,res) => res.send('Slawes Online'));
app.listen(process.env.PORT || 10000, '0.0.0.0', () => console.log('WEB SERVER ACIK'));

// 2 - DISCORD BOT
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages
  ]
});

client.once('ready', async () => {
  console.log(`Online: ${client.user.tag}`);
  const commands = [
    { name: 'sese', description: 'Botu sese çeker' },
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

  if (interaction.commandName === 'sese') {
    const vc = interaction.member?.voice?.channel;
    if (!vc) return interaction.reply({ content: '❌ Önce bir ses kanalına gir kanki!', ephemeral: true });

    try {
      joinVoiceChannel({
        channelId: vc.id,
        guildId: interaction.guild.id,
        adapterCreator: interaction.guild.voiceAdapterCreator,
        selfDeaf: false,
        selfMute: false
      });
      return interaction.reply(`✅ **${vc.name}** girdim kanki, buradayım`);
    } catch (err) {
      console.error(err);
      return interaction.reply({ content: `Giremedim kanki hata: ${err.message}`, ephemeral: true });
    }
  }

  if (interaction.commandName === 'sesten-cik') {
    const conn = getVoiceConnection(interaction.guild.id);
    if(conn) conn.destroy();
    return interaction.reply('👋 Sesten çıktım');
  }

  if (interaction.commandName === 'yaz') {
    const embed2 = new EmbedBuilder().setTitle('Slawes Store').setDescription('Açıklaman buraya').setColor(0x8A2BE2);
    return interaction.reply({ embeds:  });
  }

  if (interaction.commandName === 'spoof') {
    const embed = new EmbedBuilder().setTitle('Spoofer').setDescription('Açıklama').setColor(0x8A2BE2);
    return interaction.reply({ embeds: [embed] });
  }
});

client.login(process.env.TOKEN);
