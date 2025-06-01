const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'sil',
    aliases: ['temizle'], // Gerekiyorsa alias ekleyebilirsiniz
    description: 'Belirtilen sayıda mesaj siler (1-25 arası).',
    async execute(client, message, args) {
        const amount = parseInt(args[0]);

        // Kontrol et, args[0] sayı mı ve 1 ile 25 arasında mı?
        if (isNaN(amount) || amount < 1 || amount > 25) {
            return message.channel.send('Lütfen 1 ile 25 arasında bir sayı girin.');
        }

        // Ayar dosyasından rol ID'sini oku
        const settingsPath = path.join(__dirname, '..', 'Settings', 'idler.json');
        const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
        const allowedRoleId = settings.yetkirol;

        // Kullanıcının rol ID'sini kontrol et
        if (!message.member.roles.cache.has(allowedRoleId)) {
            return message.channel.send('Bu komutu kullanma yetkiniz yok.');
        }

        try {
            // Mesajları sil
            await message.channel.messages.fetch({ limit: amount }).then(messages => {
                message.channel.bulkDelete(messages, true);
                message.channel.send(`Başarıyla \`${amount}\` mesaj silindi.`).then(msg => {
                    setTimeout(() => msg.delete(), 5000); // 5 saniye sonra mesajı sil
                });
            });
        } catch (error) {
            console.error('Mesaj silme hatası:', error);
            message.channel.send('Mesajları silerken bir hata oluştu.');
        }
    },
};
