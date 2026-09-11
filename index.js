const mineflayer = require('mineflayer');
const express = require('express');

// --- 1. سيرفر HTTP لضمان استمرار التشغيل 24/7 على Railway ---
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('Minecraft Bot with Auto-Login is Active 24/7!');
});

app.listen(PORT, () => {
    console.log(`Keep-Alive HTTP server running on port ${PORT}`);
});

// --- 2. إعدادات البوت والباسورد ---
const botOptions = {
    host: 'Progamer-Smp.aternos.me',
    port: 29801,
    username: 'ProBot_247',
    version: false
};

// الباسورد الخاص بالبوت في السيرفر (غيره لو تحب)
const PASSWORD = 'MyBotPassword123';

let bot;
let actionInterval;

function createBot() {
    console.log('جاري الاتصال بالسيرفر...');
    bot = mineflayer.createBot(botOptions);

    // عند دخول السيرفر بنجاح
    bot.on('spawn', () => {
        console.log('دخل البوت السيرفر، جاري إرسال أوامر التسجيل...');

        // كتابة أواامر التسجيل والدخول تلقائياً فور الدخول
        setTimeout(() => {
            bot.chat(`/register ${PASSWORD} ${PASSWORD}`);
            bot.chat(`/login ${PASSWORD}`);
        }, 1500);

        // بدء الأنشطة العشوائية لمنع الـ AFK
        if (actionInterval) clearInterval(actionInterval);
        actionInterval = setInterval(() => {
            performRandomAction();
        }, 7000);
    });

    // --- 3. الأفعال العشوائية (قفز، تحرك، كسر) ---
    async function performRandomAction() {
        if (!bot || !bot.entity) return;

        const actions = ['jump', 'move', 'look', 'breakBlock'];
        const randomAction = actions[Math.floor(Math.random() * actions.length)];

        try {
            switch (randomAction) {
                case 'jump':
                    bot.setControlState('jump', true);
                    setTimeout(() => bot.setControlState('jump', false), 500);
                    break;

                case 'move':
                    const dir = Math.random() > 0.5 ? 'forward' : 'back';
                    bot.setControlState(dir, true);
                    setTimeout(() => bot.setControlState(dir, false), 1200);
                    break;

                case 'look':
                    const yaw = Math.random() * Math.PI * 2;
                    const pitch = (Math.random() - 0.5) * Math.PI;
                    await bot.look(yaw, pitch, true);
                    break;

                case 'breakBlock':
                    const targetBlock = bot.blockAt(bot.entity.position.offset(0, 0, 1));
                    if (targetBlock && targetBlock.name !== 'air' && targetBlock.name !== 'bedrock') {
                        if (bot.canDigBlock(targetBlock)) {
                            await bot.dig(targetBlock);
                        }
                    } else {
                        bot.setControlState('jump', true);
                        setTimeout(() => bot.setControlState('jump', false), 400);
                    }
                    break;
            }
        } catch (err) {
            // تجاهل الأخطاء البسيطة
        }
    }

    // --- 4. إعادة الاتصال الهادئ عند الخروج ---
    bot.on('end', (reason) => {
        console.warn(`تم فصل الاتصال (${reason}). إعادة المحاولة بعد 10 ثوانٍ...`);
        if (actionInterval) clearInterval(actionInterval);
        setTimeout(createBot, 10000);
    });

    bot.on('error', (err) => {
        console.error('خطأ في الاتصال:', err.message);
    });
}

// منع انهيار التطبيق
process.on('unhandledRejection', err => console.error('Unhandled Error:', err));
process.on('uncaughtException', err => console.error('Uncaught Error:', err));

// تشغيل البوت
createBot();
