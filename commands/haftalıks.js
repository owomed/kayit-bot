const { MessageEmbed } = require('discord.js');
const { QuickDB } = require('quick.db');

// Yeni quick.db API'sini kullanmak için db objesini yeniden oluştur
const db = new QuickDB();

module.exports = {
    name: 'haftalık-sıralama',
    aliases: ['weekly-top'],
    description: 'Haftalık kayıt sıralamasını gösterir.',
    async execute(client, message, args) {
        // Yeni API'de tüm verileri almak için .all() metodunu kullanıyoruz.
        const allData = await db.all();
        
        const weeklyData = allData.filter(data => data.id.startsWith('weekly_'));
        const sortedData = weeklyData.sort((a, b) => b.value - a.value);

        let embed = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle('Haftalık Kayıt Sıralaması')
            .setThumbnail(message.guild.iconURL({ dynamic: true }))
            .setDescription('Bu hafta en çok kayıt yapan kullanıcılar:')
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
