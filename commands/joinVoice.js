const { joinVoiceChannel } = require('@discordjs/voice');
const { SlashCommandBuilder } = require('discord.js');

// Sabit ses kanalı ID'si
const channelId = '1243483710670635079';

// Hem prefix hem de slash komutu için kullanacağımız ana fonksiyon
async function handleCommand(interactionOrMessage) {
    const guild = interactionOrMessage.guild;
    const voiceChannel = guild.channels.cache.get(channelId);

    if (!voiceChannel || voiceChannel.type !== 2) { // Discord.js v14'te `GUILD_VOICE` yerine `2` kullanılır
        const reply = 'Belirtilen ses kanalı bulunamadı veya geçerli bir ses kanalı değil.';
        if (interactionOrMessage.isCommand?.()) {
            await interactionOrMessage.reply({ content: reply, ephemeral: true });
        } else {
            await interactionOrMessage.reply(reply);
        }
        return;
    }

    try {
        joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: guild.id,
            adapterCreator: guild.voiceAdapterCreator,
        });

        const reply = '`Bot ses kanalına katıldı.`';
        if (interactionOrMessage.isCommand?.()) {
            await interactionOrMessage.reply({ content: reply, ephemeral: false });
        } else {
            await interactionOrMessage.reply(reply);
        }
    } catch (error) {
        console.error('Ses kanalına katılma hatası:', error);
        const reply = 'Ses kanalına katılırken bir hata oluştu.';
        if (interactionOrMessage.isCommand?.()) {
            await interactionOrMessage.reply({ content: reply, ephemeral: true });
        } else {
            await interactionOrMessage.reply(reply);
        }
    }
}

module.exports = {
    // Slash komutu için gerekli tanımlamalar
    data: new SlashCommandBuilder()
        .setName('kayıtses')
        .setDescription('Botun belirli bir ses kanalına katılmasını sağlar.'),
        
    // Prefix komutu için gerekli tanımlamalar
    name: 'kayıtses',
    aliases: ['join-voice'],
    description: 'Botun belirli bir ses kanalına katılmasını sağlar.',
    
    // Prefix komutunu çalıştıracak metod
    async execute(client, message, args) {
        await handleCommand(message);
    },

    // Slash komutunu çalıştıracak metod
    async slashExecute(interaction) {
        await handleCommand(interaction);
    }
};
