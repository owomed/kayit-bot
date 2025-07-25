const { MessageEmbed } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Aylık verilerin tutulduğu JSON dosyasının yolu
const monthlyDbPath = path.join(__dirname, '../database/monthly.json');

module.exports = {
    name: 'aylık-sıralama',
    aliases: ['monthly-top'],
    description: 'Aylık kayıt sıralamasını gösterir.',
    async execute(client, message, args) {
        // Dosyadan aylık verileri oku
        let monthlyData = {};
        try {
            const fileData = fs.readFileSync(monthlyDbPath, 'utf8');
            monthlyData = JSON.parse(fileData);
        } catch (error) {
            console.error('Aylık veritabanı dosyası okuma hatası:', error);
            return message.reply('Aylık sıralama verileri şu anda alınamıyor.');
        }

        // Verileri sırala
        const sortedData = Object.entries(monthlyData).sort(([, a], [, b]) => b - a);

        let embed = new MessageEmbed()
            .setColor('#ff9900')
            .setTitle('Aylık Kayıt Sıralaması')
            .setThumbnail(message.guild.iconURL({ dynamic: true }))
            .setDescription('Bu ay en çok kayıt yapan kullanıcılar:')
            .setTimestamp();

        if (sortedData.length === 0) {
            embed.setDescription('Bu ay henüz kayıt yapan bir kullanıcı yok.');
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
