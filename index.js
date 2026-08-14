const { Client, GatewayIntentBits, EmbedBuilder, REST, Routes } = require('discord.js');
const http = require('http');
http.createServer((req, res) => res.end('Bot Aktif')).listen(process.env.PORT || 10000);

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once('ready', async () => {
  console.log(`Giriş yapıldı: ${client.user.tag}`);
  const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
  try {
    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      {
        body: [{
          name: 'yaz',
          description: 'İstediğin metni kutu içinde atar',
          options: [{
            name: 'metin',
            description: 'Kutu içine yazılacak metin',
            type: 3, // STRING
            required: true
          }]
        }]
      }
    );
    console.log('Komutlar yüklendi');
  } catch (e) { console.error(e); }
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName === 'yaz') {
    const metin = interaction.options.getString('metin');

    const embed = new EmbedBuilder()
   .setAuthor({ name: 'GG Klanı | UYG' })
   .setDescription(metin) // SENİN YAZDIĞIN METİN BURAYA GELECEK
   .setColor(0x8A2BE2)
   .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
});

client.login(process.env.TOKEN);
