const { Client, GatewayIntentBits, EmbedBuilder, REST, Routes } = require('discord.js');
const http = require('http');
http.createServer((req, res) => res.end('Bot Aktif')).listen(process.env.PORT || 10000);

const FOTO_LINK = "https://cdn.discordapp.com/attachments/1536696056769814642/1537824750414463006/image.png?ex=6a807267&is=6a7f20e7&hm=62da9d8ce1ffb1656bc881786d51c4ae269b39f1f9a80bd9a259367d376336fa&"; // <--- FOTO LİNKİNİ BURAYA KOY

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once('ready', async () => {
  console.log(`Giriş yapıldı: ${client.user.tag}`);
  const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
  await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: [{ name: 'yaz', description: 'duyuru' }] });
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName === 'yaz') {
    const embed = new EmbedBuilder()
.setTitle('Slawes Cheats Emu-Private')
.setDescription(`Şunlarla çalışır:
Valorant
League of Legends
Hanbot
Scriptler

Özellikler:
Temiz ortam emülasyonu
Windows yeniden başlatma gerektirmez
BIOS flashlama gerektirmez
Secure Boot kapatma gerektirmez
TPM kapatma gerektirmez
HVCI kapatma gerektirmez
VGC kaldırma gerektirmez
Emülatör kullanımı için tek bilgisayar sınırı
VGK Heartbeat (PACMEN) Emülasyonu

Windows 10 ve 11
Desteklenen İşlemciler (CPU):
Intel ve AMD
Desteklenen Ekran Kartları (GPU):
Intel ve AMD`)
.setColor(0x8A2BE2)
.setImage(FOTO_LINK)
.setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
});
client.login(process.env.TOKEN);
