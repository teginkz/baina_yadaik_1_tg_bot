import mongoose from 'mongoose';
const { Schema } = mongoose;
const User = mongoose.model('User', userSchema);

mongoose.connect('mongodb://localhost:27017/telegramBot/', { useNewUrlParser: true, useUnifiedTopology: true });


const userSchema = new mongoose.Schema({
    chatId: Number,
    state: String,
});

let newState;

switch (currentState) {
    case MENU_STATES.UNIT_1_TASK_1:
    case MENU_STATES.UNIT_1_TASK_2:
        newState = MENU_STATES.UNIT_1;
        break;
    case MENU_STATES.UNIT_2_TASK_1:
    case MENU_STATES.UNIT_2_TASK_2:
        newState = MENU_STATES.UNIT_2;
        break;
    default:
        newState = MENU_STATES.MAIN_MENU;
        break;
}

userState.set(chatId, newState);
handleStateTransition(chatId);

const chatId = msg.chat.id;
const userMsg = msg.text;

User.findOne({ chatId: chatId }, (err, user) => {
    if (err) {
        console.error('Error finding user:', err);
        return;
    }

    const currentState = user ? user.state : MENU_STATES.MAIN_MENU;
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