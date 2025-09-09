const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Aylık verilerin tutulduğu JSON dosyasının yolu
const monthlyDbPath = path.join(__dirname, '../database/monthly.json');

// Hem prefix hem de slash komutu için kullanacağımız ana fonksiyon
async function handleCommand(interactionOrMessage) {
    let monthlyData = {};
    try {
        const fileData = fs.readFileSync(monthlyDbPath, 'utf8');
        monthlyData = JSON.parse(fileData);
    } catch (error) {
        console.error('Aylık veritabanı dosyası okuma hatası:', error);
        const reply = 'Aylık sıralama verileri şu anda alınamıyor.';
        if (interactionOrMessage.isCommand?.()) {
            await interactionOrMessage.reply({ content: reply, ephemeral: true });
        } else {
            await interactionOrMessage.reply(reply);
        }
        return;
    }

    const sortedData = Object.entries(monthlyData).sort(([, a], [, b]) => b - a);
    const client = interactionOrMessage.client;

    const embed = new EmbedBuilder()
        .setColor('#ff9900')
        .setTitle('Aylık Kayıt Sıralaması')
        .setThumbnail(interactionOrMessage.guild.iconURL({ dynamic: true }))
        .setDescription('Bu ay en çok kayıt yapan kullanıcılar:')
        .setTimestamp();

    if (sortedData.length === 0) {
        embed.setDescription('Bu ay henüz kayıt yapan bir kullanıcı yok.');
    } else {
        // En iyi 10 kullanıcıyı göster
        for (let i = 0; i < Math.min(sortedData.length, 10); i++) {
            const userId = sortedData[i][0];
            let user;
            try {
                user = await client.users.fetch(userId);
            } catch (err) {
                user = null;
            }

            const userTag = user ? user.tag : 'Bilinmeyen Kullanıcı';
            const kayitSayisi = sortedData[i][1];

            embed.addFields({
                name: `${i + 1}. ${userTag}`,
                value: `Kayıt Sayısı: \`${kayitSayisi}\`\n <:med_kivircikok:1246364420896985119> ${user ? `<@${userId}>` : 'Bilinmeyen Etiket'}`,
                inline: false
            });
        }
    }

    const replyPayload = { embeds: [embed] };
    if (interactionOrMessage.isCommand?.()) {
        await interactionOrMessage.reply(replyPayload);
    } else {
        await interactionOrMessage.reply(replyPayload);
    }
}

module.exports = {
    // Slash komutu için gerekli tanımlamalar
    data: new SlashCommandBuilder()
        .setName('aylık-sıralama')
        .setDescription('Aylık kayıt sıralamasını gösterir.'),
    
    // Prefix komutu için gerekli tanımlamalar
    name: 'aylık-sıralama',
    aliases: ['monthly-top'],
    description: 'Aylık kayıt sıralamasını gösterir.',
    
    // Prefix komutunu çalıştıracak metod
    async execute(client, message, args) {
        await handleCommand(message);
    },

    // Slash komutunu çalıştıracak metod
    async slashExecute(interaction) {
        await handleCommand(interaction);
    }
};
