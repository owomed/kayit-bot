const { MessageEmbed, MessageButton, MessageActionRow } = require('discord.js');

module.exports = {
    name: 'ping',
    description: 'Botun pingini gösterir ve bir buton ile bağlantı sunar.',
    aliases: [],
    usage: '.ping',
    async execute(client, message, args) {
        const embed = new MessageEmbed()
            .setColor('#0099ff')
            .setDescription(`🔵  gecikme \`${client.ws.ping}\`ms`);

        const dcButton = new MessageButton()
            .setLabel('OwO MED')
            .setStyle('LINK')
            .setURL('https://discord.gg/h2NK9nDXDu');

        const row = new MessageActionRow().addComponents(dcButton);

        message.channel.send({ embeds: [embed], components: [row] });
    }
};
