// Обработчик записи: сайт (GitHub Pages) → эта функция (Vercel) → Telegram администратору.
// Ключ бота и id чата лежат только в настройках Vercel (Environment Variables), в коде их нет:
//   TELEGRAM_BOT_TOKEN — ключ от @BotFather
//   TELEGRAM_CHAT_ID   — кому присылать заявки (свой id можно узнать у @userinfobot)

// С каких сайтов принимаем заявки
const ALLOWED_ORIGINS = [
  'https://dima1playnsk-bot.github.io',
  'http://127.0.0.1:8123',
  'http://localhost:8123',
];

const LIMITS = { service: 80, barber: 60, date: 20, time: 10, name: 60, phone: 30, comment: 500, source: 120 };

// Telegram показывает сообщение как HTML — экранируем всё, что ввёл человек
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function clean(body) {
  const out = {};
  for (const [key, max] of Object.entries(LIMITS)) {
    out[key] = typeof body[key] === 'string' ? body[key].trim().slice(0, max) : '';
  }
  out.price = Number.isFinite(body.price) ? Math.round(body.price) : null;
  out.duration = Number.isFinite(body.duration) ? Math.round(body.duration) : null;
  return out;
}

export default async function handler(req, res) {
  const origin = req.headers.origin || '';
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'method' });
  if (!ALLOWED_ORIGINS.includes(origin)) return res.status(403).json({ ok: false, error: 'origin' });

  const { TELEGRAM_BOT_TOKEN: token, TELEGRAM_CHAT_ID: chatId } = process.env;
  if (!token || !chatId) return res.status(500).json({ ok: false, error: 'not-configured' });

  const body = typeof req.body === 'object' && req.body ? req.body : {};

  // Ловушка для спам-ботов: это поле скрыто от людей, его заполняют только роботы
  if (body.website) return res.status(200).json({ ok: true });

  const b = clean(body);
  if (b.name.length < 2 || b.phone.replace(/\D/g, '').length !== 11 || !b.service || !b.date || !b.time) {
    return res.status(400).json({ ok: false, error: 'invalid' });
  }

  const lines = [
    '✂️ <b>Новая запись</b>',
    '',
    `<b>${esc(b.service)}</b>${b.price ? ` — ${b.price} ₽` : ''}${b.duration ? `, ${b.duration} мин` : ''}`,
    `Мастер: ${esc(b.barber || 'любой')}`,
    `Когда: ${esc(b.date)} в ${esc(b.time)}`,
    '',
    `Гость: ${esc(b.name)}`,
    `Телефон: ${esc(b.phone)}`,
    b.comment ? `Комментарий: ${esc(b.comment)}` : '',
    b.source ? `Откуда: ${esc(b.source)}` : '',
  ].filter((l, i, a) => l || a[i - 1]); // убираем пустые строки подряд

  try {
    const tg = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: lines.join('\n'), parse_mode: 'HTML' }),
    });
    if (!tg.ok) return res.status(502).json({ ok: false, error: 'telegram' });
    return res.status(200).json({ ok: true });
  } catch (_) {
    return res.status(502).json({ ok: false, error: 'telegram' });
  }
}
