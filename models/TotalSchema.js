// models/TotalSchema.js
const mongoose = require('mongoose');

const totalSchema = new mongoose.Schema({
    // Discord kullanıcısının ID'si
    userId: { 
        type: String, 
        required: true, 
        unique: true 
    },
    // Toplam kayıt sayısı
    count: { 
        type: Number, 
        default: 0 
    },
    // İsteğe bağlı olarak ekleme tarihi gibi alanlar ekleyebilirsiniz.
});

// Modeli 'TotalCount' adıyla dışa aktarıyoruz.
module.exports = mongoose.model('TotalCount', totalSchema);
