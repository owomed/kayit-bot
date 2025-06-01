// commands/yardım.js
const { MessageEmbed } = require('discord.js');

module.exports = {
    name: 'yardım',
    aliases: ['help'],
    description: 'Botun tüm komutlarını listeler.',
    async execute(client, message, args) {
        const embed = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle(`${message.guild.name} Kayıt Yardım Menüsü`)
            .setDescription('Aşağıda botun tüm komutlarını bulabilirsiniz.')
            .setThumbnail(message.guild.iconURL({ dynamic: true }))
            .setImage('https://cdn.discordapp.com/attachments/1235592734660628481/1255479594828562522/standard_24.gif?ex=667d47fd&is=667bf67d&hm=ec1bb0c30ef79c1253ffe0a337c7eaa6057052e27e51a60d611cfdb0357738ad')
            .setFooter({ text: message.author.tag, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
            .setTimestamp();

        const commands = client.commands.map(command => `\**\`\`${command.name}:\`\`** \`\`\`${command.description}\`\`\`\``).join('\n');
        embed.addFields({ name: 'Komutlar', value: commands || 'Komut bulunamadı.' });

        message.channel.send({ embeds: [embed] }).catch(error => {
            message.channel.send(`Bir hata oluştu: ${error.message}`);
        });
    }
};
