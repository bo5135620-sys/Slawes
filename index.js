// Slawes - 7/24 Bot Altyapı - Full Fix
require('dotenv').config();
const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const http = require('http');

const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;

if (!TOKEN || !CLIENT_ID) {
    console.log("TOKEN veya CLIENT_ID yok! Render Environment'a ekle kanka.");
}

// KOMUTLAR
const commands = [
    new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Botun aktif olup olmadığını kontrol eder')
        .toJSON(),
        
    new SlashCommandBuilder()
        .setName('yaz')
        .setDescription('Yazdığın metni botun atmasını sağlar')
        .addStringOption(option => 
            option.setName('metin')
            .setDescription('Buraya atılacak metni yaz - buraya metin')
            .setRequired(true)
        )
        .addChannelOption(option =>
            option.setName('kanal')
            .setDescription('Hangi kanala atılsın (boş bırakırsan buraya atar)')
            .setRequired(false)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .toJSON()
];

const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
    try {
        console.log('Slash komutlar Discord\'a yükleniyor...');
        await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
        console.log('✅ Komutlar yüklendi: /ping ve /yaz');
    } catch (error) {
        console.error(error);
    }
})();

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });

client.once('ready', () => {
    console.log(`✅ Giriş yapıldı: ${client.user.tag} - Slawes Online!`);
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'ping') {
        return interaction.reply(`Pong! 🏓 Aktifim kanka! Gecikme: ${client.ws.ping}ms`);
    }

    if (interaction.commandName === 'yaz') {
        const metin = interaction.options.getString('metin');
        const kanal = interaction.options.getChannel('kanal') || interaction.channel;
        
        try {
            await kanal.send(metin);
            await interaction.reply({ content: `✅ Mesaj ${kanal} kanalına gönderildi!`, ephemeral: true });
        } catch (err) {
            await interaction.reply({ content: `❌ Mesaj atamadım: ${err.message}`, ephemeral: true });
        }
    }
});

client.login(TOKEN);

// Render port hatasını çözmek için - BUNU SİLME
http.createServer((req, res) => {
    res.writeHead(200);
    res.end("Slawes Bot Aktif!");
}).listen(process.env.PORT || 3000, () => {
    console.log("Sahte port açıldı, Render hatası çözüldü");
});
