const express = require('express');
const { Chat } = require('../models/chat');
const { userAuth } = require('../middlewares/auth'); 

const chatRouter = express.Router();

chatRouter.get('/chat/:targetUserId', userAuth, async (req, res) => {
    const { targetUserId } = req.params;
    const userId = req.user._id;

    try {
        if (!targetUserId) {
            return res.status(400).json({ error: 'Target user ID is required' });
        }

        
        if (userId.toString() === targetUserId) {
            return res.status(400).json({ error: 'Cannot create a chat with yourself' });
        }

        let chat = await Chat.findOne({
            participants: { $all: [userId, targetUserId] },
        });

        if (!chat) {
            chat = new Chat({
                participants: [userId, targetUserId],
                messages: [],
            });
            await chat.save();
        }

        res.status(200).json(chat);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' }); // ✅ Always send a response
    }
});

module.exports = { chatRouter };