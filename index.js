const TelegramBot = require('node-telegram-bot-api');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const arabic = require('./arabic')
// Load environment variables from .env file
dotenv.config();

// Get the bot token from the environment variables
const token = process.env.BOT_TOKEN;

if (!token) {
    console.error("BOT_TOKEN is missing in the environment variables.");
    process.exit(1);
}

// Create a bot instance
const bot = new TelegramBot(token, { polling: false });

// Set up the webhook
const webhookUrl = process.env.WEBHOOK_URL; // Replace with your actual webhook URL
if (!webhookUrl) {
    console.error("WEBHOOK_URL is missing in the environment variables.");
    process.exit(1);
}
bot.setWebHook(webhookUrl);

// Define states for multi-level menu
const MENU_STATES = {
    MAIN_MENU: 'main_menu',

    UNIT_1: 'unit_1',
    UNIT_1_TASK_1: 'unit_1_task_1',

    UNIT_2: 'unit_2',
    UNIT_2_TASK_1: 'unit_2_task_1',

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
            // Handle other cases if needed
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
        default:
            // Handle other cases if needed
            break;
    }
});


function sendMainMenu(chatId) {
    bot.sendMessage(chatId, "Main menu", {
        reply_markup: {
            keyboard: [[arabic.unit1.mainTitle], [arabic.unit2.mainTitle]],
            resize_keyboard: true,
        },
    });
}

function handleMainMenu(chatId, text) {
    switch (text) {
        case arabic.unit1.mainTitle:
            userState.set(chatId, MENU_STATES.UNIT_1);
            sendUnit1Menu(chatId);
            break;
        case arabic.unit2.mainTitle:
            userState.set(chatId, MENU_STATES.UNIT_1);
            sendUnit2Menu(chatId);
            break;
        default:
            // Handle other main menu options if needed
            break;
    }
}

function sendUnit1Menu(chatId) {
    bot.sendMessage(chatId, 'Unit 1 Menu', {
        reply_markup: {
            keyboard: [[arabic.unit1.task1, arabic.unit1.task2],
            ['back']],
            resize_keyboard: true,
        },
    });
}

function handleUnit1Menu(chatId, text) {
    switch (text) {
        case 'Task 1':
            userState.set(chatId, MENU_STATES.UNIT_1_TASK_1);
            sendTask1(chatId);
            break;
        case 'back':
            userState.set(chatId, MENU_STATES.MAIN_MENU);
            sendMainMenu(chatId);
            break;
        default:
            // Handle other unit 1 menu options if needed
            break;
    }
}

function sendTask1(chatId) {
    bot.sendMessage(chatId, 'Task 1 Content', {
        reply_markup: {
            keyboard: [['back']],
            resize_keyboard: true,
        },
    });
    // Send an audio file (MP3)
    // bot.sendAudio(chatId, __dirname + '/audios/01.mp3')
    //     .then(() => {
    //         console.log('Audio sent successfully');
    //     })
    //     .catch((error) => {
    //         console.error('Error sending audio:', error);
    //     });

}

function handleUnit1Task1(chatId, text) {
    switch (text) {
        case 'back':
            userState.set(chatId, MENU_STATES.UNIT_1);
            sendUnit1Menu(chatId);
            break;
        default:
            // Handle other task 1 options if needed
            break;
    }
}
function handleUnit1Task2(chatId, text) {
    switch (text) {
        case 'back':
            userState.set(chatId, MENU_STATES.UNIT_1);
            sendUnit1Menu(chatId);
            break;
        default:
            // Handle other task 1 options if needed
            break;
    }
}

// Start the Express server for handling the webhook
const express = require('express');
const app = express();
const port = 3000; // Replace with your desired port

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Set up a route for the webhook
app.post('/tgwebhook', (req, res) => {
    console.log(`req.body`, req.body);
    bot.processUpdate(req.body);
    res.sendStatus(200);
});

app.get('/ping', (req, res) => res.send('pong'));

// Start the server
app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
