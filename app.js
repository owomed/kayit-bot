const { Client, Collection, Intents } = require('discord.js');
const fs = require('fs');
const { Enmap } = require('enmap');
const { prefix } = require('./Settings/config.json');
require('dotenv').config();
const cron = require('node-cron');

// Bot ve komutlar için temel yapılandırma
const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_VOICE_STATES,
        Intents.FLAGS.MESSAGE_CONTENT,
        Intents.FLAGS.DIRECT_MESSAGES
    ],
});
client.commands = new Collection();
client.idler = require('./Settings/idler.json');

// Komut dosyalarını yükleyin
const commandFiles = fs.readdirSync('./commands/').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}

// Olay dosyalarını yükleyin
const eventFiles = fs.readdirSync('./events/').filter(file => file.endsWith('.js'));
for (const file of eventFiles) {
    const event = require(`./events/${file}`);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args, client));
    } else {
        client.on(event.name, (...args) => event.execute(...args, client));
    }
}

// Mesaj olayını işleyin
client.on('messageCreate', async message => {
    if (!message.content.startsWith(prefix) || message.author.bot || message.channel.type === 'dm') return;

    const args = message.content.slice(prefix.length).split(/ +/);
    const commandName = args.shift().toLowerCase();
    const command = client.commands.get(commandName) || client.commands.find(x => x.aliases && x.aliases.includes(commandName));

    if (!command) return;

    try {
        await command.execute(client, message, args);
    } catch (error) {
        console.error('Komut çalıştırma hatası:', error);
        message.reply('Komut çalıştırılırken bir hata oluştu.');
    }
});

// Tarih formatı ve hesaplama fonksiyonları
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

// Durumları ayarla
const statuses = [
    { name: 'MED Kayıt', type: 'STREAMING', url: "https://www.twitch.tv/owomed" },
    { name: 'MED 💚 hicckimse', type: 'STREAMING', url: "https://www.twitch.tv/owomed" },
    { name: 'hicckimse 💛 MED', type: 'STREAMING', url: "https://www.twitch.tv/owomed" },
    { name: 'MED ❤️ hicckimse', type: 'STREAMING', url: "https://www.twitch.tv/owomed" },
    { name: 'hicckimse 🤍 MED', type: 'STREAMING', url: "https://www.twitch.tv/owomed" },
    { name: 'MED 🤎 hicckimse', type: 'STREAMING', url: "https://www.twitch.tv/owomed" },
    { name: 'hicckimse 💜 MED', type: 'STREAMING', url: "https://www.twitch.tv/owomed" },
    { name: 'MED 🩵 hicckimse', type: 'STREAMING', url: "https://www.twitch.tv/owomed" },
    { name: 'hicckimse 💙 MED', type: 'STREAMING', url: "https://www.twitch.tv/owomed" }
];
let statusIndex = 0;

// Enmap veritabanı bağlantısı
const db = new Enmap({ name: "kayitlar" });

client.on('ready', () => {
    console.log(`Bot başarılı bir şekilde giriş yaptı!`);
    
    // Geçici sıfırlama - Bot kapalı olurda çalışmazsa kullanılabilir
    // resetWeeklyData(); // Haftalık
    // resetMonthlyData(); // Aylık
    
    // Haftalık sıfırlama: Her Pazartesi 00:00'da
    cron.schedule('0 0 * * 1', () => {
        resetWeeklyData();
    });

    // Aylık sıfırlama: Her Ayın 1'inde 00:00'da
    cron.schedule('0 0 1 * *', () => {
        resetMonthlyData();
    });

    setInterval(() => {
        const status = statuses[statusIndex];
        client.user.setPresence({
            activities: [{ name: status.name, type: status.type, url: status.url }],
        });
        statusIndex = (statusIndex + 1) % statuses.length;
    }, 20000); // Her 20 saniyede bir güncelle
});

// Sıfırlama fonksiyonları Enmap ile uyumlu hale getirildi
async function resetWeeklyData() {
    console.log('Haftalık veriler sıfırlanıyor...');
    const allData = await db.fetchEverything();
    allData.filter((value, key) => key.startsWith('weekly_')).forEach((value, key) => db.delete(key));
    console.log('Haftalık veriler sıfırlandı.');
}

async function resetMonthlyData() {
    console.log('Aylık veriler sıfırlanıyor...');
    const allData = await db.fetchEverything();
    allData.filter((value, key) => key.startsWith('monthly_')).forEach((value, key) => db.delete(key));
    console.log('Aylık veriler sıfırlandı.');
}

const express = require('express');
const app = express();

// Ana route
app.get("/", (request, response) => {
    response.sendStatus(200);
});

// Glitch portunu kullan (öncelikli), yoksa 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Web sunucusu çalışıyor. PORT: ${PORT}`);
});

// Glitch projesinin uykuya geçmemesi için 4 dakikada bir ping at
setInterval(() => {
  require('https').get('https://magenta-absorbing-redcurrant.glitch.me/');
}, 4 * 60 * 1000); // 4 dakika

// BURAYA EKLE: Bot token'ının değerini logla
console.log('BOT_TOKEN değeri:', process.env.BOT_TOKEN ? 'Token mevcut (gizlendi)' : 'Token mevcut değil veya boş!');

client.login(process.env.BOT_TOKEN)
    .catch(error => {
        console.error('Discord botuna bağlanırken bir hata oluştu:', error);
        // Hatanın türüne göre ek mesajlar ekleyebilirsin
        if (error.code === 'TOKEN_INVALID') {
            console.error('Hata: Bot token\'ı geçersiz veya eksik. Lütfen Render ortam değişkenlerini kontrol edin.');
        } else if (error.code === 'DISALLOWED_INTENTS') {
            console.error('Hata: Gerekli intent\'ler Discord Geliştirici Portalı\'nda etkinleştirilmemiş olabilir.');
        }
    });
