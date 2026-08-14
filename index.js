// PORT FIX - EN ÜSTE KOYDUM, SİLME
const http = require('http');
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Slawes Bot Aktif!');
}).listen(process.env.PORT || 3000, '0.0.0.0', () => {
  console.log('Port açıldı');
});

require('dotenv').config();
const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;

const commands = [
    new SlashCommandBuilder().setName('ping').setDescription('Bot aktif mi').toJSON(),
    new SlashCommandBuilder()
        .setName('yaz')
        .setDescription('Bot metin atsın')
        .addStringOption(o => o.setName('metin').setDescription('Buraya metin yaz').setRequired(true))
        .addChannelOption(o => o.setName('kanal').setDescription('Kanal seç').setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .toJSON()
];

const rest = new REST({ version: '10' }).setToken(TOKEN);
(async () => {
    try {
        await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
        console.log('Komutlar yüklendi');
    } catch(e){ console.error(e); }
})();

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });
client.once('ready', () => console.log(`Giriş yapıldı: ${client.user.tag}`));
client.on('interactionCreate', async i => {
    if(!i.isChatInputCommand()) return;
    if(i.commandName === 'ping') return i.reply(`Pong! ${client.ws.ping}ms`);
    if(i.commandName === 'yaz'){
        const metin = i.options.getString('metin');
        const kanal = i.options.getChannel('kanal') || i.channel;
        await kanal.send(metin);
        await i.reply({content: `✅ Gönderildi`, ephemeral: true});
    }
});
client.login(TOKEN);
