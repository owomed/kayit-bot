const { joinVoiceChannel, VoiceConnectionStatus } = require('@discordjs/voice');

module.exports = {
    name: 'voiceStateUpdate',
    once: false, // Bu olayın her seferinde çalışmasını sağlar
    async execute(oldState, newState) {
        // İdler verisini client üzerinden ana dosya(index.js) üzerinden alın
        const idler = newState.client.idler;
        const channelId = idler.kayıtses; // idler.json dosyasından ses kanalı ID'sini alın

        // Eğer yeni durumdaki kanal ID'si, belirlediğimiz ID değilse veya bot kanaldan ayrılıyorsa durdur
        if (newState.channelId !== channelId || newState.channelId === null) {
            return;
        }

        // Botun zaten kanalda olup olmadığını kontrol et
        const botMember = newState.guild.members.cache.get(newState.client.user.id);
        if (botMember.voice.channelId === channelId) {
            return;
        }

        // Ses kanalına bağlanma
        try {
            const connection = joinVoiceChannel({
                channelId: newState.channelId,
                guildId: newState.guild.id,
                adapterCreator: newState.guild.voiceAdapterCreator,
                selfDeaf: true, // Botun kendini sağır yapması
            });
            console.log('Bot ses kanalına otomatik olarak katıldı.');

            // Bağlantı durumlarını dinle
            connection.on(VoiceConnectionStatus.Ready, () => {
                console.log('Ses bağlantısı hazır!');
            });

            connection.on(VoiceConnectionStatus.Disconnected, async (oldDisconnect, newDisconnect) => {
                try {
                    if (newDisconnect.reason === 'voiceServerUpdate') return; // Sunucu güncellemesi durumunda yeniden bağlanma
                    // Eğer kanal boşalırsa veya bir hata oluşursa tekrar bağlan
                    joinVoiceChannel({
                        channelId: newState.channelId,
                        guildId: newState.guild.id,
                        adapterCreator: newState.guild.voiceAdapterCreator,
                        selfDeaf: true,
                    });
                } catch (error) {
                    console.error('Ses bağlantısı kesildi ve yeniden bağlanma hatası:', error);
                }
            });

        } catch (error) {
            console.error('Ses kanalına katılma hatası:', error);
        }
    },
};
