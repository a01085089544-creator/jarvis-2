const $=s=>document.querySelector(s), chat=$('#chat'), q=$('#q'), status=$('#status');let last='';
function add(t,c){let d=document.createElement('div');d.className='bubble '+c;d.textContent=t;chat.appendChild(d);chat.scrollTop=chat.scrollHeight;if(c==='jarvis')last=t}
function say(t){add(t,'jarvis');if('speechSynthesis'in window){speechSynthesis.cancel();let u=new SpeechSynthesisUtterance(t);u.lang='ko-KR';speechSynthesis.speak(u)}}
function search(x){let term=x.replace(/웹 검색|검색해줘|검색/g,'').trim();if(!term){say('검색어를 입력하세요.');return}location.href='https://www.google.com/search?q='+encodeURIComponent(term)}
function map(x){let dest=x.replace(/지도|열어줘|길찾기|경로/g,'').trim();location.href=dest?'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(dest):'https://www.google.com/maps'}
function locationNow(){if(!navigator.geolocation){say('이 브라우저는 GPS를 지원하지 않습니다.');return}status.textContent='GPS…';navigator.geolocation.getCurrentPosition(p=>{status.textContent='ONLINE';let a=p.coords.latitude,b=p.coords.longitude;say(`현재 위치를 확인했습니다.\n위도 ${a.toFixed(5)}, 경도 ${b.toFixed(5)}\n지도에서 확인하려면 위치 버튼을 다시 누르거나 지도 앱을 이용하세요.`)},e=>{status.textContent='ONLINE';say(e.code===1?'위치 권한이 거부되었습니다. 브라우저 설정에서 위치 권한을 허용하세요.':'현재 위치를 가져오지 못했습니다.')},{enableHighAccuracy:true,timeout:10000,maximumAge:0})}
function execute(){let x=q.value.trim();if(!x)return;add(x,'user');q.value='';let l=x.toLowerCase();
if(l.includes('위치'))return locationNow();
if(l.includes('지도')||l.includes('길찾기')||l.includes('경로'))return map(x);
if(l.includes('검색'))return search(x);
if(l.includes('기억')){if(l.includes('보여')){say(localStorage.getItem('jarvis_memory')||'저장된 기억이 없습니다.')}else{localStorage.setItem('jarvis_memory',x);say('이 기기의 기억에 저장했습니다.')}return}
if(l.includes('이미지')||l.includes('도면')){$('#file').click();return}
if(l.includes('안녕'))return say('안녕하세요. JARVIS입니다. 현재 연결된 기능을 사용할 준비가 되어 있습니다.');
say('현재 명령을 이해했지만, 이 웹앱에는 외부 AI 서버가 연결되지 않았습니다. AI 대화를 실제로 사용하려면 API를 서버에 안전하게 연결해야 합니다.')}
$('#go').onclick=execute;q.addEventListener('keydown',e=>{if(e.key==='Enter')execute()});
document.querySelectorAll('.quick button').forEach(b=>b.onclick=()=>{q.value=b.dataset.c;execute()});
$('#mic').onclick=()=>{let SR=window.SpeechRecognition||window.webkitSpeechRecognition;if(!SR){say('음성 인식을 지원하지 않는 브라우저입니다. Android Chrome에서 사용하세요.');return}let r=new SR();r.lang='ko-KR';r.interimResults=false;r.maxAlternatives=1;status.textContent='LISTENING';r.onresult=e=>{status.textContent='ONLINE';q.value=e.results[0][0].transcript;execute()};r.onerror=()=>status.textContent='ONLINE';r.start()};
$('#file').onchange=e=>{let f=e.target.files[0];if(f)say(`이미지 ${f.name}을 선택했습니다. 실제 이미지·도면 분석은 Vision API 연결 후 분석 결과를 표시하도록 확장할 수 있습니다.`)};
$('#photo').onclick=()=>$('#file').click();
let deferred;window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferred=e;$('#install').hidden=false});$('#install').onclick=async()=>{if(deferred){deferred.prompt();await deferred.userChoice;deferred=null;$('#install').hidden=true}};
if('serviceWorker'in navigator)navigator.serviceWorker.register('sw.js').catch(()=>{});
