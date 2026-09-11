const mineflayer = require('mineflayer');
const express = require('express');

// --- 1. سيرفر HTTP لضمان استمرار التشغيل على Railway ---
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('Advanced Anti-AFK Bot is Active!');
});

app.listen(PORT, () => console.log(`Keep-Alive running on port ${PORT}`));

// --- 2. إعدادات السيرفر ---
const botOptions = {
    host: 'Progamer-Smp.aternos.me',
    port: 29801,
    username: 'ProBot_247',
    version: false
};

const PASSWORD = 'MyBotPassword123';
let bot;
let actionTimeout;

function createBot() {
    console.log('جاري الاتصال بالسيرفر...');
    bot = mineflayer.createBot(botOptions);

    bot.on('spawn', () => {
        console.log('دخل البوت السيرفر بنجاح!');

        // تسجيل الدخول
        setTimeout(() => {
            bot.chat(`/register ${PASSWORD} ${PASSWORD}`);
            bot.chat(`/login ${PASSWORD}`);
        }, 2000);

        // بدء نظام الحركة العشوائي المتغير
        scheduleNextAction();
    });

    // --- 3. نظام حركة عشوائي غير منتظم (محاكاة الإنسان) ---
    function scheduleNextAction() {
        // وقت عشوائي بين كل حركة والتانية (بين 5 إلى 20 ثانية)
        const randomDelay = Math.floor(Math.random() * (20000 - 5000)) + 5000;

        actionTimeout = setTimeout(async () => {
            if (bot && bot.entity) {
                await performHumanAction();
            }
            scheduleNextAction(); // جدولة الحركة التالية
        }, randomDelay);
    }

    async function performHumanAction() {
        const actions = ['jump', 'sneak', 'lookAround', 'walk', 'swingArm'];
        const chosenAction = actions[Math.floor(Math.random() * actions.length)];

        try {
            switch (chosenAction) {
                case 'jump':
                    bot.setControlState('jump', true);
                    setTimeout(() => bot.setControlState('jump', false), 400);
                    break;

                case 'sneak':
                    bot.setControlState('sneak', true);
                    setTimeout(() => bot.setControlState('sneak', false), 1000);
                    break;

                case 'lookAround':
                    const yaw = (Math.random() * 360 - 180) * (Math.PI / 180);
                    const pitch = (Math.random() * 90 - 45) * (Math.PI / 180);
                    await bot.look(yaw, pitch, true);
                    break;

                case 'walk':
                    const dir = Math.random() > 0.5 ? 'forward' : 'back';
                    bot.setControlState(dir, true);
                    setTimeout(() => bot.setControlState(dir, false), Math.floor(Math.random() * 1500) + 500);
                    break;

                case 'swingArm':
                    bot.swingArm('right');
                    break;
            }
        } catch (e) {
            // تجاهل الأخطاء العابرة
        }
    }

    // --- 4. معالجة الخروج وإعادة الدخول التلقائي ---
    bot.on('end', (reason) => {
        console.warn(`تم فصل الاتصال: ${reason}. إعادة الاتصال خلال 15 ثانية...`);
        if (actionTimeout) clearTimeout(actionTimeout);
        setTimeout(createBot, 15000);
    });

    bot.on('error', (err) => {
        console.error('خطأ في الاتصال:', err.message);
    });
}

// حماية من انهيار السيرفر
process.on('unhandledRejection', err => console.error('Unhandled Error:', err));
process.on('uncaughtException', err => console.error('Uncaught Error:', err));

createBot();
