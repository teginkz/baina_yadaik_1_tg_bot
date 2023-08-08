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
const webhookUrl = 'https://9976-178-91-115-127.ngrok-free.app/tgwebhook'; // Replace with your actual webhook URL
bot.setWebHook(webhookUrl);

// Handle incoming messages
// ... Import necessary modules and set up bot ...

bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;

    const options = {
        reply_markup: {
            keyboard: [
                [arabic.unit1.mainTitle]
            ],
            resize_keyboard: true,
            one_time_keyboard: true,
        },
    };

    bot.sendMessage(chatId, 'Welcome to the menu!', options);
});

bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    switch (text) {
        case 'Option 1':
            // Send a text message
            bot.sendMessage(chatId, 'You selected Option 1. Here is your audio:');

            // Send an audio file (MP3)
            bot.sendAudio(chatId, __dirname + '/audios/01.mp3')
                .then(() => {
                    console.log('Audio sent successfully');
                })
                .catch((error) => {
                    console.error('Error sending audio:', error);
                });
            break;
        case 'Option 2':
            bot.sendMessage(chatId, 'You selected Option 2');
            break;
        case 'Option 3':
            bot.sendMessage(chatId, 'You selected Option 3');
            break;
        case 'Option 4':
            bot.sendMessage(chatId, 'You selected Option 4');
            break;
        case 'Help':
            bot.sendMessage(chatId, 'This is the help message.');
            break;
        default:
            bot.sendMessage(chatId, 'I do not understand your choice.');
            break;
    }
});

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
