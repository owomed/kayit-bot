const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder } = require('discord.js');

// Hem prefix hem de slash komutu için kullanacağımız ana fonksiyon
async function handleCommand(interactionOrMessage) {
    const client = interactionOrMessage.client;
    
    const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setDescription(`🔵  Gecikme \`${client.ws.ping}\`ms`);

    const dcButton = new ButtonBuilder()
        .setLabel('OwO MED')
        .setStyle(ButtonStyle.Link)
        .setURL('https://discord.gg/h2NK9nDXDu');

    const row = new ActionRowBuilder().addComponents(dcButton);
    
    const replyPayload = { embeds: [embed], components: [row] };

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
        .setName('ping')
        .setDescription('Botun gecikmesini gösterir.'),
    
    // Prefix komutu için gerekli tanımlamalar
    name: 'ping',
    aliases: ['p'],
    description: 'Botun gecikmesini gösterir.',
    
    // Prefix komutunu çalıştıracak metod
    async execute(client, message, args) {
        await handleCommand(message);
    },

    // Slash komutunu çalıştıracak metod
    async slashExecute(interaction) {
        await handleCommand(interaction);
    }
};
