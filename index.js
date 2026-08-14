const { Client, GatewayIntentBits, EmbedBuilder, REST, Routes } = require('discord.js');
const { joinVoiceChannel, getVoiceConnection } = require('@discordjs/voice');
const http = require('http');

// Render port hatasını çözmek için sahte web server
http.createServer((req,res) => res.end('SlawesCheats Online')).listen(process.env.PORT || 3000);

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
    { name: 'sese', description: 'Botu bulunduğun sese çeker' },
    { name: 'sesten-cik', description: 'Botu sesten çıkarır' },
    { name: 'yaz', description: 'Özel embed duyuru' },
    { name: 'spoof', description: 'Fotoğraflı duyuru' }
  ];

  const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
  await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands });
  console.log('Komutlar yüklendi!');
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'sese') {
    const vc = interaction.member?.voice?.channel;
    if (!vc) return interaction.reply({ content: '❌ Önce sese gir kanka!', ephemeral: true });

    joinVoiceChannel({
      channelId: vc.id,
      guildId: interaction.guild.id,
      adapterCreator: interaction.guild.voiceAdapterCreator,
      selfDeaf: false
    });
    return interaction.reply(`✅ **${vc.name}** girdim.`);
  }

  if (interaction.commandName === 'sesten-cik') {
    const conn = getVoiceConnection(interaction.guild.id);
    if (conn) conn.destroy();
    return interaction.reply('👋 Çıktım.');
  }

  if (interaction.commandName === 'yaz') {
    const embed2 = new EmbedBuilder().setTitle('Slawes Store').setDescription('Burayı düzenle').setColor(0x8A2BE2);
    return interaction.reply({ embeds:  });
  }

  if (interaction.commandName === 'spoof') {
    const embed = new EmbedBuilder().setTitle('Spoofer').setDescription('Burayı düzenle').setImage('https://i.imgur.com/placeholder.png').setColor(0x8A2BE2);
    return interaction.reply({ embeds: [embed] });
  }
});

client.login(process.env.TOKEN);
