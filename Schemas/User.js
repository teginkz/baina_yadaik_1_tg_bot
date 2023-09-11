// const mongoose = require('mongoose');

// const userSchema = new mongoose.Schema({
//     phone: {
//         type: Number,
//         required: true,
//         trim: true,
//         maxlength: 20,
//         minlength: 4,
//     },
//     email: {
//         type: String,
//         required: true,
//         trim: true,
//         maxlength: 255,
//         minlength: 4,
//     },
//     firstName: {
//         type: String,
//         required: true,
//         maxlength: 255,
//         minlength: 2,
//         trim: true,
//     },
//     lastName: {
//         type: String,
//         required: true,
//         maxlength: 255,
//         minlength: 2,
//         trim: true,
//     },
//     created: {
//         type: Date,
//         default: Date.now(),
//     },
// });

// userSchema.methods.getNameUpperCase = function() {
//     let name = this.firstName + ' ' + this.lastName
//     return name.toUpperCase();
// }

// module.exports = mongoose.model('User', userSchema)

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    chatId: {
        type: Number,
        required: true,
        unique: true,
    },
    state: String,
});

const User = mongoose.model('User', userSchema);

module.exports = User;