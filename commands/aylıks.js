const { MessageEmbed } = require('discord.js');
const { QuickDB } = require('quick.db');

// Yeni quick.db API'sini kullanmak için db objesini yeniden oluştur
const db = new QuickDB();

module.exports = {
    name: 'aylık-sıralama',
    aliases: ['monthly-top'],
    description: 'Aylık kayıt sıralamasını gösterir.',
    async execute(client, message, args) {
        // Yeni API'de tüm verileri almak için .all() yerine .all() metodunu kullanıyoruz.
        // Bu metot tüm anahtar-değer çiftlerini döndürür.
        const allData = await db.all();
        
        const monthlyData = allData.filter(data => data.id.startsWith('monthly_'));
        const sortedData = monthlyData.sort((a, b) => b.value - a.value);

        let embed = new MessageEmbed()
            .setColor('#ff9900')
            .setTitle('Aylık Kayıt Sıralaması')
            .setThumbnail(message.guild.iconURL({ dynamic: true }))
            .setDescription('Bu ay en çok kayıt yapan kullanıcılar:')
            .setTimestamp();

        for (let i = 0; i < sortedData.length; i++) {
            const userId = sortedData[i].id.split('_')[1];
            let user = await client.users.fetch(userId).catch(() => null);
            const userTag = user ? user.tag : 'Bilinmeyen Kullanıcı';

            embed.addField(
                `${i + 1}. ${userTag}`,
                `Kayıt Sayısı: \`${sortedData[i].value}\`\n <:med_kivircikok:1246364420896985119> ${user ? `<@${userId}>` : 'Bilinmeyen Etiket'}`,
                false
            );
        }

        message.channel.send({ embeds: [embed] });
    }
};
