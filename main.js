const TelegramBot = require('node-telegram-bot-api');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const english = require('./english');
const express = require('express');
const mongoose = require('mongoose');
const User = require('./Schemas/User')
mongoose.connect('mongodb://127.0.0.1:27017/telegramBot', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

dotenv.config();

const token = process.env.BOT_TOKEN;

if (!token) {
    console.error("BOT_TOKEN is missing in the environment variables.");
    process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });
bot.on("polling_error", console.log);

const MENU_STATES = {
    MAIN_MENU: 'main_menu',

    UNIT_1: 'unit_1',
    UNIT_1_TASK_1: 'unit_1_task_1',
    UNIT_1_TASK_2: 'unit_1_task_2',

    UNIT_2: 'unit_2',
    UNIT_2_TASK_1: 'unit_2_task_1',
    UNIT_2_TASK_2: 'unit_2_task_2',
};

bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    const newState = MENU_STATES.MAIN_MENU;

    try {
        const existingUser = await User.findOne({ chatId });

        if (existingUser) {
            await User.updateOne({ chatId }, { state: newState });
        } else {
            const newUser = new User({ chatId, state: newState });
            await newUser.save();
        }

        await sendMainMenu(chatId);
    } catch (error) {
        console.error('Error handling /start:', error);
    }
});

bot.onText(/\/back/, async (msg) => {
    const chatId = msg.chat.id;

    
}); 