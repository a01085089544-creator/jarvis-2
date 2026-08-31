const $ = s => document.querySelector(s);

const chat = $('#chat');
const q = $('#q');
const status = $('#status');

let last = '';

function add(text, cls) {
  const d = document.createElement('div');
  d.className = 'bubble ' + cls;
  d.textContent = text;
  chat.appendChild(d);
  chat.scrollTop = chat.scrollHeight;

  if (cls === 'jarvis') last = text;
}

function say(text) {
  add(text, 'jarvis');

  if ('speechSynthesis' in window) {
    speechSynthesis.cancel();

    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'ko-KR';
    speechSynthesis.speak(u);
  }
}

function search(x) {
  const term = x.replace(/웹 검색|검색해줘|검색/g, '').trim();

  if (!term) {
    say('검색어를 입력하세요.');
    return;
  }

  location.href =
    'https://www.google.com/search?q=' +
    encodeURIComponent(term);
}

function map(x) {
  const dest = x.replace(/지도|열어줘|길찾기|경로/g, '').trim();

  location.href = dest
    ? 'https://www.google.com/maps/search/?api=1&query=' +
      encodeURIComponent(dest)
    : 'https://www.google.com/maps';
}

function locationNow() {
  if (!navigator.geolocation) {
    say('이 브라우저는 GPS를 지원하지 않습니다.');
    return;
  }

  status.textContent = 'GPS…';

  navigator.geolocation.getCurrentPosition(
    p => {
      status.textContent = 'ONLINE';

      const a = p.coords.latitude;
      const b = p.coords.longitude;

      say(
        `현재 위치를 확인했습니다.\n위도 ${a.toFixed(5)}, 경도 ${b.toFixed(5)}`
      );
    },
    () => {
      status.textContent = 'ONLINE';
      say('현재 위치를 가져오지 못했습니다.');
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    }
  );
}

async function askAI(message) {
  say('생각 중입니다...');

  try {
    const r = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: message
      })
    });

    const data = await r.json();

    if (!r.ok) {
      throw new Error(data.error || 'AI 서버 오류');
    }

    if (data.reply) {
      say(data.reply);
    } else {
      say('AI의 응답을 받지 못했습니다.');
    }

  } catch (error) {
    console.error(error);
    say('AI 연결 오류: ' + error.message);
  }
}

function execute() {
  const x = q.value.trim();

  if (!x) return;

  add(x, 'user');
  q.value = '';

  const l = x.toLowerCase();

  if (l.includes('위치')) {
    locationNow();
    return;
  }

  if (
    l.includes('지도') ||
    l.includes('길찾기') ||
    l.includes('경로')
  ) {
    map(x);
    return;
  }

  if (l.includes('검색')) {
    search(x);
    return;
  }

  if (l.includes('기억')) {
    if (l.includes('보여')) {
      say(
        localStorage.getItem('jarvis_memory') ||
        '저장된 기억이 없습니다.'
      );
    } else {
      localStorage.setItem('jarvis_memory', x);
      say('이 기기의 기억에 저장했습니다.');
    }

    return;
  }

  if (l.includes('이미지') || l.includes('도면')) {
    $('#file').click();
    return;
  }

  askAI(x);
}

$('#go').addEventListener('click', execute);

q.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    execute();
  }
});

document.querySelectorAll('.quick button').forEach(button => {
  button.addEventListener('click', () => {
    q.value = button.dataset.c;
    execute();
  });
});

$('#mic').addEventListener('click', () => {
  const SR =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;

  if (!SR) {
    say('음성 인식을 지원하지 않는 브라우저입니다.');
    return;
  }

  const r = new SR();

  r.lang = 'ko-KR';
  r.interimResults = false;
  r.maxAlternatives = 1;

  status.textContent = 'LISTENING';

  r.onresult = e => {
    status.textContent = 'ONLINE';
    q.value = e.results[0][0].transcript;
    execute();
  };

  r.onerror = () => {
    status.textContent = 'ONLINE';
  };

  r.start();
});

$('#file').addEventListener('change', e => {
  const f = e.target.files[0];

  if (f) {
    say(`이미지 ${f.name}을 선택했습니다.`);
  }
});
