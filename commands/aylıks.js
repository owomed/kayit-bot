const { MessageEmbed } = require('discord.js');
const db = require('quick.db');

module.exports = {
    name: 'aylık-sıralama',
    aliases: ['monthly-top'],
    description: 'Aylık kayıt sıralamasını gösterir.',
    async execute(client, message, args) {
        let allData = db.all();
        let monthlyData = allData.filter(data => data.ID.startsWith('monthly_'));
        let sortedData = monthlyData.sort((a, b) => b.data - a.data);

        let embed = new MessageEmbed()
            .setColor('#ff9900')
            .setTitle('Aylık Kayıt Sıralaması')
            .setThumbnail(message.guild.iconURL({ dynamic: true }))
            .setDescription('Bu ay en çok kayıt yapan kullanıcılar:')
            .setTimestamp();

        for (let i = 0; i < sortedData.length; i++) {
            let userId = sortedData[i].ID.split('_')[1];
            let user = await client.users.fetch(userId).catch(() => null);
            let userTag = user ? user.tag : 'Bilinmeyen Kullanıcı';
            embed.addField(
                `${i + 1}. ${userTag}`,
                `Kayıt Sayısı: \`${sortedData[i].data}\`\n <:med_kivircikok:1246364420896985119> ${user ? `<@${userId}>` : 'Bilinmeyen Etiket'}`,
                false
            );
        }

        message.channel.send({ embeds: [embed] });
    }
};
