const { MessageEmbed } = require('discord.js');
const { Enmap } = require('enmap');

// 'kayitlar' isminde yeni bir enmap veritabanı oluşturuyoruz
const db = new Enmap({ name: "kayitlar" });

module.exports = {
    name: 'haftalık-sıralama',
    aliases: ['weekly-top'],
    description: 'Haftalık kayıt sıralamasını gösterir.',
    async execute(client, message, args) {
        // Enmap'in tüm verileri döndürmesi için `fetchEverything()` metodu kullanılır
        const allData = await db.fetchEverything();
        
        // Enmap verisi bir Map nesnesi olduğundan, filtreleme yapmak için Array'e dönüştürmek gerekir
        // .filter() metodu ile haftalık kayıtları alıyoruz.
        const weeklyData = allData.filter((value, key) => key.startsWith('weekly_'));
        
        // Sıralama işlemi Map üzerindeki verilerle yapılır
        // Map'i önce Array'e dönüştürüp sonra sıralıyoruz
        const sortedData = [...weeklyData.entries()].sort(([, a], [, b]) => b - a);

        let embed = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle('Haftalık Kayıt Sıralaması')
            .setThumbnail(message.guild.iconURL({ dynamic: true }))
            .setDescription('Bu hafta en çok kayıt yapan kullanıcılar:')
            .setTimestamp();

        for (let i = 0; i < sortedData.length; i++) {
            const userId = sortedData[i][0].split('_')[1];
            let user = await client.users.fetch(userId).catch(() => null);
            const userTag = user ? user.tag : 'Bilinmeyen Kullanıcı';
            const kayitSayisi = sortedData[i][1];

            embed.addField(
                `${i + 1}. ${userTag}`,
                `Kayıt Sayısı: \`${kayitSayisi}\`\n <:med_kivircikok:1246364420896985119> ${user ? `<@${userId}>` : 'Bilinmeyen Etiket'}`,
                false
            );
        }

        message.channel.send({ embeds: [embed] });
    }
};
