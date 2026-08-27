const CONFIG = {
  weddingDate: new Date('2027-05-22T13:00:00+09:00'),
  title: '박민구 ♥ 손지현 결혼식',
  venue: 'DMC 타워웨딩',
  address: '서울특별시 마포구 성암로 189 중소기업DMC타워 2층'
};

const toast = document.querySelector('#toast');
let toastTimer;
function showToast(message) {
  toast.textContent = message;
  toast.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 1800);
}

function renderCalendar() {
  const container = document.querySelector('#calendarDays');
  const year = CONFIG.weddingDate.getFullYear();
  const month = CONFIG.weddingDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();
  const fragment = document.createDocumentFragment();
  for (let i = 0; i < firstDay; i += 1) fragment.append(document.createElement('span'));
  for (let day = 1; day <= lastDate; day += 1) {
    const cell = document.createElement('span');
    cell.textContent = day;
    if (day === CONFIG.weddingDate.getDate()) {
      cell.className = 'wedding-day';
      cell.setAttribute('aria-label', `${day}일 결혼식`);
    }
    fragment.append(cell);
  }
  container.append(fragment);
}

function updateCountdown() {
  const days = Math.ceil((CONFIG.weddingDate - new Date()) / 86400000);
  const output = document.querySelector('#countdown');
  if (days > 0) output.innerHTML = `박민구 ♥ 손지현의 결혼식이 <strong>${days}일</strong> 남았습니다.`;
  else if (days === 0) output.innerHTML = '오늘, 저희 두 사람이 결혼합니다.';
  else output.innerHTML = '함께 축복해 주셔서 감사합니다.';
}

document.querySelectorAll('.copy-button').forEach((button) => {
  button.addEventListener('click', async () => {
    if (!button.dataset.copy) { showToast('계좌번호를 먼저 입력해 주세요.'); return; }
    try {
      await navigator.clipboard.writeText(button.dataset.copy);
      showToast('계좌번호를 복사했습니다.');
    } catch {
      showToast(`계좌번호: ${button.dataset.copy}`);
    }
  });
});

const galleryImages = [...document.querySelectorAll('.gallery__item img')];
const lightbox = document.querySelector('#lightbox');
const lightboxImage = document.querySelector('#lightboxImage');
const lightboxCount = document.querySelector('#lightboxCount');
let currentImage = 0;
function showImage(index) {
  currentImage = (index + galleryImages.length) % galleryImages.length;
  lightboxImage.src = galleryImages[currentImage].src.replace(/w=\d+/, 'w=1400');
  lightboxImage.alt = galleryImages[currentImage].alt;
  lightboxCount.textContent = `${currentImage + 1} / ${galleryImages.length}`;
}
document.querySelector('#gallery').addEventListener('click', (event) => {
  const item = event.target.closest('.gallery__item');
  if (!item) return;
  showImage(Number(item.dataset.index));
  lightbox.showModal();
});
document.querySelector('.lightbox__close').addEventListener('click', () => lightbox.close());
document.querySelector('.lightbox__nav--prev').addEventListener('click', () => showImage(currentImage - 1));
document.querySelector('.lightbox__nav--next').addEventListener('click', () => showImage(currentImage + 1));
lightbox.addEventListener('click', (event) => { if (event.target === lightbox) lightbox.close(); });

document.querySelector('#shareButton').addEventListener('click', async () => {
  const shareData = { title: CONFIG.title, text: `${CONFIG.title}\n2027년 5월 22일 토요일 오후 1시`, url: location.href };
  try {
    if (navigator.share) await navigator.share(shareData);
    else { await navigator.clipboard.writeText(location.href); showToast('청첩장 주소를 복사했습니다.'); }
  } catch (error) { if (error.name !== 'AbortError') showToast('공유하지 못했습니다.'); }
});

document.querySelector('#calendarButton').addEventListener('click', () => {
  const pad = (value) => String(value).padStart(2, '0');
  const toIcs = (date) => `${date.getUTCFullYear()}${pad(date.getUTCMonth()+1)}${pad(date.getUTCDate())}T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}00Z`;
  const end = new Date(CONFIG.weddingDate.getTime() + 2 * 60 * 60 * 1000);
  const ics = ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Wedding Invitation//KO','BEGIN:VEVENT',`DTSTART:${toIcs(CONFIG.weddingDate)}`,`DTEND:${toIcs(end)}`,`SUMMARY:${CONFIG.title}`,`LOCATION:${CONFIG.venue}, ${CONFIG.address}`,'END:VEVENT','END:VCALENDAR'].join('\r\n');
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' }));
  link.download = 'wedding.ics';
  link.click();
  URL.revokeObjectURL(link.href);
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => { if (entry.isIntersecting) entry.target.classList.add('is-visible'); });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));

renderCalendar();
updateCountdown();
