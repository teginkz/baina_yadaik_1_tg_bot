const mongoose = require('mongoose');
const User = require('./Schemas/User');

mongoose.connect('mongodb://127.0.0.1:27017/test', { useNewUrlParser: true, useUnifiedTopology: true });

const db = mongoose.connection;

const userIdToDelete = '64fae96c99ac0e530a5f2f9d';

async function deleteUser() {
    try {
        const deletedUser = await User.findByIdAndRemove(userIdToDelete);
        if (!deletedUser) {
            console.error('User not found.');
        } else {
            console.log('Deleted user:', deletedUser);
        }
    } catch (err) {
        console.error('Error deleting user:', err);
    }
}

deleteUser()
    .then(() => {
        db.close();
    })
    .catch((err) => {
        console.error('Error:', err);
        db.close();
    });
