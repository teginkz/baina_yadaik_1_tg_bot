const TelegramBot = require('node-telegram-bot-api');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const english = require('./english');
const express = require('express');

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

const userState = new Map();

bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;

    userState.set(chatId, MENU_STATES.MAIN_MENU);

    sendMainMenu(chatId);
});

bot.onText(/back/, (msg) => {
    const chatId = msg.chat.id;

    const currentState = userState.get(chatId);

    switch (currentState) {
        case MENU_STATES.UNIT_1:
        case MENU_STATES.UNIT_1_TASK_1:
            userState.set(chatId, MENU_STATES.MAIN_MENU);
            sendMainMenu(chatId);
            break;
        default:
            break;
    }
});

bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;
    const currentState = userState.get(chatId);

    switch (currentState) {
        case MENU_STATES.MAIN_MENU:
            handleMainMenu(chatId, text);
            break;
        case MENU_STATES.UNIT_1:
            handleUnit1Menu(chatId, text);
            break;
        case MENU_STATES.UNIT_1_TASK_1:
            handleUnit1Task1(chatId, text);
            break;
        case MENU_STATES.UNIT_1_TASK_2:
            handleUnit1Task2(chatId, text);
            break;
        case MENU_STATES.UNIT_2:
            handleUnit2Menu(chatId, text);
            break;
        case MENU_STATES.UNIT_2_TASK_1:
            handleUnit2Task1(chatId, text)
            break;
        case MENU_STATES.UNIT_2_TASK_2:
            handleUnit2Task2(chatId, text);
            break;
        default:
            break;
    }
});

function sendMainMenu(chatId) {
    bot.sendMessage(chatId, "Main menu", {
        reply_markup: {
            keyboard: [[english.unit1.mainTitle], [english.unit2.mainTitle]],
            resize_keyboard: true,
        },
    });
}

function handleMainMenu(chatId, text) {
    switch (text) {
        case english.unit1.mainTitle:
            userState.set(chatId, MENU_STATES.UNIT_1);
            sendUnit1Menu(chatId);
            break;
        case english.unit2.mainTitle:
            userState.set(chatId, MENU_STATES.UNIT_2);
            sendUnit2Menu(chatId);
            break;
        default:
            break;
    }
}

function sendUnit1Menu(chatId) {
    bot.sendMessage(chatId, 'Unit 1 Menu', {
        reply_markup: {
            keyboard: [[english.unit1.task1, english.unit1.task2],
            ['back']],
            resize_keyboard: true,
        },
    });
}

function handleUnit1Menu(chatId, text) {
    switch (text) {
        case 'unit 1 task 1':
            userState.set(chatId, MENU_STATES.UNIT_1_TASK_1);
            sendUnit1Task1(chatId);
            break;
        case 'unit 1 task 2':
            userState.set(chatId, MENU_STATES.UNIT_1_TASK_2);
            sendUnit1Task2(chatId);
            break;
        case 'back':
            userState.set(chatId, MENU_STATES.MAIN_MENU);
            sendMainMenu(chatId);
            break;
        default:
            break;
    }
}

function sendUnit1Task1(chatId) {

    const keyboardOptions = [['Text', 'Audio'], ['Exam', 'Back']];
    const replyMarkup = {
        keyboard: keyboardOptions,
        resize_keyboard: true,
    };

    bot.sendMessage(chatId, 'Unit 1 - Task 1', {
        reply_markup: replyMarkup,
        keyboard: keyboardOptions,
    });
}

function sendUnit1Task2(chatId) {

    const keyboardOptions = [['Text', 'Audio'], ['Exam', 'Back']];
    const replyMarkup = {
        keyboard: keyboardOptions,
        resize_keyboard: true,
    };

    bot.sendMessage(chatId, 'Unit 1 - Task 2 Content', {
        reply_markup: replyMarkup,
        keyboard: keyboardOptions,
    });
}

function sendUnit2Menu(chatId) {
    bot.sendMessage(chatId, 'Unit 2 Menu', {
        reply_markup: {
            keyboard: [[english.unit2.task1, english.unit2.task2],
            ['back']],
            resize_keyboard: true,
        },
    });
}

function handleUnit2Menu(chatId, text) {
    switch (text) {
        case 'unit 2 task 1':
            userState.set(chatId, MENU_STATES.UNIT_2_TASK_1);
            sendUnit2Task1(chatId);
            break;
        case 'unit 2 task 2':
            userState.set(chatId, MENU_STATES.UNIT_2_TASK_2);
            sendUnit2Task2(chatId);
            break;
        case 'back':
            userState.set(chatId, MENU_STATES.MAIN_MENU);
            sendMainMenu(chatId);
            break;
        default:
            break;
    }
}

function sendUnit2Task1(chatId) {

    const keyboardOptions = [['Text', 'Audio'], ['Exam', 'Back']];
    const replyMarkup = {
        keyboard: keyboardOptions,
        resize_keyboard: true,
    };

    bot.sendMessage(chatId, 'Unit 2 - Task 1 Content', {
        reply_markup: replyMarkup,
        keyboard: keyboardOptions,
    });
}

function sendUnit2Task2(chatId) {

    const keyboardOptions = [['Text', 'Audio'], ['Exam', 'Back']];
    const replyMarkup = {
        keyboard: keyboardOptions,
        resize_keyboard: true,
    };

    bot.sendMessage(chatId, 'Unit 2 - Task 2 Content', {
        reply_markup: replyMarkup,
        keyboard: keyboardOptions,
    });
}

function handleUnit1Task1(chatId, text) {
    switch (text) {
        case 'Text':
            bot.sendMessage(chatId, 'You chose: text');
            break;
        case 'Audio':
            bot.sendMessage(chatId, 'You chose: audio');
            bot.sendAudio(chatId, __dirname + '/audios/03.mp3')
                .then(() => {
                    console.log('Audio sent successfully');
                })
                .catch((error) => {
                    console.error('Error sending audio:', error);
                });
            break;
        case 'Exam':
            bot.sendMessage(chatId, 'You chose: exam');
            break;
        case 'Back':
            userState.set(chatId, MENU_STATES.UNIT_1);
            sendUnit1Menu(chatId);
            break;
        default:
            break;
    }
}

function handleUnit1Task2(chatId, text) {
    switch (text) {
        case 'Text':
            bot.sendMessage(chatId, 'You chose: text');
            break;
        case 'Audio':
            bot.sendMessage(chatId, 'You chose: audio');
            bot.sendAudio(chatId, __dirname + '/audios/04.mp3')
                .then(() => {
                    console.log('Audio sent successfully');
                })
                .catch((error) => {
                    console.error('Error sending audio:', error);
                });
            break;
        case 'Exam':
            bot.sendMessage(chatId, 'You chose: exam');
            break;
        case 'Back':
            userState.set(chatId, MENU_STATES.UNIT_1);
            sendUnit1Menu(chatId);
            break;
        default:
            break;
    }
}

function handleUnit2Task1(chatId, text) {
    switch (text) {
        case 'Text':
            bot.sendMessage(chatId, 'You chose: text');
            break;
        case 'Audio':
            bot.sendMessage(chatId, 'You chose: audio');
            bot.sendAudio(chatId, __dirname + '/audios/02.mp3')
                .then(() => {
                    console.log('Audio sent successfully');
                })
                .catch((error) => {
                    console.error('Error sending audio:', error);
                });
            break;
        case 'Exam':
            bot.sendMessage(chatId, 'You chose: exam');
            break;
        case 'Back':
            userState.set(chatId, MENU_STATES.UNIT_2);
            sendUnit2Menu(chatId);
            break;
        default:
            break;
    }
}

function handleUnit2Task2(chatId, text) {
    switch (text) {
        case 'Text':
            bot.sendMessage(chatId, 'You chose: text');
            break;
        case 'Audio':
            bot.sendMessage(chatId, 'You chose: audio');
            bot.sendAudio(chatId, __dirname + '/audios/01.mp3')
                .then(() => {
                    console.log('Audio sent successfully');
                })
                .catch((error) => {
                    console.error('Error sending audio:', error);
                });
            break;
        case 'Exam':
            bot.sendMessage(chatId, 'You chose: exam');
            break;
        case 'Back':
            userState.set(chatId, MENU_STATES.UNIT_2);
            sendUnit2Menu(chatId);
            break;
        default:
            break;
    }
}

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/tgwebhook', (req, res) => {
    console.log('Received webhook request:', req.body);
    bot.processUpdate(req.body);
    res.sendStatus(200);
});

app.get('/ping', (req, res) => res.send('pong'));

app.listen(port, () => {
    console.log(`Web server is listening on port ${port}`);
});