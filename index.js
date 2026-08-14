const { Client, GatewayIntentBits, EmbedBuilder, REST, Routes } = require('discord.js');
const { joinVoiceChannel, getVoiceConnection } = require('@discordjs/voice');
const express = require('express');

// PORT HATASINI ÇÖZEN KISIM
const app = express();
app.get('/', (req, res) => res.send('SlawesCheats Online - Bot Çalışıyor'));
const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Web server port ${port} de açık`));

// DISCORD BOTU
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
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
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'sese') {
    const vc = interaction.member?.voice?.channel;
    if (!vc) return interaction.reply({ content: '❌ Önce sese gir!', ephemeral: true });
    joinVoiceChannel({ channelId: vc.id, guildId: interaction.guild.id, adapterCreator: interaction.guild.voiceAdapterCreator, selfDeaf: false });
    return interaction.reply(`✅ **${vc.name}** girdim`);
  }

  if (interaction.commandName === 'sesten-cik') {
    const conn = getVoiceConnection(interaction.guild.id);
    if (conn) conn.destroy();
    return interaction.reply('👋 Çıktım');
  }

  if (interaction.commandName === 'yaz') {
    const embed2 = new EmbedBuilder().setTitle('Slawes').setDescription('test').setColor(0x8A2BE2);
    return interaction.reply({ embeds:  });
  }

  if (interaction.commandName === 'spoof') {
    const embed = new EmbedBuilder().setTitle('Spoofer').setDescription('test').setColor(0x8A2BE2).setImage('https://i.imgur.com/placeholder.png');
    return interaction.reply({ embeds: [embed] });
  }
});

client.login(process.env.TOKEN);
