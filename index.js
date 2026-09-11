const mineflayer = require('mineflayer');
const { pathfinder, movements, goals } = require('mineflayer-pathfinder');
const express = require('express');

// --- 1. سيرفر HTTP للبقاء يعمل 24/7 على Railway ---
const app = express();
const PORT = process.env.PORT || 3000;
app.get('/', (req, res) => res.send('Smart Minecraft Bot is Online!'));
app.listen(PORT, () => console.log(`Keep-Alive server active on port ${PORT}`));

// --- 2. إعدادات الاتصال ---
const botOptions = {
    host: process.env.MC_HOST || Progamer-Smp.aternos.me',
    port: parseInt(process.env.MC_PORT) || 29801,
    username: process.env.MC_USERNAME || 'isad',
    version: false
};

let bot;

function createSmartBot() {
    console.log('جاري الاتصال بالسيرفر...');
    bot = mineflayer.createBot(botOptions);

    // تحميل إضافة التحرك الذكي (Pathfinder)
    bot.loadPlugin(pathfinder);

    bot.on('spawn', () => {
        console.log('دخل البوت السيرفر بنجاح وهو جاهز للعمل!');
        
        // إعداد قوانين الحركة للبوت (يقدر ينزل درج، يقفز، يكسر البلوكات لو محشور)
        const defaultMove = new movements(bot);
        defaultMove.canDig = false; // خليه true لو عايزه يكسر البلوكات وهو ماشي
        bot.pathfinder.setMovements(defaultMove);
    });

    // --- 3. الذكاء التفاعلي (الشات والأوامر) ---
    bot.on('chat', (username, message) => {
        if (username === bot.username) return; // ignore self

        const msg = message.toLowerCase();

        // أمر التتبع: يجيلك لحد عندك بطريقة ذكية
        if (msg === 'تعال' || msg === 'come') {
            const player = bot.players[username];
            if (!player || !player.entity) {
                bot.chat(`أنا مش شايفك يا ${username}! قرب مني.`);
                return;
            }
            bot.chat(`أنا جاي لك يا ${username}...`);
            const target = player.entity.position;
            bot.pathfinder.setGoal(new goals.GoalFollow(player.entity, 1));
        }

        // أمر التوقف
        if (msg === 'اثبت' || msg === 'stop') {
            bot.chat('حاضر، وقفت مكانى.');
            bot.pathfinder.setGoal(null);
        }

        // إجابة ذكية على التحية
        if (msg.includes('هلا') || msg.includes('سلام')) {
            bot.chat(`أهلاً بك يا ${username}! اكتب "تعال" عشان أجيلك، أو "اثبت" عشان أقف.`);
        }
    });

    // --- 4. الدفاع الذكي عن النفس (Self Defense) ---
    bot.on('entityHurt', (entity) => {
        // لو البوت تعرض للهجوم
        if (entity === bot.entity) {
            bot.chat('أنا بتعرض للهجوم!');
        }
    });

    // --- 5. التعامل مع الانقطاع والهبوط الهدوء (Auto Reconnect) ---
    bot.on('end', (reason) => {
        console.warn(`تم الفصل (السبب: ${reason}). جاري إعادة الاتصال بعد 10 ثوانٍ...`);
        setTimeout(createSmartBot, 10000);
    });

    bot.on('error', (err) => console.error('خطأ في الاتصال:', err.message));
}

// التغلب على أخطاء الانهيار غير المتوقعة
process.on('unhandledRejection', err => console.error('Unhandled Error:', err));
process.on('uncaughtException', err => console.error('Uncaught Error:', err));

// تشغيل البوت
createSmartBot();


