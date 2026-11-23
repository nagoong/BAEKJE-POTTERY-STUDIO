(() => {
  const relics = [
    { id:'jar', name:'직구단경호', period:'백제 전 시기', place:'백제 유적 출토 사례', size:'유물별 상이', material:'토기', type:'항아리형', desc:'짧고 곧은 목과 둥근 몸체가 특징이다. 어깨에는 문양대가 나타나고, 하부에는 타날문이 시문되기도 했다. 3세기 중·후반에 등장하여 백제 전 시기에 사용됐다.', pattern:'rings', objUrl:'./models/kimnagyeong-final.obj', mtlUrl:'./models/kimnagyeong.mtl' },
    { id:'pedestal', name:'고배', period:'한성기·웅진기·사비기', place:'백제 유적 출토 사례', size:'유물별 상이', material:'토기', type:'굽다리형', desc:'접시 모양의 몸체 아래에 굽다리가 부착된 기종이다. 뚜껑의 유무와 뚜껑받이턱의 존재에 따라 무개고배와 유개고배로 구분된다.', pattern:'lotus', objUrl:'' },
    { id:'threeleg', name:'삼족토기', period:'백제 고유 기종', place:'백제 유적 출토 사례', size:'유물별 상이', material:'토기', type:'세 다리형', desc:'반형 또는 배형의 몸체 아래에 세 개의 다리가 붙은 백제의 독특한 기종이다. 유개식과 무개식, 반형과 배형을 구분한다.', pattern:'cloud', objUrl:'' }
  ];
  const shapes = [
    {id:'jar', name:'직구단경호', sub:'짧고 곧은 목과 둥근 몸체', silhouette:'M34 12 C34 8 66 8 66 12 L65 22 C65 28 78 30 80 44 C84 68 73 88 50 91 C27 88 16 68 20 44 C22 30 35 28 35 22 Z', color:'#875844'},
    {id:'pedestal', name:'고배', sub:'접시형 몸체와 굽다리', silhouette:'M38 12 C38 8 62 8 62 12 L61 22 C61 29 74 30 77 43 C81 60 67 69 61 71 L65 84 L70 88 L70 92 L30 92 L30 88 L35 84 L39 71 C33 69 19 60 23 43 C26 30 39 29 39 22 Z', color:'#956d51'},
    {id:'threeleg', name:'삼족토기', sub:'세 다리가 부착된 반·배형 몸체', silhouette:'M18 38 C23 26 77 26 82 38 C78 49 22 49 18 38 Z M25 47 L35 78 L27 90 L37 90 L44 49 Z M75 47 L65 78 L73 90 L63 90 L56 49 Z M43 49 L57 49 L54 84 L46 84 Z', color:'#80684f'}
  ];
  const details = [
    {id:'long', name:'긴 목', sub:'목선을 길게'}, {id:'wide', name:'넓은 입구', sub:'열린 입술'}, {id:'foot', name:'낮은 굽', sub:'안정적인 바닥'}
  ];
  const patterns = [
    {id:'none',name:'무늬 없음',sub:'형태를 그대로',symbol:'○'},
    {id:'cloud',name:'구름무늬',sub:'백제의 부드러운 선',symbol:'☁'},
    {id:'lotus',name:'연꽃무늬',sub:'차분한 꽃잎 장식',symbol:'✿'},
    {id:'rings',name:'새김 선무늬',sub:'정갈한 반복 선',symbol:'〰'}
  ];
  const state = { page:'home', relicIndex:0, relicFilter:'all', step:1, shape:'jar', detail:'round', shoulder:true, lower:true, cover:'open', body:'bowl', depth:'deep', legs:'inside', pattern:'cloud', drawColor:'#874d3c', drawing:'', compareRelic:0, note:'', objName:'', records:loadRecords() };
  const app = document.getElementById('app');
  let toastTimer;
  function loadRecords(){ try{return JSON.parse(localStorage.getItem('baekje-pottery-records')||'[]')}catch{return[]} }
  function persist(){ try{localStorage.setItem('baekje-pottery-records',JSON.stringify(state.records))}catch{notify('이 브라우저에서는 기록 저장이 제한될 수 있어요.')} }
  function esc(value){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
  function currentShape(){return shapes.find(x=>x.id===state.shape)||shapes[0]}
  function patternMarkup(pattern){
    if(pattern==='cloud') return `<g fill="none" stroke="#e6cba9" stroke-width="1.8" opacity=".78"><path d="M27 52c-5-7 3-12 8-8 1-8 13-9 15-1 6-6 15-1 12 6 8-1 11 8 4 12H32c-8 0-9-7-5-9Z"/><path d="M34 67c-4-5 2-9 6-6 2-6 10-6 12 0 4-4 10-1 9 4 5 0 7 6 2 8H39c-6 0-8-4-5-6Z"/></g>`;
    if(pattern==='lotus') return `<g fill="none" stroke="#e6cba9" stroke-width="1.7" opacity=".82"><path d="M50 48c-8-12 0-18 0-18s8 6 0 18Zm0 0c-15-9-20-1-20-1s8 10 20 1Zm0 0c15-9 20-1 20-1s-8 10-20 1Zm0 0c-10 3-13 11-13 11h26s-3-8-13-11Z"/><path d="M37 65h26M41 70h18"/></g>`;
    if(pattern==='rings') return `<g fill="none" stroke="#e6cba9" stroke-width="1.8" opacity=".82"><path d="M25 48h50M22 54h56M23 60h54M27 66h46M33 72h34"/></g>`;
    return '';
  }
  function potSVG(shapeId=state.shape, pattern=state.pattern, detail=state.detail, uid='pot'){
    const shape=shapes.find(x=>x.id===shapeId)||shapes[0];
    let path=shape.silhouette;
    if(shapeId==='jar'&&detail==='oval') path='M34 12 C34 8 66 8 66 12 L65 22 C65 28 83 34 83 50 C84 72 72 88 50 91 C28 88 17 72 17 50 C17 34 35 28 35 22 Z';
    if(shapeId==='jar'&&detail==='wide') path='M29 12 C29 8 71 8 71 12 L68 22 C67 28 78 30 80 44 C84 68 73 88 50 91 C27 88 16 68 20 44 C22 30 33 28 32 22 Z';
    if(shapeId==='jar'&&detail==='long') path='M38 8 C38 5 62 5 62 8 L60 28 C60 34 77 34 80 47 C84 69 73 88 50 91 C27 88 16 69 20 47 C23 34 40 34 40 28 Z';
    if(shapeId==='pedestal'&&detail==='foot') path='M38 12 C38 8 62 8 62 12 L61 22 C61 29 74 30 77 43 C81 60 67 69 61 71 L63 83 L74 87 L74 92 L26 92 L26 87 L37 83 L39 71 C33 69 19 60 23 43 C26 30 39 29 39 22 Z';
    if(shapeId==='bottle'&&detail==='wide') path='M29 12 C29 8 71 8 71 12 L63 36 C62 41 74 44 77 55 C81 73 67 89 50 91 C33 89 19 73 23 55 C26 44 38 41 37 36 Z';
    const color=shape.color;
    return `<svg class="pot-svg" viewBox="0 0 100 104" role="img" aria-label="백제 토기 모형" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="${uid}g" x1="0" y1="0" x2=".9" y2="1"><stop stop-color="#c49b73"/><stop offset=".35" stop-color="${color}"/><stop offset=".72" stop-color="#654333"/><stop offset="1" stop-color="#37271f"/></linearGradient><linearGradient id="${uid}h" x1="0" x2="1"><stop stop-color="#fff1cf" stop-opacity=".36"/><stop offset=".42" stop-color="#fff" stop-opacity=".03"/><stop offset="1" stop-color="#21140e" stop-opacity=".3"/></linearGradient><filter id="${uid}t"><feTurbulence type="fractalNoise" baseFrequency=".75" numOctaves="2" seed="8"/><feColorMatrix values=".25 0 0 0 .3 .25 0 0 0 .22 .25 0 0 0 .18 0 0 0 .14 0"/></filter><clipPath id="${uid}c"><path d="${path}"/></clipPath></defs><ellipse cx="50" cy="94" rx="25" ry="3" fill="#4d392a" opacity=".22"/><path d="${path}" fill="url(#${uid}g)" stroke="#573b2b" stroke-width="1"/><g clip-path="url(#${uid}c)"><rect x="15" y="8" width="70" height="88" fill="url(#${uid}h)"/>${patternMarkup(pattern)}<rect x="15" y="8" width="70" height="88" filter="url(#${uid}t)" opacity=".55"/><path d="M22 49c-1 17 8 34 17 38" fill="none" stroke="#f1d6ae" stroke-opacity=".2" stroke-width="2"/></g><path d="M34 12c6-2 26-2 32 0" fill="none" stroke="#d2b18a" stroke-width="2" opacity=".8"/><path d="M43 90h14" stroke="#241b15" stroke-opacity=".45" stroke-width="2"/></svg>`;
  }
  function logo(){return `<span class="brand-mark"><svg viewBox="0 0 40 40" fill="none" aria-hidden="true"><path d="M7 32h26M10 32V15h20v17M7 15h26L20 6 7 15Zm7 0v17m12-17v17M15 20h3m4 0h3m-10 6h3m4 0h3" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/><path d="M4 35h32" stroke="currentColor" stroke-width="2"/></svg></span><span class="brand-name">BAEKJE<span>POTTERY STUDIO</span></span>`}
  function header(){const names=[['home','홈'],['gallery','전시실'],['create','제작실'],['compare','비교하기'],['records','기록실']];return `<header class="topbar"><button class="brand" data-page="home" aria-label="홈으로">${logo()}</button><nav class="nav" aria-label="주 메뉴">${names.map(([id,label])=>`<button data-page="${id}" class="${state.page===id?'active':''}">${label}</button>`).join('')}</nav><span class="profile-dot" title="로그인 기능 준비 중">⌂</span></header>`}
  function home(){return `<main><section class="hero"><div class="hero-content"><span class="eyebrow">A DIGITAL HERITAGE EXPERIENCE</span><h1>백제의 시간을<br>빚다.</h1><p>실제 유물을 관찰하고,<br>나만의 백제 토기를 만들어 보세요.</p><button class="btn btn-primary" data-page="create">토기 제작 시작하기 <span>→</span></button></div><div class="hero-visual">${potSVG('jar','cloud','long','hero')}</div><div class="hero-pager"><strong>01</strong><span>/ 03</span><span class="dots"><i></i><i></i><i></i></span></div><div class="hero-note">BAEKJE · POTTERY · STUDIO</div></section><section class="home-intro"><div><span class="eyebrow">OBSERVE · CREATE · COMPARE</span><h2>유물을 살펴보고,<br>나만의 방식으로 다시 빚어요.</h2><p class="subhead">백제 토기의 형태와 쓰임을 살펴본 뒤, 여러 선택지를 조합해 나만의 토기를 만들어 보세요.</p></div><div class="intro-points"><div class="intro-point"><b>01</b><span>실제 유물 관찰</span></div><div class="intro-point"><b>02</b><span>나만의 토기 제작</span></div><div class="intro-point"><b>03</b><span>형태 비교와 기록</span></div></div></section><footer class="footer">BAEKJE POTTERY STUDIO · DIGITAL HERITAGE EXPERIENCE</footer></main>`}
  function gallery(){const r=relics[state.relicIndex];return `<main><div class="container"><div class="page-heading"><div><span class="eyebrow">THE RELIC GALLERY</span><h1>백제 토기 전시실</h1><p class="subhead">실제 출토 토기의 형태와 특징을 관찰해 보세요.</p></div><button class="btn btn-outline" data-action="use-relic">이 토기로 만들어 보기 <span>→</span></button></div><div class="chips">${[['all','전체 유물'],['hanseong','한성기'],['ungjin','웅진기'],['sabi','사비기']].map(([id,n])=>`<button class="chip ${state.relicFilter===id?'active':''}" data-filter="${id}">${n}</button>`).join('')}</div><div class="gallery-layout"><section class="relic-stage"><div class="stage-glow"></div><button class="icon-btn stage-arrow left" data-relic="prev" aria-label="이전 유물">‹</button><div class="pot-holder">${potSVG(r.id,r.pattern,'long','gallery'+r.id)}</div><button class="icon-btn stage-arrow right" data-relic="next" aria-label="다음 유물">›</button><span class="stage-caption">모형 관찰 · 유물 형태를 살펴보세요</span></section><article class="info-card"><span class="period-tag">${r.period}</span><h2 style="margin-top:13px">${r.name}</h2><dl class="info-grid"><dt>출토지</dt><dd>${r.place}</dd><dt>크기</dt><dd>${r.size}</dd><dt>재질</dt><dd>${r.material}</dd><dt>기형</dt><dd>${r.type}</dd></dl>  <p class="description">${r.desc}</p><button class="btn btn-primary" data-action="relic-guide">유물 해설 보기 <span>→</span></button><div class="obj-tools"><label for="obj-file">스캔 OBJ 모델 열기</label><input id="obj-file" type="file" accept=".obj,text/plain"><small>선택한 OBJ는 브라우저에서만 읽으며 서버로 전송되지 않습니다. 360도 회전과 확대가 가능합니다.</small></div></article></div></div><footer class="footer">BAEKJE POTTERY STUDIO</footer></main>`}
  function progress(){return `<div class="steps">${['기본 형태','세부 형태','문양 선택','완성'].map((s,i)=>`<div class="step ${state.step===i+1?'active':''} ${state.step>i+1?'done':''}"><span class="num">${state.step>i+1?'✓':i+1}</span><span>${s}</span></div>${i<3?'<i class="step-line"></i>':''}`).join('')}</div>`}
  function createOptions(){
    if(state.step===1)return `<h2>기본 토기 형태 선택</h2><p class="subhead">세 가지 백제 대표 기종 중 하나를 골라보세요.</p><div class="option-grid">${shapes.map((s,i)=>`<button class="option ${state.shape===s.id?'selected':''}" data-shape="${s.id}"><span class="option-art">${potSVG(s.id,'none','round','opt'+i)}</span><b>${s.name}</b><small>${s.sub}</small></button>`).join('')}</div><div class="shape-summary">선택한 형태 <b>${currentShape().name}</b><br>실제 유물의 기형을 참고한 창작 모형입니다.</div>`;
    if(state.step===2){
      let groups='';
      if(state.shape==='jar') groups=`
        <div class="shape-summary"><b>몸체 형태</b></div><div class="pattern-list"><button class="pattern-option ${state.detail==='round'?'selected':''}" data-detail="round"><span class="pattern-swatch">○</span><span><b>원형</b><small>둥근 공 모양</small></span></button><button class="pattern-option ${state.detail==='oval'?'selected':''}" data-detail="oval"><span class="pattern-swatch">◯</span><span><b>타원형</b><small>위아래가 넓은 타원</small></span></button></div>
        <div class="pattern-list"><button class="pattern-option ${state.shoulder?'selected':''}" data-toggle="shoulder"><span class="pattern-swatch">〰</span><span><b>어깨 문양대</b><small>적용하기</small></span></button><button class="pattern-option ${state.lower?'selected':''}" data-toggle="lower"><span class="pattern-swatch">≋</span><span><b>하부 타날문</b><small>적용하기</small></span></button></div>`;
      if(state.shape==='pedestal') groups=`
        <div class="shape-summary"><b>뚜껑 구조</b></div><div class="pattern-list"><button class="pattern-option ${state.cover==='open'?'selected':''}" data-cover="open"><span class="pattern-swatch">○</span><span><b>무개식</b><small>뚜껑받이턱 없음</small></span></button><button class="pattern-option ${state.cover==='closed'?'selected':''}" data-cover="closed"><span class="pattern-swatch">◡</span><span><b>유개식</b><small>뚜껑받이턱 있음</small></span></button></div><div class="shape-summary">※ 뚜껑이 없더라도 뚜껑받이턱이 있으면 유개식으로 분류합니다.</div>`;
      if(state.shape==='threeleg') groups=`
        <div class="shape-summary"><b>몸체 형태와 구조</b></div><div class="pattern-list"><button class="pattern-option ${state.body==='bowl'?'selected':''}" data-body="bowl"><span class="pattern-swatch">반</span><span><b>반형</b><small>얕은 반 모양</small></span></button><button class="pattern-option ${state.body==='dish'?'selected':''}" data-body="dish"><span class="pattern-swatch">배</span><span><b>배형</b><small>배 모양의 몸체</small></span></button><button class="pattern-option ${state.cover==='open'?'selected':''}" data-cover="open"><span class="pattern-swatch">무</span><span><b>무개식</b><small>뚜껑 구조 없음</small></span></button><button class="pattern-option ${state.cover==='closed'?'selected':''}" data-cover="closed"><span class="pattern-swatch">유</span><span><b>유개식</b><small>뚜껑받이턱 구조</small></span></button></div>
        <div class="shape-summary"><b>단순화된 시대적 변화 옵션</b></div><div class="pattern-list"><button class="pattern-option ${state.depth==='deep'?'selected':''}" data-depth="deep"><span><b>깊은 형태</b><small>초기형에 가까움</small></span></button><button class="pattern-option ${state.depth==='shallow'?'selected':''}" data-depth="shallow"><span><b>얕은 형태</b><small>후기형에 가까움</small></span></button><button class="pattern-option ${state.legs==='inside'?'selected':''}" data-legs="inside"><span><b>안쪽 배치</b><small>세 다리를 모아 배치</small></span></button><button class="pattern-option ${state.legs==='outside'?'selected':''}" data-legs="outside"><span><b>바깥쪽 분산</b><small>세 다리를 벌려 배치</small></span></button></div><div class="shape-summary">※ 깊이와 다리 위치는 시대별 변화의 단순화된 제작 옵션이며 개별 유물을 그대로 재현한 선택지는 아닙니다.</div>`;
      return `<h2>세부 형태 선택</h2><p class="subhead">선택한 기종의 세부 요소를 조합하세요.</p>${groups}`;
    }
    if(state.step===3)return `<h2>장식 추가</h2><p class="subhead">구름무늬·연꽃무늬는 참고용이고, 아래 메모는 창작 장식입니다.</p><div class="pattern-list">${patterns.map(p=>`<button class="pattern-option ${state.pattern===p.id?'selected':''}" data-pattern="${p.id}"><span class="pattern-swatch">${p.symbol}</span><span><b>${p.name}</b><small>${p.sub}</small></span></button>`).join('')}</div><div class="drawing-controls">${['#874d3c','#b98970','#4d4a3d','#fff4dc'].map(c=>`<button class="color-dot ${state.drawColor===c?'selected':''}" style="background:${c}" data-drawcolor="${c}" aria-label="창작 장식 색상"></button>`).join('')}</div><textarea class="drawing-note" id="drawing-note" placeholder="창작 장식으로 그릴 무늬를 간단히 메모해 보세요.">${esc(state.drawing)}</textarea><div class="model-disclaimer">선택한 문양과 메모는 사용자가 직접 만든 창작 장식이며 실제 유물의 장식을 그대로 구현한 것이 아닙니다.</div>`;
    return `<h2>나만의 토기 완성</h2><p class="subhead">선택한 요소를 확인하고 실제 유물과 비교해 보세요.</p><div class="shape-summary"><b>${currentShape().name}</b><br>${patterns.find(p=>p.id===state.pattern)?.name} · 창작 장식 메모 반영</div><div class="model-disclaimer">실제 스캔 3D가 아닌 교육용 벡터 모형입니다. 완성 시 실제 유물 설명과 나란히 비교할 수 있습니다.</div>`;
  }
  function creator(){return `<main><div class="container"><div class="creator-top"><div><span class="eyebrow">YOUR POTTERY WORKSHOP</span><h1 style="font-size:34px;margin:7px 0 0">나만의 토기 제작실</h1><p class="subhead">백제 토기를 참고하여 나만의 토기를 만들어 보세요.</p></div><button class="btn btn-quiet" data-page="gallery">유물 먼저 관찰하기</button></div>${progress()}<div class="creator-layout"><section class="preview-card"><span class="preview-hint">모형 미리보기 · 드래그 회전은 준비 중</span><div class="preview-pot">${potSVG(state.shape,state.pattern,state.detail,'preview')}</div></section><section class="options-card">${createOptions()}<div class="options-footer"><span>STEP 0${state.step} / 04</span><div style="display:flex;gap:8px">${state.step>1?'<button class="btn btn-outline" data-action="prev-step">이전</button>':''}<button class="btn btn-primary" data-action="next-step">${state.step===4?'비교하러 가기':'다음 단계'} <span>→</span></button></div></div></section></div></div><footer class="footer">BAEKJE POTTERY STUDIO</footer></main>`}
  function compare(){const r=relics[state.compareRelic];return `<main><div class="container"><div class="page-heading"><div><span class="eyebrow">FORM & PROPORTION</span><h1>실제 유물과 비교하기</h1><p class="subhead">내가 만든 토기와 실제 출토 유물을 나란히 살펴보세요.</p></div><button class="btn btn-outline" data-page="create">제작실로 돌아가기</button></div><div class="chips">${relics.map((x,i)=>`<button class="chip ${i===state.compareRelic?'active':''}" data-compare-relic="${i}">${x.name}</button>`).join('')}</div><div class="compare-grid"><figure class="compare-figure"><div class="figure-art">${potSVG(r.id,r.pattern,'long','compareRelic')}</div><figcaption>실제 출토 토기 · ${r.name}</figcaption></figure><figure class="compare-figure"><div class="figure-art">${potSVG(state.shape,state.pattern,state.detail,'compareOwn')}</div><figcaption>나의 토기 · ${currentShape().name}</figcaption></figure><section class="compare-stats"><h3>형태 비교 결과</h3><div class="stat-row"><span>높이</span><span>28cm　|　<b>26cm</b></span></div><div class="stat-row"><span>너비</span><span>19cm　|　<b>21cm</b></span></div><div class="stat-row"><span>기형</span><span>${r.type}　|　<b>${currentShape().name}</b></span></div><div class="similarity">${state.shape===r.id?'92':'78'}<small style="font:14px 'Noto Sans KR'">%</small></div><p>두 토기는 전체적인 형태가 ${state.shape===r.id?'매우':'서로 다른 요소도 있어'} 유사합니다. 목의 길이와 몸체의 비례를 함께 살펴보세요.</p></section></div><section class="note-box"><label for="pot-note">나만의 토기 특징을 적어보세요.</label><textarea id="pot-note" placeholder="예) 둥근 몸통과 좁은 입구가 특징이에요.">${esc(state.note)}</textarea><div class="note-row"><span class="subhead" style="font-size:11px">메모는 토기 기록에 함께 저장됩니다.</span><button class="btn btn-primary" data-action="save">기록 저장하기 <span>→</span></button></div></section></div><footer class="footer">BAEKJE POTTERY STUDIO</footer></main>`}
  function records(){return `<main><div class="container"><div class="page-heading"><div><span class="eyebrow">YOUR COLLECTION</span><h1>나의 토기 기록실</h1><p class="subhead">지금까지 만든 나의 토기를 확인해 보세요.</p></div><button class="btn btn-primary" data-page="create">새 토기 만들기 <span>→</span></button></div>${state.records.length?`<div class="record-list">${state.records.map((r,i)=>`<article class="record-card"><div class="record-image">${potSVG(r.shape,r.pattern,r.detail,'record'+i)}</div><div class="record-info"><span class="period-tag">${esc(r.shapeName)}</span><h3 style="margin-top:10px">${esc(r.title)}</h3><p>제작일　${esc(r.date)}<br>${esc(r.patternName)} · ${esc(r.detailName)}${r.note?`<br>${esc(r.note)}`:''}</p><div class="record-actions"><button class="btn btn-outline" data-download="${i}">이미지 저장</button><button class="btn btn-quiet" data-record-download="${i}">기록 다운로드</button></div></div></article>`).join('')}</div>`:`<div class="record-list"><div class="empty-state"><div class="empty-icon">◌</div><h3>아직 기록한 토기가 없어요</h3><p>제작실에서 첫 번째 토기를 만들어 보세요.</p><button class="btn btn-primary" data-page="create">토기 만들기 <span>→</span></button></div></div>`}</div><footer class="footer">BAEKJE POTTERY STUDIO</footer></main>`}
  function showObjObject(object,label,hasMaterials=false){
    const holder=document.querySelector('.pot-holder');
    if(!holder)return;
    holder.innerHTML='<div class="obj-viewer" id="obj-viewer"></div>';
    const host=holder.querySelector('#obj-viewer');
    const scene=new THREE.Scene();
    const camera=new THREE.PerspectiveCamera(35,host.clientWidth/host.clientHeight,0.1,1000);
    camera.position.set(0,1.2,4);
    const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true});
    renderer.setSize(host.clientWidth,host.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
    host.appendChild(renderer.domElement);
    scene.add(new THREE.HemisphereLight(0xfff5e6,0x4a3427,1.5));
    const light=new THREE.DirectionalLight(0xffffff,1.2);light.position.set(3,5,4);scene.add(light);
    if(!hasMaterials) object.traverse(child=>{if(child.isMesh){child.material=new THREE.MeshStandardMaterial({color:0x956d51,roughness:.78,metalness:0})}});
    const box=new THREE.Box3().setFromObject(object);
    const size=box.getSize(new THREE.Vector3());
    const center=box.getCenter(new THREE.Vector3());
    object.position.sub(center);
    object.scale.setScalar(2.2/Math.max(size.x,size.y,size.z));
    scene.add(object);
    const controls=new THREE.OrbitControls(camera,renderer.domElement);
    controls.enableDamping=true;controls.dampingFactor=.08;controls.enablePan=false;
    function animate(){requestAnimationFrame(animate);controls.update();renderer.render(scene,camera)}animate();
    state.objName=label;notify(`${label} 모델을 열었어요.`);
  }
  function loadObjFile(file){
    if(!file || !window.THREE || !window.THREE.OBJLoader){notify('3D 뷰어 라이브러리를 불러오지 못했어요.');return}
    const reader=new FileReader();
    reader.onload=()=>showObjObject(new THREE.OBJLoader().parse(reader.result),file.name);
    reader.readAsText(file);
  }
  function loadObjUrl(url,label){
    if(!window.THREE || !window.THREE.OBJLoader){notify('3D 뷰어 라이브러리를 불러오지 못했어요.');return}
    const holder=document.querySelector('.pot-holder');
    if(holder)holder.innerHTML='<div style="display:grid;place-items:center;height:100%;color:#806a55;font-size:11px">스캔 모델 불러오는 중…</div>';
    const mtlUrl=relics[state.relicIndex].mtlUrl;
    if(mtlUrl && window.THREE.MTLLoader){
      const mtlLoader=new THREE.MTLLoader();
      mtlLoader.setPath('./models/');
      mtlLoader.load('kimnagyeong.mtl',
        materials=>{
          materials.preload();
          const objLoader=new THREE.OBJLoader();
          objLoader.setMaterials(materials);
          objLoader.load(url,
            object=>showObjObject(object,label,true),
            xhr=>{if(holder&&xhr.total)holder.setAttribute('data-load-progress',`${Math.round(xhr.loaded/xhr.total*100)}%`)},
            ()=>notify('OBJ 파일을 불러오지 못했어요.')
          );
        },
        undefined,
        ()=>{
          new THREE.OBJLoader().load(url,
            object=>showObjObject(object,label,false),
            undefined,
            ()=>notify('OBJ 파일을 불러오지 못했어요.')
          );
        }
      );
    }else{
      new THREE.OBJLoader().load(url,
        object=>showObjObject(object,label,false),
        undefined,
        ()=>notify('OBJ 파일을 불러오지 못했어요.')
      );
    }
  }
  function render(){
    app.innerHTML=`<div class="shell">${header()}${({home,gallery,create:creator,compare,records}[state.page]||home)()}<div class="toast" id="toast"></div></div>`;
    if(state.page==='gallery'){
      const relic=relics[state.relicIndex];
      if(relic.objUrl)requestAnimationFrame(()=>loadObjUrl(relic.objUrl,relic.name));
    }
  }
  function notify(message){const el=document.getElementById('toast');if(!el)return;el.textContent=message;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),2400)}
  function guide(){const r=relics[state.relicIndex];const div=document.createElement('div');div.className='modal-backdrop';div.innerHTML=`<article class="modal"><button class="icon-btn close" data-action="close-modal" aria-label="닫기">×</button><span class="eyebrow">OBJECT GUIDE · ${esc(r.period)}</span><h2>${esc(r.name)} 읽어보기</h2><p>${esc(r.desc)}</p><p>구연부·목·어깨·몸체·하부·굽·다리의 위치를 관찰하고, 제작실에서 실제 유물의 특징을 참고해 나만의 모형을 조합해 보세요.</p><button class="btn btn-primary" data-action="guide-create">이 형태 참고하기 →</button></article>`;document.body.append(div);div.addEventListener('click',e=>{if(e.target===div||e.target.closest('[data-action="close-modal"]'))div.remove();if(e.target.closest('[data-action="guide-create"]')){div.remove();state.shape=r.id;state.pattern='none';state.step=1;state.page='create';render()}})}
  function chosenDetailName(){
    if(state.shape==='jar') return state.detail==='oval'?'타원형 몸체':'원형 몸체';
    if(state.shape==='pedestal') return state.cover==='closed'?'유개고배':'무개고배';
    if(state.shape==='threeleg') return `${state.body==='dish'?'배형':'반형'} · ${state.cover==='closed'?'유개식':'무개식'} · ${state.depth==='shallow'?'얕은 형태':'깊은 형태'} · ${state.legs==='outside'?'바깥쪽 다리':'안쪽 다리'}`;
    return state.detail;
  }
  function save(){const now=new Date();const item={id:Date.now(),title:`나의 ${['첫 번째','두 번째','세 번째','네 번째'][Math.min(state.records.length,3)]} 백제 토기`,date:`${now.getFullYear()}.${String(now.getMonth()+1).padStart(2,'0')}.${String(now.getDate()).padStart(2,'0')}`,shape:state.shape,shapeName:currentShape().name,detail:state.detail,detailName:chosenDetailName(),pattern:state.pattern,patternName:patterns.find(p=>p.id===state.pattern).name,drawing:state.drawing,note:state.note};state.records.unshift(item);persist();state.page='records';render();notify('토기 기록을 저장했어요.')}
  function svgDownload(index){const item=state.records[index];const svg=potSVG(item.shape,item.pattern,item.detail,'download'+index).replace('class="pot-svg"','');const full=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 104" width="1200" height="1248"><rect width="100%" height="100%" fill="#efe3d2"/>${svg}</svg>`;const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([full],{type:'image/svg+xml'}));a.download=`baekje-pottery-${item.id}.svg`;a.click();URL.revokeObjectURL(a.href);notify('토기 이미지를 저장했어요.')}
  function jsonDownload(index){const item=state.records[index];const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(item,null,2)],{type:'application/json'}));a.download=`baekje-pottery-record-${item.id}.json`;a.click();URL.revokeObjectURL(a.href);notify('토기 기록 파일을 저장했어요.')}
  app.addEventListener('click',e=>{
    const page=e.target.closest('[data-page]');if(page){state.page=page.dataset.page;render();window.scrollTo({top:0,behavior:'smooth'});return}
    const filter=e.target.closest('[data-filter]');if(filter){const id=filter.dataset.filter;state.relicFilter=id;state.relicIndex=id==='all'?0:id==='hanseong'?0:id==='ungjin'?1:2;render();return}
    const relic=e.target.closest('[data-relic]');if(relic){state.relicIndex=(state.relicIndex+(relic.dataset.relic==='next'?1:relics.length-1))%relics.length;render();return}
    const shape=e.target.closest('[data-shape]');if(shape){state.shape=shape.dataset.shape;render();return}
    const detail=e.target.closest('[data-detail]');if(detail){state.detail=detail.dataset.detail;render();return}
    const toggle=e.target.closest('[data-toggle]');if(toggle){const key=toggle.dataset.toggle;state[key]=!state[key];render();return}
    const cover=e.target.closest('[data-cover]');if(cover){state.cover=cover.dataset.cover;render();return}
    const body=e.target.closest('[data-body]');if(body){state.body=body.dataset.body;render();return}
    const depth=e.target.closest('[data-depth]');if(depth){state.depth=depth.dataset.depth;render();return}
    const legs=e.target.closest('[data-legs]');if(legs){state.legs=legs.dataset.legs;render();return}
    const drawColor=e.target.closest('[data-drawcolor]');if(drawColor){state.drawColor=drawColor.dataset.drawcolor;render();return}
    const pattern=e.target.closest('[data-pattern]');if(pattern){state.pattern=pattern.dataset.pattern;render();return}
    const cr=e.target.closest('[data-compare-relic]');if(cr){state.compareRelic=Number(cr.dataset.compareRelic);render();return}
    const dl=e.target.closest('[data-download]');if(dl){svgDownload(Number(dl.dataset.download));return}
    const jd=e.target.closest('[data-record-download]');if(jd){jsonDownload(Number(jd.dataset.recordDownload));return}
    const action=e.target.closest('[data-action]')?.dataset.action;
    if(action==='use-relic'){const r=relics[state.relicIndex];state.shape=r.id;state.pattern='none';state.step=1;state.page='create';render();return}
    if(action==='relic-guide'){guide();return}
    if(action==='prev-step'){state.step=Math.max(1,state.step-1);render();return}
    if(action==='next-step'){if(state.step<4){state.step++;render()}else{state.compareRelic=Math.max(0,relics.findIndex(r=>r.id===state.shape));state.page='compare';render()}return}
    if(action==='save'){state.note=document.getElementById('pot-note')?.value.trim()||'';save();return}
    if(action==='close-modal'){document.querySelector('.modal-backdrop')?.remove();return}
  });
  app.addEventListener('input',e=>{
    if(e.target.id==='pot-note')state.note=e.target.value;
    if(e.target.id==='drawing-note')state.drawing=e.target.value;
  });
  app.addEventListener('change',e=>{
    if(e.target.id==='obj-file' && e.target.files?.[0]) loadObjFile(e.target.files[0]);
  });
  render();
})();
