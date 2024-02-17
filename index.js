const { Telegraf } = require('telegraf')
const { message } = require('telegraf/filters')
const axios = require('axios');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const sharp = require('sharp');
const nodeHtmlToImage = require('node-html-to-image');
const html2canvas = require('html2canvas');
const htmlToImage = require('html-to-image');
const sanitizeHtml = require('sanitize-html');
const { create } = require('html-pdf');
const { createReadStream } = require('fs');
const { URLSearchParams } = require('url');
const { fromPath } = require('pdf2pic');

const bot = new Telegraf('6560704523:AAE9a6vWJ4C-11OMI_QYcLH_NZqk_XSId9c');

bot.start((ctx) => ctx.reply('Привет чепушня, введи /меню для запуска меню со списком команд <3'))

bot.hears('/пляж', async (ctx) => {
    await ctx.replyWithPhoto({url: 'https://i.ibb.co/sjLh7gg/image.png'});
});

bot.hears('/еблоутиное', async (ctx) => {
    await ctx.replyWithPhoto({url: 'https://i.ibb.co/19xDPJ7/image.png'});
});

bot.hears('/осадки', async (ctx) => {
    ctx.reply('Ожидается небольшая облачность:')
    await ctx.replyWithPhoto({url: 'https://i.ibb.co/qpzdPBG/image.png'});
});

bot.hears('/list', async (ctx) => {
    await ctx.replyWithHTML('<b>Вот команды бота:</b> \n\n<b>1.</b> /пляж; \n<b>2.</b> /погода; \n<b>3.</b> /еблоутиное; \n<b>4.</b> /расписание;\n<b>5.</b> /осадки.');
});

bot.hears('/погода', async (ctx) => {
    await ctx.reply('Отправьте свою геопозицию при помощи скрепки: ')
});

bot.hears('/help', async (ctx) => {
    await ctx.replyWithHTML('<b>Пропиши /list!</b>');
});

const takeScreenshot = async (url, outputFileName) => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);
    await page.setViewport({ width: 1920, height: 1080 });
    await page.screenshot({ path: outputFileName });

    await browser.close();
}

// ----------MENU-----------
bot.hears('/меню', async (ctx) => {
    const menu = {
        reply_markup: {
            keyboard: [
                [{ text: '/расписание' }, { text: '/осадки' }],
                [{ text: '/еблоутиное' }, { text: '/погода' }],
                [{ text: '/пляж' }]
            ],
            resize_keyboard: true
        }
    };
    await ctx.reply('Выберите команду:', menu);
});
// ---------MENU---------

bot.hears('/расписание', async (ctx) => {
    const formData = new URLSearchParams();

    // Создаем объект Date для текущей даты
    const currentDate = new Date();

    // Устанавливаем dt1 в текущую дату
    formData.append('dt1', currentDate.toISOString().slice(0, 10));

    // Создаем объект Date для текущей даты плюс 7 дней
    const futureDate = new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000);

    // Устанавливаем dt2 на неделю вперед от dt1
    formData.append('dt2', futureDate.toISOString().slice(0, 10));

    formData.append('gruppa', '354д');

    try {
        const response = await fetch('http://ntgmk.ru/program/rasp3.php', {
            method: 'POST',
            body: formData
        });
        const htmlCode = await response.text();

        // Конвертируем HTML в PDF
        create(htmlCode).toBuffer((err, buffer) => {
            if (err) {
                console.error('Ошибка при создании PDF:', err);
                ctx.reply('Произошла ошибка при создании PDF.');
                return;
            }
            // Отправляем PDF как документ
            ctx.replyWithPhoto({ source: buffer, filename: 'расписание 354д' });
        });
    } catch (error) {
        console.error('Ошибка:', error);
        ctx.reply('Произошла ошибка при получении расписания.');
    }
});

bot.on('message', async (ctx)=>{
    if (ctx.message.location){
        console.log(ctx.message.location);
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${ctx.message.location.latitude}&lon=${ctx.message.location.longitude}&appid=31de6c1e9982ea547186a5d0c260ed8b`;
        const response = await axios.get(url);
        const temperatureCelsius = response.data.main.temp - 273.15; // Конвертация из Кельвинов в градусы Цельсия
        ctx.reply(`${response.data.name}: ${temperatureCelsius.toFixed(1)}°C`);
    }
});
bot.launch()

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))