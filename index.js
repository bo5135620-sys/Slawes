const { Client, GatewayIntentBits, EmbedBuilder, REST, Routes } = require('discord.js');
const express = require('express');

// Port hatası için - Render için şart
const app = express();
app.get('/', (req, res) => res.send('Bot aktif!'));
app.listen(process.env.PORT || 10000);

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once('ready', async () => {
  console.log(`Giriş yapıldı: ${client.user.tag}`);

  // Slash komutu kaydet
  const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
  try {
    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: [{ name: 'yaz', description: 'Spoofer duyurusunu atar' }] }
    );
    console.log('Komutlar yüklendi');
  } catch (e) { console.error(e); }
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName === 'yaz') {

    const embed = new EmbedBuilder()
     .setAuthor({ name: 'GG Klanı | UYG' })
     .setTitle('ManLikeAlex91 Permanent HWID Spoofer v1.0')
     .setDescription(
`Merhabalar, sizlere kendi geliştirdiğim HWID Spoofer'ı sunuyorum. Kernel tabanlı, **permanent (kalıcı)** çalışan ve birden fazla anti-cheat'e karşı test edilmiş bir araçtır.

🌟 **Özellikler**
> • **Permanent (Kalıcı) Kernel Spoof**
> • Her restartta otomatik spoof atar
> • Driverları Otomatik Durdur — PC açıldığında driverları otomatik durdurur, VAN hatasını engeller
> • Tek tıkla çalışır, teknik bilgi gerekmez
> • Tamamen ücretsiz`
      )
     .addFields(
        { name: '🎮 Desteklenen Oyunlar', value: '• Valorant (Vanguard)\n• FiveM\n• EAC (Easy Anti-Cheat)\n• BattlEye', inline: true },
        { name: '🔧 Neler Spooflanır?', value: '• CPU Seri Numarası\n• Motherboard Seri Numarası\n• BIOS UUID\n• HDD / SSD Disk Seri Numarası\n• Volume ID • MAC Adresi', inline: true }
      )
     .setColor(0x8A2BE2)
     .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
});

client.login(process.env.TOKEN);
