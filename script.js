'use strict';

/* ===== Данные ===== */
const TZ = 'Asia/Novosibirsk';
const OPEN_H = 10;
const CLOSE_H = 22;
const STEP_MIN = 30;

const IMG = (id, w = 600) => `https://images.unsplash.com/${id}?w=${w}&q=70&auto=format&fit=crop`;

const CATS = { hair: 'Стрижки', beard: 'Борода и бритьё', combo: 'Комплексы', kids: 'Детям' };

// price: [барбер, топ-барбер]
const SERVICES = [
  // top: показываем во вкладке «Все» до нажатия «Показать все услуги»
  { id: 'haircut', cat: 'hair', name: 'Мужская стрижка', desc: 'Консультация, ножницы и машинка, мытьё головы, укладка', dur: 60, price: [1800, 2300], hit: true, top: true },
  { id: 'fade', cat: 'hair', name: 'Фейд', desc: 'Плавный переход от кожи, чёткий контур, укладка', dur: 60, price: [2000, 2500], top: true },
  { id: 'buzz', cat: 'hair', name: 'Стрижка машинкой', desc: 'Одна-две насадки и окантовка, без укладки', dur: 30, price: [1100, 1400] },
  { id: 'long', cat: 'hair', name: 'Удлинённая стрижка', desc: 'Для волос длиннее 10 см: ножницы, филировка, укладка', dur: 90, price: [2200, 2700] },
  { id: 'beard', cat: 'beard', name: 'Моделирование бороды', desc: 'Форма, контур опасной бритвой, распаривание, масло', dur: 30, price: [1200, 1500], top: true },
  { id: 'shave', cat: 'beard', name: 'Королевское бритьё', desc: 'Горячие полотенца, опасная бритва, охлаждающий компресс', dur: 60, price: [1900, 2300], top: true },
  { id: 'grey', cat: 'beard', name: 'Камуфляж седины', desc: 'Тонирование волос или бороды в естественный оттенок', dur: 30, price: [1200, 1200] },
  { id: 'combo', cat: 'combo', name: 'Стрижка + борода', desc: 'Полный образ за один визит', dur: 90, price: [2800, 3400], hit: true, top: true },
  { id: 'fatherson', cat: 'combo', name: 'Отец + сын', desc: 'Две стрижки в соседних креслах, сыну до 12 лет', dur: 60, price: [3000, 3600], seats: 2, top: true },
  { id: 'ritual', cat: 'combo', name: 'Полный ритуал', desc: 'Стрижка, королевское бритьё, камуфляж седины, уход за лицом', dur: 150, price: [4900, 5800] },
  { id: 'kids', cat: 'kids', name: 'Детская стрижка', desc: 'С 4 до 12 лет, мультики на планшете', dur: 30, price: [1300, 1600] },
];

const BARBERS = [
  { id: 'artem', name: 'Артём Кузнецов', short: 'Артём', dative: 'Артёму', gen: 'Артёма', tier: 1, role: 'Топ-барбер, основатель', exp: '11 лет', spec: 'Классические стрижки и королевское бритьё опасной бритвой', rating: '5,0', reviews: 312, img: 'photo-1506794778202-cad84cf45f1d' },
  { id: 'ilya', name: 'Илья Морозов', short: 'Илья', dative: 'Илье', gen: 'Ильи', tier: 1, role: 'Топ-барбер', exp: '8 лет', spec: 'Фейды, текстурный кроп, стрижки под кудрявые волосы', rating: '4,9', reviews: 264, img: 'photo-1500648767791-00dcc994a43e' },
  { id: 'timur', name: 'Тимур Галиев', short: 'Тимур', dative: 'Тимуру', gen: 'Тимура', tier: 0, role: 'Барбер', exp: '5 лет', spec: 'Бороды любой длины, камуфляж седины', rating: '4,9', reviews: 187, img: 'photo-1507003211169-0a1dd7228f2d' },
  { id: 'nikita', name: 'Никита Белов', short: 'Никита', dative: 'Никите', gen: 'Никиты', tier: 0, role: 'Барбер', exp: '3 года', spec: 'Детские и удлинённые стрижки', rating: '4,8', reviews: 107, img: 'photo-1539571696357-5a69c17a67c6' },
];

/* ===== Утилиты ===== */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const rub = n => n.toLocaleString('ru-RU') + ' ₽';
const durText = m => (m >= 60 ? `${Math.floor(m / 60)} ч${m % 60 ? ' ' + (m % 60) + ' мин' : ''}` : `${m} мин`);
const plural = (n, [one, few, many]) => {
  const a = n % 10, b = n % 100;
  if (a === 1 && b !== 11) return one;
  if (a >= 2 && a <= 4 && (b < 12 || b > 14)) return few;
  return many;
};
const DOW = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
const MONTHS = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
const svc = id => SERVICES.find(s => s.id === id);
const barberById = id => BARBERS.find(b => b.id === id);
const toMin = t => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
const toTime = m => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;

// Текущее время в Новосибирске, независимо от часового пояса посетителя
function nskNow() {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
      .formatToParts(new Date()).map(x => [x.type, x.value])
  );
  return { key: `${p.year}-${p.month}-${p.day}`, min: +p.hour * 60 + +p.minute };
}
function addDays(key, n) {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
}
function dayInfo(key) {
  const [y, m, d] = key.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return { dow: dt.getUTCDay(), d, m: m - 1, y };
}
function dayLabel(key) {
  const today = nskNow().key;
  if (key === today) return 'сегодня';
  if (key === addDays(today, 1)) return 'завтра';
  const { d, m, dow } = dayInfo(key);
  return `${DOW[dow].toLowerCase()}, ${d} ${MONTHS[m]}`;
}

/* ===== Расписание (демо) =====
   Занятость генерируется детерминированно, чтобы при перезагрузке картина не менялась.
   Когда появится бэкенд или Telegram-бот, заменить isBusy() на реальные данные. */
function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
const BOOKINGS_KEY = 'ob_bookings';
function loadBookings() {
  try { return JSON.parse(localStorage.getItem(BOOKINGS_KEY) || '[]'); } catch (_) { return []; }
}
// Время, которое посетитель уже занял сам, тоже считается занятым
let ownBusy = new Set();
function rebuildOwnBusy() {
  ownBusy = new Set();
  loadBookings().forEach(b => {
    if (!b.barberId) return;
    for (let t = toMin(b.time); t < toMin(b.time) + b.duration; t += STEP_MIN) ownBusy.add(`${b.date}|${b.barberId}|${t}`);
  });
}
const isBusy = (dateKey, barberId, minute) =>
  ownBusy.has(`${dateKey}|${barberId}|${minute}`) || hash(`${dateKey}|${barberId}|${minute}`) % 100 < 30;

function freeBarbers(dateKey, startMin, dur) {
  const now = nskNow();
  if (dateKey === now.key && startMin < now.min + 30) return [];
  if (startMin + dur > CLOSE_H * 60) return [];
  return BARBERS.filter(b => {
    for (let t = startMin; t < startMin + dur; t += STEP_MIN) if (isBusy(dateKey, b.id, t)) return false;
    return true;
  });
}
// seats: сколько кресел нужно одновременно («Отец + сын» занимает два)
function slotsFor(dateKey, barberSel, dur, seats = 1) {
  const out = [];
  for (let t = OPEN_H * 60; t + dur <= CLOSE_H * 60; t += STEP_MIN) {
    const free = freeBarbers(dateKey, t, dur);
    const ok = free.length >= seats && (barberSel === 'any' || free.some(b => b.id === barberSel));
    out.push({ t, ok });
  }
  return out;
}
function nearestSlot(serviceId = 'haircut', barberSel = 'any') {
  const s = svc(serviceId);
  const today = nskNow().key;
  for (let i = 0; i < 14; i++) {
    const key = addDays(today, i);
    const slot = slotsFor(key, barberSel, s.dur, s.seats).find(x => x.ok);
    if (slot) return { key, t: slot.t };
  }
  return null;
}

/* ===== Шапка, меню, статус ===== */
const header = $('#header');
const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 20);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

const nav = $('#nav');
const burger = $('#burger');
function setMenu(open) {
  nav.classList.toggle('is-open', open);
  burger.setAttribute('aria-expanded', String(open));
  burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
  $('use', burger).setAttribute('href', open ? '#i-x' : '#i-menu'); // крестик показывает, как закрыть меню
}
burger.addEventListener('click', () => setMenu(!nav.classList.contains('is-open')));
nav.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });

function updateOpenStatus() {
  const { min } = nskNow();
  const el = $('#openStatus');
  const open = min >= OPEN_H * 60 && min < CLOSE_H * 60;
  el.textContent = open ? 'Открыто до 22:00' : 'Сейчас закрыто, откроемся в 10:00';
  el.classList.toggle('is-open', open);
}

/* ===== Услуги и цены ===== */
// Сначала открыта вкладка «Популярные»: 3 услуги, которые берут чаще всего. Полный прайс — во вкладке «Все».
const POPULAR = ['haircut', 'combo', 'fade'];
const priceState = { cat: 'popular' };
function renderPrices() {
  const { cat } = priceState;
  const list = cat === 'popular' ? POPULAR.map(id => SERVICES.find(s => s.id === id))
    : SERVICES.filter(s => cat === 'all' || s.cat === cat);
  $('#priceList').innerHTML = list.map(s => `
    <li class="price">
      <div class="price__info">
        <div class="price__name">${s.name}${s.hit ? '<span class="badge">Хит</span>' : ''}</div>
        <p class="price__desc">${s.desc}. <span class="price__dur">${durText(s.dur)}</span></p>
      </div>
      <p class="price__value"><small>Барбер</small>${rub(s.price[0])}</p>
      <p class="price__value price__value--top"><small>Топ-барбер</small>${rub(s.price[1])}</p>
      <button class="price__book" type="button" data-book data-service="${s.id}" aria-label="Записаться: ${s.name}">Записаться</button>
    </li>`).join('');
}
function bindToggleGroup(container, attr, onPick) {
  const btns = $$('button', container);
  btns.forEach((btn, i) => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.setAttribute(attr, String(b === btn)));
      onPick(btn);
    });
    btn.addEventListener('keydown', e => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      const next = btns[(i + (e.key === 'ArrowRight' ? 1 : -1) + btns.length) % btns.length];
      next.focus();
      next.click();
    });
  });
}
bindToggleGroup($('#serviceTabs'), 'aria-selected', b => { priceState.cat = b.dataset.cat; renderPrices(); });

/* ===== Барберы ===== */
function renderBarbers() {
  $('#barberList').innerHTML = BARBERS.map(b => `
    <article class="barber">
      <div class="barber__photo">
        <img loading="lazy" src="${IMG(b.img, 600)}" alt="${b.name}" width="600" height="750">
      </div>
      <div class="barber__body">
        <p class="barber__role">${b.role}, стаж ${b.exp}</p>
        <h3 class="barber__name">${b.name}</h3>
        <p class="barber__spec">${b.spec}</p>
        <p class="barber__rating"><span class="stars" aria-hidden="true">★</span> ${b.rating} (${b.reviews} ${plural(b.reviews, ['отзыв', 'отзыва', 'отзывов'])})</p>
        <p class="barber__free" data-free="${b.id}"></p>
      </div>
    </article>`).join('');
}

/* ===== Онлайн-запись ===== */
const dlg = $('#booking');
const bk = { step: 1, service: null, barber: null, date: null, time: null };
const TITLES = { 1: 'Выберите услугу', 2: 'Выберите мастера', 3: 'Дата и время', 4: 'Ваши контакты', 5: 'Онлайн-запись' };

function priceFor(serviceId, barberSel) {
  const s = svc(serviceId);
  if (!s) return '';
  // Любой свободный мастер всегда по цене барбера, даже если достанется топ-барбер
  if (!barberSel || barberSel === 'any') return rub(s.price[0]);
  return rub(s.price[barberById(barberSel).tier]);
}
function firstMissing() {
  if (!bk.service) return 1;
  if (!bk.barber) return 2;
  if (!bk.date || !bk.time) return 3;
  return 4;
}
function canNext() {
  return { 1: !!bk.service, 2: !!bk.barber, 3: !!(bk.date && bk.time), 4: true }[bk.step];
}

function renderServicesStep() {
  const groups = Object.entries(CATS).map(([cat, title]) => {
    const items = SERVICES.filter(s => s.cat === cat).map(s => `
      <button class="opt" type="button" role="radio" aria-checked="${bk.service === s.id}" data-pick-service="${s.id}">
        <span class="opt__main"><span class="opt__title">${s.name}${s.hit ? ' <span class="badge">Хит</span>' : ''}</span><span class="opt__sub">${durText(s.dur)}. ${s.desc}</span></span>
        <span class="opt__price">${priceFor(s.id, bk.barber)}</span>
      </button>`).join('');
    return `<p class="opt-group">${title}</p><div class="opt-list" role="radiogroup" aria-label="${title}">${items}</div>`;
  }).join('');
  $('#bkServices').innerHTML = groups;
}
function renderBarbersStep() {
  const any = `
    <button class="opt" type="button" role="radio" aria-checked="${bk.barber === 'any'}" data-pick-barber="any">
      <span class="opt__img opt__any"><svg class="ic" aria-hidden="true"><use href="#i-users"/></svg></span>
      <span class="opt__main"><span class="opt__title">Любой свободный мастер</span><span class="opt__sub">По цене барбера, даже если достанется топ</span></span>
      <span class="opt__price">${bk.service ? priceFor(bk.service, 'any') : ''}</span>
    </button>`;
  const list = BARBERS.map(b => {
    // Ближайшее время мастера под выбранную услугу, чтобы не перебирать мастеров вслепую
    const f = bk.service ? nearestSlot(bk.service, b.id) : null;
    const when = f ? `<br><span class="opt__free">свободен ${dayLabel(f.key)} в ${toTime(f.t)}</span>` : '';
    return `
    <button class="opt" type="button" role="radio" aria-checked="${bk.barber === b.id}" data-pick-barber="${b.id}">
      <img class="opt__img" src="${IMG(b.img, 120)}" width="48" height="48" alt="" loading="lazy">
      <span class="opt__main"><span class="opt__title">${b.name}</span><span class="opt__sub">${b.role}, ★&nbsp;${b.rating}${when}</span></span>
      <span class="opt__price">${bk.service ? priceFor(bk.service, b.id) : ''}</span>
    </button>`;
  }).join('');
  $('#bkBarbers').innerHTML = `<div class="opt-list" role="radiogroup" aria-label="Мастер">${any}${list}</div>`;
}
function renderDateStep() {
  const s = svc(bk.service);
  const today = nskNow().key;
  const days = Array.from({ length: 14 }, (_, i) => addDays(today, i));
  if (bk.date && !days.includes(bk.date)) { bk.date = null; bk.time = null; } // вкладка висела открытой после полуночи
  if (!bk.date) bk.date = days.find(k => slotsFor(k, bk.barber, s.dur, s.seats).some(x => x.ok)) || today;
  $('#bkDays').innerHTML = days.map((k, i) => {
    const { d, dow } = dayInfo(k);
    const top = i === 0 ? 'Сегодня' : i === 1 ? 'Завтра' : DOW[dow];
    const full = !slotsFor(k, bk.barber, s.dur, s.seats).some(x => x.ok);
    return `<button class="day${full ? ' is-full' : ''}" type="button" role="option" aria-selected="${bk.date === k}" data-pick-date="${k}"${full ? ' aria-label="' + d + ', мест нет"' : ''}><small>${top}</small><b>${d}</b>${full ? '<small>мест нет</small>' : ''}</button>`;
  }).join('');
  const slots = slotsFor(bk.date, bk.barber, s.dur, s.seats);
  const anyFree = slots.some(x => x.ok);
  $('#bkSlots').innerHTML = anyFree
    ? slots.map(x => `<button class="slot" type="button" role="option" ${x.ok ? '' : 'disabled'} aria-selected="${bk.time === toTime(x.t)}" data-pick-time="${toTime(x.t)}">${toTime(x.t)}</button>`).join('')
    : '<p class="slots__empty">На этот день свободного времени нет. Выберите другой день.</p>';
  const sel = $('.day[aria-selected="true"]', dlg);
  if (sel) sel.scrollIntoView({ block: 'nearest', inline: 'nearest' });
}

function renderSummary() {
  const el = $('#bkSummary');
  if (!bk.service) {
    el.innerHTML = bk.barber && bk.barber !== 'any'
      ? `<b>${barberById(bk.barber).name}</b><span>Выберите услугу</span>`
      : '<span>Ничего не выбрано</span>';
    return;
  }
  const s = svc(bk.service);
  const who = bk.barber ? (bk.barber === 'any' ? 'Любой мастер' : barberById(bk.barber).short) : '';
  const when = bk.date && bk.time ? `${dayLabel(bk.date)}, ${bk.time}` : '';
  el.innerHTML = `<b>${s.name}</b><span class="gold">${priceFor(bk.service, bk.barber)}</span>${[who, when].filter(Boolean).map(x => ', ' + x).join('')}`;
}

function go(step) {
  bk.step = step;
  $$('.bk-step', dlg).forEach(el => { el.hidden = +el.dataset.step !== step; });
  $('#bookingTitle').textContent = TITLES[step];
  $('#bkStepLabel').textContent = step <= 4 ? `Шаг ${step} из 4` : 'Опасная бритва';
  $('#bkProgress').style.width = `${Math.min(step, 4) * 25}%`;
  $('#bkBack').style.visibility = step === 1 || step === 5 ? 'hidden' : 'visible';
  $('#bkFoot').hidden = step === 5;
  if (step === 1) renderServicesStep();
  if (step === 2) renderBarbersStep();
  if (step === 3) renderDateStep();
  const next = $('#bkNext');
  next.textContent = step === 4 ? 'Записаться' : 'Далее';
  next.disabled = !canNext();
  renderSummary();
  $('.booking__body', dlg).scrollTop = 0;
  // Фокус внутрь шага: содержимое перерисовано, и без этого клавиатура «теряется»
  const target = {
    1: () => $('#bkServices [aria-checked="true"]') || $('#bkServices .opt'),
    2: () => $('#bkBarbers [aria-checked="true"]') || $('#bkBarbers .opt'),
    3: () => $('.slot[aria-selected="true"]', dlg) || $('.slot:not(:disabled)', dlg) || $('.day[aria-selected="true"]', dlg),
    5: () => $('#bkFinish'),
  }[step];
  if (target) setTimeout(() => { const el = target(); if (el) el.focus(); }, 60);
  if (step === 4) {
    // Повторный гость: подставляем имя и телефон с прошлой записи
    try {
      const me = JSON.parse(localStorage.getItem('ob_guest') || 'null');
      if (me && !nameIn.value) nameIn.value = me.name;
      if (me && !phoneIn.value) phoneIn.value = me.phone;
    } catch (_) { /* нет доступа к хранилищу */ }
    setTimeout(() => (nameIn.value ? $('#bkNext') : nameIn).focus(), 50);
  }
}

function openBooking({ service, barber, date, time } = {}) {
  if (service) { if (service !== bk.service) { bk.time = null; } bk.service = service; }
  if (barber) { if (barber !== bk.barber) { bk.time = null; } bk.barber = barber; }
  if (date) bk.date = date;
  if (time) bk.time = time;
  if (bk.step === 5) Object.assign(bk, { service: service || null, barber: barber || null, date: date || null, time: time || null });
  setMenu(false);
  if (!dlg.open) dlg.showModal();
  bookingOpen = true;
  lockScroll(true);
  go(firstMissing());
}

// Не полагаемся на событие 'close': в части браузеров оно не приходит, и страница оставалась без прокрутки
const lockScroll = on => { document.documentElement.style.overflow = on ? 'hidden' : ''; };
let bookingOpen = false;
function afterBookingClose() {
  if (!bookingOpen) return;
  bookingOpen = false;
  lockScroll(false);
  // Незаконченная запись: выбор сохранён, напоминаем, что можно продолжить
  if (bk.service && bk.step < 5) toast('Выбор сохранили. Нажмите «Записаться», чтобы продолжить');
}
function closeBooking() {
  if (dlg.open) dlg.close();
  afterBookingClose();
}
dlg.addEventListener('close', afterBookingClose);
dlg.addEventListener('cancel', e => { e.preventDefault(); closeBooking(); }); // Esc
dlg.addEventListener('click', e => {
  if (e.target !== dlg) return;
  const r = dlg.getBoundingClientRect();
  if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) closeBooking();
});

document.addEventListener('click', e => {
  const trigger = e.target.closest('[data-book]');
  if (trigger) { openBooking({ service: trigger.dataset.service, barber: trigger.dataset.barber }); return; }

  if (!dlg.contains(e.target)) return;
  const pickS = e.target.closest('[data-pick-service]');
  const pickB = e.target.closest('[data-pick-barber]');
  const pickD = e.target.closest('[data-pick-date]');
  const pickT = e.target.closest('[data-pick-time]');
  if (pickS) {
    if (bk.service !== pickS.dataset.pickService) bk.time = null;
    bk.service = pickS.dataset.pickService;
    renderServicesStep();
    setTimeout(() => go(firstMissing()), 180);
  } else if (pickB) {
    if (bk.barber !== pickB.dataset.pickBarber) bk.time = null;
    bk.barber = pickB.dataset.pickBarber;
    renderBarbersStep();
    setTimeout(() => go(firstMissing()), 180);
  } else if (pickD) {
    bk.date = pickD.dataset.pickDate;
    bk.time = null;
    renderDateStep();
    $('#bkNext').disabled = true;
    renderSummary();
  } else if (pickT && !pickT.disabled) {
    bk.time = pickT.dataset.pickTime;
    renderDateStep();
    renderSummary();
    setTimeout(() => go(4), 220);
  }
});

$('#bkClose').addEventListener('click', closeBooking);
$('#bkBack').addEventListener('click', () => go(Math.max(1, bk.step - 1)));
$('#bkNext').addEventListener('click', () => {
  if (bk.step === 4) { submitBooking(); return; }
  if (canNext()) go(bk.step + 1 > 3 ? firstMissing() : bk.step + 1);
});
$('#bkFinish').addEventListener('click', closeBooking);

/* Источник визита: utm_source из ссылки (реклама, Telegram, ВК) запоминается на сессию */
function trafficSource() {
  try {
    const p = new URLSearchParams(location.search);
    const src = [p.get('utm_source'), p.get('utm_campaign')].filter(Boolean).join(' / ');
    if (src) sessionStorage.setItem('ob_src', src);
    return sessionStorage.getItem('ob_src') || (document.referrer ? new URL(document.referrer).hostname : 'прямой заход');
  } catch (_) { return 'неизвестно'; }
}
trafficSource();

/* Ссылка сразу на запись: ?book=fade&barber=ilya (или просто ?book) */
function openFromUrl() {
  const p = new URLSearchParams(location.search);
  if (!p.has('book')) return;
  const service = svc(p.get('book')) ? p.get('book') : undefined;
  const barber = p.get('barber') === 'any' || barberById(p.get('barber')) ? p.get('barber') : undefined;
  openBooking({ service, barber });
}

/* Форма контактов */
const nameIn = $('#bkName');
const phoneIn = $('#bkPhone');
const agreeIn = $('#bkAgree');

function formatPhone(v) {
  let d = v.replace(/\D/g, '');
  if (!d) return '';
  if (d[0] === '8') d = '7' + d.slice(1);
  if (d[0] !== '7') d = '7' + d;
  const p = d.slice(1, 11);
  let out = '+7';
  if (p.length) out += ' (' + p.slice(0, 3);
  if (p.length >= 3) out += ')';
  if (p.length > 3) out += ' ' + p.slice(3, 6);
  if (p.length > 6) out += '-' + p.slice(6, 8);
  if (p.length > 8) out += '-' + p.slice(8, 10);
  return out;
}
phoneIn.addEventListener('input', e => {
  if (e.inputType && e.inputType.startsWith('delete')) return;
  phoneIn.value = formatPhone(phoneIn.value);
});
phoneIn.addEventListener('blur', () => { phoneIn.value = formatPhone(phoneIn.value); validate('phone'); });
nameIn.addEventListener('blur', () => validate('name'));
agreeIn.addEventListener('change', () => validate('agree'));

function setErr(input, errEl, msg) {
  input.setAttribute('aria-invalid', msg ? 'true' : 'false');
  if (msg) input.setAttribute('aria-describedby', errEl.id); else input.removeAttribute('aria-describedby');
  errEl.textContent = msg;
  return !msg;
}
function validate(which) {
  const res = [];
  if (!which || which === 'name') res.push(setErr(nameIn, $('#bkNameErr'), nameIn.value.trim().length < 2 ? 'Напишите имя, чтобы мастер знал, как к вам обращаться' : ''));
  if (!which || which === 'phone') res.push(setErr(phoneIn, $('#bkPhoneErr'), phoneIn.value.replace(/\D/g, '').length !== 11 ? 'Нужен номер из 11 цифр, например +7 (913) 123-45-67' : ''));
  if (!which || which === 'agree') res.push(setErr(agreeIn, $('#bkAgreeErr'), agreeIn.checked ? '' : 'Без согласия мы не сможем сохранить запись'));
  return res.every(Boolean);
}

/* Отправка заявки: сайт → обработчик на Vercel (api/booking.js) → Telegram администратору.
   Токен бота НЕЛЬЗЯ класть в этот файл, его увидит любой посетитель, — он лежит только в настройках Vercel.
   Пока адрес обработчика пустой, сайт работает в демо-режиме: запись сохраняется только в браузере. */
const BOOKING_ENDPOINT = '';

function saveLocally(booking) {
  try {
    const list = loadBookings();
    list.push(booking);
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(list));
  } catch (_) { /* приватный режим: просто не сохраняем */ }
  rebuildOwnBusy();
}

async function sendBooking(booking) {
  if (!BOOKING_ENDPOINT) {
    saveLocally(booking);
    await new Promise(r => setTimeout(r, 900));
    return { ok: true };
  }
  try {
    const r = await fetch(BOOKING_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...booking, website: $('#bkWebsite').value }),
    });
    if (!r.ok) return { ok: false };
    saveLocally(booking);
    return { ok: true };
  } catch (_) {
    return { ok: false };
  }
}

let lastBooking = null;
async function submitBooking() {
  if (!validate()) {
    const bad = $('[aria-invalid="true"]', dlg);
    if (bad) bad.focus();
    return;
  }
  const s = svc(bk.service);
  const free = freeBarbers(bk.date, toMin(bk.time), s.dur);
  const master = bk.barber === 'any' ? free[0] : barberById(bk.barber);
  if (!master) { toast('Это время только что заняли, выберите другое'); bk.time = null; go(3); return; }

  const btn = $('#bkNext');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner" aria-hidden="true"></span>Отправляем…';
  const booking = {
    service: s.name, price: bk.barber === 'any' ? s.price[0] : s.price[master.tier], duration: s.dur, barber: master.name, barberId: master.id,
    date: bk.date, time: bk.time, name: nameIn.value.trim(), phone: phoneIn.value,
    comment: $('#bkComment').value.trim(), source: trafficSource(), createdAt: new Date().toISOString(),
  };
  const res = await sendBooking(booking);
  try { localStorage.setItem('ob_guest', JSON.stringify({ name: booking.name, phone: booking.phone })); } catch (_) { /* ок */ }
  btn.innerHTML = 'Записаться';
  btn.disabled = false;
  if (!res.ok) { toast('Не получилось отправить. Позвоните нам: +7 (383) 000-00-00'); return; }

  lastBooking = booking;
  $('#bkDoneText').textContent = `${booking.name}, ждём вас ${dayLabel(booking.date)} в ${booking.time}. ${s.name} у мастера ${master.gen}, ${rub(booking.price)}. Адрес: ул. Цирюльная, 7.`;
  go(5);
  renderMyBooking();
  $('#bkForm').reset();
  Object.assign(bk, { service: null, barber: null, date: null, time: null });
  refreshAvailability();
}

/* Файл .ics для календаря */
$('#bkIcs').addEventListener('click', () => {
  if (!lastBooking) return;
  const { y, m, d } = dayInfo(lastBooking.date);
  const startMin = toMin(lastBooking.time);
  const fmt = dt => dt.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const startUtc = new Date(Date.UTC(y, m, d, 0, startMin - 7 * 60)); // Новосибирск = UTC+7
  const endUtc = new Date(startUtc.getTime() + lastBooking.duration * 60000);
  const ics = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Opasnaya Britva//RU', 'CALSCALE:GREGORIAN', 'BEGIN:VEVENT',
    `UID:${Date.now()}@opasnaya-britva`, `DTSTAMP:${fmt(new Date())}`, `DTSTART:${fmt(startUtc)}`, `DTEND:${fmt(endUtc)}`,
    `SUMMARY:Барбершоп «Опасная бритва»: ${lastBooking.service}`,
    `DESCRIPTION:Мастер: ${lastBooking.barber}. Телефон: +7 (383) 000-00-00`,
    'LOCATION:Новосибирск\\, ул. Цирюльная\\, 7',
    'BEGIN:VALARM', 'TRIGGER:-PT2H', 'ACTION:DISPLAY', 'DESCRIPTION:Скоро стрижка', 'END:VALARM',
    'END:VEVENT', 'END:VCALENDAR',
  ].join('\r\n');
  const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' }));
  const a = Object.assign(document.createElement('a'), { href: url, download: 'opasnaya-britva.ics' });
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});

/* ===== Подарочный сертификат ===== */
const giftDlg = $('#gift');
const giftPhone = $('#giftPhone');
const giftLabel = v => (v === 'ritual' ? 'Полный ритуал' : rub(+v));
function closeOnBackdrop(dialog, close) {
  dialog.addEventListener('click', e => {
    if (e.target !== dialog) return;
    const r = dialog.getBoundingClientRect();
    if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) close();
  });
}
function closeGift() {
  if (giftDlg.open) giftDlg.close();
  lockScroll(false);
}
$('#giftOpen').addEventListener('click', () => {
  giftDlg.showModal();
  lockScroll(true);
});
$('#giftClose').addEventListener('click', closeGift);
giftDlg.addEventListener('close', () => lockScroll(false));
giftDlg.addEventListener('cancel', e => { e.preventDefault(); closeGift(); }); // Esc
closeOnBackdrop(giftDlg, closeGift);
$('#giftForm').addEventListener('change', e => {
  if (e.target.name === 'amount') $('#giftValue').textContent = giftLabel(e.target.value);
});
giftPhone.addEventListener('input', e => {
  if (e.inputType && e.inputType.startsWith('delete')) return;
  giftPhone.value = formatPhone(giftPhone.value);
});
$('#giftForm').addEventListener('submit', async e => {
  e.preventDefault();
  const ok = setErr(giftPhone, $('#giftPhoneErr'), giftPhone.value.replace(/\D/g, '').length !== 11 ? 'Нужен номер из 11 цифр, чтобы прислать сертификат' : '');
  if (!ok) { giftPhone.focus(); return; }
  const btn = $('#giftSubmit');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner" aria-hidden="true"></span>Оформляем…';
  const amount = new FormData(e.target).get('amount');
  // Позже эту заявку тоже будет получать Telegram-бот
  await sendBooking({ type: 'gift', amount: giftLabel(amount), to: $('#giftTo').value.trim(), phone: giftPhone.value, createdAt: new Date().toISOString() });
  btn.disabled = false;
  btn.textContent = 'Оформить сертификат';
  closeGift();
  e.target.reset();
  $('#giftValue').textContent = giftLabel('3000');
  toast('Заявка на сертификат принята. Перезвоним в течение 15 минут');
});

/* ===== Моя запись: видна на первом экране, можно отменить ===== */
function upcomingBooking() {
  const now = nskNow();
  return loadBookings()
    .filter(b => b.barberId && (b.date > now.key || (b.date === now.key && toMin(b.time) > now.min)))
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))[0] || null;
}
// Карточку «Ближайшее время / Вы записаны» убрали с первого экрана: кнопок записи было слишком много.
// Функцию оставили пустой, чтобы не трогать места, где она вызывается.
function renderMyBooking() {}

/* ===== Ближайшее время и свободные окна ===== */
function refreshAvailability() {
  const n = nearestSlot('haircut');
  if (n) $('#mobileBookSub').textContent = `${dayLabel(n.key)} в ${toTime(n.t)}`;
  $$('[data-free]').forEach(el => {
    const f = nearestSlot('haircut', el.dataset.free);
    el.textContent = f ? `Свободен ${dayLabel(f.key)} в ${toTime(f.t)}` : '';
  });
  const today = nskNow().key;
  const count = slotsFor(today, 'any', 60).filter(x => x.ok).length;
  const title = $('.final h2');
  if (count > 0) title.textContent = `Сегодня свободно ещё ${count} ${plural(count, ['окно', 'окна', 'окон'])}`;
  else if (n) title.textContent = `Свободно ${dayLabel(n.key)} с ${toTime(n.t)}`;
  else title.textContent = 'Запишитесь на удобное время';
}

/* ===== Галерея ===== */
const lb = $('#lightbox');
$('#gallery').addEventListener('click', e => {
  const item = e.target.closest('[data-full]');
  if (!item) return;
  const img = $('#lightboxImg');
  img.src = IMG(item.dataset.full, 1600).replace('&fit=crop', '');
  img.alt = $('img', item).alt;
  lb.showModal();
});
lb.addEventListener('click', () => lb.close());

/* ===== Тост ===== */
let toastTimer;
function toast(msg) {
  const el = $('#toast');
  el.textContent = msg;
  el.classList.add('is-on');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('is-on'), 3500);
}

/* ===== Появление и активный пункт меню ===== */
function initReveal() {
  if (!('IntersectionObserver' in window)) return;
  const links = $$('.nav a');
  const spy = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      links.forEach(a => {
        const on = a.getAttribute('href') === '#' + en.target.id;
        a.classList.toggle('is-active', on);
        if (on) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current'); // диктор слышит, где сейчас человек
      });
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  // Следим и за блоками без пункта в меню: на первом экране и в «Вопросах» подсветка снимается
  ['top', 'services', 'offers', 'why', 'barbers', 'works', 'reviews', 'faq', 'contacts'].forEach(id => { const s = document.getElementById(id); if (s) spy.observe(s); });
}

/* ===== Старт ===== */
rebuildOwnBusy();
renderPrices();
renderBarbers();
updateOpenStatus();
refreshAvailability();
renderMyBooking();
initReveal();
openFromUrl();
setInterval(() => { updateOpenStatus(); refreshAvailability(); renderMyBooking(); }, 60000);

/* ===== Первый экран: лица мастеров рядом с кнопкой записи ===== */
(function heroAvatars() {
  const box = $('#heroAvatars');
  if (!box) return;
  box.innerHTML = BARBERS.slice(0, 3)
    .map(b => `<img src="${IMG(b.img, 96)}" alt="" width="40" height="40" loading="lazy">`).join('');
})();

/* Мессенджеры в шапке: на демо-сайте настоящих аккаунтов нет, поэтому честно об этом говорим */
document.addEventListener('click', e => {
  const link = e.target.closest('[data-demo-msg]');
  if (!link) return;
  e.preventDefault();
  toast(`Демо-сайт: здесь откроется ${link.dataset.demoMsg} барбершопа`);
});

/* Пока главная кнопка «Записаться онлайн» на экране, дублирующие кнопки спрятаны */
(function singleHeroCta() {
  const cta = $('.hero__cta');
  if (!cta || !('IntersectionObserver' in window)) return;
  new IntersectionObserver(([entry]) => {
    document.body.classList.toggle('hero-cta-visible', entry.isIntersecting);
  }).observe(cta);
})();

/* ===== Интерактивная карта =====
   MapLibre + OpenFreeMap: бесплатно, без ключей, векторная — поэтому её можно перекрасить в цвета сайта
   и убрать лишнее (железные дороги, стрелки, границы). Библиотеку грузим, только когда карта подъезжает
   к экрану, чтобы не замедлять первый экран. Точка вымышленная: рядом с пл. Ленина в Новосибирске. */
(function lazyMap() {
  const el = $('#map');
  if (!el) return;
  const SHOP = [82.9245, 55.0285];   // [долгота, широта]
  const METRO = [82.9204, 55.0302];
  const LIB = 'https://cdnjs.cloudflare.com/ajax/libs/maplibre-gl/4.7.1/';

  // Палитра карты — из палитры сайта
  const C = {
    bg: '#171717', block: '#1c1c1c', park: '#1b201b', water: '#18222a', building: '#222121',
    road: '#2b2a29', roadMajor: '#363432', label: '#8f897f', halo: '#171717',
  };
  const HIDE = /^(road_oneway|railway|aeroway|boundary|landcover_(ice|glacier)|road_area_pier|road_pier|highway_path)/;

  function restyle(map) {
    for (const layer of map.getStyle().layers) {
      const { id, type } = layer;
      if (HIDE.test(id)) { map.setLayoutProperty(id, 'visibility', 'none'); continue; }
      if (type === 'background') map.setPaintProperty(id, 'background-color', C.bg);
      else if (id === 'water') map.setPaintProperty(id, 'fill-color', C.water);
      else if (id === 'waterway') map.setPaintProperty(id, 'line-color', C.water);
      else if (/landuse_park|landcover_wood/.test(id)) { map.setPaintProperty(id, 'fill-color', C.park); map.setPaintProperty(id, 'fill-opacity', 1); }
      else if (id === 'landuse_residential') map.setPaintProperty(id, 'fill-color', C.block);
      else if (id === 'building') { map.setPaintProperty(id, 'fill-color', C.building); map.setPaintProperty(id, 'fill-outline-color', C.building); }
      else if (/^highway_(major|motorway)/.test(id)) map.setPaintProperty(id, 'line-color', C.roadMajor);
      else if (id === 'highway_minor') map.setPaintProperty(id, 'line-color', C.road);
      else if (type === 'symbol') {
        // подписи: по-русски, приглушённые, без лишних мелких мест
        if (/^place_(village|state|country)/.test(id)) { map.setLayoutProperty(id, 'visibility', 'none'); continue; }
        map.setLayoutProperty(id, 'text-field', ['coalesce', ['get', 'name:ru'], ['get', 'name']]);
        map.setPaintProperty(id, 'text-color', C.label);
        map.setPaintProperty(id, 'text-halo-color', C.halo);
        map.setPaintProperty(id, 'text-halo-width', 1.4);
      }
    }
  }

  function load() {
    const css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = LIB + 'maplibre-gl.css';
    document.head.appendChild(css);
    const js = document.createElement('script');
    js.src = LIB + 'maplibre-gl.js';
    js.onload = init;
    js.onerror = fail;
    document.head.appendChild(js);
  }
  function fail() {
    el.innerHTML = '<p class="map__fallback">Карта не загрузилась. Адрес: ул. Цирюльная, 7</p>';
  }

  function init() {
    if (!window.maplibregl) return fail();
    el.innerHTML = '';
    const map = new maplibregl.Map({
      container: el,
      style: 'https://tiles.openfreemap.org/styles/dark',
      center: [82.9226, 55.0294], zoom: 15.6,
      attributionControl: false,
      cooperativeGestures: true,   // колесо и один палец крутят страницу; карту — Ctrl+колесо или двумя пальцами
      dragRotate: false, pitchWithRotate: false, touchPitch: false,
      locale: {
        'CooperativeGesturesHandler.WindowsHelpText': 'Ctrl + колесо мыши — приблизить карту',
        'CooperativeGesturesHandler.MacHelpText': '⌘ + колесо мыши — приблизить карту',
        'CooperativeGesturesHandler.MobileHelpText': 'Двигайте карту двумя пальцами',
        'NavigationControl.ZoomIn': 'Приблизить',
        'NavigationControl.ZoomOut': 'Отдалить',
      },
    });
    map.touchZoomRotate.disableRotation();
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-left');
    map.addControl(new maplibregl.AttributionControl({
      compact: true,
      customAttribution: '<a href="https://openfreemap.org" target="_blank" rel="noopener">OpenFreeMap</a> © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>',
    }), 'bottom-right');
    map.on('styledata', () => { if (!map.__styled && map.isStyleLoaded()) { map.__styled = true; restyle(map); } });
    map.on('error', e => console.warn('Карта:', e && e.error && e.error.message));
    // подпись источников свёрнута в кнопку «i», чтобы не закрывать карту
    map.on('load', () => el.querySelector('.maplibregl-ctrl-attrib')?.classList.remove('maplibregl-compact-show'));

    const pinEl = document.createElement('div');
    pinEl.className = 'map-pin';
    pinEl.innerHTML = '<svg width="36" height="46" viewBox="0 0 36 46" aria-hidden="true"><path fill="currentColor" d="M18 46s18-15.6 18-28A18 18 0 0 0 0 18c0 12.4 18 28 18 28Z"/><circle cx="18" cy="18" r="7" fill="#171717"/></svg>';
    const popup = new maplibregl.Popup({ offset: 44, closeButton: false, className: 'map-popup' })
      .setHTML('<b>Опасная бритва</b>ул. Цирюльная, 7, вход со двора<br>Ежедневно 10:00–22:00');
    const shopMarker = new maplibregl.Marker({ element: pinEl, anchor: 'bottom' }).setLngLat(SHOP).setPopup(popup).addTo(map);
    // пин доступен с клавиатуры: Tab — фокус, Enter — подсказка с адресом
    pinEl.setAttribute('role', 'button');
    pinEl.setAttribute('tabindex', '0');
    pinEl.setAttribute('aria-label', 'Опасная бритва, ул. Цирюльная, 7 — показать адрес');
    pinEl.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); shopMarker.togglePopup(); } });

    // и метро, и барбершоп всегда в кадре, на любой ширине экрана
    const fit = () => map.fitBounds([METRO, SHOP], { padding: { top: 70, bottom: 90, left: 60, right: 60 }, maxZoom: 16.3, duration: 0 });
    map.on('load', fit);

    const metroEl = document.createElement('div');
    metroEl.innerHTML = '<span class="map-metro" title="Метро «Площадь Ленина»">М</span>';
    new maplibregl.Marker({ element: metroEl }).setLngLat(METRO).addTo(map);
  }

  if (!('IntersectionObserver' in window)) return load();
  const io = new IntersectionObserver(entries => {
    if (entries.some(e => e.isIntersecting)) { io.disconnect(); load(); }
  }, { rootMargin: '400px' });
  io.observe(el);
})();
