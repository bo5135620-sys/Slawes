require('dotenv').config();
const { 
    Client, 
    GatewayIntentBits, 
    Partials, 
    ActivityType, 
    EmbedBuilder, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle 
} = require('discord.js');
const express = require('express');

// ==========================================
// 1. RENDER 7/24 UYANIK TUTUCU (EXPRESS)
// ==========================================
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.status(200).send(`
        <!DOCTYPE html>
        <html>
        <head><title>Bot Durumu</title><meta charset="utf-8"></head>
        <body style="background:#0f172a; color:#f8fafc; font-family:sans-serif; text-align:center; padding-top:50px;">
            <h1 style="color:#22c55e;">🟢 Bot 7/24 Aktif!</h1>
            <p>Render ve UptimeRobot bağlantısı sorunsuz çalışıyor.</p>
        </body>
        </html>
    `);
});

app.listen(PORT, () => {
    console.log(`🌐 [Web] Express sunucusu ${PORT} portunda dinlemede.`);
});

// ==========================================
// 2. DISCORD CLIENT TANIMLAMASI
// ==========================================
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildPresences
    ],
    partials: [
        Partials.Channel,
        Partials.Message,
        Partials.User,
        Partials.GuildMember
    ]
});

// ==========================================
// 3. SLASH KOMUTLARIN TANIMI
// ==========================================
const commands = [
    {
        name: 'ping',
        description: 'Botun ve Discord API gecikme sürelerini gösterir.'
    },
    {
        name: 'yardim',
        description: 'Mevcut tüm bot komutlarını listeler.'
    },
    {
        name: 'istatistik',
        description: 'Botun RAM kullanımı, uptime ve sunucu istatistiklerini gösterir.'
    },
    {
        name: 'sunucu',
        description: 'Bulunduğun sunucu hakkında detaylı bilgi verir.'
    }
];

// ==========================================
// 4. BOT HAZIR (READY) & KOMUT KAYDI & OYNATILIYOR
// ==========================================
client.once('ready', async () => {
    console.log(`🚀 [Bot] ${client.user.tag} olarak Discord'a başarıyla giriş yapıldı!`);

    // Global Slash Komutlarını Otomatik Kaydet
    try {
        console.log('🔄 [Komutlar] Slash komutları Discord\'a yükleniyor...');
        await client.application.commands.set(commands);
        console.log('✅ [Komutlar] Tüm Slash komutları başarıyla kaydedildi!');
    } catch (error) {
        console.error('❌ [Komutlar] Komutlar yüklenirken hata:', error);
    }

    // Dönen Durum / Aktivite Mesajları
    const activities = [
        () => ({ name: `⚡ ${client.guilds.cache.size} Sunucu!`, type: ActivityType.Watching }),
        () => ({ name: `👥 ${client.users.cache.size} Kullanıcı`, type: ActivityType.Watching }),
        () => ({ name: `/yardim ile komutları gör`, type: ActivityType.Playing }),
        () => ({ name: `💎 7/24 Aktif & Kesintisiz`, type: ActivityType.Streaming, url: 'https://twitch.tv/discord' })
    ];

    let activityIndex = 0;
    setInterval(() => {
        const activity = activities[activityIndex % activities.length]();
        client.user.setPresence({
            activities: [activity],
            status: 'online'
        });
        activityIndex++;
    }, 15000); // 15 saniyede bir durumu günceller
});

// ==========================================
// 5. ETKİLEŞİM & KOMUT YÖNETİCİSİ (INTERACTION)
// ==========================================
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const { commandName } = interaction;

    try {
        // --- PING KOMUTU ---
        if (commandName === 'ping') {
            const sent = await interaction.reply({ content: '🏓 Ölçülüyor...', fetchReply: true });
            const latency = sent.createdTimestamp - interaction.createdTimestamp;
            const apiLatency = Math.round(client.ws.ping);

            const pingEmbed = new EmbedBuilder()
                .setColor(0x5865F2)
                .setTitle('🏓 Pong!')
                .addFields(
                    { name: '📶 Bot Gecikmesi', value: `\`${latency}ms\``, inline: true },
                    { name: '🌐 API Gecikmesi', value: `\`${apiLatency}ms\``, inline: true }
                )
                .setTimestamp();

            return await interaction.editReply({ content: null, embeds: [pingEmbed] });
        }

        // --- YARDIM KOMUTU ---
        if (commandName === 'yardim') {
            const helpEmbed = new EmbedBuilder()
                .setColor(0x22C55E)
                .setTitle('📖 Bot Komut Rehberi')
                .setDescription('Bot üzerinde kullanabileceğin tüm slash komutları aşağıdadır:')
                .addFields(
                    { name: '`/ping`', value: 'Botun anlık ping değerini ölçer.' },
                    { name: '`/istatistik`', value: 'Botun çalışma süresi ve sistem kaynaklarını gösterir.' },
                    { name: '`/sunucu`', value: 'Sunucuya dair üye ve kanal istatistiklerini verir.' },
                    { name: '`/yardim`', value: 'Bu menüyü görüntüler.' }
                )
                .setFooter({ text: `${client.user.username} • 7/24 Kesintisiz Hizmet`, iconURL: client.user.displayAvatarURL() });

            return await interaction.reply({ embeds: [helpEmbed] });
        }

        // --- İSTATİSTİK KOMUTU ---
        if (commandName === 'istatistik') {
            const uptimeSeconds = Math.floor(process.uptime());
            const days = Math.floor(uptimeSeconds / 86400);
            const hours = Math.floor((uptimeSeconds % 86400) / 3600);
            const minutes = Math.floor((uptimeSeconds % 3600) / 60);
            const seconds = uptimeSeconds % 60;
            const uptimeString = `${days}g ${hours}s ${minutes}d ${seconds}sn`;

            const memoryUsage = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);

            const statEmbed = new EmbedBuilder()
                .setColor(0xF59E0B)
                .setTitle('📊 Bot İstatistikleri')
                .addFields(
                    { name: '⏱️ Aktif Kalma Süresi', value: `\`${uptimeString}\``, inline: true },
                    { name: '💾 Bellek (RAM) Kullanımı', value: `\`${memoryUsage} MB\``, inline: true },
                    { name: '🌐 Toplam Sunucu', value: `\`${client.guilds.cache.size}\``, inline: true },
                    { name: '👥 Toplam Kullanıcı', value: `\`${client.users.cache.size}\``, inline: true },
                    { name: '⚙️ Node.js Sürümü', value: `\`${process.version}\``, inline: true },
                    { name: '🤖 discord.js Sürümü', value: `\`v14.14.1\``, inline: true }
                )
                .setTimestamp();

            return await interaction.reply({ embeds: [statEmbed] });
        }

        // --- SUNUCU BİLGİ KOMUTU ---
        if (commandName === 'sunucu') {
            const guild = interaction.guild;
            const serverEmbed = new EmbedBuilder()
                .setColor(0x3B82F6)
                .setTitle(`📌 ${guild.name}`)
                .setThumbnail(guild.iconURL({ dynamic: true }))
                .addFields(
                    { name: '👑 Sunucu Sahibi', value: `<@${guild.ownerId}>`, inline: true },
                    { name: '👥 Toplam Üye', value: `\`${guild.memberCount}\``, inline: true },
                    { name: '💬 Toplam Kanal', value: `\`${guild.channels.cache.size}\``, inline: true },
                    { name: '🚀 Boost Sayısı', value: `\`${guild.premiumSubscriptionCount || 0}\` (Seviye ${guild.premiumTier})`, inline: true },
                    { name: '📅 Kuruluş Tarihi', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`, inline: true }
                )
                .setFooter({ text: `ID: ${guild.id}` })
                .setTimestamp();

            return await interaction.reply({ embeds: [serverEmbed] });
        }

    } catch (err) {
        console.error('Komut çalıştırılırken hata oluştu:', err);
        const errorMsg = { content: '❌ Bu komut çalıştırılırken beklenmeyen bir hata meydana geldi!', ephemeral: true };
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp(errorMsg);
        } else {
            await interaction.reply(errorMsg);
        }
    }
});

// ==========================================
// 6. TAŞ GİBİ ANTİ-CRASH (BOT ASLA ÇÖKMEZ)
// ==========================================
process.on('unhandledRejection', (reason, promise) => {
    console.error('🛡️ [Anti-Crash] Yakalanmamış Promise Reddi:', reason);
});

process.on('uncaughtException', (err, origin) => {
    console.error('🛡️ [Anti-Crash] Yakalanmamış İstisna Hatası:', err);
});

process.on('uncaughtExceptionMonitor', (err, origin) => {
    console.error('🛡️ [Anti-Crash] İstisna İzleyici:', err);
});

// ==========================================
// 7. BOTU BAŞLAT
// ==========================================
const TOKEN = process.env.TOKEN;

if (!TOKEN) {
    console.error('❌ HATA: .env dosyasında veya Environment Variables kısmında TOKEN bulunamadı!');
    process.exit(1);
}

client.login(TOKEN);
