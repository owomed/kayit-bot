// Gerekli modülleri Discord.js v14'e uygun şekilde içe aktarın
const { Client, Collection, GatewayIntentBits, Partials, ActivityType, PresenceUpdateStatus } = require('discord.js');
const fs = require('fs');
const path = require('path');
const cron = require('node-cron');
const mongoose = require('mongoose');
require('dotenv').config();

// MongoDB modellerini içe aktarın
const MonthlyCount = require('./models/MonthlySchema');
const WeeklyCount = require('./models/WeeklySchema');
const TotalCount = require('./models/TotalSchema');


// Komutlar ve diğer dosyalar için yollar
const commandFiles = fs.readdirSync('./commands/').filter(file => file.endsWith('.js'));
const eventFiles = fs.readdirSync('./events/').filter(file => file.endsWith('.js'));
const { prefix } = require('./Settings/config.json');

// Bot ve komutlar için temel yapılandırma
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages,
    ],
    partials: [Partials.Channel, Partials.Message],
});

client.commands = new Collection();
client.idler = require('./Settings/idler.json');
const allSlashCommands = []; // Slash komutlarını depolamak için dizi

// MongoDB'ye bağlanma
mongoose.connect(process.env.MONGO_URI)
.then(() => {
    console.log('✅ MongoDB\'ye başarıyla bağlandı.');
})
.catch(err => {
    console.error('❌ MongoDB bağlantı hatası:', err);
});

// --- Komut ve Olay Yükleme Sistemi ---
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
    if (command.data) {
        allSlashCommands.push(command.data.toJSON());
    }
}

for (const file of eventFiles) {
    const event = require(`./events/${file}`);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args, client));
    } else {
        client.on(event.name, (...args) => event.execute(...args, client));
    }
}

// --- Komut İşleme Olayları ---
client.on('messageCreate', async message => {
    if (!message.content.startsWith(prefix) || message.author.bot || message.channel.type === 'dm') return;

    const args = message.content.slice(prefix.length).split(/ +/);
    const commandName = args.shift().toLowerCase();
    const command = client.commands.get(commandName) || client.commands.find(x => x.aliases && x.aliases.includes(commandName));

    if (!command || !command.execute) return;

    try {
        await command.execute(client, message, args);
    } catch (error) {
        console.error('Prefix komut çalıştırma hatası:', error);
        await message.reply('Komut çalıştırılırken bir hata oluştu.');
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command || !command.slashExecute) return;

    try {
        await command.slashExecute(interaction);
    } catch (error) {
        console.error('Slash komut çalıştırma hatası:', error);
        await interaction.reply({ content: 'Komut çalıştırılırken bir hata oluştu.', ephemeral: true });
    }
});


// --- Cron Görevleri ve Veritabanı Sıfırlama ---
client.on('ready', async () => {
    console.log(`✅ Bot başarılı bir şekilde ${client.user.tag} olarak giriş yaptı!`);

    const { REST, Routes } = require('discord.js');
    const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);

    try {
        const guildId = process.env.GUILD_ID;
        if (guildId) {
            await rest.put(Routes.applicationGuildCommands(client.user.id, guildId), { body: allSlashCommands });
            console.log('✅ Sunucuya özgü slash komutları başarıyla yüklendi.');
        } else {
            await rest.put(Routes.applicationCommands(client.user.id), { body: allSlashCommands });
            console.log('✅ Global slash komutları başarıyla yüklendi.');
        }
    } catch (error) {
        console.error('❌ Slash komutlarını yüklerken hata oluştu:', error);
    }

    cron.schedule('0 0 * * 1', async () => {
        await resetWeeklyData();
    }, { timezone: "Europe/Istanbul" });

    cron.schedule('0 0 1 * *', async () => {
        await resetMonthlyData();
    }, { timezone: "Europe/Istanbul" });

    // Tek bir durum belirle ve ayarla
    client.user.setPresence({
        status: "online",
        activities: [{
            name: 'customstatus', // Bu sabit bir ad, değiştirilemez
            state: 'OwO MED :( ', // Özel durum metni
            type: ActivityType.Custom // Bu, "Özel Durum"u ayarlar
        }],
    });
});

// --- MongoDB Verilerini Sıfırlama Fonksiyonları ---
async function resetWeeklyData() {
    console.log('Haftalık veriler sıfırlanıyor...');
    await WeeklyCount.deleteMany({});
    console.log('✅ Haftalık veriler sıfırlandı.');
}

async function resetMonthlyData() {
    console.log('Aylık veriler sıfırlanıyor...');
    await MonthlyCount.deleteMany({});
    console.log('✅ Aylık veriler sıfırlandı.');
}

// --- Web Sunucusu ve Diğer Fonksiyonlar ---
const express = require('express');
const app = express();
app.get("/", (request, response) => { response.sendStatus(200); });
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => { console.log(`Web sunucusu çalışıyor. PORT: ${PORT}`); });
setInterval(() => { require('https').get('https://' + process.env.RENDER_EXTERNAL_HOSTNAME); }, 4 * 60 * 1000);

// Gerekli fonksiyonlar (tarihHesapla vb.)
// ... (Mevcut kodunuzdaki tarih fonksiyonları buraya eklenecek)
Date.prototype.toTurkishFormatDate = function (format) {
    let date = this,
        day = date.getDate(),
        weekDay = date.getDay(),
        month = date.getMonth(),
        year = date.getFullYear(),
        hours = date.getHours(),
        minutes = date.getMinutes(),
        seconds = date.getSeconds();

    let monthNames = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
    let dayNames = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];

    if (!format) {
        format = "dd MM yyyy | hh:ii:ss";
    }
    format = format.replace("mm", month.toString().padStart(2, "0"));
    format = format.replace("MM", monthNames[month]);

    if (format.indexOf("yyyy") > -1) {
        format = format.replace("yyyy", year.toString());
    } else if (format.indexOf("yy") > -1) {
        format = format.replace("yy", year.toString().substr(2, 2));
    }

    format = format.replace("dd", day.toString().padStart(2, "0"));
    format = format.replace("DD", dayNames[weekDay]);

    if (format.indexOf("HH") > -1) format = format.replace("HH", hours.toString().replace(/^(\d)$/, '0$1'));
    if (format.indexOf("hh") > -1) {
        if (hours > 12) hours -= 12;
        if (hours === 0) hours = 12;
        format = format.replace("hh", hours.toString().replace(/^(\d)$/, '0$1'));
    }
    if (format.indexOf("ii") > -1) format = format.replace("ii", minutes.toString().replace(/^(\d)$/, '0$1'));
    if (format.indexOf("ss") > -1) format = format.replace("ss", seconds.toString().replace(/^(\d)$/, '0$1'));
    return format;
};

client.tarihHesapla = (date) => {
    const startedAt = Date.parse(date);
    var msecs = Math.abs(new Date() - startedAt);

    const years = Math.floor(msecs / (1000 * 60 * 60 * 24 * 365));
    msecs -= years * 1000 * 60 * 60 * 24 * 365;
    const months = Math.floor(msecs / (1000 * 60 * 60 * 24 * 30));
    msecs -= months * 1000 * 60 * 60 * 24 * 30;
    const weeks = Math.floor(msecs / (1000 * 60 * 60 * 24 * 7));
    msecs -= weeks * 1000 * 60 * 60 * 24 * 7;
    const days = Math.floor(msecs / (1000 * 60 * 60 * 24));
    msecs -= days * 1000 * 60 * 60 * 24;
    const hours = Math.floor(msecs / (1000 * 60 * 60));
    msecs -= hours * 1000 * 60 * 60;
    const mins = Math.floor((msecs / (1000 * 60)));
    msecs -= mins * 1000 * 60;
    const secs = Math.floor(msecs / 1000);
    msecs -= secs * 1000;

    var string = "";
    if (years > 0) string += `${years} yıl ${months} ay`;
    else if (months > 0) string += `${months} ay ${weeks > 0 ? weeks + " hafta" : ""}`;
    else if (weeks > 0) string += `${weeks} hafta ${days > 0 ? days + " gün" : ""}`;
    else if (days > 0) string += `${days} gün ${hours > 0 ? hours + " saat" : ""}`;
    else if (hours > 0) string += `${hours} saat ${mins > 0 ? mins + " dakika" : ""}`;
    else if (mins > 0) string += `${mins} dakika ${secs > 0 ? secs + " saniye" : ""}`;
    else if (secs > 0) string += `${secs} saniye`;
    else string += `saniyeler`;

    string = string.trim();
    return `${string} önce`;
};

client.login(process.env.BOT_TOKEN)
    .catch(error => {
        console.error('❌ Discord botuna bağlanırken bir hata oluştu:', error);
        if (error.code === 'TokenInvalid') {
            console.error('Hata: Bot token\'ı geçersiz veya eksik. Lütfen Render ortam değişkenlerini kontrol edin.');
        } else if (error.code === 'DisallowedIntents') {
            console.error('Hata: Gerekli intent\'ler Discord Geliştirici Portalı\'nda etkinleştirilmemiş olabilir.');
        }
    });
