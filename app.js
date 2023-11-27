const mongoose = require('mongoose');
const User = require('./Schemas/User');

mongoose.connect('mongodb://127.0.0.1:27017/test', { useNewUrlParser: true, useUnifiedTopology: true });

const db = mongoose.connection;

const userIdToUpdate = '64fae96c99ac0e530a5f2f9d';
const updatedData = {
    phone: '+77778818199',
    email: 'speedclanker@gmail.com',
    firstName: 'Clanker',
    lastName: 'GoofyKiddo',
};

async function updateUser() {
    try {
        const updatedUser = await User.findByIdAndUpdate(
            userIdToUpdate,
            updatedData,
            { new: true }
        );
        if (!updatedUser) {
            console.error('User not found.');
        } else {
            console.log('Updated user:', updatedUser);
        }
    } catch (err) {
        console.error('Error updating user:', err);
    }
}

async function retrieveUsers() {
    try {
        const users = await User.find({});
        console.log('Retrieved users:', users);
    } catch (err) {
        console.error('Error retrieving users:', err);
    }
}

Promise.all([updateUser(), retrieveUsers()])
    .then(() => {
        db.close();
    })
    .catch((err) => {
        console.error('Error:', err);
        db.close();
    });
