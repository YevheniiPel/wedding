/* Євгеній & Христина · доповнення до весільного сайту · 18.11.2026 */
(function () {
  'use strict';
  const site = document.getElementById('site');
  if (!site) return;

  /* Зручна галерея: фото відкривається на весь екран. */
  const photos = Array.from(document.querySelectorAll('#gallery .photo-grid img'));
  const lightbox = document.createElement('div');
  lightbox.id = 'weddingLightbox';
  lightbox.className = 'wedding-lightbox';
  lightbox.hidden = true;
  lightbox.setAttribute('role', 'dialog');
  lightbox.setAttribute('aria-modal', 'true');
  lightbox.setAttribute('aria-label', 'Перегляд весільних фотографій');
  lightbox.innerHTML =
    '<button type="button" class="wedding-lightbox-close" aria-label="Закрити фотографію">×</button>' +
    '<button type="button" class="wedding-lightbox-prev" aria-label="Попередня фотографія">‹</button>' +
    '<figure class="wedding-lightbox-figure"><img alt=""><figcaption><span id="weddingPhotoCaption"></span><small id="weddingPhotoCounter"></small></figcaption></figure>' +
    '<button type="button" class="wedding-lightbox-next" aria-label="Наступна фотографія">›</button>';
  document.body.appendChild(lightbox);
  const bigPhoto = lightbox.querySelector('.wedding-lightbox-figure img');
  const caption = lightbox.querySelector('#weddingPhotoCaption');
  const counter = lightbox.querySelector('#weddingPhotoCounter');
  const closeButton = lightbox.querySelector('.wedding-lightbox-close');
  let current = 0, lastFocus = null, previousOverflow = '', touchStartX = null;

  function showPhoto(index) {
    if (!photos.length) return;
    current = (index + photos.length) % photos.length;
    bigPhoto.src = photos[current].getAttribute('src');
    bigPhoto.alt = photos[current].alt || 'Весільна фотографія';
    caption.textContent = bigPhoto.alt;
    counter.textContent = String(current + 1) + ' / ' + String(photos.length);
  }
  function openPhoto(index) {
    lastFocus = document.activeElement;
    previousOverflow = document.body.style.overflow;
    lightbox.hidden = false;
    showPhoto(index);
    document.body.style.overflow = 'hidden';
    closeButton.focus();
  }
  function closePhoto() {
    if (lightbox.hidden) return;
    lightbox.hidden = true;
    bigPhoto.removeAttribute('src');
    document.body.style.overflow = previousOverflow;
    if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
  }
  photos.forEach(function (img, index) {
    img.loading = 'lazy';
    img.decoding = 'async';
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'wedding-photo-button';
    button.setAttribute('aria-label', 'Відкрити фото ' + String(index + 1) + ': ' + (img.alt || 'фотографія'));
    img.parentNode.insertBefore(button, img);
    button.appendChild(img);
    button.addEventListener('click', function () { openPhoto(index); });
  });
  document.querySelectorAll('.story-image img, .closing > img').forEach(function (img) {
    img.loading = 'lazy';
    img.decoding = 'async';
  });
  const heroImage = document.querySelector('.hero-image');
  if (heroImage) heroImage.fetchPriority = 'high';
  closeButton.addEventListener('click', closePhoto);
  lightbox.querySelector('.wedding-lightbox-prev').addEventListener('click', function () { showPhoto(current - 1); });
  lightbox.querySelector('.wedding-lightbox-next').addEventListener('click', function () { showPhoto(current + 1); });
  lightbox.addEventListener('click', function (event) {
    if (event.target === lightbox) closePhoto();
  });
  document.addEventListener('keydown', function (event) {
    if (lightbox.hidden) return;
    if (event.key === 'Escape') { event.preventDefault(); closePhoto(); }
    if (event.key === 'ArrowLeft') { event.preventDefault(); showPhoto(current - 1); }
    if (event.key === 'ArrowRight') { event.preventDefault(); showPhoto(current + 1); }
    if (event.key === 'Tab') {
      const controls = [
        closeButton,
        lightbox.querySelector('.wedding-lightbox-prev'),
        lightbox.querySelector('.wedding-lightbox-next')
      ];
      const index = controls.indexOf(document.activeElement);
      if (event.shiftKey && (index === 0 || index === -1)) {
        event.preventDefault(); controls[controls.length - 1].focus();
      } else if (!event.shiftKey && (index === controls.length - 1 || index === -1)) {
        event.preventDefault(); controls[0].focus();
      }
    }
  });
  lightbox.addEventListener('touchstart', function (event) {
    if (event.touches.length === 1) touchStartX = event.touches[0].clientX;
  }, { passive: true });
  lightbox.addEventListener('touchend', function (event) {
    if (touchStartX === null || event.changedTouches.length !== 1) return;
    const distance = event.changedTouches[0].clientX - touchStartX;
    touchStartX = null;
    if (Math.abs(distance) > 55) showPhoto(current + (distance < 0 ? 1 : -1));
  }, { passive: true });

  /* Швидкі дії для гостей: календар та посилання для поширення. */
  const dateLine = document.querySelector('#details .details-date');
  if (dateLine) {
    const actions = document.createElement('div');
    actions.className = 'wedding-guest-actions';
    actions.innerHTML =
      '<button id="weddingSaveDate" type="button"><span aria-hidden="true">▧</span> Додати у календар</button>' +
      '<button id="weddingShare" type="button"><span aria-hidden="true">↗</span> Поділитися запрошенням</button>';
    const actionStatus = document.createElement('p');
    actionStatus.className = 'wedding-action-status';
    actionStatus.setAttribute('role', 'status');
    actionStatus.setAttribute('aria-live', 'polite');
    dateLine.insertAdjacentElement('afterend', actions);
    actions.insertAdjacentElement('afterend', actionStatus);

    actions.querySelector('#weddingSaveDate').addEventListener('click', function () {
      function icsEscape(value) {
        return String(value).replace(/\\/g, '\\\\').replace(/\r?\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
      }
      const description = [
        'Весілля Євгенія та Христини — субота, 11 вересня 2027.',
        '09:45 — зустріч у нареченого.',
        '11:30 — зустріч у нареченої.',
        '11:45 — церемонія, храм Пресвятої Євхаристії, Рясне-2, вул. Івана Величковського, 1, Львів.',
        '13:00 — ресторан «Мускат», вул. Яворівська, 58А, Івано-Франкове.',
        'Церемонія: https://maps.app.goo.gl/5aUM7yzxTGoERVR69',
        'Ресторан: https://maps.app.goo.gl/oQwTQcDQ6Em72t1w5'
      ].join('\n');
      const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
      const calendar = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Yevhenii and Khrystyna Wedding//UK',
        'CALSCALE:GREGORIAN',
        'BEGIN:VEVENT',
        'UID:yevhenii-khrystyna-20270911@yevheniipel.github.io',
        'DTSTAMP:' + stamp,
        'DTSTART;VALUE=DATE:20270911',
        'DTEND;VALUE=DATE:20270912',
        'SUMMARY:' + icsEscape('Весілля Євгенія та Христини'),
        'DESCRIPTION:' + icsEscape(description),
        'END:VEVENT',
        'END:VCALENDAR',
        ''
      ].join('\r\n');
      const blob = new Blob([calendar], { type: 'text/calendar;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'Vesillia-Yevhenii-Khrystyna-11-09-2027.ics';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(function () { URL.revokeObjectURL(url); }, 5000);
      actionStatus.textContent = 'Файл календаря підготовлено. Відкрийте його, щоб зберегти дату.';
    });

    actions.querySelector('#weddingShare').addEventListener('click', async function () {
      const url = window.location.origin + window.location.pathname;
      const data = {
        title: 'Євгеній & Христина — 11.09.2027',
        text: 'Запрошення на наше весілля — 11 вересня 2027 року.',
        url: url
      };
      if (navigator.share) {
        try {
          await navigator.share(data);
          actionStatus.textContent = '';
          return;
        } catch (error) {
          if (error && error.name === 'AbortError') return;
        }
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        try {
          await navigator.clipboard.writeText(url);
          actionStatus.textContent = 'Посилання скопійовано. Можна надіслати гостям!';
          return;
        } catch (error) { /* Fallback below. */ }
      }
      actionStatus.textContent = 'Посилання на запрошення: ' + url;
    });
  }

  /* Навігація завжди під рукою на смартфоні. */
  const dock = document.createElement('nav');
  dock.className = 'wedding-mobile-dock';
  dock.setAttribute('aria-label', 'Швидка навігація весільним сайтом');
  dock.innerHTML =
    '<a href="#details"><span aria-hidden="true">◇</span> Програма</a>' +
    '<a href="#gallery"><span aria-hidden="true">▦</span> Фото</a>' +
    '<a href="#rsvp"><span aria-hidden="true">✉</span> Відповідь</a>';
  site.appendChild(dock);

  /* Форма поки копіює відповідь, а не надсилає її автоматично. */
  const form = document.getElementById('rsvpForm');
  if (form) {
    const submit = form.querySelector('.submit');
    if (submit) submit.textContent = 'СКОПІЮВАТИ ВІДПОВІДЬ';
    const helpText = form.querySelector('small');
    if (helpText) helpText.textContent =
      'Відповідь не надсилається автоматично. Після натискання вставте скопійований текст у повідомлення молодятам.';
  }
})();