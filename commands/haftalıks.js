const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const WeeklyCount = require('../models/WeeklySchema'); // Yeni MongoDB modelini içe aktar

// Hem prefix hem de slash komutu için kullanacağımız ana fonksiyon
async function handleCommand(interactionOrMessage) {
    const client = interactionOrMessage.client;
    
    // MongoDB'den en çok kayıt yapan 10 kullanıcıyı al
    const weeklyData = await WeeklyCount.find().sort({ count: -1 }).limit(10);
    
    const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('Haftalık Kayıt Sıralaması')
        .setThumbnail(interactionOrMessage.guild.iconURL({ dynamic: true }))
        .setDescription('Bu hafta en çok kayıt yapan kullanıcılar:')
        .setTimestamp();

    if (weeklyData.length === 0) {
        embed.setDescription('Bu hafta henüz kayıt yapan bir kullanıcı yok.');
    } else {
        // MongoDB'den gelen veriyi döngüye al
        for (let i = 0; i < weeklyData.length; i++) {
            const data = weeklyData[i];
            const userId = data.userId;
            const kayitSayisi = data.count;
            
            let user;
            try {
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
    // Slash komutu için gerekli tanımlamalar
    data: new SlashCommandBuilder()
        .setName('haftalık-sıralama')
        .setDescription('Haftalık kayıt sıralamasını gösterir.'),
    
    // Prefix komutu için gerekli tanımlamalar
    name: 'haftalık-sıralama',
    aliases: ['weekly-top'],
    description: 'Haftalık kayıt sıralamasını gösterir.',
    
    // Prefix komutunu çalıştıracak metod
    async execute(client, message, args) {
        await handleCommand(message);
    },

    // Slash komutunu çalıştıracak metod
    async slashExecute(interaction) {
        await handleCommand(interaction);
    }
};
