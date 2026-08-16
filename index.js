require('dotenv').config();
const { 
    Client, 
    GatewayIntentBits, 
    Partials, 
    ActivityType, 
    EmbedBuilder, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle, 
    ChannelType, 
    PermissionFlagsBits 
} = require('discord.js');
const { joinVoiceChannel, VoiceConnectionStatus, entersState } = require('@discordjs/voice');
const express = require('express');

// ====================================================
// 1. RENDER 7/24 UYANIK TUTUCU (EXPRESS)
// ====================================================
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.status(200).send(`
        <!DOCTYPE html>
        <html>
        <head><title>Bot Durumu</title><meta charset="utf-8"></head>
        <body style="background:#090d16; color:#ffffff; font-family:sans-serif; text-align:center; padding-top:60px;">
            <h1 style="color:#10b981;">🟢 Gelişmiş Discord Botu 7/24 Aktif!</h1>
            <p style="color:#94a3b8;">Spam Koruması, Anti-Link ve Ses Sistemi devrede.</p>
        </body>
        </html>
    `);
});

app.listen(PORT, () => {
    console.log(`🌐 [Web] Express sunucusu ${PORT} portunda dinlemede.`);
});

// ====================================================
// 2. DISCORD İSTEMCİSİ
// ====================================================
const client = new Client({
    intents: [
   const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.MessageContent
    ],
    partials: [Partials.Channel, Partials.Message, Partials.User, Partials.GuildMember]
});
    ],
    partials: [Partials.Channel, Partials.Message, Partials.User, Partials.GuildMember]
});

// ====================================================
// 3. SPAM & REKLAM KORUMA HAFIZASI
// ====================================================
const spamMap = new Map();
const linkRegex = /(https?:\/\/[^\s]+)|(discord\.(gg|io|me|li)\/[^\s]+)|(discordapp\.com\/invite\/[^\s]+)|(discord\.com\/invite\/[^\s]+)/i;

// ====================================================
// 4. SLASH KOMUT LİSTESİ
// ====================================================
const commands = [
    // Rol & Emoji
    {
        name: 'rol-emoji',
        description: 'Emojili ve butonlu rol alma paneli oluşturur.',
        options: [
            { name: 'rol', description: 'Verilecek rol', type: 8, required: true },
            { name: 'emoji', description: 'Buton emojisi (örn: 🎮, 🔔, ⭐, 💎)', type: 3, required: true },
            { name: 'aciklama', description: 'Embed panel açıklaması', type: 3, required: false },
            { name: 'buton_yazi', description: 'Buton üzerindeki yazı', type: 3, required: false }
        ]
    },

    // 7/24 Ses
    {
        name: 'ses-katil',
        description: 'Botu seçilen ses kanalında 7/24 AFK bırakır.',
        options: [{ name: 'kanal', description: 'Ses kanalı', type: 7, required: true }]
    },

    // Destek & Çekiliş
    { name: 'ticket-kur', description: 'Butonlu destek paneli kurar.' },
    {
        name: 'cekilis',
        description: 'Butonlu süreli çekiliş başlatır.',
        options: [
            { name: 'dakika', description: 'Süre (dakika)', type: 4, required: true },
            { name: 'odul', description: 'Ödül', type: 3, required: true },
            { name: 'kazanan_sayisi', description: 'Kazanan sayısı', type: 4, required: false }
        ]
    },

    // Moderasyon
    {
        name: 'sil',
        description: 'Sohbetten mesaj siler (1-100).',
        options: [{ name: 'miktar', description: 'Silinecek sayı', type: 4, required: true }]
    },
    {
        name: 'kilit',
        description: 'Kanalı kilitler veya açar.',
        options: [
            {
                name: 'durum',
                description: 'Kilit durumu',
                type: 3,
                required: true,
                choices: [
                    { name: '🔒 Kilitle', value: 'lock' },
                    { name: '🔓 Kilidi Aç', value: 'unlock' }
                ]
            }
        ]
    },
    {
        name: 'yavas-mod',
        description: 'Yavaş mod ayarlar.',
        options: [{ name: 'saniye', description: 'Süre (saniye)', type: 4, required: true }]
    },
    {
        name: 'ban',
        description: 'Kullanıcıyı yasaklar.',
        options: [
            { name: 'kullanici', description: 'Kişi', type: 6, required: true },
            { name: 'sebep', description: 'Sebep', type: 3, required: false }
        ]
    },
    {
        name: 'kick',
        description: 'Kullanıcıyı atar.',
        options: [
            { name: 'kullanici', description: 'Kişi', type: 6, required: true },
            { name: 'sebep', description: 'Sebep', type: 3, required: false }
        ]
    },
    {
        name: 'timeout',
        description: 'Kullanıcıyı susturur.',
        options: [
            { name: 'kullanici', description: 'Kişi', type: 6, required: true },
            { name: 'dakika', description: 'Dakika', type: 4, required: true },
            { name: 'sebep', description: 'Sebep', type: 3, required: false }
        ]
    },
    {
        name: 'rol-ver',
        description: 'Kullanıcıya rol verir.',
        options: [
            { name: 'kullanici', description: 'Kişi', type: 6, required: true },
            { name: 'rol', description: 'Rol', type: 8, required: true }
        ]
    },
    {
        name: 'rol-al',
        description: 'Kullanıcıdan rol alır.',
        options: [
            { name: 'kullanici', description: 'Kişi', type: 6, required: true },
            { name: 'rol', description: 'Rol', type: 8, required: true }
        ]
    },

    // Bilgi & Eğlence
    { name: 'ping', description: 'Bot gecikmesini ölçer.' },
    { name: 'yardim', description: 'Tüm komutları listeler.' },
    { name: 'istatistik', description: 'Sistem verilerini gösterir.' },
    { name: 'sunucu', description: 'Sunucu bilgilerini gösterir.' },
    {
        name: 'avatar',
        description: 'Avatarı gösterir.',
        options: [{ name: 'kullanici', description: 'Kişi', type: 6, required: false }]
    },
    {
        name: 'kullanici-bilgi',
        description: 'Kullanıcı detaylarını gösterir.',
        options: [{ name: 'kullanici', description: 'Kişi', type: 6, required: false }]
    },
    {
        name: 'yaz',
        description: 'Bota mesaj yazdırır.',
        options: [{ name: 'mesaj', description: 'Metin', type: 3, required: true }]
    },
    { name: 'zar-at', description: 'Zar atar.' },
    { name: 'yazi-tura', description: 'Yazı tura atar.' }
];

// ====================================================
// 5. READY EVENT (ÇİFT KOMUTLARI OTOMATİK TEMİZLER)
// ====================================================
client.once('ready', async () => {
    console.log(`🚀 [Bot] ${client.user.tag} olarak Discord'a başarıyla giriş yapıldı!`);

    try {
        console.log('🧹 [Temizlik] Eski çift kopyalar siliniyor...');
        for (const guild of client.guilds.cache.values()) {
            await guild.commands.set([]);
        }
        await client.application.commands.set(commands);
        console.log('✅ [Komutlar] Çift komutlar temizlendi, tek ve temiz kopya yüklendi!');
    } catch (err) {
        console.error('❌ [Komutlar] Hata:', err);
    }

    const activities = [
        () => ({ name: `⚡ ${client.guilds.cache.size} Sunucu`, type: ActivityType.Watching }),
        () => ({ name: `🛡️ Spam & Link Koruması`, type: ActivityType.Watching }),
        () => ({ name: `/yardim • 7/24 Aktif`, type: ActivityType.Playing }),
        () => ({ name: `🎙️ 7/24 Seste AFK`, type: ActivityType.Listening })
    ];

    let actIndex = 0;
    setInterval(() => {
        const act = activities[actIndex % activities.length]();
        client.user.setPresence({ activities: [act], status: 'online' });
        actIndex++;
    }, 15000);
});

// ====================================================
// 6. GÜVENLİK (ANTİ-REKLAM, SPAM KORUMASI & SA-AS)
// ====================================================
client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.guild) return;

    const member = message.member;
    const isStaff = member && (member.permissions.has(PermissionFlagsBits.ManageMessages) || member.permissions.has(PermissionFlagsBits.Administrator));

    // 1. REKLAM / LİNK KORUMASI
    if (!isStaff && linkRegex.test(message.content)) {
        await message.delete().catch(() => {});
        const warnMsg = await message.channel.send(`❌ ${message.author}, bu sunucuda link ve reklam paylaşımı yapmak yasaktır!`);
        setTimeout(() => warnMsg.delete().catch(() => {}), 4000);
        return;
    }

    // 2. AKILLI SPAM KORUMASI
    if (!isStaff) {
        const userId = message.author.id;
        const now = Date.now();
        const content = message.content.toLowerCase().trim();

        const userData = spamMap.get(userId) || {
            lastMsg: '',
            msgCount: 0,
            lastTimestamp: now,
            warnings: 0
        };

        const timeDiff = now - userData.lastTimestamp;
        const isDuplicate = userData.lastMsg === content && content.length > 2;

        if (timeDiff < 3000 || isDuplicate) {
            userData.msgCount++;
        } else {
            userData.msgCount = 1;
        }

        userData.lastMsg = content;
        userData.lastTimestamp = now;

        if (userData.msgCount >= 2 || isDuplicate) {
            await message.delete().catch(() => {});
            userData.warnings++;

            // 2. Kere yaparsa -> 5 DAKİKA TIMEOUT
            if (userData.warnings >= 2) {
                spamMap.delete(userId);
                try {
                    await member.timeout(5 * 60 * 1000, 'Otomatik Spam Koruması');
                    return await message.channel.send(`⏳ ${message.author} spam yapmayı sürdürdüğü için **5 dakika susturuldu (Timeout)!**`);
                } catch (err) {
                    console.error('Timeout uygulanamadı:', err);
                }
            } else {
                // 1. Kere yaparsa -> UYARI
                spamMap.set(userId, userData);
                const warn = await message.channel.send(`⚠️ ${message.author}, lütfen spam yapma! Tekrar edersen **susturulacaksın!**`);
                setTimeout(() => warn.delete().catch(() => {}), 4000);
                return;
            }
        }

        spamMap.set(userId, userData);
    }

    // 3. SA - AS OTO CEVAP
    const text = message.content.toLowerCase().trim();
    const saKelimeler = ['sa', 'sea', 'selam', 'selamün aleyküm', 'selamun aleykum', 'selam aleyküm', 'slm'];
    if (saKelimeler.includes(text)) {
        await message.reply(`Aleyküm selam ${message.author}, hoş geldin! 👋`).catch(() => {});
    }
});

// ====================================================
// 7. ETKİLEŞİMLER (KOMUTLAR & BUTONLAR)
// ====================================================
const activeGiveaways = new Map();

client.on('interactionCreate', async (interaction) => {
    // --- BUTON TIKLAMALARI ---
    if (interaction.isButton()) {
        const { customId, guild, user, channel, member } = interaction;

        // EMOJİLİ ROL BUTONU
        if (customId.startsWith('btn_role_')) {
            const roleId = customId.replace('btn_role_', '');
            const targetRole = guild.roles.cache.get(roleId);

            if (!targetRole) return await interaction.reply({ content: '❌ Rol bulunamadı!', ephemeral: true });

            if (member.roles.cache.has(roleId)) {
                await member.roles.remove(roleId);
                return await interaction.reply({ content: `🗑️ **${targetRole.name}** rolü üzerinden alındı!`, ephemeral: true });
            } else {
                await member.roles.add(roleId);
                return await interaction.reply({ content: `✅ **${targetRole.name}** rolü sana verildi!`, ephemeral: true });
            }
        }

        // TICKET AÇ
        if (customId === 'btn_ticket_create') {
            const existingChannel = guild.channels.cache.find(c => c.name === `talep-${user.username.toLowerCase()}`);
            if (existingChannel) return await interaction.reply({ content: `❌ Zaten açık talebin var: <#${existingChannel.id}>`, ephemeral: true });

            const ticketChannel = await guild.channels.create({
                name: `talep-${user.username}`,
                type: ChannelType.GuildText,
                permissionOverwrites: [
                    { id: guild.id, deny: [PermissionFlagsBits.ViewChannel] },
                    { id: user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.AttachFiles, PermissionFlagsBits.ReadMessageHistory] },
                    { id: client.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageChannels] }
                ]
            });

            const embed = new EmbedBuilder()
                .setColor(0x3B82F6)
                .setTitle('📩 Destek Talebi Açıldı')
                .setDescription(`Merhaba ${user}, yetkililerimiz en kısa sürede seninle ilgilenecektir.\n\nTalebi kapatmak için aşağıdaki butona tıkla.`)
                .setTimestamp();

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('btn_ticket_close').setLabel('🔒 Talebi Kapat').setStyle(ButtonStyle.Danger)
            );

            await ticketChannel.send({ content: `${user} | @everyone`, embeds: [embed], components: [row] });
            return await interaction.reply({ content: `✅ Talebin oluşturuldu: <#${ticketChannel.id}>`, ephemeral: true });
        }

        // TICKET KAPAT
        if (customId === 'btn_ticket_close') {
            await interaction.reply('🔒 Talep **5 saniye** içinde siliniyor...');
            setTimeout(() => channel.delete().catch(() => {}), 5000);
            return;
        }

        // ÇEKİLİŞ KATIL
        if (customId.startsWith('btn_giveaway_join_')) {
            const msgId = customId.replace('btn_giveaway_join_', '');
            const giveaway = activeGiveaways.get(msgId);
            if (!giveaway) return await interaction.reply({ content: '❌ Bu çekiliş bitmiş.', ephemeral: true });

            if (giveaway.participants.has(user.id)) {
                giveaway.participants.delete(user.id);
                await interaction.reply({ content: '📤 Çekilişten ayrıldın.', ephemeral: true });
            } else {
                giveaway.participants.add(user.id);
                await interaction.reply({ content: '🎉 Çekilişe katıldın! Bol şans.', ephemeral: true });
            }
            return;
        }
    }

    // --- SLASH KOMUTLARI ---
    if (!interaction.isChatInputCommand()) return;

    const { commandName, options, guild, member, channel } = interaction;

    try {
        // EMOJİLİ ROL MENÜSÜ
        if (commandName === 'rol-emoji') {
            if (!member.permissions.has(PermissionFlagsBits.ManageRoles)) return await interaction.reply({ content: '❌ Yetkiniz yok!', ephemeral: true });

            const role = options.getRole('rol');
            const emoji = options.getString('emoji');
            const aciklama = options.getString('aciklama') || `Aşağıdaki butona basarak **${role.name}** rolünü alabilir veya bırakabilirsiniz.`;
            const butonYazi = options.getString('buton_yazi') || `${role.name} Rolü`;

            const embed = new EmbedBuilder()
                .setColor(role.color || 0x5865F2)
                .setTitle(`🎭 ${role.name} Rol Paneli`)
                .setDescription(aciklama)
                .setFooter({ text: `${guild.name} • Rol Sistemi` });

            const btn = new ButtonBuilder().setCustomId(`btn_role_${role.id}`).setLabel(butonYazi).setStyle(ButtonStyle.Primary);
            try { btn.setEmoji(emoji); } catch (e) {}

            await interaction.channel.send({ embeds: [embed], components: [new ActionRowBuilder().addComponents(btn)] });
            return await interaction.reply({ content: '✅ Emojili rol paneli kuruldu!', ephemeral: true });
        }

        // SES KATIL
        if (commandName === 'ses-katil') {
            if (!member.permissions.has(PermissionFlagsBits.Administrator)) return await interaction.reply({ content: '❌ Yönetici yetkisi gerekir!', ephemeral: true });
            const voiceChannel = options.getChannel('kanal');
            if (voiceChannel.type !== ChannelType.GuildVoice && voiceChannel.type !== ChannelType.GuildStageVoice) {
                return await interaction.reply({ content: '❌ Geçerli bir Ses Kanalı seçin!', ephemeral: true });
            }

            const connection = joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: guild.id,
                adapterCreator: guild.voiceAdapterCreator,
                selfDeaf: true,
                selfMute: false
            });

            connection.on(VoiceConnectionStatus.Disconnected, async () => {
                try {
                    await Promise.race([
                        entersState(connection, VoiceConnectionStatus.Signalling, 5_000),
                        entersState(connection, VoiceConnectionStatus.Connecting, 5_000),
                    ]);
                } catch {
                    connection.destroy();
                }
            });

            return await interaction.reply({ content: `🎙️ Bot **${voiceChannel.name}** ses kanalında 7/24 AFK kalacak!`, ephemeral: true });
        }

        // TICKET KUR
        if (commandName === 'ticket-kur') {
            if (!member.permissions.has(PermissionFlagsBits.Administrator)) return await interaction.reply({ content: '❌ Yönetici yetkisi gerekir!', ephemeral: true });
            const embed = new EmbedBuilder().setColor(0x22C55E).setTitle('📩 Destek Paneli').setDescription('Yetkililerle görüşmek için aşağıdaki butona basınız.');
            const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('btn_ticket_create').setLabel('🎫 Destek Talebi Aç').setStyle(ButtonStyle.Success));
            await channel.send({ embeds: [embed], components: [row] });
            return await interaction.reply({ content: '✅ Destek paneli kuruldu!', ephemeral: true });
        }

        // ÇEKİLİŞ
        if (commandName === 'cekilis') {
            if (!member.permissions.has(PermissionFlagsBits.ManageGuild)) return await interaction.reply({ content: '❌ Sunucuyu Yönet yetkisi gerekir!', ephemeral: true });
            const dakika = options.getInteger('dakika');
            const odul = options.getString('odul');
            const kazananSayisi = options.getInteger('kazanan_sayisi') || 1;
            const bitis = Math.floor(Date.now() / 1000) + (dakika * 60);

            const embed = new EmbedBuilder()
                .setColor(0xF59E0B)
                .setTitle('🎉 YENİ ÇEKİLİŞ!')
                .setDescription(`🎁 **Ödül:** **${odul}**\n👑 **Kazanan:** \`${kazananSayisi}\`\n⏳ **Bitiş:** <t:${bitis}:R>\n\nKatılmak için butona bas!`);

            const msg = await interaction.reply({ embeds: [embed], fetchReply: true });
            const btn = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId(`btn_giveaway_join_${msg.id}`).setLabel('🎉 Katıl').setStyle(ButtonStyle.Primary));
            await interaction.editReply({ components: [btn] });

            const participants = new Set();
            activeGiveaways.set(msg.id, { participants });

            setTimeout(async () => {
                const data = activeGiveaways.get(msg.id);
                activeGiveaways.delete(msg.id);
                const arr = data ? Array.from(data.participants) : [];

                if (arr.length === 0) return await interaction.editReply({ content: '❌ Yeterli katılım olmadığı için çekiliş iptal edildi.', embeds: [], components: [] });

                const winners = [];
                const pool = [...arr];
                for (let i = 0; i < Math.min(kazananSayisi, pool.length); i++) {
                    winners.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
                }
                const wText = winners.map(w => `<@${w}>`).join(', ');
                await interaction.editReply({ content: `🎉 **Çekiliş Bitti!** Kazanan: ${wText} | **Ödül:** ${odul}`, embeds: [], components: [] });
                await channel.send(`🎉 Tebrikler ${wText}! **${odul}** kazandınız!`);
            }, dakika * 60 * 1000);
            return;
        }

        // PING / YARDIM / AVATAR / İSTATİSTİK / SUNUCU / KULLANICI BİLGİ
        if (commandName === 'ping') {
            const sent = await interaction.reply({ content: '🏓 Ölçülüyor...', fetchReply: true });
            return await interaction.editReply(`🏓 **Pong!** Bot: \`${sent.createdTimestamp - interaction.createdTimestamp}ms\` | API: \`${Math.round(client.ws.ping)}ms\``);
        }

        if (commandName === 'yardim') {
            const help = new EmbedBuilder()
                .setColor(0x5865F2)
                .setTitle('📖 Gelişmiş Bot Komut Menüsü')
                .addFields(
                    { name: '🛡️ Güvenlik & Guard', value: '• **Anti-Reklam:** Linkler anında silinir.\n• **Anti-Spam:** 2 kez yazan uyarılır, tekrarında 5 dk Timeout yer!' },
                    { name: '🎭 Emojili Rol Sistemi', value: '`/rol-emoji` - Emojili butonlu rol paneli kurar' },
                    { name: '🎙️ Ses Sistemi', value: '`/ses-katil` - Botu seste 7/24 AFK bırakır' },
                    { name: '📩 Destek & Çekiliş', value: '`/ticket-kur` - Destek paneli\n`/cekilis` - Çekiliş başlatır' },
                    { name: '⚙️ Moderasyon', value: '`/sil`, `/kilit`, `/yavas-mod`, `/ban`, `/kick`, `/timeout`, `/rol-ver`, `/rol-al`' },
                    { name: '🎲 Eğlence & Bilgi', value: '`/avatar`, `/zar-at`, `/yazi-tura`, `/yaz`, `/sunucu`, `/kullanici-bilgi`, `/istatistik`' }
                );
            return await interaction.reply({ embeds: [help] });
        }

        if (commandName === 'avatar') {
            const u = options.getUser('kullanici') || interaction.user;
            const embed = new EmbedBuilder().setColor(0x5865F2).setTitle(`🖼️ ${u.username} Avatarı`).setImage(u.displayAvatarURL({ dynamic: true, size: 1024 }));
            return await interaction.reply({ embeds: [embed] });
        }

        if (commandName === 'kilit') {
            if (!member.permissions.has(PermissionFlagsBits.ManageChannels)) return await interaction.reply({ content: '❌ Yetki yok!', ephemeral: true });
            const durum = options.getString('durum');
            await channel.permissionOverwrites.edit(guild.id, { SendMessages: durum !== 'lock' });
            return await interaction.reply(durum === 'lock' ? '🔒 Kanal kilitlendi.' : '🔓 Kanal kilidi açıldı.');
        }

        if (commandName === 'yavas-mod') {
            if (!member.permissions.has(PermissionFlagsBits.ManageChannels)) return await interaction.reply({ content: '❌ Yetki yok!', ephemeral: true });
            const saniye = options.getInteger('saniye');
            await channel.setRateLimitPerUser(saniye);
            return await interaction.reply(`⏳ Yavaş mod **${saniye} sn** olarak ayarlandı.`);
        }

        if (commandName === 'sil') {
            if (!member.permissions.has(PermissionFlagsBits.ManageMessages)) return await interaction.reply({ content: '❌ Yetki yok!', ephemeral: true });
            const m = options.getInteger('miktar');
            const d = await channel.bulkDelete(m, true);
            return await interaction.reply({ content: `🧹 **${d.size}** mesaj silindi!`, ephemeral: true });
        }

        if (commandName === 'ban') {
            if (!member.permissions.has(PermissionFlagsBits.BanMembers)) return await interaction.reply({ content: '❌ Yetki yok!', ephemeral: true });
            const u = options.getUser('kullanici');
            await guild.members.ban(u.id, { reason: options.getString('sebep') || 'Yok' });
            return await interaction.reply(`🔨 **${u.tag}** yasaklandı!`);
        }

        if (commandName === 'kick') {
            if (!member.permissions.has(PermissionFlagsBits.KickMembers)) return await interaction.reply({ content: '❌ Yetki yok!', ephemeral: true });
            const u = options.getUser('kullanici');
            const mem = await guild.members.fetch(u.id);
            await mem.kick(options.getString('sebep') || 'Yok');
            return await interaction.reply(`👢 **${u.tag}** atıldı!`);
        }

        if (commandName === 'timeout') {
            if (!member.permissions.has(PermissionFlagsBits.ModerateMembers)) return await interaction.reply({ content: '❌ Yetki yok!', ephemeral: true });
            const u = options.getUser('kullanici');
            const dak = options.getInteger('dakika');
            const mem = await guild.members.fetch(u.id);
            await mem.timeout(dak * 60 * 1000, options.getString('sebep') || 'Yok');
            return await interaction.reply(`⏳ **${u.tag}** **${dak} dakika** susturuldu!`);
        }

        if (commandName === 'rol-ver') {
            if (!member.permissions.has(PermissionFlagsBits.ManageRoles)) return await interaction.reply({ content: '❌ Yetki yok!', ephemeral: true });
            const u = options.getUser('kullanici');
            const r = options.getRole('rol');
            const mem = await guild.members.fetch(u.id);
            await mem.roles.add(r);
            return await interaction.reply({ content: `✅ **${u.tag}** kullanıcısına ${r} rolü verildi!` });
        }

        if (commandName === 'rol-al') {
            if (!member.permissions.has(PermissionFlagsBits.ManageRoles)) return await interaction.reply({ content: '❌ Yetki yok!', ephemeral: true });
            const u = options.getUser('kullanici');
            const r = options.getRole('rol');
            const mem = await guild.members.fetch(u.id);
            await mem.roles.remove(r);
            return await interaction.reply({ content: `✅ **${u.tag}** kullanıcısından ${r} rolü alındı!` });
        }

        if (commandName === 'yaz') {
            if (!member.permissions.has(PermissionFlagsBits.ManageMessages)) return await interaction.reply({ content: '❌ Yetki yok!', ephemeral: true });
            await channel.send(options.getString('mesaj'));
            return await interaction.reply({ content: '✅ Gönderildi.', ephemeral: true });
        }

        if (commandName === 'yazi-tura') {
            return await interaction.reply(`🪙 Madeni para atıldı: **${Math.random() < 0.5 ? 'YAZI' : 'TURA'}**!`);
        }

        if (commandName === 'zar-at') {
            return await interaction.reply(`🎲 Zar atıldı: **${Math.floor(Math.random() * 6) + 1}**!`);
        }

        if (commandName === 'istatistik') {
            const ram = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
            return await interaction.reply(`📊 **İstatistik:**\n⏱️ Uptime: \`${Math.floor(process.uptime())}s\`\n💾 RAM: \`${ram} MB\`\n🌐 Sunucu: \`${client.guilds.cache.size}\``);
        }

        if (commandName === 'sunucu') {
            return await interaction.reply(`📌 **${guild.name}**\n👥 Üye: \`${guild.memberCount}\`\n💬 Kanal: \`${guild.channels.cache.size}\``);
        }

        if (commandName === 'kullanici-bilgi') {
            const target = options.getUser('kullanici') || interaction.user;
            return await interaction.reply(`👤 **${target.tag}**\n🆔 ID: \`${target.id}\`\n📅 Kuruluş: <t:${Math.floor(target.createdTimestamp / 1000)}:R>`);
        }

    } catch (e) {
        console.error(e);
        if (!interaction.replied) await interaction.reply({ content: '❌ Hata oluştu!', ephemeral: true });
    }
});

// ====================================================
// 8. ANTİ-CRASH & GİRİŞ
// ====================================================
process.on('unhandledRejection', (r) => console.error('🛡️ [Anti-Crash]:', r));
process.on('uncaughtException', (e) => console.error('🛡️ [Anti-Crash]:', e));

console.log("TOKEN kontrol:", process.env.TOKEN ? `VAR - ${process.env.TOKEN.length} karakter` : "YOK! TOKEN YOK!");
client.login(process.env.TOKEN).then(() => {
  console.log("✅ BOT DISCORD'A GİRDİ!");
}).catch(err => {
  console.error("❌ BOT GİRİŞ HATASI:", err);
});
