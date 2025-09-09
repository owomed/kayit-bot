const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'messageCreate',
    execute(message) {
        // Botun kendi mesajlarına ve diğer komutlara cevap vermemesi için
        if (message.author.bot || message.content.startsWith(message.client.prefix)) return;

        // Kontrol etmek istediğiniz kanal ID'si
        const targetChannelId = '1234861099267133480';
        if (message.channel.id !== targetChannelId) return;

        // Mesaj içeriğini kontrol edin
        const content = message.content.toLowerCase().trim();
        if (content === 'kayıt' || content.startsWith('kayıt ') || content === 'kayit' || content.startsWith('kayit ')) {
            // Embed mesajını oluşturun
            const embed = new EmbedBuilder()
                .setTitle('Kayıt Olmanız İçin Yapmanız Gerekenler! <a:med_verify_owo:1235316609632043008>')
                .addFields(
                    { name: '<a:PandaYay21:1254503938674262016> <#1235112746329178165> Kanalından en az 1 rol almak!', value: '\u200B' },
                    { name: "<a:pandamutluy:1254540678554452089> OwO Profilini açmak!", value: '**⮱ OwO seviyeniz en az 5 lvl veya takım hayvanlarınız en az 10 lvl olmalı.**\n **Profil için `w profile` | Takım için `w tm`**'}
                )
                .setFooter({ text: `Bu adımları tamamlayınca Kayıt görevlisini etiketleyebilirsiniz. 🤎` })
                .setColor('Random')
                .setImage('https://cdn.discordapp.com/attachments/1235592734660628481/1255479594828562522/standard_24.gif?ex=667d47fd&is=667bf67d&hm=ec1bb0c30ef79c1253ffe0a337c7eaa6057052e27e51a60d611cfdb0357738ad&');

            // Embed mesajını gönderin
            message.channel.send({ embeds: [embed] });
        }
    }
};
