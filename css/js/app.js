/* ============ УТИЛИТЫ ============ */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const money = n => n.toLocaleString('ru-RU') + ' ₽';
const finalPrice = g => Math.round(g.price * (1 - g.discount / 100));
const params = new URLSearchParams(location.search);

/* ---------- Корзина (localStorage) ---------- */
const Cart = {
  key: 'steamshop_cart',
  get: () => JSON.parse(localStorage.getItem(Cart.key) || '[]'),
  save(items) { localStorage.setItem(Cart.key, JSON.stringify(items)); Cart.syncBadge(); },
  add(gameId, editionName = 'Стандартное', extra = 0) {
    const items = Cart.get();
    const found = items.find(i => i.id === gameId && i.edition === editionName);
    if (found) found.qty++;
    else items.push({ id: gameId, edition: editionName, extra, qty: 1 });
    Cart.save(items);
    const g = GAMES.find(x => x.id === +gameId);
    toast(`«${g ? g.title : 'Игра'}» добавлена в корзину`);
  },
  remove(idx) { const i = Cart.get(); i.splice(idx, 1); Cart.save(i); },
  count: () => Cart.get().reduce((s, i) => s + i.qty, 0),
  syncBadge() {
    const n = Cart.count();
    $$('.cart-count').forEach(el => { el.textContent = n; el.classList.toggle('show', n > 0); });
  }
};

/* ---------- Библиотека (купленные) ---------- */
const Library = {
  key: 'steamshop_lib',
  get: () => JSON.parse(localStorage.getItem(Library.key) || '[]'),
  add(ids) { const l = new Set([...Library.get(), ...ids]); localStorage.setItem(Library.key, JSON.stringify([...l])); }
};

/* ---------- Toast ---------- */
function toast(msg) {
  let stack = $('.toast-stack');
  if (!stack) { stack = document.createElement('div'); stack.className = 'toast-stack'; document.body.append(stack); }
  const el = document.createElement('div');
  el.className = 'toast';
  el.innerHTML = `<span style="color:var(--accent-3)">✓</span><span>${msg}</span>`;
  stack.append(el);
  setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 350); }, 2600);
}

/* ---------- Scroll progress + header ---------- */
function initScrollUI() {
  const bar = document.createElement('div');
  bar.className = 'scroll-progress';
  document.body.prepend(bar);
  const header = $('.header');
  const onScroll = () => {
    const h = document.documentElement;
    const p = h.scrollTop / (h.scrollHeight - h.clientHeight || 1);
    bar.style.transform = `scaleX(${Math.min(p, 1)})`;
    header?.classList.toggle('scrolled', h.scrollTop > 20);
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  $$('.burger').forEach(b => b.onclick = () => $('.nav')?.classList.toggle('open'));
}

/* ---------- Reveal on scroll (IntersectionObserver) ---------- */
function initReveal() {
  const els = $$('.reveal');
  if (!('IntersectionObserver' in window)) { els.forEach(e => e.classList.add('in')); return; }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.14, rootMargin: '0px 0px -60px 0px' });
  els.forEach(e => io.observe(e));
}

/* ---------- Параллакс героя ---------- */
function initParallax() {
  const art = $('.hero__art');
  if (!art) return;
  addEventListener('mousemove', (e) => {
    const x = (e.clientX / innerWidth - .5) * 18;
    const y = (e.clientY / innerHeight - .5) * 18;
    $$('.hero__card', art).forEach((c, i) => {
      const k = i ? -1.4 : 1;
      c.style.translate = `${x * k}px ${y * k}px`;
    });
  });
}

/* ---------- Счётчики ---------- */
function initCounters() {
  $$('[data-count]').forEach(el => {
    const target = +el.dataset.count;
    const dur = 1400;
    const start = performance.now();
    const step = (t) => {
      const p = Math.min((t - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased).toLocaleString('ru-RU') + (el.dataset.suffix || '');
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });
}

/* ---------- Карточка игры (шаблон) ---------- */
function gameCard(g, delay = 0) {
  const fp = finalPrice(g);
  return `
  <article class="game-card reveal" style="transition-delay:${delay}ms" data-id="${g.id}">
    <a class="game-card__cover" href="game.html?id=${g.id}">
      ${g.discount ? `<span class="game-card__discount">-${g.discount}%</span>` : ''}
      <img src="${coverOf(g)}" alt="${g.title}" loading="lazy">
    </a>
    <div class="game-card__body">
      <span class="game-card__genre">${g.genre}</span>
      <h3><a href="game.html?id=${g.id}">${g.title}</a></h3>
      <span class="game-card__rating">★ ${g.rating.toFixed(1)} · ${g.year}</span>
      <div class="game-card__foot">
        <div class="price">
          ${g.discount ? `<span class="price__old">${money(g.price)}</span>` : ''}
          <span class="price__new">${money(fp)}</span>
        </div>
        <button class="btn btn--primary btn--sm" data-add="${g.id}">В корзину</button>
      </div>
    </div>
  </article>`;
}

/* ---------- Делегирование «В корзину» ---------- */
document.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-add]');
  if (!btn) return;
  Cart.add(+btn.dataset.add, btn.dataset.edition || 'Стандартное', +(btn.dataset.extra || 0));
});

/* ============ ГЛАВНАЯ ============ */
function initHome() {
  const hot = $('#hot-grid');
  if (hot) {
    hot.innerHTML = [...GAMES].sort((a, b) => b.discount - a.discount).slice(0, 4)
      .map((g, i) => gameCard(g, i * 80)).join('');
  }
  const rec = $('#rec-grid');
  if (rec) rec.innerHTML = [...GAMES].sort((a, b) => b.rating - a.rating).slice(0, 4)
    .map((g, i) => gameCard(g, i * 80)).join('');

  initCounters();
  initParallax();
}

/* ============ КАТАЛОГ ============ */
function initCatalog() {
  const grid = $('#catalog-grid');
  if (!grid) return;

  const state = { q: '', genre: 'all', sort: 'popular', maxPrice: 3000, view: 'grid', page: 1, per: 6 };

  const render = () => {
    let list = GAMES.filter(g =>
      g.title.toLowerCase().includes(state.q.toLowerCase()) &&
      (state.genre === 'all' || g.genre === state.genre) &&
      finalPrice(g) <= state.maxPrice
    );
    if (state.sort === 'cheap') list.sort((a, b) => finalPrice(a) - finalPrice(b));
    if (state.sort === 'exp') list.sort((a, b) => finalPrice(b) - finalPrice(a));
    if (state.sort === 'rating') list.sort((a, b) => b.rating - a.rating);
    if (state.sort === 'discount') list.sort((a, b) => b.discount - a.discount);

    const pages = Math.max(1, Math.ceil(list.length / state.per));
    state.page = Math.min(state.page, pages);
    const slice = list.slice((state.page - 1) * state.per, state.page * state.per);

    grid.className = 'grid' + (state.view === 'list' ? ' list' : '');
    grid.innerHTML = slice.length
      ? slice.map((g, i) => gameCard(g, i * 60)).join('')
      : `<div class="empty">Ничего не найдено. Попробуйте изменить фильтры.</div>`;

    $('#result-count').textContent = `${list.length} игр`;
    const pg = $('#pagination');
    if (pg) {
      pg.innerHTML = pages > 1 ? Array.from({ length: pages }, (_, i) =>
        `<button class="chip ${i + 1 === state.page ? 'active' : ''}" data-page="${i + 1}">${i + 1}</button>`
      ).join('') : '';
    }
    initReveal();
  };

  $('#search').addEventListener('input', e => { state.q = e.target.value; state.page = 1; render(); });
  $('#sort').addEventListener('change', e => { state.sort = e.target.value; render(); });
  $('#price').addEventListener('input', e => { state.maxPrice = +e.target.value; $('#price-out').textContent = money(+e.target.value); state.page = 1; render(); });
  $$('.chip[data-genre]').forEach(c => c.onclick = () => {
    $$('.chip[data-genre]').forEach(x => x.classList.remove('active'));
    c.classList.add('active'); state.genre = c.dataset.genre; state.page = 1; render();
  });
  $('#view-toggle').onclick = (e) => {
    state.view = state.view === 'grid' ? 'list' : 'grid';
    e.currentTarget.textContent = state.view === 'grid' ? 'Сетка' : 'Список';
    render();
  };
  $('#pagination')?.addEventListener('click', e => {
    const b = e.target.closest('[data-page]'); if (!b) return;
    state.page = +b.dataset.page; render();
    $('.filters').scrollIntoView({ behavior: 'smooth', block: 'center' });
  });

  render();
}

/* ============ СТРАНИЦА ИГРЫ ============ */
function initGamePage() {
  const box = $('#game-root');
  if (!box) return;
  const g = GAMES.find(x => x.id === +(params.get('id') || 1)) || GAMES[0];

  document.title = `${g.title} — SteamShop`;

  box.innerHTML = `
  <div class="breadcrumbs container"><a href="index.html">Главная</a> / <a href="catalog.html">Каталог</a> / <span>${g.title}</span></div>
  <div class="game-hero container">
    <div>
      <div class="gallery__main reveal in" id="gal-main"><img src="${coverOf(g)}" alt="${g.title}"></div>
      <div class="gallery__thumbs" id="gal-thumbs">
        ${[0,1,2,3].map(i => `<button class="${i===0?'active':''}" data-i="${i}"><img src="${coverOf({...g, id: g.id + i})}" alt=""></button>`).join('')}
      </div>
      <div style="margin-top:40px">
        <div class="tabs">
          <button class="tab active" data-tab="desc">Описание</button>
          <button class="tab" data-tab="reqs">Системные требования</button>
          <button class="tab" data-tab="rev">Отзывы (${g.reviews.length})</button>
        </div>
        <div class="tab-panel active" data-panel="desc">
          <p style="color:var(--muted);line-height:1.8;font-size:15px">${g.desc}</p>
          <div class="chips" style="margin-top:20px">${g.tags.map(t => `<span class="chip">${t}</span>`).join('')}</div>
        </div>
        <div class="tab-panel" data-panel="reqs">
          <table class="spec-table">${g.reqs.map(r => `<tr><td>${r[0]}</td><td>${r[1]}</td></tr>`).join('')}</table>
        </div>
        <div class="tab-panel" data-panel="rev">
          ${g.reviews.map(r => `
            <div class="review">
              <div class="review__top"><div class="avatar">${r.name[0]}</div>
              <div><b>${r.name}</b><div style="font-size:12px;color:var(--muted)">${'★'.repeat(r.score)}${'☆'.repeat(5-r.score)}</div></div></div>
              <p>${r.text}</p>
            </div>`).join('')}
          <div class="field"><label>Ваш отзыв</label><textarea id="rev-text" rows="3" placeholder="Что думаете об игре?"></textarea><small id="rev-err"></small></div>
          <button class="btn btn--ghost btn--sm" id="rev-send" style="margin-top:12px">Отправить отзыв</button>
        </div>
      </div>
    </div>

    <aside class="buy-panel reveal in">
      <h1>${g.title}</h1>
      <div class="meta">★ ${g.rating.toFixed(1)} · ${g.genre} · ${g.year}</div>
      <div class="editions">
        ${g.editions.map((e, i) => `
          <div class="edition ${i===0?'active':''}" data-ed="${i}" data-extra="${e.add}">
            <div><div class="edition__name">${e.name}</div><div class="edition__desc">${e.desc}</div></div>
            <b>${money(finalPrice(g) + e.add)}</b>
          </div>`).join('')}
      </div>
      <div class="price" style="margin-bottom:18px">
        ${g.discount ? `<span class="price__old">${money(g.price)}</span><span class="badge">-${g.discount}%</span>` : ''}
      </div>
      <button class="btn btn--primary" style="width:100%" id="buy-btn">Купить сейчас</button>
      <button class="btn btn--ghost" style="width:100%;margin-top:10px" id="cart-btn">В корзину</button>
      <p style="color:var(--muted);font-size:12px;margin-top:16px;line-height:1.6">Ключ приходит на e-mail мгновенно. Активация в Steam — 1 минута.</p>
    </aside>
  </div>`;

  let sel = 0;
  $$('.edition').forEach(el => el.onclick = () => {
    $$('.edition').forEach(x => x.classList.remove('active'));
    el.classList.add('active'); sel = +el.dataset.ed;
  });

  $('#gal-thumbs').onclick = (e) => {
    const b = e.target.closest('button'); if (!b) return;
    $$('#gal-thumbs button').forEach(x => x.classList.remove('active'));
    b.classList.add('active');
    $('#gal-main img').style.opacity = 0;
    setTimeout(() => {
      $('#gal-main img').src = b.querySelector('img').src;
      $('#gal-main img').style.opacity = 1;
    }, 130);
  };

  $$('.tab').forEach(t => t.onclick = () => {
    $$('.tab').forEach(x => x.classList.remove('active'));
    $$('.tab-panel').forEach(x => x.classList.remove('active'));
    t.classList.add('active');
    $(`[data-panel="${t.dataset.tab}"]`).classList.add('active');
  });

  const pick = () => { const e = g.editions[sel]; return { name: e.name, extra: e.add }; };
  $('#cart-btn').onclick = () => Cart.add(g.id, pick().name, pick().extra);
  $('#buy-btn').onclick = () => { Cart.add(g.id, pick().name, pick().extra); location.href = 'cart.html'; };

  $('#rev-send').onclick = () => {
    const v = $('#rev-text').value.trim();
    if (v.length < 10) { $('#rev-err').textContent = 'Минимум 10 символов'; $('#rev-text').classList.add('err'); return; }
    $('#rev-text').classList.remove('err'); $('#rev-err').textContent = '';
    toast('Спасибо! Отзыв отправлен на модерацию');
    $('#rev-text').value = '';
  };
}

/* ============ КОРЗИНА ============ */
function initCart() {
  const root = $('#cart-root');
  if (!root) return;
  let promoApplied = false;

  const render = () => {
    const items = Cart.get();
    if (!items.length) {
      root.innerHTML = `
        <div class="cart-layout">
          <div class="empty" style="background:var(--bg-2);border:1px solid var(--line);border-radius:18px">
            <h3 style="color:var(--text);margin-bottom:10px">Корзина пуста</h3>
            <p style="margin-bottom:22px">Загляните в каталог — там сейчас скидки до 60%.</p>
            <a class="btn btn--primary" href="catalog.html">Перейти в каталог</a>
          </div>
        </div>`;
      return;
    }

    let subtotal = 0, oldTotal = 0;
    const rows = items.map((it, i) => {
      const g = GAMES.find(x => x.id === it.id); if (!g) return '';
      const unit = finalPrice(g) + (it.extra || 0);
      subtotal += unit * it.qty;
      oldTotal += (g.price + (it.extra || 0)) * it.qty;
      return `
      <div class="cart-item">
        <div class="cart-item__cover"><img src="${coverOf(g)}" alt=""></div>
        <div>
          <b>${g.title}</b>
          <div style="color:var(--muted);font-size:13px;margin-top:4px">${it.edition}</div>
        </div>
        <div class="qty">
          <button data-dec="${i}">−</button><span>${it.qty}</span><button data-inc="${i}">+</button>
        </div>
        <div style="text-align:right;min-width:110px">
          <b>${money(unit * it.qty)}</b>
          <div><button class="btn btn--sm" style="background:none;border:none;color:var(--danger);padding:4px 0" data-del="${i}">Удалить</button></div>
        </div>
      </div>`;
    }).join('');

    const disc = promoApplied ? Math.round(subtotal * 0.1) : 0;
    const total = subtotal - disc;

    root.innerHTML = `
      <div class="cart-layout">
        <div>${rows}</div>
        <aside class="summary">
          <h3 style="margin-bottom:16px">Итого</h3>
          <div class="summary__row"><span>Товары (${Cart.count()})</span><span>${money(oldTotal)}</span></div>
          <div class="summary__row"><span>Скидка магазина</span><span style="color:var(--accent-3)">−${money(oldTotal - subtotal)}</span></div>
          ${promoApplied ? `<div class="summary__row"><span>Промокод AUTUMN10</span><span style="color:var(--accent-3)">−${money(disc)}</span></div>` : ''}
          <div class="summary__row total"><span>К оплате</span><span>${money(total)}</span></div>
          <div class="promo">
            <input id="promo-in" placeholder="Промокод" value="${promoApplied ? 'AUTUMN10' : ''}">
            <button class="btn btn--ghost btn--sm" id="promo-btn">OK</button>
          </div>
          <button class="btn btn--primary" style="width:100%" id="checkout">Оформить заказ</button>
          <p style="color:var(--muted);font-size:12px;margin-top:14px">Демо-оплата. Реальные списания не производятся.</p>
        </aside>
      </div>`;

    root.querySelectorAll('[data-inc]').forEach(b => b.onclick = () => {
      const it = Cart.get(); it[+b.dataset.inc].qty++; Cart.save(it); render();
    });
    root.querySelectorAll('[data-dec]').forEach(b => b.onclick = () => {
      const it = Cart.get(); const i = +b.dataset.dec;
      it[i].qty--; if (it[i].qty <= 0) it.splice(i, 1);
      Cart.save(it); render();
    });
    root.querySelectorAll('[data-del]').forEach(b => b.onclick = () => { Cart.remove(+b.dataset.del); render(); });

    $('#promo-btn').onclick = () => {
      const v = $('#promo-in').value.trim().toUpperCase();
      if (v === 'AUTUMN10') { promoApplied = true; toast('Промокод применён: −10%'); }
      else { promoApplied = false; toast('Промокод не найден'); }
      render();
    };

    $('#checkout').onclick = () => {
      const ids = Cart.get().map(i => i.id);
      Library.add(ids);
      Cart.save([]);
      openModal('Заказ оформлен', 'Ключи активации отправлены на e-mail и уже лежат в вашей библиотеке.', 'Библиотека', 'library.html');
    };
  };

  render();
}

/* ============ БИБЛИОТЕКА ============ */
function initLibrary() {
  const root = $('#lib-root');
  if (!root) return;
  const ids = Library.get();
  if (!ids.length) {
    root.innerHTML = `<div class="empty" style="background:var(--bg-2);border:1px solid var(--line);border-radius:18px">
      <h3 style="color:var(--text);margin-bottom:10px">Библиотека пока пуста</h3>
      <p style="margin-bottom:22px">Купите первую игру — она появится здесь вместе с ключом.</p>
      <a class="btn btn--primary" href="catalog.html">Открыть каталог</a></div>`;
    return;
  }
  const games = GAMES.filter(g => ids.includes(g.id));
  root.innerHTML = games.map((g, i) => `
    <div class="lib-card reveal" style="transition-delay:${i * 70}ms">
      <div class="lib-card__cover"><img src="${coverOf(g)}" alt=""></div>
      <div>
        <b style="font-size:17px">${g.title}</b>
        <div style="color:var(--muted);font-size:13px;margin-top:4px">Ключ активирован · ${g.genre}</div>
        <div class="progress"><div class="progress__bar" data-w="${30 + (g.id * 9) % 60}"></div></div>
        <div style="display:flex;gap:10px;margin-top:16px;flex-wrap:wrap">
          <button class="btn btn--primary btn--sm" data-play="${g.id}">Запустить</button>
          <a class="btn btn--ghost btn--sm" href="game.html?id=${g.id}">Страница игры</a>
        </div>
      </div>
    </div>`).join('');

  setTimeout(() => $$('.progress__bar', root).forEach(b => b.style.width = b.dataset.w + '%'), 250);
  root.addEventListener('click', e => {
    const b = e.target.closest('[data-play]'); if (!b) return;
    const g = GAMES.find(x => x.id === +b.dataset.play);
    openModal('Запуск ' + g.title, 'Демо-режим: игра не установлена. В реальном магазине здесь открывался бы Steam-клиент или страница загрузки.', 'Понятно');
  });
  initReveal();
}

/* ============ НОВОСТИ ============ */
function initNews() {
  const root = $('#news-root');
  if (!root) return;
  const render = (tag = 'all') => {
    const list = NEWS.filter(n => tag === 'all' || n.tag === tag);
    root.innerHTML = list.map((n, i) => `
      <article class="news-card reveal" style="transition-delay:${i * 60}ms">
        <div class="news-card__date">${new Date(n.date).toLocaleDateString('ru-RU', { day: '2-digit', month: 'long', year: 'numeric' })} · ${n.tag}</div>
        <h3>${n.title}</h3>
        <p>${n.preview}</p>
        <div class="news-body">${n.body}</div>
        <span class="more">Читать полностью →</span>
      </article>`).join('');
    root.querySelectorAll('.more').forEach(m => m.onclick = () => {
      const card = m.closest('.news-card');
      card.classList.toggle('expanded');
      m.textContent = card.classList.contains('expanded') ? 'Свернуть ←' : 'Читать полностью →';
    });
    initReveal();
  };
  $$('.chip[data-tag]').forEach(c => c.onclick = () => {
    $$('.chip[data-tag]').forEach(x => x.classList.remove('active'));
    c.classList.add('active'); render(c.dataset.tag);
  });
  render();
}

/* ============ FAQ + ФОРМА ============ */
function initAbout() {
  $$('.acc-item').forEach(item => {
    const btn = $('.acc-btn', item), body = $('.acc-body', item);
    btn.onclick = () => {
      const open = item.classList.toggle('open');
      body.style.maxHeight = open ? body.scrollHeight + 'px' : 0;
    };
  });

  const form = $('#contact-form');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let ok = true;
    const checks = [
      ['#f-name', v => v.length >= 2, 'Введите имя'],
      ['#f-email', v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), 'Некорректный e-mail'],
      ['#f-msg', v => v.length >= 15, 'Минимум 15 символов']
    ];
    checks.forEach(([sel, test, msg]) => {
      const inp = $(sel), err = inp.parentElement.querySelector('small');
      if (!test(inp.value.trim())) { inp.classList.add('err'); err.textContent = msg; ok = false; }
      else { inp.classList.remove('err'); err.textContent = ''; }
    });
    if (ok) { form.reset(); toast('Сообщение отправлено. Ответим в течение 30 минут'); }
  });
}

/* ============ МОДАЛКА ============ */
function openModal(title, text, btnText = 'Закрыть', href = null) {
  const back = document.createElement('div');
  back.className = 'modal-backdrop';
  back.innerHTML = `<div class="modal">
      <h3>${title}</h3><p>${text}</p>
      <div style="display:flex;gap:10px">
        <button class="btn btn--primary" id="m-ok">${btnText}</button>
        <button class="btn btn--ghost" id="m-close">Закрыть</button>
      </div></div>`;
  document.body.append(back);
  requestAnimationFrame(() => back.classList.add('open'));
  const close = () => { back.classList.remove('open'); setTimeout(() => back.remove(), 300); };
  $('#m-close', back).onclick = close;
  $('#m-ok', back).onclick = () => href ? location.href = href : close();
  back.onclick = e => { if (e.target === back) close(); };
}

/* ============ ИНИТ ============ */
document.addEventListener('DOMContentLoaded', () => {
  Cart.syncBadge();
  initScrollUI();
  initReveal();
  initHome();
  initCatalog();
  initGamePage();
  initCart();
  initLibrary();
  initNews();
  initAbout();
});
