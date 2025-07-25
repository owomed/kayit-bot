const { MessageEmbed } = require('discord.js');
const Enmap = require('enmap');

// 'kayitlar' isminde yeni bir enmap veritabanı oluşturuyoruz
const db = new Enmap({ name: "kayitlar" });

module.exports = {
    name: 'kayıt',
    description: 'Kullanıcının ismini değiştirir ve kayıt işlemini tamamlar.',
    aliases: ['k'],
    usage: '.k @kullanıcı (yeniisim)',
    async execute(client, message, args) {
        // idler nesnesini client üzerinden al
        const idler = client.idler;
        const yetkiliRolID = idler.yetkirol;
        const kayıtsızRolID = idler.kayıtsızrol;
        const kayıtlıRolID = idler.kayıtrol;
        const logKanalID = idler.kayıtlog;

        // Kullanıcının yeterliliğini kontrol et
        if (!message.member.roles.cache.has(yetkiliRolID)) {
            return message.reply("`Bu komutu kullanmak için yetkiniz yok.`");
        }

        // Hedef kullanıcıyı al
        const targetUser = message.mentions.members.first();
        if (!targetUser) {
            return message.reply("`Lütfen bir kullanıcı etiketleyin.`");
        }

        // Yeni ismi al
        const newName = args.slice(1).join(' ');
        if (!newName) {
            return message.reply("`Lütfen yeni bir isim belirtin.`");
        }

        try {
            // Kullanıcının ismini değiştir
            await targetUser.setNickname(newName);
            // Rollerle işlemleri yap
            await targetUser.roles.remove(kayıtsızRolID);
            await targetUser.roles.add(kayıtlıRolID);

            // Kayıt yapan kişinin kayıt sayısını güncelle
            const authorId = message.author.id;

            // Enmap'in .ensure() metodu veritabanında bir anahtar yoksa varsayılan değerle oluşturur.
            // Bu, .get() metodunu kullanırken verinin null olmasını engeller.
            db.ensure(`weekly_${authorId}`, 0);
            db.ensure(`monthly_${authorId}`, 0);

            // Kayıt sayısını 1 artırıp veritabanına kaydediyoruz
            db.set(`weekly_${authorId}`, db.get(`weekly_${authorId}`) + 1);
            db.set(`monthly_${authorId}`, db.get(`monthly_${authorId}`) + 1);

            // Embed mesajını oluştur
            const embed = new MessageEmbed()
                .setAuthor({ name: 'MED Kayıt' })
                .setTitle(`${targetUser.user.username}, az önce kayıt edildi. <a:med_AAPeekOwO:1235316737294204958>`)
                .setDescription(`╰> Kayıt edilen kişi ${targetUser}.`)
                .addFields(
                    { name: '<a:med_yetki:1235236274676437032> Kayıt İşlemini Yapan Yetkili:', value: `${message.author}`, inline: true },
                    { name: '<:med_owo1:1242166689551093800> Kayıt Türü:', value: '`member`', inline: true }
                )
                .setFooter({ text: message.author.tag, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
                .setThumbnail(targetUser.user.displayAvatarURL({ dynamic: true }))
                .setTimestamp();

            // Log kanalına ve komutun yapıldığı kanala mesaj gönder
            const logChannel = client.channels.cache.get(logKanalID);
            if (logChannel) {
                await logChannel.send({ embeds: [embed] });
            }
            await message.channel.send({ embeds: [embed] });
        } catch (error) {
            console.error('Kayıt işlemi hatası:', error);
            message.reply('`Kayıt işlemi sırasında bir hata oluştu.`');
        }
    }
};
