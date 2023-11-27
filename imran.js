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

// const webhookUrl = process.env.WEBHOOK_URL;
// if (!webhookUrl) {
//     console.error("WEBHOOK_URL is missing in the environment variables.");
//     process.exit(1);
// }
// bot.setWebHook(webhookUrl);

const MENU_STATES = {
    MAIN_MENU: 'main_menu',

    UNIT_1: 'unit_1',
    UNIT_1_TASK_1: 'unit_1_task_1',
    UNIT_1_TASK_2: 'unit_1_task_2',

    UNIT_2: 'unit_2',
    UNIT_2_TASK_1: 'unit_2_task_1',
    UNIT_2_TASK_2: 'unit_2_task_2',
};

// const userState = new Map();

// const userStateSchema = new mongoose.Schema({
//     chatId: {
//         type: Number,
//         required: true,
//         unique: true,
//     },
//     state: String,
// });

// module.exports = mongoose.model('UserState', userStateSchema)

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

    try {
        const usr = await User.findOne({ chatId });
        if (!usr) {
            await User.create({ chatId, state: MENU_STATES.MAIN_MENU });
        }

        const currentState = usr.state;

        let nextState = MENU_STATES.MAIN_MENU;

        switch (currentState) {
            case MENU_STATES.UNIT_1_TASK_1:
            case MENU_STATES.UNIT_1_TASK_2:
                nextState = MENU_STATES.UNIT_1;
                break;
            case MENU_STATES.UNIT_2_TASK_1:
            case MENU_STATES.UNIT_2_TASK_2:
                nextState = MENU_STATES.UNIT_2;
                break;
            default:
                break;
        }

        await User.findOneAndUpdate({ chatId }, { state: nextState });
        await handleStateTransition(chatId, nextState);
    } catch (error) {
        console.error('Error handnling /back:', error);
    }
}); 

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    let usr;
    try {
        usr = await User.findOne({ chatId });
        if (!usr) {
            usr = new User({ chatId, state: MENU_STATES.MAIN_MENU });
            await usr.save();
        }
        let currentState = usr.state;
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

        await handleStateTransition(chatId, currentState, userMsg);
    } catch (error) {
        console.error('Error handling user message:', error);
    }
});

async function handleStateTransition(chatId, currentState, userMsg) {
    try {
        let nextState = currentState;

        switch (currentState) {
            case MENU_STATES.MAIN_MENU:
                if (userMsg.toLowerCase() === "unit 1") {
                    nextState = MENU_STATES.UNIT_1;
                } else if (userMsg.toLowerCase() === "unit 2") {
                    nextState = MENU_STATES.UNIT_2;
                }
                break;
            case MENU_STATES.UNIT_1:
                if (userMsg.toLowerCase() === "unit 1 task 1") {
                    nextState = MENU_STATES.UNIT_1_TASK_1;
                } else if (userMsg.toLowerCase() === "unit 1 task 2") {
                    nextState = MENU_STATES.UNIT_1_TASK_2;
                }
                break;
            case MENU_STATES.UNIT_2:
                if (userMsg.toLowerCase() === "unit 2 task 1") {
                    nextState = MENU_STATES.UNIT_2_TASK_1;
                } else if (userMsg.toLowerCase() === "unit 2 task 2") {
                    nextState = MENU_STATES.UNIT_2_TASK_2;
                }
                break;
            default:
                break;
        }

        await User.findOneAndUpdate({ chatId }, { state: nextState });

        switch (nextState) {
            case MENU_STATES.MAIN_MENU:
                sendMainMenu(chatId);
                break;
            case MENU_STATES.UNIT_1:
                sendUnit1Menu(chatId);
                break;
            case MENU_STATES.UNIT_1_TASK_1:
                sendUnit1Task1(chatId);
                break;
            case MENU_STATES.UNIT_1_TASK_2:
                sendUnit1Task2(chatId);
                break;
            case MENU_STATES.UNIT_2:
                sendUnit2Menu(chatId);
                break;
            case MENU_STATES.UNIT_2_TASK_1:
                sendUnit2Task1(chatId);
                break;
            case MENU_STATES.UNIT_2_TASK_2:
                sendUnit2Task2(chatId);
                break;
            default:
                break;
            }
    } catch (error) {
        console.error('Error handling state transition:', error);
    }
}

async function sendMainMenu(chatId) {
    try {
        const user = await User.findOne({ chatId });
        if (user.state !== MENU_STATES.MAIN_MENU) {
            return;
        }

        bot.sendMessage(chatId, "Main menu", {
            reply_markup: {
                keyboard: [[english.unit1.mainTitle], [english.unit2.mainTitle]],
                resize_keyboard: true,
            },
        });
    } catch (error) {
        console.error('Error sending main menu:', error);
    }
}


async function handleMainMenu(chatId, text) {
    try {
        switch (text) {
            case english.unit1.mainTitle:
                await User.findOneAndUpdate({ chatId }, { state: MENU_STATES.UNIT_1 });
                break;
            case english.unit2.mainTitle:
                await User.findOneAndUpdate({ chatId }, { state: MENU_STATES.UNIT_2 });
                break;
            default:
                break;
        }
    } catch (error) {
        console.error('Error handling main menu:', error);
    }
}


async function sendUnit1Menu(chatId) {
    try {
        const user = await User.findOne({ chatId });
        if (user.state !== MENU_STATES.UNIT_1) {
            return;
        }

        bot.sendMessage(chatId, 'Unit 1 Menu', {
            reply_markup: {
                keyboard: [[english.unit1.task1, english.unit1.task2], ['back']],
                resize_keyboard: true,
            },
        });
    } catch (error) {
        console.error('Error sending unit 1 menu:', error);
    }
}

async function handleUnit1Menu(chatId, text, currentState) {
    switch (text) {
        case english.unit1.task1:
            await User.findOneAndUpdate({ chatId }, { state: MENU_STATES.UNIT_1_TASK_1 });
            sendUnit1Task1(chatId);
            break;
        case english.unit1.task2:
            await User.findOneAndUpdate({ chatId }, { state: MENU_STATES.UNIT_1_TASK_2 });
            sendUnit1Task2(chatId);
            break;
        case 'back':
            await User.findOneAndUpdate({ chatId }, { state: currentState });
            sendMainMenu(chatId);
            break;
        default:
            break;
    }
}


async function sendUnit1Task1(chatId) {
    try {
        const user = await User.findOne({ chatId });
        if (user.state !== MENU_STATES.UNIT_1_TASK_1) {
            return;
        }

        const keyboardOptions = [['Text', 'Audio'], ['Exam', 'Back']];
        const replyMarkup = {
            keyboard: keyboardOptions,
            resize_keyboard: true,
        };

        bot.sendMessage(chatId, 'Unit 1 - Task 1 Content', {
            reply_markup: replyMarkup,
        });
    } catch (error) {
        console.error('Error sending unit 1 task 1:', error);
    }
}

async function sendUnit1Task2(chatId) {
    try {
        const user = await User.findOne({ chatId });
        if (user.state !== MENU_STATES.UNIT_1_TASK_2) {
            return;
        }

        const keyboardOptions = [['Text', 'Audio'], ['Exam', 'Back']];
        const replyMarkup = {
            keyboard: keyboardOptions,
            resize_keyboard: true,
        };

        bot.sendMessage(chatId, 'Unit 1 - Task 2 Content', {
            reply_markup: replyMarkup,
        });
    } catch (error) {
        console.error('Error sending unit 1 task 2:', error);
    }
}

async function handleUnit1Task1(chatId, text) {
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
            await User.findOneAndUpdate({ chatId }, { state: MENU_STATES.UNIT_1 });
            sendUnit1Menu(chatId);
            break;
        default:
            break;
    }
}

async function handleUnit1Task2(chatId, text) {
    switch (text) {
        case 'Text':
            bot.sendMessage(chatId, 'Text example!');
            break;
        case 'Audio':
            bot.sendMessage(chatId, 'Audio example!');
            bot.sendAudio(chatId, __dirname + '/audios/02.mp3')
                .then(() => {
                    console.log('Audio sent successfully');
                })
                .catch((error) => {
                    console.error('Error sending audio:', error);
                });
            break;
        case 'Exam':
            bot.sendMessage(chatId, 'Exam example!');
            break;
        case 'Back':
            await User.findOneAndUpdate({ chatId }, { state: MENU_STATES.UNIT_1 });
            sendUnit1Menu(chatId);
            break;
        default:
            break;
    }
}

async function sendUnit2Menu(chatId) {
    try {
        const user = await User.findOne({ chatId });
        if (user.state !== MENU_STATES.UNIT_2) {
            return;
        }

        bot.sendMessage(chatId, 'Unit 2 Menu', {
            reply_markup: {
                keyboard: [[english.unit2.task1, english.unit2.task2], ['back']],
                resize_keyboard: true,
            },
        });
    } catch (error) {
        console.error('Error sending unit 2 menu:', error);
    }
}

async function sendUnit2Task1(chatId) {
    try {
        const user = await User.findOne({ chatId });
        if (user.state !== MENU_STATES.UNIT_2_TASK_1) {
            return;
        }

        const keyboardOptions = [['Text', 'Audio'], ['Exam', 'Back']];
        const replyMarkup = {
            keyboard: keyboardOptions,
            resize_keyboard: true,
        };

        bot.sendMessage(chatId, 'Unit 2 - Task 1 Content', {
            reply_markup: replyMarkup,
        });
    } catch (error) {
        console.error('Error sending unit 2 task 1:', error);
    }
}

async function sendUnit2Task2(chatId) {
    try {
        const user = await User.findOne({ chatId });
        if (user.state !== MENU_STATES.UNIT_2_TASK_2) {
            return;
        }

        const keyboardOptions = [['Text', 'Audio'], ['Exam', 'Back']];
        const replyMarkup = {
            keyboard: keyboardOptions,
            resize_keyboard: true,
        };

        bot.sendMessage(chatId, 'Unit 2 - Task 2 Content', {
            reply_markup: replyMarkup,
        });
    } catch (error) {
        console.error('Error sending unit 2 task 2:', error);
    }
}

async function handleUnit2Menu(chatId, text, currentState) {
    switch (text) {
        case english.unit2.task1:
            await User.findOneAndUpdate({ chatId }, { state: MENU_STATES.UNIT_2_TASK_1 });
            sendUnit2Task1(chatId);
            break;
        case english.unit2.task2:
            await User.findOneAndUpdate({ chatId }, { state: MENU_STATES.UNIT_2_TASK_2 });
            sendUnit2Task2(chatId);
            break;
        case 'back':
            await User.findOneAndUpdate({ chatId }, { state: currentState });
            sendMainMenu(chatId);
            break;
        default:
            break;
    }
}


async function handleUnit2Task1(chatId, text) {
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
            await User.findOneAndUpdate({ chatId }, { state: MENU_STATES.UNIT_1 });
            sendUnit2Menu(chatId);
            break;
        default:
            break;
    }
}

async function handleUnit2Task2(chatId, text) {
    switch (text) {
        case 'Text':
            bot.sendMessage(chatId, 'Text example!');
            break;
        case 'Audio':
            bot.sendMessage(chatId, 'Audio example!');
            bot.sendAudio(chatId, __dirname + '/audios/04.mp3')
                .then(() => {
                    console.log('Audio sent successfully');
                })
                .catch((error) => {
                    console.error('Error sending audio:', error);
                });
            break;
        case 'Exam':
            bot.sendMessage(chatId, 'Exam example!');
            break;
        case 'Back':
            await User.findOneAndUpdate({ chatId }, { state: MENU_STATES.UNIT_1 });
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
    const update = req.body;
    bot.processUpdate(req.body);
    res.sendStatus(200);
});

app.get('/ping', (req, res) => res.send('pong'));

app.listen(port, () => {
    console.log(`Web server is listening on port ${port}`);
});