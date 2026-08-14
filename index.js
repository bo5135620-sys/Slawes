const { Client, GatewayIntentBits, EmbedBuilder, REST, Routes, PermissionsBitField, ChannelType, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { joinVoiceChannel, getVoiceConnection } = require('@discordjs/voice');
const express = require('express');

const app = express();
app.get('/', (req, res) => res.send('Slawes Online'));
app.listen(process.env.PORT || 10000, '0.0.0.0', () => console.log('WEB SERVER ACIK'));

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

client.once('ready', async () => {
  console.log(`Online: ${client.user.tag}`);
  const commands = [
    { name: 'sese-gel', description: 'Botu sese çeker' },
    { name: 'sesten-cik', description: 'Botu sesten çıkarır' },
    { name: 'temizle', description: 'Seçilen kanaldaki tüm mesajları siler', options: [{ name: 'kanal', description: 'Temizlenecek kanal', type: 7, required: true }] },
    { name: 'ticket-kur', description: 'Ticket sistemini kurar' },
    { name: 'lisans', description: 'Lisans keyleri gösterir' },
    { name: 'rank', description: 'Valorant rank sorgular', options: [
      { name: 'isim', description: 'Oyuncu ismi Örn: Barbar', type: 3, required: true },
      { name: 'etiket', description: 'Etiket Örn: EUW', type: 3, required: true },
      { name: 'bolge', description: 'Bölge eu/na/tr/ap', type: 3, required: false }
    ]},
    { name: 'yaz', description: 'Embed duyuru' },
    { name: 'spoof', description: 'Fotoğraflı duyuru' }
  ];
  const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
  try {
    if (process.env.GUILD_ID && process.env.CLIENT_ID) {
      await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), { body: commands });
      console.log('Guild komutlar ANINDA yüklendi');
    } else {
      await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands });
      console.log('Global komutlar yüklendi');
    }
  } catch(e) { console.log('Hata:', e.message) }
});

client.on('interactionCreate', async interaction => {
  if (interaction.isButton()) {
    if (interaction.customId === 'create_ticket') {
      const existing = interaction.guild.channels.cache.find(c => c.name === `ticket-${interaction.user.id}`);
      if (existing) return interaction.reply({ content: `Zaten ticketin var: ${existing}`, ephemeral: true });
      const ticketChannel = await interaction.guild.channels.create({
        name: `ticket-${interaction.user.id}`,
        type: ChannelType.GuildText,
        permissionOverwrites: [
          { id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
          { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory] },
          { id: client.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] }
        ]
      });
      const closeRow = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('close_ticket').setLabel('Ticketi Kapat').setEmoji('🔒').setStyle(ButtonStyle.Danger));
      await ticketChannel.send({ content: `Hoşgeldin ${interaction.user}, yetkililer ilgilenecek!`, components: [closeRow] });
      return interaction.reply({ content: `Ticketin açıldı: ${ticketChannel}`, ephemeral: true });
    }
    if (interaction.customId === 'close_ticket') {
      await interaction.reply({ content: '🔒 Ticket 5 saniye içinde kapatılacak...' });
      setTimeout(() => interaction.channel.delete().catch(() => {}), 5000);
      return;
    }
  }

  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'sese-gel') {
    await interaction.deferReply();
    const vc = interaction.member?.voice?.channel;
    if (!vc) return interaction.editReply('❌ Önce sese gir!');
    joinVoiceChannel({ channelId: vc.id, guildId: interaction.guild.id, adapterCreator: interaction.guild.voiceAdapterCreator, selfDeaf: false, selfMute: false });
    return interaction.editReply(`✅ **${vc.name}** girdim`);
  }
  if (interaction.commandName === 'sesten-cik') {
    const conn = getVoiceConnection(interaction.guild.id);
    if (conn) conn.destroy();
    return interaction.reply('👋 Çıktım');
  }
  if (interaction.commandName === 'temizle') {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) return interaction.reply({ content: '❌ Yetkin yok!', ephemeral: true });
    await interaction.deferReply();
    const channel = interaction.options.getChannel('kanal');
    const newChannel = await channel.clone();
    await channel.delete();
    await newChannel.send(`✅ Kanal ${interaction.user} tarafından temizlendi.`);
    return interaction.editReply(`✅ Temizlendi`);
  }
  if (interaction.commandName === 'ticket-kur') {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) return interaction.reply({ content: '❌ Sadece admin', ephemeral: true });
    const embed = new EmbedBuilder().setTitle('Help & Support').setDescription('Click below to create a new support ticket 🎫\nPowered by Slawes').setColor(0xFFAA00);
    const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('create_ticket').setLabel('Create Ticket').setEmoji('🎫').setStyle(ButtonStyle.Secondary));
    return interaction.reply({ embeds: [embed], components: [row] });
  }
  if (interaction.commandName === 'lisans') {
    const embed = new EmbedBuilder().setTitle('🔑 Slawes Lisans Keyleri').setDescription('**LİSANS KEY : SENT-IALI-ST26**\n**LİSANS KEY : A1B2-C3D4-E5F6**').setColor(0x00FF00).setFooter({ text: 'SlawesCheats' });
    return interaction.reply({ embeds: [embed] });
  }
  if (interaction.commandName === 'rank') {
    await interaction.deferReply();
    const isim = interaction.options.getString('isim');
    const etiket = interaction.options.getString('etiket');
    const bolge = interaction.options.getString('bolge') || 'eu';
    try {
      const res = await fetch(`https://api.henrikdev.xyz/valorant/v2/mmr/${bolge}/${isim}/${etiket}`);
      const data = await res.json();
      if (data.status!== 200) return interaction.editReply(`❌ Oyuncu bulunamadı: ${isim}#${etiket}`);
      const rank = data.data.current_data.currenttierpatched || 'Unranked';
      const rr = data.data.current_data.ranking_in_tier;
      const elo = data.data.current_data.elo;
      const embed = new EmbedBuilder()
       .setTitle(`🎯 ${isim}#${etiket} - Rank`)
       .setDescription(`**Rank:** ${rank}\n**RR:** ${rr}\n**ELO:** ${elo}\n**Bölge:** ${bolge.toUpperCase()}`)
       .setColor(0xFF4655)
       .setThumbnail(data.data.current_data.images?.large || null)
       .setFooter({ text: 'SlawesCheats | Valorant Rank' });
      return interaction.editReply({ embeds: [embed] });
    } catch (e) {
      return interaction.editReply('❌ API hatası, sonra tekrar dene.');
    }
  }
  if (interaction.commandName === 'yaz') {
    return interaction.reply({ embeds: [new EmbedBuilder().setTitle('Slawes Store').setDescription('Duyuru').setColor(0x8A2BE2)] });
  }
  if (interaction.commandName === 'spoof') {
    return interaction.reply({ embeds: [new EmbedBuilder().setTitle('Spoofer').setDescription('Açıklama').setColor(0x8A2BE2)] });
  }
});

client.on('messageCreate', async message => {
  if (message.author.bot) return;
  if (['sa','sea','s.a','selam'].includes(message.content.toLowerCase().trim())) message.reply('as kanki hoşgeldin 🖤');
  const reklam = ["discord.gg", "discord.com/invite", ".gg/", "https://", "http://", "www."];
  if (reklam.some(word => message.content.toLowerCase().includes(word))) {
    if (message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;
    try {
      await message.delete();
      message.channel.send(`⚠️ ${message.author} reklam yasak!`).then(m => setTimeout(() => m.delete().catch(()=>{}), 5000));
    } catch(e) {}
  }
});

client.login(process.env.TOKEN);
