const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

// Hem prefix hem de slash komutu için kullanacağımız ana fonksiyon
async function handleCommand(interactionOrMessage, amount) {
    const client = interactionOrMessage.client;
    const yetkiliRolID = client.idler.yetkirol;

    // Yetki kontrolü (sadece prefix komutu için)
    // Slash komutları için yetki kontrolü 'setDefaultMemberPermissions' ile zaten yapılıyor.
    if (interactionOrMessage.isMessage && !interactionOrMessage.member.roles.cache.has(yetkiliRolID)) {
        return interactionOrMessage.reply('Bu komutu kullanma yetkiniz yok.');
    }

    // Mesaj sayısını kontrol et
    if (isNaN(amount) || amount < 1 || amount > 25) {
        return interactionOrMessage.reply('Lütfen 1 ile 25 arasında bir sayı girin.');
    }

    try {
        // Mesajları sil
        const channel = interactionOrMessage.channel;
        const fetched = await channel.messages.fetch({ limit: amount });
        await channel.bulkDelete(fetched, true);

        // Yanıt mesajını gönder
        const reply = `Başarıyla \`${amount}\` mesaj silindi.`;
        if (interactionOrMessage.isCommand?.()) {
            await interactionOrMessage.reply({ content: reply, ephemeral: true });
        } else {
            const sentMessage = await channel.send(reply);
            setTimeout(() => sentMessage.delete().catch(console.error), 5000);
        }
    } catch (error) {
        console.error('Mesaj silme hatası:', error);
        const reply = 'Mesajları silerken bir hata oluştu.';
        if (interactionOrMessage.isCommand?.()) {
            await interactionOrMessage.reply({ content: reply, ephemeral: true });
        } else {
            await interactionOrMessage.channel.send(reply);
        }
    }
}

module.exports = {
    // Slash komutu için gerekli tanımlamalar
    data: new SlashCommandBuilder()
        .setName('sil')
        .setDescription('Belirtilen sayıda mesajı siler.')
        .addIntegerOption(option =>
            option.setName('sayı')
                .setDescription('Silinecek mesaj sayısı (1-25).')
                .setMinValue(1)
                .setMaxValue(25)
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    
    // Prefix komutu için gerekli tanımlamalar
    name: 'sil',
    aliases: ['temizle', 'clear'],
    description: 'Belirtilen sayıda mesajı siler (1-25 arası).',
    
    // Prefix komutunu çalıştıracak metod
    async execute(client, message, args) {
        const amount = parseInt(args[0]);
        await handleCommand(message, amount);
    },

    // Slash komutunu çalıştıracak metod
    async slashExecute(interaction) {
        const amount = interaction.options.getInteger('sayı');
        await handleCommand(interaction, amount);
    }
};
