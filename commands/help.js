const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');

// Hem prefix hem de slash komutu için kullanacağımız ana fonksiyon
async function handleCommand(interactionOrMessage) {
    const client = interactionOrMessage.client;
    
    const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle(`${interactionOrMessage.guild.name} Kayıt Yardım Menüsü`)
        .setDescription('Aşağıda botun tüm komutlarını bulabilirsiniz.')
        .setThumbnail(interactionOrMessage.guild.iconURL({ dynamic: true }))
        .setImage('https://cdn.discordapp.com/attachments/1235592734660628481/1255479594828562522/standard_24.gif?ex=667d47fd&is=667bf67d&hm=ec1bb0c30ef79c1253ffe0a337c7eaa6057052e27e51a60d611cfdb0357738ad')
        .setTimestamp();
        
    // Komutu kullanan kullanıcının avatarını ve tag'ini footer'a ekle
    let user;
    if (interactionOrMessage.isCommand?.()) {
        user = interactionOrMessage.user;
    } else {
        user = interactionOrMessage.author;
    }
    embed.setFooter({ text: user.tag, iconURL: user.displayAvatarURL({ dynamic: true }) });

    const commands = client.commands
        .map(command => `**\`\`${command.name}:\`\`** \`\`\`${command.description}\`\`\``)
        .join('\n');
        
    embed.addFields({ name: 'Komutlar', value: commands || 'Komut bulunamadı.' });

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
        .setName('yardım')
        .setDescription('Botun tüm komutlarını listeler.'),
        
    // Prefix komutu için gerekli tanımlamalar
    name: 'yardım',
    aliases: ['help'],
    description: 'Botun tüm komutlarını listeler.',
    
    // Prefix komutunu çalıştıracak metod
    async execute(client, message, args) {
        await handleCommand(message);
    },

    // Slash komutunu çalıştıracak metod
    async slashExecute(interaction) {
        await handleCommand(interaction);
    }
};
