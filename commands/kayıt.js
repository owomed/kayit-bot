const { MessageEmbed } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Aylık ve Haftalık verilerin tutulduğu JSON dosyalarının yolları
const monthlyDbPath = path.join(__dirname, '../database/monthly.json');
const weeklyDbPath = path.join(__dirname, '../database/weekly.json');

// JSON dosyasından veriyi okuyan ve yazan yardımcı fonksiyonlar
function readData(filePath) {
    try {
        const fileData = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(fileData);
    } catch (error) {
        console.error(`Dosya okuma hatası (${filePath}):`, error);
        return {};
    }
}

function writeData(filePath, data) {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error(`Dosya yazma hatası (${filePath}):`, error);
    }
}

module.exports = {
    name: 'kayıt',
    description: 'Kullanıcının ismini değiştirir ve kayıt işlemini tamamlar.',
    aliases: ['k'],
    usage: '.k @kullanıcı (yeniisim)',
    async execute(client, message, args) {
        // idler nesnesini client üzerinden al
        const idler = client.idler;
        const yetkiliRolID = idler.yetkirol;
        const kayıtsızRolID = idler.kayıtsızrol;
        const kayıtlıRolID = idler.kayıtrol;
        const logKanalID = idler.kayıtlog;

        // Kullanıcının yeterliliğini kontrol et
        if (!message.member.roles.cache.has(yetkiliRolID)) {
            return message.reply("`Bu komutu kullanmak için yetkiniz yok.`");
        }

        // Hedef kullanıcıyı al
        const targetUser = message.mentions.members.first();
        if (!targetUser) {
            return message.reply("`Lütfen bir kullanıcı etiketleyin.`");
        }

        // Yeni ismi al
        const newName = args.slice(1).join(' ');
        if (!newName) {
            return message.reply("`Lütfen yeni bir isim belirtin.`");
        }

        try {
            // Kullanıcının ismini değiştir
            await targetUser.setNickname(newName);
            // Rollerle işlemleri yap
            await targetUser.roles.remove(kayıtsızRolID);
            await targetUser.roles.add(kayıtlıRolID);

            // Kayıt yapan kişinin kayıt sayısını güncelle
            const authorId = message.author.id;

            // Haftalık veriyi oku, güncelle ve kaydet
            let weeklyData = readData(weeklyDbPath);
            weeklyData[authorId] = (weeklyData[authorId] || 0) + 1;
            writeData(weeklyDbPath, weeklyData);

            // Aylık veriyi oku, güncelle ve kaydet
            let monthlyData = readData(monthlyDbPath);
            monthlyData[authorId] = (monthlyData[authorId] || 0) + 1;
            writeData(monthlyDbPath, monthlyData);

            // Embed mesajını oluştur
            const embed = new MessageEmbed()
                .setAuthor({ name: 'MED Kayıt' })
                .setTitle(`${targetUser.user.username}, az önce kayıt edildi. <a:med_AAPeekOwO:1235316737294204958>`)
                .setDescription(`╰> Kayıt edilen kişi ${targetUser}.`)
                .addFields(
                    { name: '<a:med_yetki:1235236274676437032> Kayıt İşlemini Yapan Yetkili:', value: `${message.author}`, inline: true },
                    { name: '<:med_owo1:1242166689551093800> Kayıt Türü:', value: '`member`', inline: true }
                )
                .setFooter({ text: message.author.tag, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
                .setThumbnail(targetUser.user.displayAvatarURL({ dynamic: true }))
                .setTimestamp();

            // Log kanalına ve komutun yapıldığı kanala mesaj gönder
            const logChannel = client.channels.cache.get(logKanalID);
            if (logChannel) {
                await logChannel.send({ embeds: [embed] });
            }
            await message.channel.send({ embeds: [embed] });
        } catch (error) {
            console.error('Kayıt işlemi hatası:', error);
            message.reply('`Kayıt işlemi sırasında bir hata oluştu.`');
        }
    }
};
