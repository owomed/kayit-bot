const { MessageEmbed } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Haftalık verilerin tutulduğu JSON dosyasının yolu
const weeklyDbPath = path.join(__dirname, '../database/weekly.json');

module.exports = {
    name: 'haftalık-sıralama',
    aliases: ['weekly-top'],
    description: 'Haftalık kayıt sıralamasını gösterir.',
    async execute(client, message, args) {
        // Dosyadan haftalık verileri oku
        let weeklyData = {};
        try {
            const fileData = fs.readFileSync(weeklyDbPath, 'utf8');
            weeklyData = JSON.parse(fileData);
        } catch (error) {
            console.error('Haftalık veritabanı dosyası okuma hatası:', error);
            return message.reply('Haftalık sıralama verileri şu anda alınamıyor.');
        }

        // Verileri sırala
        const sortedData = Object.entries(weeklyData).sort(([, a], [, b]) => b - a);

        let embed = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle('Haftalık Kayıt Sıralaması')
            .setThumbnail(message.guild.iconURL({ dynamic: true }))
            .setDescription('Bu hafta en çok kayıt yapan kullanıcılar:')
            .setTimestamp();
        
        if (sortedData.length === 0) {
            embed.setDescription('Bu hafta henüz kayıt yapan bir kullanıcı yok.');
        } else {
            for (let i = 0; i < sortedData.length; i++) {
                const userId = sortedData[i][0];
                let user = await client.users.fetch(userId).catch(() => null);
                const userTag = user ? user.tag : 'Bilinmeyen Kullanıcı';
                const kayitSayisi = sortedData[i][1];

                embed.addField(
                    `${i + 1}. ${userTag}`,
                    `Kayıt Sayısı: \`${kayitSayisi}\`\n <:med_kivircikok:1246364420896985119> ${user ? `<@${userId}>` : 'Bilinmeyen Etiket'}`,
                    false
                );
            }
        }

        message.channel.send({ embeds: [embed] });
    }
};
