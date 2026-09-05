const CONFIG = {
  weddingDate: new Date('2027-01-23T12:40:00+09:00'),
  title: '박민구 ♥ 손지현 결혼식',
  venue: 'DMC 타워웨딩 2층 그랜드볼룸홀',
  address: '서울특별시 마포구 성암로 189 중소기업DMC타워 2층',
  // 모든 웨딩 사진 목록
  allPhotos: [
    'image/001.jpg', 'image/002.jpg', 'image/005.jpg', 'image/007.jpg', 
    'image/009.jpg', 'image/010.jpg', 'image/011.jpg', 'image/012.jpg', 
    'image/013.jpg', 'image/014.jpg', 'image/015.jpg', 'image/016.jpg', 
    'image/018.jpg', 'image/019.jpg', 'image/020.jpg', 'image/021.jpg', 
    'image/022.jpg', 'image/025.jpg', 'image/026.jpg', 'image/027.jpg', 
    'image/029.jpg'
  ]
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

// 갤러리: 썸네일은 6장만 표시
const galleryImages = [...document.querySelectorAll('.gallery__item img')];
// 라이트박스: 모든 사진을 보여줌
const lightbox = document.querySelector('#lightbox');
const lightboxImage = document.querySelector('#lightboxImage');
const lightboxCount = document.querySelector('#lightboxCount');
let currentImage = 0;

function showImage(index) {
  currentImage = (index + CONFIG.allPhotos.length) % CONFIG.allPhotos.length;
  lightboxImage.src = CONFIG.allPhotos[currentImage];
  lightboxImage.alt = `웨딩 사진 ${currentImage + 1}`;
  lightboxCount.textContent = `${currentImage + 1} / ${CONFIG.allPhotos.length}`;
}

document.querySelector('#gallery').addEventListener('click', (event) => {
  const item = event.target.closest('.gallery__item');
  if (!item) return;
  // 클릭한 썸네일의 인덱스로 시작
  const galleryIndex = Number(item.dataset.index);
  // 전체 사진에서 시작할 인덱스 찾기 (썸네일 이미지 src를 기반으로)
  const clickedSrc = item.querySelector('img').src;
  const allPhotosIndex = CONFIG.allPhotos.findIndex(photo => clickedSrc.includes(photo));
  showImage(allPhotosIndex >= 0 ? allPhotosIndex : galleryIndex);
  lightbox.showModal();
});

document.querySelector('.lightbox__close').addEventListener('click', () => lightbox.close());
document.querySelector('.lightbox__nav--prev').addEventListener('click', () => showImage(currentImage - 1));
document.querySelector('.lightbox__nav--next').addEventListener('click', () => showImage(currentImage + 1));
lightbox.addEventListener('click', (event) => { if (event.target === lightbox) lightbox.close(); });

document.querySelector('#shareButton').addEventListener('click', async () => {
  const shareData = { title: CONFIG.title, text: `${CONFIG.title}\n2027년 1월 23일 토요일 오후 12시 40분`, url: location.href };
  try {
    if (navigator.share) await navigator.share(shareData);
    else { await navigator.clipboard.writeText(location.href); showToast('청첩장 주소를 복사했습니다.'); }
  } catch (error) { if (error.name !== 'AbortError') showToast('공유하지 못했습니다.'); }
});

document.querySelector('#calendarButton').addEventListener('click', () => {
  const pad = (value) => String(value).padStart(2, '0');
  const toIcs = (date) => `${date.getUTCFullYear()}${pad(date.getUTCMonth()+1)}${pad(date.getUTCDate())}T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}00Z`;
  const end = new Date(CONFIG.weddingDate.getTime() + 2 * 60 * 60 * 1000);
  const ics = ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Wedding Invitation//KO','BEGIN:VEVENT',`DTSTART:${toIcs(CONFIG.weddingDate)}`,`DTEND:${toIcs(end)}`,`SUMMARY:${CONFIG.title}`,`LOCATION:${CONFIG.address}`,`DESCRIPTION:${CONFIG.title}`,`END:VEVENT`,'END:VCALENDAR'].join('\r\n');
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
