const { Client, GatewayIntentBits, EmbedBuilder, REST, Routes } = require('discord.js');

const http = require('http');

http.createServer((req, res) => res.end('Bot Aktif')).listen(process.env.PORT || 10000);



const client = new Client({ intents: [GatewayIntentBits.Guilds] });



client.once('ready', async () => {

  console.log(`Giriş yapıldı: ${client.user.tag}`);

  const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

  await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), {

    body: [

      { name: 'yaz', description: 'emu duyurusu atar' },

      { name: 'spoof', description: 'spoof duyurusu atar' }

    ]

  });

});



client.on('interactionCreate', async interaction => {

  if (!interaction.isChatInputCommand()) return;



  // 1. KOMUT - /yaz

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

.setColor(0x8A2BE2);

    await interaction.reply({ embeds: [embed] });

  }



  // 2. KOMUT - /spoof - FOTOLU OLAN

  if (interaction.commandName === 'spoof') {

    const embed2 = new EmbedBuilder()

.setTitle('Slawes Cheats Spoofer')

.setDescription(`Şunlarla çalışır:

SlawesCheats Spoofer

TPM ,SECURE BOOT ,HVCI ,IOMMU(VT-D) : On

TÜM ANAKARTLARLA UYUMLU!

DRIVERLESS!

TEK SEFERLİK KALICI BİR ÇÖZÜM!

VAN 152, VAL5 KESİN ÇÖZÜM!

ÇIK GİR VEYA POPUP HATASI YOK!

KALICI TPM BYPASS

KOLAY KURULUM VE KLAVUZ

KALICI TPM BYPASS﻿

HWID BAN KALDIRMA

DONANIM BANI ATAN TÜM OYUNLARDAN TEK TUŞ İLE KURTULMA İMKANI !!



Not:Bu Ürünün Doğru Çalışması İçin Windows Reİnstall Ve Bios Flash gereklidir VE RAİD ATMANIZ ŞART !

eğer bunlar ne bilmiyorsanız satın alım sonrası destek ekibimiz size tüm adımlarda yardımcı olacaktır Asus ve Laptoplarda Raid şart değildir msi asrock gigbyte raid şartır`)

.setColor(0xFF0000)

.setImage('https://cdn.discordapp.com/attachments/1536696056769814642/1537834634782711848/08cf01ea-1927-443a-8ce0-2e84770d57ba.jpg?ex=6a807b9c&is=6a7f2a1c&hm=871fe5dd8b54fb240c43f461aaaba463fff01d462688598ea3fb8202f3a2d3e6&');

    await interaction.reply({ embeds: [embed2] });

  }



});

client.login(process.env.TOKEN); 

