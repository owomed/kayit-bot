const { EmbedBuilder, GuildMember, MessageEmbed, time } = require('discord.js');
const moment = require('moment');
require('moment-duration-format');

module.exports = {
    name: 'guildMemberAdd',
    /**
     * @param {GuildMember} member
     */
    async execute(member) {
        // İdler verisini client üzerinden ana dosya(index.js) üzerinden alın
        const idler = member.client.idler;
        
        // Kanalları ve rolleri kontrol edin
        const kanal = member.guild.channels.cache.get(idler.kayıtkanal);
        if (!kanal) {
            return console.error('Kanal bulunamadı: ' + idler.kayıtkanal);
        }
        
        const kayıtsızRol = member.guild.roles.cache.get(idler.kayıtsızrol);
        const jailRol = member.guild.roles.cache.get(idler.jailrol);
        const yetkiRol = member.guild.roles.cache.get(idler.yetkirol);
        
        if (!kayıtsızRol || !jailRol || !yetkiRol) {
            return console.error('Roller bulunamadı. Lütfen ID\'leri kontrol edin.');
        }

        // Kayıtsız rolü ekle
        try {
            await member.roles.add(kayıtsızRol);
        } catch (error) {
            console.error('Kayıtsız rolü ekleme hatası:', error);
        }

        // Kullanıcı ve hesap durumu kontrolü
        const kurulus = new Date().getTime() - member.user.createdAt.getTime();
        const güvenilirlikSüresi = 1000 * 60 * 60 * 24 * 15; // 15 gün
        let kontrol;
        
        if (kurulus < güvenilirlikSüresi) {
            try {
                await member.roles.add(jailRol);
                await member.roles.remove(kayıtsızRol);
            } catch (error) {
                console.error('Rol ekleme/kaldırma hatası (jail):', error);
            }
            kontrol = `Hesap Durumu: **Güvenilir Değil** ❌`;
        } else {
            kontrol = `Hesap Durumu: **Güvenilir <a:med_verify:1235237448926236763>** `;
        }
        
        // Üye sayısını string olarak al ve haritalama (mapping) yap
        const mapping = {
            " ": " ",
            '0': '0', '1': '1', '2': '2', '3': '3', '4': '4',
            '5': '5', '6': '6', '7': '7', '8': '8', '9': '9'
        };
        const üyeSayısı = `${member.guild.memberCount}`.split("").map(c => mapping[c] || c).join("");
        
        // Hesap oluşturulma süresini Discord'un yerleşik time metodunu kullanarak al
        const timestamp = Math.round(member.user.createdAt.getTime() / 1000);
        
        // Embed oluştur (Discord.js v14'e göre güncellendi)
        const embed = new EmbedBuilder()
            .setTitle(`${member.user.username} sunucumuza katıldı. <a:med_kalp211:1254503881220554893>`)
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
            .setDescription(`**${member.user} Kayıt olmayı bekliyor...** !
            
<a:owo_wave1:1254503920051683338> **OwO MED sunucusuna** Hoşgeldiniz.

<:owo_ok1:1254500571583611012> Sunucuda sohbete başlamadan önce \`BİLGİ\` kategorisine göz atmanı öneririz çünkü bir sıkıntı olduğu zaman yönetim kadromuz bu kurallar ve bilgiler çerçevesinde sizinle ilgilenecektir.

<:PandaHmm1:1254511149857247232> Kayıt sorumlularımız eğer gelmezlerse <@&1189127683653783552> yazarak tekrar etiketleyebilirsiniz.

**Bilgiler:**

<a:med_kirmiziyildiz1:1254503904541020370> Seninle beraber **${üyeSayısı}** üye olduk!

<a:PandaYay21:1254503938674262016> Hesabın <t:${timestamp}:R> oluşturulmuş!

${kontrol}`)
            .setColor("Random")
            .setImage('https://cdn.discordapp.com/attachments/1235592734660628481/1255479594828562522/standard_24.gif?ex=667d47fd&is=667bf67d&hm=ec1bb0c30ef79c1253ffe0a337c7eaa6057052e27e51a60d611cfdb0357738ad&');

        // Mesaj gönderme
        try {
            await kanal.send({ content: `||<@&${yetkiRol.id}> & ${member.user}||`, embeds: [embed] });
        } catch (error) {
            console.error('Mesaj gönderme hatası:', error);
        }
    },
};
