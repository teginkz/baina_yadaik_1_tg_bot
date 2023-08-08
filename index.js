const TelegramBot = require('node-telegram-bot-api');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');

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
bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    // Your custom logic to handle messages
    // For example, you can send a reply:
    bot.sendMessage(chatId, `You said: ${text}`);
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
