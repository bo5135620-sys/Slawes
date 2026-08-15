const { Client, GatewayIntentBits, Partials, EmbedBuilder, PermissionsBitField, ChannelType, SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, REST, Routes } = require('discord.js');
const { joinVoiceChannel, getVoiceConnection } = require('@discordjs/voice');
const axios = require('axios');
const express = require('express');

const app = express();
app.get('/', (req,res) => res.send('BOT ONLINE - SlawesCheats'));
app.listen(process.env.PORT || 3000, () => console.log('WEB SERVER ACIK'));

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.MessageContent],
    partials: [Partials.Channel, Partials.Message, Partials.GuildMember]
});

const TOKEN = (process.env.TOKEN || '').trim();
console.log('TOKEN VAR MI:',!!TOKEN, 'UZUNLUK:', TOKEN.length);

const commands = [
    new SlashCommandBuilder().setName('lisan').setDescription('Lisans keyleri gösterir'),
    new SlashCommandBuilder().setName('rank').setDescription('Valorant rank sorgular').addStringOption(o => o.setName('isim').setDescription('İsim').setRequired(true)).addStringOption(o => o.setName('etiket').setDescription('Etiket').setRequired(true)),
    new SlashCommandBuilder().setName('sese-gel').setDescription('Botu sese çeker'),
    new SlashCommandBuilder().setName('sesten-cik').setDescription('Botu sesten çıkarır'),
    new SlashCommandBuilder().setName('spoof').setDescription('Fotoğrafı duyurur').addAttachmentOption(o => o.setName('foto').setDescription('Foto').setRequired(true)).addStringOption(o => o.setName('mesaj').setDescription('Mesaj').setRequired(false)),
    new SlashCommandBuilder().setName('temizle').setDescription('Kanalı siler').addChannelOption(o => o.setName('kanal').setDescription('Kanal').setRequired(false)),
    new SlashCommandBuilder().setName('ticket-kur').setDescription('Ticket kurar').addChannelOption(o => o.setName('kanal').setDescription('Kanal').setRequired(true)),
].map(c => c.toJSON());

client.once('ready', async () => {
    console.log(`BOT ONLINE: ${client.user.tag}`);
    const rest = new REST({ version: '10' }).setToken(TOKEN);
    await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
    console.log('Komutlar yüklendi!');
});

client.on('interactionCreate', async interaction => {
    if(!interaction.isChatInputCommand()) return;
    if(interaction.commandName === 'lisan'){
        const embed = new EmbedBuilder().setTitle('🔑 SlawesCheats - Lisans').setColor(0x00a8ff).setDescription('`SLAWES-XXXX-XXXX` - 30 Gün\n`SLAWES-YYYY-YYYY` - Sınırsız');
        return interaction.reply({ embeds: [embed], ephemeral: true });
    }
    if(interaction.commandName === 'rank'){
        await interaction.deferReply();
        const isim = interaction.options.getString('isim'); const etiket = interaction.options.getString('etiket');
        try {
            const res = await axios.get(`https://api.henrikdev.xyz/valorant/v2/mmr/eu/${isim}/${etiket}`);
            const d = res.data.data;
            const embed = new EmbedBuilder().setTitle(`${isim}#${etiket}`).setColor(0xff4655).addFields({ name: 'Rank', value: d.current_data.currenttierpatched, inline: true }, { name: 'RR', value: `${d.current_data.ranking_in_tier}`, inline: true }, { name: 'ELO', value: `${d.current_data.elo}`, inline: true });
            return interaction.editReply({ embeds: [embed] });
        } catch { return interaction.editReply(`Rank bulunamadı: ${isim}#${etiket}`); }
    }
    if(interaction.commandName === 'sese-gel'){
        const ch = interaction.member.voice.channel; if(!ch) return interaction.reply({ content: 'Sese gir!', ephemeral: true });
        joinVoiceChannel({ channelId: ch.id, guildId: interaction.guild.id, adapterCreator: interaction.guild.voiceAdapterCreator });
        return interaction.reply(`🔊 ${ch.name} geldim!`);
    }
    if(interaction.commandName === 'sesten-cik'){
        const conn = getVoiceConnection(interaction.guild.id); if(!conn) return interaction.reply({ content: 'Seste değilim', ephemeral: true });
        conn.destroy(); return interaction.reply('Çıktım 👋');
    }
    if(interaction.commandName === 'spoof'){
        const foto = interaction.options.getAttachment('foto'); const mesaj = interaction.options.getString('mesaj') || '📢 Duyuru';
        const embed = new EmbedBuilder().setTitle(mesaj).setColor(0x00a8ff).setImage(foto.url).setFooter({ text: interaction.user.tag });
        return interaction.reply({ embeds: [embed] });
    }
    if(interaction.commandName === 'temizle'){
        const kanal = interaction.options.getChannel('kanal') || interaction.channel; await interaction.deferReply({ ephemeral: true });
        let deleted = 0; let lastId; while(true){ const msgs = await kanal.messages.fetch({ limit: 100,...(lastId && { before: lastId }) }); if(msgs.size===0) break; lastId = msgs.last().id; for(const m of msgs.values()){ await m.delete().catch(()=>{}); deleted++; } if(msgs.size<100) break; }
        return interaction.editReply(`✅ ${deleted} mesaj silindi.`);
    }
    if(interaction.commandName === 'ticket-kur'){
        const kanal = interaction.options.getChannel('kanal');
        const embed = new EmbedBuilder().setTitle('🎫 Destek').setDescription('Butona tıkla ticket aç').setColor(0x00a8ff);
        const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('ticket_ac').setLabel('🎫 Ticket Aç').setStyle(ButtonStyle.Primary));
        await kanal.send({ embeds: [embed], components: [row] }); return interaction.reply({ content: 'Kuruldu', ephemeral: true });
    }
});
client.on('interactionCreate', async i => {
    if(!i.isButton() || i.customId!=='ticket_ac') return;
    const ch = await i.guild.channels.create({ name: `ticket-${i.user.username}`, type: ChannelType.GuildText, permissionOverwrites: [{ id: i.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] }, { id: i.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] }] });
    await i.reply({ content: `Açıldı: ${ch}`, ephemeral: true });
});
client.login(TOKEN);
