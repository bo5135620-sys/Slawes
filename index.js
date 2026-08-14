// Slawes - 7/24 Bot Altyapı
require('dotenv').config();
const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

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
            .setDescription('Buraya atılacak metni yaz')
            .setRequired(true)
        )
        .addChannelOption(option =>
            option.setName('kanal')
            .setDescription('Hangi kanala atılsın')
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
