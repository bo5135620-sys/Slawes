const { Client, GatewayIntentBits, EmbedBuilder, REST, Routes } = require('discord.js');
const http = require('http');
http.createServer((req, res) => res.end('Bot Aktif')).listen(process.env.PORT || 10000);
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once('ready', async () => {
  console.log(`Giriş yapıldı: ${client.user.tag}`);
  const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
  await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: [{ name: 'yaz', description: 'duyuru atar' }] });
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName === 'yaz') {
    const embed = new EmbedBuilder()
   .setAuthor({ name: 'Slawes Cheats | UYG' })
   .setTitle('Slawes Cheats Emulator v1.0')
   .setDescription(
`Merhabalar, sizlere Slawes Klanın geliştirdiği Emulator sunuyorum. Emulator val 5 vermez veya van 156 verirse ticket açın olmaz eğer olursa ticket açıp fixlenmesini bekleyin kesinlikle kalıcıdır iyi günler.

🌟 **Özellikler**
> isterseniz vanguardı silin
> Eğer Val 5 Verirse Tekrar Deneyin
> Gene Olursa Ticket açınca fixlenmeyi bekleyin
> van 102 ard arda verirse biraz bekleyin sonra tekrar deneyin`
    )
   .addFields(
      { name: '🎮 Desteklenen Oyunlar', value: '• Valorant (Vanguard)', inline: true },
      { name: '🔧 Neler Durdur?', value: '• vgc (durdurur)\n• vgk (durdurur)\n• vanguard (durdurur)', inline: true }
    )
   .setColor(0x8A2BE2)
   .setTimestamp();
    await interaction.reply({ embeds: [embed] });
  }
});
client.login(process.env.TOKEN);
