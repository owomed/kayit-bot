const { MessageEmbed } = require('discord.js');
const moment = require('moment');
require('moment-duration-format');
const fs = require('fs');

module.exports = {
  name: 'guildMemberAdd',
  async execute(member) {
    // JSON dosyasından idler verilerini yükle
    let idler;
    try {
      idler = JSON.parse(fs.readFileSync('./Settings/idler.json', 'utf8'));
    } catch (error) {
      console.error('IDLER dosyası okunamadı:', error);
      return;
    }

    // Kanalları ve rolleri kontrol edin
    const kanal = member.guild.channels.cache.get(idler.kayıtkanal);
    if (!kanal) {
      console.error('Kanal bulunamadı');
      return;
    }
    const kayıtsızRol = member.guild.roles.cache.get(idler.kayıtsızrol);
    const jailRol = member.guild.roles.cache.get(idler.jailrol);
    const yetkiRol = member.guild.roles.cache.get(idler.yetkirol);
    if (!kayıtsızRol || !jailRol || !yetkiRol) {
      console.error('Roller bulunamadı');
      return;
    }

    // Kayıtsız rolü ekle
    try {
      await member.roles.add(kayıtsızRol);
    } catch (error) {
      console.error('Rol ekleme hatası:', error);
    }

    // Kullanıcı bilgilerini al
    let los = member.client.users.cache.get(member.id);
    if (!los) {
      console.error('Kullanıcı bilgileri bulunamadı');
      return;
    }
    const kurulus = new Date().getTime() - los.createdAt.getTime();

    // Üye sayısını formatla
    const mapping = {
      " ": "  ",
      '0': '0',
      '1': '1',
      '2': '2',
      '3': '3',
      '4': '4',
      '5': '5',
      '6': '6',
      '7': '7',
      '8': '8',
      '9': '9'
    };
    let üyesayısı = `${member.guild.memberCount.toString()}`
      .split("")
      .map(c => mapping[c] || c)
      .join("");

    // Hesap durumu kontrolü
    var kontrol;
    if (kurulus < 1296000000) { // 15 gün
      try {
        await member.roles.add(jailRol);
        await member.roles.remove(kayıtsızRol);
      } catch (error) {
        console.error('Rol ekleme ve kaldırma hatası:', error);
      }
      kontrol = `Hesap Durumu: **Güvenilir Değil** ❌`;
    } else {
      kontrol = `Hesap Durumu: **Güvenilir <a:med_verify:1235237448926236763>** `;
    }

    // Hesap oluşturulma süresi
    const timestamp = Math.round(los.createdAt.getTime() / 1000);

    // Embed oluştur
    const embed = new MessageEmbed()
      .setTitle(`${member.user.username} sunucumuza katıldı. <a:med_kalp211:1254503881220554893>`)
      .setThumbnail(member.user.avatarURL({ dynamic: true }))
      .setDescription(`**${los} Kayıt olmayı bekliyor...** !

<a:owo_wave1:1254503920051683338> **OwO MED sunucusuna** Hoşgeldiniz.

<:owo_ok1:1254500571583611012> Sunucuda sohbete başlamadan önce \`BİLGİ\` kategorisine göz atmanı öneririz çünkü bir sıkıntı olduğu zaman yönetim kadromuz bu kurallar ve bilgiler çerçevesinde sizinle ilgilenecektir.

<:PandaHmm1:1254511149857247232> Kayıt sorumlularımız eğer gelmezlerse <@&1189127683653783552> yazarak tekrar etiketleyebilirsiniz.

**Bilgiler:**

<a:med_kirmiziyildiz1:1254503904541020370> Seninle beraber **${üyesayısı}** üye olduk!

<a:PandaYay21:1254503938674262016> Hesabın <t:${timestamp}:R> oluşturulmuş!

${kontrol}`)
      .setColor("RANDOM")
      .setImage('https://cdn.discordapp.com/attachments/1235592734660628481/1255479594828562522/standard_24.gif?ex=667d47fd&is=667bf67d&hm=ec1bb0c30ef79c1253ffe0a337c7eaa6057052e27e51a60d611cfdb0357738ad&');

    // Mesaj gönderme
    try {
      await kanal.send({ content: `||<@&${yetkiRol.id}> & ${los}||`, embeds: [embed] });
    } catch (error) {
      console.error('Mesaj gönderme hatası:', error);
    }
  },
};
