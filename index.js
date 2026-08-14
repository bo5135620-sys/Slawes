const { Client, GatewayIntentBits, EmbedBuilder, REST, Routes, PermissionsBitField, ChannelType, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { joinVoiceChannel, getVoiceConnection } = require('@discordjs/voice');
const express = require('express');

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
    {
      name: 'temizle',
      description: 'Seçilen kanaldaki tüm mesajları siler',
      options: [{
        name: 'kanal',
        description: 'Temizlenecek kanal',
        type: 7, // Kanal tipi
        required: true
      }]
    },
    { name: 'ticket-kur', description: 'Ticket sistemini kurar' }
  ];
  const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
  await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands });
});

client.on('interactionCreate', async interaction => {
  // BUTON TIKLAMA - TICKET
  if (interaction.isButton()) {
    if (interaction.customId === 'create_ticket') {
      const guild = interaction.guild;
      const existing = guild.channels.cache.find(c => c.name === `ticket-${interaction.user.username.toLowerCase()}`);
      if (existing) return interaction.reply({ content: `Zaten ticketin var: ${existing}`, ephemeral: true });

      const ticketChannel = await guild.channels.create({
        name: `ticket-${interaction.user.username}`,
        type: ChannelType.GuildText,
        permissionOverwrites: [
          { id: guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
          { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
          { id: client.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] }
        ]
      });
      await ticketChannel.send(`Hoşgeldin ${interaction.user}, yetkililer ilgilenecek!`);
      return interaction.reply({ content: `Ticketin açıldı: ${ticketChannel}`, ephemeral: true });
    }
  }

  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'sese-gel') {
    await interaction.deferReply();
    const vc = interaction.member?.voice?.channel;
    if (!vc) return interaction.editReply('❌ Önce sese gir!');
    joinVoiceChannel({ channelId: vc.id, guildId: interaction.guild.id, adapterCreator: interaction.guild.voiceAdapterCreator, selfDeaf: false });
    return interaction.editReply(`✅ **${vc.name}** girdim`);
  }

  if (interaction.commandName === 'sesten-cik') {
    const conn = getVoiceConnection(interaction.guild.id);
    if (conn) conn.destroy();
    return interaction.reply('👋 Çıktım');
  }

  // NUKE DEĞİL GÜVENLİ TEMİZLE
  if (interaction.commandName === 'temizle') {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) return interaction.reply({ content: '❌ Yetkin yok!', ephemeral: true });

    await interaction.deferReply();
    const channel = interaction.options.getChannel('kanal');

    try {
      // Kanalı klonla = tüm mesajlar gider en temiz yöntem
      const newChannel = await channel.clone();
      await channel.delete();
      await newChannel.send(`✅ Kanal ${interaction.user} tarafından temizlendi.`);
      return interaction.editReply(`✅ ${channel.name} temizlendi.`);
    } catch (e) {
      return interaction.editReply(`Hata: ${e.message}`);
    }
  }

  // TICKET KURMA
  if (interaction.commandName === 'ticket-kur') {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) return interaction.reply({ content: '❌ Sadece admin kurabilir', ephemeral: true });

    const embed = new EmbedBuilder()
     .setTitle('Help & Support')
     .setDescription('Click below to create a new support ticket 🎫\nPowered by Slawes')
     .setColor(0xFFAA00);

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('create_ticket').setLabel('Create Ticket').setEmoji('🎫').setStyle(ButtonStyle.Secondary)
    );

    return interaction.reply({ embeds: [embed], components: [row] });
  }
});

client.on('messageCreate', async message => {
  if (message.author.bot) return;
  if (['sa','sea','s.a','selam'].includes(message.content.toLowerCase().trim())) {
    message.reply('as kanki hoşgeldin 🖤');
  }
});

client.login(process.env.TOKEN);
