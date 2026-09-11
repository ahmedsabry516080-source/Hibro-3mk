const mineflayer = require('mineflayer');
const express = require('express');

// --- 1. سيرفر HTTP لضمان استمرار تشغيل المشروع 24/7 على Railway ---
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('Minecraft Bot is Active 24/7!');
});

app.listen(PORT, () => {
    console.log(`Keep-Alive HTTP server running on port ${PORT}`);
});

// --- 2. إعدادات البوت وسيرفر ماين كرافت الخاص بك ---
const botOptions = {
    host: 'Progamer-Smp.aternos.me',
    port: 29801,
    username: 'ProBot_247',
    version: false
};

let bot;
let actionInterval;

function createBot() {
    console.log('جاري محاولة الاتصال بالسيرفر...');
    bot = mineflayer.createBot(botOptions);

    // عند دخول السيرفر بنجاح
    bot.on('spawn', () => {
        console.log('تم دخول البوت السيرفر بنجاح وهو الآن نشيط!');

        // حركة ومحاكاة نشاط عشوائي كل 7 ثوانٍ لمنع الـ AFK
        if (actionInterval) clearInterval(actionInterval);
        actionInterval = setInterval(() => {
            performRandomAction();
        }, 7000);
    });

    // --- 3. الأفعال العشوائية (قفز، تحرك، قف، كسر) ---
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
            // تجاهل أخطاء الحركة البسيطة
        }
    }

    // --- 4. إعادة الاتصال الهادئ عند الخروج دون عمل Restart للمشروع ---
    bot.on('end', (reason) => {
        console.warn(`تم فصل الاتصال (${reason}). جاري إعادة المحاولة بعد 10 ثوانٍ...`);
        if (actionInterval) clearInterval(actionInterval);
        setTimeout(createBot, 10000);
    });

    bot.on('error', (err) => {
        console.error('خطأ في الاتصال:', err.message);
    });
}

// منع انهيار البرنامج عند حدوث أي خطأ غير متوقع
process.on('unhandledRejection', err => console.error('Unhandled Error:', err));
process.on('uncaughtException', err => console.error('Uncaught Error:', err));

// تشغيل البوت
createBot();
