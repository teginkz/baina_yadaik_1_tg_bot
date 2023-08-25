const TelegramBot = require('node-telegram-bot-api');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const english = require("./english")
dotenv.config();

const token = process.env.BOT_TOKEN;

if (!token) {
    console.error("BOT_TOKEN is missing in the environment variables.");
    process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });

const webhookUrl = process.env.WEBHOOK_URL;
if (!webhookUrl) {
    console.error("WEBHOOK_URL is missing in the environment variables.");
    process.exit(1);
}
bot.setWebHook(webhookUrl);

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
    const text = "Hello! welcome to testing bot!";
    bot.sendMessage(chatId, text);
});

bot.onText(/\/back/, (msg) => {
    const chatId = msg.chat.id;
    const currentState = userState.get(chatId);

    console.log('Received "back" command.');

    switch (currentState) {
        case MENU_STATES.UNIT_1_TASK_1:
        case MENU_STATES.UNIT_1_TASK_2:
            userState.set(chatId, MENU_STATES.UNIT_1);
            sendUnit1Menu(chatId);
            break;
        case MENU_STATES.UNIT_2_TASK_1:
        case MENU_STATES.UNIT_2_TASK_2:
            userState.set(chatId, MENU_STATES.UNIT_2);
            sendUnit2Menu(chatId); 
            break;
        default:
            break;
    }
});

bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const currentState = userState.get(chatId);
    const userMsg = msg.text;

    switch (currentState) {
        case MENU_STATES.MAIN_MENU:
            handleMainMenu(chatId, userMsg);
            break;
            case MENU_STATES.UNIT_1:
                handleUnit1Menu(chatId, userMsg);
                break;
        case MENU_STATES.UNIT_1_TASK_1:
            handleUnit1Task1(chatId, userMsg);
            break;
        case MENU_STATES.UNIT_1_TASK_2:
            handleUnit1Task2(chatId, userMsg);
            break;
            case MENU_STATES.UNIT_2:
                handleUnit2Menu(chatId, userMsg);
                break;
        case MENU_STATES.UNIT_2_TASK_1:
            handleUnit2Task1(chatId, userMsg);
            break;
        case MENU_STATES.UNIT_2_TASK_2:
            handleUnit2Task2(chatId, userMsg);
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
        case english.unit1.task1:
            userState.set(chatId, MENU_STATES.UNIT_1_TASK_1);
            sendTask1(chatId);
            break;
        case english.unit1.task2:
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

function sendTask1(chatId) {
    const keyboardOptions = [['Text', 'Audio'], ['Exam', 'Back']];
    const replyMarkup = {
        keyboard: keyboardOptions,
        resize_keyboard: true,
    };

    bot.sendMessage(chatId, 'Unit 1 - Task 1 Content', {
        reply_markup: replyMarkup,
    });
}

function handleUnit1Task1(chatId, text) {
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
            userState.set(chatId, MENU_STATES.UNIT_1);
            sendUnit1Menu(chatId);
            break;
        default:
            break;
    }
}


function handleUnit1Task2(chatId, text) {
    bot.sendMessage(chatId, "Unit 1 - Task 2 Content");
    switch (text) {
        case 'back':
            userState.set(chatId, MENU_STATES.UNIT_1);
            sendUnit1Menu(chatId);
            break;
        default:
            break;
    }
};

function sendUnit2Menu(chatId) {
    bot.sendMessage(chatId, 'Unit 2 Menu', {
        reply_markup: {
            keyboard: [[english.unit2.task1, english.unit2.task2], ['back']],
            resize_keyboard: true,
        },
    });
}

function handleUnit2Menu(chatId, text) {
    switch (text) {
        case english.unit2.task1:
            userState.set(chatId, MENU_STATES.UNIT_2_TASK_1);
            break;
        case english.unit2.task2:
            userState.set(chatId, MENU_STATES.UNIT_2_TASK_2);
            break;
        case 'back':
            userState.set(chatId, MENU_STATES.MAIN_MENU);
            sendMainMenu(chatId);
            break;
        default:
            break;
    }
}

function sendTask2(chatId, unit) {
    bot.sendMessage(chatId, `Task 2 Content for ${unit}`, {
        reply_markup: {
            keyboard: [['back']],
            resize_keyboard: true,
        },
    });
}

function handleUnit2Task1(chatId, text) {
    switch (text) {
        case 'back':
            userState.set(chatId, MENU_STATES.UNIT_2);
            sendUnit2Menu(chatId);
            break;
        default:
            break;
    }
}

function handleUnit2Task2(chatId, text) {
    switch (text) {
        case 'back':
            userState.set(chatId, MENU_STATES.UNIT_2);
            sendUnit2Menu(chatId);
            break;
        default:
            break;
    }
}

const express = require('express');
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
    console.log(`Server is listening on port ${port}`); 
});