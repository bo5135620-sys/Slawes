const { Client, GatewayIntentBits, EmbedBuilder, REST, Routes } = require('discord.js');
const { joinVoiceChannel, getVoiceConnection } = require('@discordjs/voice');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages
  ]
});

client.once('ready', async () => {
  console.log(`Giriş yapıldı: ${client.user.tag}`);

  const commands = [
    { name: 'sese', description: 'Botu bulunduğun sese çeker' },
    { name: 'sesten-cik', description: 'Botu sesten çıkarır' },
    { name: 'yaz', description: 'Özel embed duyuru atar' },
    { name: 'spoof', description: 'Fotoğraflı duyuru atar' }
  ];

  const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
  await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands });
  console.log('Komutlar yüklendi!');
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  // SESE GİR
  if (interaction.commandName === 'sese') {
    const vc = interaction.member?.voice?.channel;
    if (!vc) return interaction.reply({ content: '❌ Kanka önce bir ses kanalına gir!', ephemeral: true });

    joinVoiceChannel({
      channelId: vc.id,
      guildId: interaction.guild.id,
      adapterCreator: interaction.guild.voiceAdapterCreator,
      selfDeaf: false
    });

    return interaction.reply({ content: `✅ **${vc.name}** kanalına girdim, artık çıkmam.` });
  }

  // SESTEN ÇIK
  if (interaction.commandName === 'sesten-cik') {
    const conn = getVoiceConnection(interaction.guild.id);
    if (conn) conn.destroy();
    return interaction.reply({ content: '👋 Sesten çıktım.' });
  }

  // YAZ
  if (interaction.commandName === 'yaz') {
    const embed2 = new EmbedBuilder()
     .setTitle('Slawes Store')
     .setDescription('Buraya kendi yazını yazarsın kanka')
     .setColor(0x8A2BE2);

    return interaction.reply({ embeds:  }); // İŞTE BURASI ÖNEMLİ - BOŞ BIRAKMA
  }

  // SPOOF
  if (interaction.commandName === 'spoof') {
    const embed = new EmbedBuilder()
     .setTitle('Spoofer')
     .setDescription('Açıklama buraya')
     .setImage('https://i.imgur.com/placeholder.png')
     .setColor(0x8A2BE2);

    return interaction.reply({ embeds: [embed] });
  }
});

client.login(process.env.TOKEN);
