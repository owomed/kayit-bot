const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const MonthlyCount = require('../models/MonthlySchema'); // MongoDB modelini içe aktar

// Hem prefix hem de slash komutu için kullanacağımız ana fonksiyon
async function handleCommand(interactionOrMessage) {
    const client = interactionOrMessage.client;
    
    // MongoDB'den en çok kayıt yapan 10 kullanıcıyı al
    const monthlyData = await MonthlyCount.find().sort({ count: -1 }).limit(10);
    
    const embed = new EmbedBuilder()
        .setColor('#ff9900')
        .setTitle('Aylık Kayıt Sıralaması')
        .setThumbnail(interactionOrMessage.guild.iconURL({ dynamic: true }))
        .setDescription('Bu ay en çok kayıt yapan kullanıcılar:')
        .setTimestamp();

    if (monthlyData.length === 0) {
        embed.setDescription('Bu ay henüz kayıt yapan bir kullanıcı yok.');
    } else {
        // MongoDB'den gelen veriyi döngüye al
        for (let i = 0; i < monthlyData.length; i++) {
            const data = monthlyData[i];
            const userId = data.userId;
            const kayitSayisi = data.count;
            
            let user;
            try {
                // Kullanıcıyı botun önbelleğinden veya Discord API'den getir
                user = await client.users.fetch(userId);
            } catch (err) {
                user = null; // Kullanıcı bulunamazsa null olarak ayarla
            }

            const userTag = user ? user.tag : 'Bilinmeyen Kullanıcı';
            
            embed.addFields({
                name: `${i + 1}. ${userTag}`,
                value: `Kayıt Sayısı: \`${kayitSayisi}\`\n <:med_kivircikok:1246364420896985119> ${user ? `<@${userId}>` : 'Bilinmeyen Etiket'}`,
                inline: false
            });
        }
    }
    
    const replyPayload = { embeds: [embed] };
    
    // Komutun türüne göre yanıt ver
    if (interactionOrMessage.isCommand?.()) {
        await interactionOrMessage.reply(replyPayload);
    } else {
        await interactionOrMessage.reply(replyPayload);
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('aylık-sıralama')
        .setDescription('Aylık kayıt sıralamasını gösterir.'),
    
    name: 'aylık-sıralama',
    aliases: ['monthly-top'],
    description: 'Aylık kayıt sıralamasını gösterir.',
    
    async execute(client, message, args) {
        await handleCommand(message);
    },

    async slashExecute(interaction) {
        await handleCommand(interaction);
    }
};
