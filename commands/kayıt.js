const { EmbedBuilder, SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const MonthlyCount = require('../models/MonthlySchema');
const WeeklyCount = require('../models/WeeklySchema');
const TotalCount = require('../models/TotalSchema'); // <-- Eklenecek satır


// Hem prefix hem de slash komutu için kullanacağımız ana fonksiyon
async function handleCommand(interactionOrMessage, targetUser, newName) {
    const client = interactionOrMessage.client;
    const idler = client.idler;
    const yetkiliRolID = idler.yetkirol;
    const kayıtsızRolID = idler.kayıtsızrol;
    const kayıtlıRolID = idler.kayıtrol;
    const logKanalID = idler.kayıtlog;
    const authorId = interactionOrMessage.author ? interactionOrMessage.author.id : interactionOrMessage.user.id;

    // Hedef kullanıcıyı ve yeni ismi kontrol et
    if (!targetUser) {
        return interactionOrMessage.reply({ content: 'Lütfen bir kullanıcı etiketleyin.', ephemeral: true });
    }
    if (!newName) {
        return interactionOrMessage.reply({ content: 'Lütfen yeni bir isim belirtin.', ephemeral: true });
    }

    try {
        // Kullanıcının ismini değiştir
        await targetUser.setNickname(newName);
        // Rollerle işlemleri yap
        await targetUser.roles.remove(kayıtsızRolID).catch(console.error);
        await targetUser.roles.add(kayıtlıRolID).catch(console.error);

        // MongoDB'de kayıt sayısını güncelle
        // Aylık sayacı
        await MonthlyCount.findOneAndUpdate(
            { userId: authorId },
            { $inc: { count: 1 } },
            { upsert: true, new: true }
        );
        // Haftalık sayacı
        await WeeklyCount.findOneAndUpdate(
            { userId: authorId },
            { $inc: { count: 1 } },
            { upsert: true, new: true }
        );
        // Toplam sayacı (Toplam kayıtları tutmak için)
        await TotalCount.findOneAndUpdate(
            { userId: authorId },
            { $inc: { count: 1 } },
            { upsert: true, new: true }
        );

        // Embed mesajını oluştur
        const embed = new EmbedBuilder()
            .setAuthor({ name: 'MED Kayıt' })
            .setTitle(`${targetUser.user.username}, az önce kayıt edildi. <a:med_AAPeekOwO:1235316737294204958>`)
            .setDescription(`╰> Kayıt edilen kişi ${targetUser}.`)
            .addFields(
                { name: '<a:med_yetki:1235236274676437032> Kayıt İşlemini Yapan Yetkili:', value: `<@${authorId}>`, inline: true },
                { name: '<:med_owo1:1242166689551093800> Kayıt Türü:', value: '`member`', inline: true }
            )
            .setFooter({ text: interactionOrMessage.guild.name, iconURL: interactionOrMessage.guild.iconURL({ dynamic: true }) })
            .setThumbnail(targetUser.user.displayAvatarURL({ dynamic: true }))
            .setTimestamp();

        // Log kanalına mesaj gönder
        const logChannel = client.channels.cache.get(logKanalID);
        if (logChannel) {
            await logChannel.send({ embeds: [embed] });
        }

        // Komutun kullanıldığı yere yanıt ver
        const replyPayload = { embeds: [embed] };
        if (interactionOrMessage.isCommand?.()) {
            await interactionOrMessage.reply(replyPayload);
        } else {
            await interactionOrMessage.channel.send(replyPayload); // Prefix için channel.send kullanıldı
        }
    } catch (error) {
        console.error('Kayıt işlemi hatası:', error);
        const reply = 'Kayıt işlemi sırasında bir hata oluştu.';
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
        .setName('kayıt')
        .setDescription('Kullanıcının ismini değiştirir ve kayıt işlemini tamamlar.')
        .addMentionableOption(option =>
            option.setName('kullanıcı')
                .setDescription('Kayıt edilecek kullanıcıyı etiketleyin.')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('yeniisim')
                .setDescription('Kullanıcının yeni ismini girin.')
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageNicknames), // Yetki kontrolü
        
    // Prefix komutu için gerekli tanımlamalar
    name: 'kayıt',
    aliases: ['k'],
    description: 'Kullanıcının ismini değiştirir ve kayıt işlemini tamamlar.',
    
    // Prefix komutunu çalıştıracak metod
    async execute(client, message, args) {
        const yetkiliRolID = client.idler.yetkirol;
        if (!message.member.roles.cache.has(yetkiliRolID)) {
            return message.reply("Bu komutu kullanmak için yetkiniz yok.");
        }
        const targetUser = message.mentions.members.first();
        const newName = args.slice(1).join(' ');
        await handleCommand(message, targetUser, newName);
    },

    // Slash komutunu çalıştıracak metod
    async slashExecute(interaction) {
        const yetkiliRolID = interaction.client.idler.yetkirol;
        const member = await interaction.guild.members.fetch(interaction.user.id);
        if (!member.roles.cache.has(yetkiliRolID)) {
            return interaction.reply({ content: "Bu komutu kullanmak için yetkiniz yok.", ephemeral: true });
        }
        const targetUser = interaction.options.getMember('kullanıcı');
        const newName = interaction.options.getString('yeniisim');
        await handleCommand(interaction, targetUser, newName);
    }
};
