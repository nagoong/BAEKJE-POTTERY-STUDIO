(() => {
  let relics = [];
  const shapes = [
    {id:'jar', name:'직구단경호', hanja:'直口短頸壺', description:'짧고 곧은 목과 둥근 몸체가 특징인 항아리입니다. 어깨에는 무늬 띠가 나타나고, 몸체 아래쪽에는 타날문이 시문되기도 합니다. 3세기 중·후반에 등장해 백제 전 시기에 걸쳐 사용된 한성기의 대표 기종입니다.', silhouette:'M34 12 C34 8 66 8 66 12 L65 22 C65 28 78 30 80 44 C84 68 73 88 50 91 C27 88 16 68 20 44 C22 30 35 28 35 22 Z', color:'#875844'},
    {id:'pedestal', name:'고배', hanja:'高杯', description:'굽이 달린 접시 모양의 토기입니다. 무개고배와 유개고배로 구분하며, 무개고배는 3세기 후반경 등장해 한성기 말까지 사용되었습니다. 뚜껑이 남아 있지 않아도 뚜껑받이턱이 있으면 유개식으로 분류합니다.', silhouette:'M38 12 C38 8 62 8 62 12 L61 22 C61 29 74 30 77 43 C81 60 67 69 61 71 L65 84 L70 88 L70 92 L30 92 L30 88 L35 84 L39 71 C33 69 19 60 23 43 C26 30 39 29 39 22 Z', color:'#956d51'},
    {id:'threeleg', name:'삼족토기', hanja:'三足土器', description:'접시나 잔 형태의 몸체 아래에 세 개의 다리가 붙은 토기입니다. 크기에 따라 반과 배로, 형태에 따라 유개식과 무개식으로 구분합니다. 백제 고유 기종이며, 유개식 배형은 백제 전 시기에 사용되었습니다. 후대로 갈수록 몸체가 얕아지고 다리가 바깥쪽으로 벌어집니다.', silhouette:'M18 38 C23 26 77 26 82 38 C78 49 22 49 18 38 Z M25 47 L35 78 L27 90 L37 90 L44 49 Z M75 47 L65 78 L73 90 L63 90 L56 49 Z M43 49 L57 49 L54 84 L46 84 Z', color:'#80684f'}
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
  const state = { page:'home', relicIndex:0, compareRelic:0, completedCreation:false, step:1, shape:'jar', detail:'round', shoulder:true, lower:true, cover:'open', body:'bowl', depth:'deep', legs:'inside', pattern:'none', clayColor:'#875844', drawColor:'#f6e8d2', brushSize:12, strokes:[], note:'', objName:'', records:[] };
  const app = document.getElementById('app');
  let toastTimer;
  let creatorViews=[];
  function esc(value){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
  function currentShape(){return shapes.find(x=>x.id===state.shape)||shapes[0]}
  function patternMarkup(pattern){
    if(pattern==='cloud') return `<g fill="none" stroke="#e6cba9" stroke-width="1.8" opacity=".78"><path d="M27 52c-5-7 3-12 8-8 1-8 13-9 15-1 6-6 15-1 12 6 8-1 11 8 4 12H32c-8 0-9-7-5-9Z"/><path d="M34 67c-4-5 2-9 6-6 2-6 10-6 12 0 4-4 10-1 9 4 5 0 7 6 2 8H39c-6 0-8-4-5-6Z"/></g>`;
    if(pattern==='lotus') return `<g fill="none" stroke="#e6cba9" stroke-width="1.7" opacity=".82"><path d="M50 48c-8-12 0-18 0-18s8 6 0 18Zm0 0c-15-9-20-1-20-1s8 10 20 1Zm0 0c15-9 20-1 20-1s-8 10-20 1Zm0 0c-10 3-13 11-13 11h26s-3-8-13-11Z"/><path d="M37 65h26M41 70h18"/></g>`;
    if(pattern==='rings') return `<g fill="none" stroke="#e6cba9" stroke-width="1.8" opacity=".82"><path d="M25 48h50M22 54h56M23 60h54M27 66h46M33 72h34"/></g>`;
    return '';
  }
  function svgDrawingLayer(strokes,uid){
    if(!strokes?.length)return '';
    const canvas=document.createElement('canvas');
    canvas.width=1024;canvas.height=512;
    const ctx=canvas.getContext('2d');
    strokes.forEach(stroke=>{
      ctx.strokeStyle=stroke.color;ctx.fillStyle=stroke.color;
      ctx.lineWidth=stroke.size*1.6;ctx.lineCap='round';ctx.lineJoin='round';
      if(stroke.points.length===1){
        ctx.beginPath();ctx.arc(stroke.points[0].x*canvas.width,stroke.points[0].y*canvas.height,ctx.lineWidth/2,0,Math.PI*2);ctx.fill();
      }else{
        ctx.beginPath();
        stroke.points.forEach((point,index)=>{
          const x=point.x*canvas.width,y=point.y*canvas.height;
          if(index===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
        });
        ctx.stroke();
      }
    });
    return `<image href="${canvas.toDataURL('image/png')}" x="15" y="8" width="70" height="88" preserveAspectRatio="none" clip-path="url(#${uid}c)"/>`;
  }
  function potSVG(shapeId=state.shape, pattern=state.pattern, detail=state.detail, uid='pot', potteryColor=null, paintStrokes=[]){
    const shape=shapes.find(x=>x.id===shapeId)||shapes[0];
    let path=shape.silhouette;
    if(shapeId==='jar'&&detail==='oval') path='M34 12 C34 8 66 8 66 12 L65 22 C65 28 83 34 83 50 C84 72 72 88 50 91 C28 88 17 72 17 50 C17 34 35 28 35 22 Z';
    if(shapeId==='jar'&&detail==='wide') path='M29 12 C29 8 71 8 71 12 L68 22 C67 28 78 30 80 44 C84 68 73 88 50 91 C27 88 16 68 20 44 C22 30 33 28 32 22 Z';
    if(shapeId==='jar'&&detail==='long') path='M38 8 C38 5 62 5 62 8 L60 28 C60 34 77 34 80 47 C84 69 73 88 50 91 C27 88 16 69 20 47 C23 34 40 34 40 28 Z';
    if(shapeId==='pedestal'&&detail==='foot') path='M38 12 C38 8 62 8 62 12 L61 22 C61 29 74 30 77 43 C81 60 67 69 61 71 L63 83 L74 87 L74 92 L26 92 L26 87 L37 83 L39 71 C33 69 19 60 23 43 C26 30 39 29 39 22 Z';
    if(shapeId==='bottle'&&detail==='wide') path='M29 12 C29 8 71 8 71 12 L63 36 C62 41 74 44 77 55 C81 73 67 89 50 91 C33 89 19 73 23 55 C26 44 38 41 37 36 Z';
    const color=potteryColor||shape.color;
    return `<svg class="pot-svg" viewBox="0 0 100 104" role="img" aria-label="백제 토기 모형" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="${uid}g" x1="0" y1="0" x2=".9" y2="1"><stop stop-color="#c49b73"/><stop offset=".35" stop-color="${color}"/><stop offset=".72" stop-color="#654333"/><stop offset="1" stop-color="#37271f"/></linearGradient><linearGradient id="${uid}h" x1="0" x2="1"><stop stop-color="#fff1cf" stop-opacity=".36"/><stop offset=".42" stop-color="#fff" stop-opacity=".03"/><stop offset="1" stop-color="#21140e" stop-opacity=".3"/></linearGradient><filter id="${uid}t"><feTurbulence type="fractalNoise" baseFrequency=".75" numOctaves="2" seed="8"/><feColorMatrix values=".25 0 0 0 .3 .25 0 0 0 .22 .25 0 0 0 .18 0 0 0 .14 0"/></filter><clipPath id="${uid}c"><path d="${path}"/></clipPath></defs><ellipse cx="50" cy="94" rx="25" ry="3" fill="#4d392a" opacity=".22"/><path d="${path}" fill="url(#${uid}g)" stroke="#573b2b" stroke-width="1"/><g clip-path="url(#${uid}c)"><rect x="15" y="8" width="70" height="88" fill="url(#${uid}h)"/>${patternMarkup(pattern)}<rect x="15" y="8" width="70" height="88" filter="url(#${uid}t)" opacity=".55"/><path d="M22 49c-1 17 8 34 17 38" fill="none" stroke="#f1d6ae" stroke-opacity=".2" stroke-width="2"/>${svgDrawingLayer(paintStrokes,uid)}</g><path d="M34 12c6-2 26-2 32 0" fill="none" stroke="#d2b18a" stroke-width="2" opacity=".8"/><path d="M43 90h14" stroke="#241b15" stroke-opacity=".45" stroke-width="2"/></svg>`;
  }
  function logo(){return `<span class="brand-mark"><svg viewBox="0 0 40 40" fill="none" aria-hidden="true"><path d="M7 32h26M10 32V15h20v17M7 15h26L20 6 7 15Zm7 0v17m12-17v17M15 20h3m4 0h3m-10 6h3m4 0h3" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/><path d="M4 35h32" stroke="currentColor" stroke-width="2"/></svg></span><span class="brand-name">BAEKJE<span>POTTERY STUDIO</span></span>`}
  function header(){const names=[['home','홈'],['gallery','전시실'],['create','제작실'],['compare','비교하기'],['records','기록실']];return `<header class="topbar"><button class="brand" data-page="home" aria-label="홈으로">${logo()}</button><nav class="nav" aria-label="주 메뉴">${names.map(([id,label])=>`<button data-page="${id}" class="${state.page===id||(state.page==='relic-detail'&&id==='gallery')?'active':''}">${label}</button>`).join('')}</nav><span class="profile-dot" title="로그인 기능 준비 중">⌂</span></header>`}
  function home(){return `<main><section class="hero"><div class="hero-content"><span class="eyebrow">A DIGITAL HERITAGE EXPERIENCE</span><h1>백제의 시간을<br>빚다.</h1><p>실제 유물을 관찰하고,<br>나만의 백제 토기를 만들어 보세요.</p><button class="btn btn-primary" data-page="create">토기 제작 시작하기 <span>→</span></button></div><div class="hero-visual">${potSVG('jar','cloud','long','hero')}</div><div class="hero-pager"><strong>01</strong><span>/ 03</span><span class="dots"><i></i><i></i><i></i></span></div><div class="hero-note">BAEKJE · POTTERY · STUDIO</div></section><section class="home-intro"><div><span class="eyebrow">OBSERVE · CREATE · COMPARE</span><h2>유물을 살펴보고,<br>나만의 방식으로 다시 빚어요.</h2><p class="subhead">백제 토기의 형태와 쓰임을 살펴본 뒤, 여러 선택지를 조합해 나만의 토기를 만들어 보세요.</p></div><div class="intro-points"><div class="intro-point"><b>01</b><span>실제 유물 관찰</span></div><div class="intro-point"><b>02</b><span>나만의 토기 제작</span></div><div class="intro-point"><b>03</b><span>형태 비교와 기록</span></div></div></section><footer class="footer">BAEKJE POTTERY STUDIO · DIGITAL HERITAGE EXPERIENCE</footer></main>`}
  function gallery(){
    const r=relics[state.relicIndex];
    const modelNote=r.objUrl?'사용자 제공 OBJ 스캔 · 360도 회전/확대 가능':'PPT 사진을 참고한 형태 3D 모형 · 특정 유물 스캔은 아닙니다';
    const makerAction=r.creatable===false
      ?'<button class="btn btn-outline" disabled>전시실 참고 유물</button>'
      :'<button class="btn btn-outline" data-action="use-relic">이 토기로 만들어 보기 <span>→</span></button>';
    return `<main><div class="container">
      <div class="page-heading"><div><span class="eyebrow">THE RELIC GALLERY</span><h1>백제 토기 전시실</h1><p class="subhead">실제 출토 토기의 형태와 특징을 관찰해 보세요.</p></div>${makerAction}</div>
      <nav class="chips relic-quick-nav" aria-label="토기 종류 선택">${relics.map((item,index)=>`<button class="chip ${index===state.relicIndex?'active':''}" data-relic-index="${index}">${esc(item.name)}</button>`).join('')}</nav>
      <div class="gallery-layout">
        <section class="relic-stage"><div class="stage-glow"></div><button class="icon-btn stage-arrow left" data-relic="prev" aria-label="이전 유물">‹</button><div class="pot-holder"><div id="gallery-relic-preview" class="pottery-stage-3d"></div></div><button class="icon-btn stage-arrow right" data-relic="next" aria-label="다음 유물">›</button><span class="stage-caption">${modelNote}</span></section>
        <article class="info-card"><span class="period-tag">${esc(r.period)}</span><h2 style="margin-top:13px">${esc(r.name)}</h2><dl class="info-grid"><dt>출토지</dt><dd>${esc(r.place)}</dd><dt>크기</dt><dd>${esc(r.size)}</dd><dt>재질</dt><dd>${esc(r.material)}</dd><dt>기형</dt><dd>${esc(r.type)}</dd></dl><p class="description">${esc(r.desc)}</p>${r.referenceImage?`<figure class="gallery-reference-photo"><img src="${esc(r.referenceImage)}" alt="${esc(r.name)} 참고 사진"><figcaption>${esc(r.referenceCaption||'PPT 참고 사진')}</figcaption></figure>`:''}<button class="btn btn-primary" data-action="relic-guide">유물 자세히 보기 <span>→</span></button><div class="obj-tools"><label for="obj-file">스캔 OBJ 모델 열기</label><input id="obj-file" type="file" accept=".obj,text/plain"><small>선택한 OBJ는 브라우저에서만 읽으며 서버로 전송되지 않습니다. 360도 회전과 확대가 가능합니다.</small></div></article>
      </div>
    </div><footer class="footer">BAEKJE POTTERY STUDIO</footer></main>`;
  }
  function relicGuideSectionsMarkup(guide){
    const sections=guide.sections||[
      {title:'2. 형태적 특징',type:'features',items:guide.formFeatures},
      {title:'3. 시대적 특징',type:'text',text:guide.periodFeatures},
      {title:'4. 고고학적 의미',type:'text',text:guide.archaeologicalMeaning},
      {title:'5. 관찰 포인트',type:'list',items:guide.observationPoints},
    ];
    return sections.map(section=>{
      let content='';
      if(section.type==='features'){
        content=`<dl class="detail-feature-list">${section.items.map(item=>`<div><dt>${esc(item.label)}</dt><dd>${esc(item.description)}</dd></div>`).join('')}</dl>`;
      }else if(section.type==='list'){
        content=`<ul>${section.items.map(item=>`<li>${esc(item)}</li>`).join('')}</ul>`;
      }else{
        content=`<p>${esc(section.text)}</p>`;
      }
      const label=section.type==='features'?'FORM':section.type==='list'?'OBSERVE':'DETAIL';
      return `<section class="detail-section"><span class="eyebrow">${label}</span><h2>${esc(section.title)}</h2>${content}</section>`;
    }).join('');
  }
  function relicDetail(){
    const r=relics[state.relicIndex];
    const guide=r.guide;
    const comparisonAction=state.completedCreation
      ?'<button class="btn btn-primary" data-action="compare-relic">내 토기와 실제 유물 비교하기 <span>→</span></button>'
      :r.creatable===false
        ?'<button class="btn btn-outline" data-page="gallery">전시실로 돌아가기</button>'
        :'<button class="btn btn-primary" data-action="use-relic">이 기종으로 토기 제작하기 <span>→</span></button>';
    const modelNote=r.objUrl?'사용자 제공 OBJ 스캔':'PPT 사진을 참고한 형태 3D 모형 · 특정 유물 스캔은 아닙니다';
    return `<main class="relic-detail-page"><div class="container"><div class="page-heading"><div><span class="eyebrow">RELIC STORY</span><h1>${esc(r.name)} <span class="detail-hanja">${esc(r.hanja||'')}</span></h1><p class="subhead">${esc(guide.subtitle)}</p></div><button class="btn btn-outline" data-page="gallery">전시실로 돌아가기</button></div><section class="relic-detail-hero"><div class="detail-model-stack"><figure class="detail-model-panel"><div id="relic-detail-preview" class="pottery-stage-3d"></div><figcaption>${modelNote}</figcaption></figure>${r.referenceImage?`<figure class="detail-reference-photo"><img src="${esc(r.referenceImage)}" alt="${esc(r.name)} PPT 참고 사진"><figcaption>${esc(r.referenceCaption||'PPT 참고 사진')}</figcaption></figure>`:''}</div><div class="detail-introduction"><span class="period-tag">${esc(r.period)}</span><h2>1. 유물 소개</h2><p>${esc(guide.introduction)}</p><dl class="info-grid"><dt>출토지</dt><dd>${esc(r.place)}</dd><dt>크기</dt><dd>${esc(r.size)}</dd><dt>재질</dt><dd>${esc(r.material)}</dd><dt>기형</dt><dd>${esc(r.type)}</dd></dl></div></section><div class="relic-detail-sections">${relicGuideSectionsMarkup(guide)}</div><section class="detail-next-step"><p>${state.completedCreation?'제작한 토기와 실제 유물의 형태를 비교해 보세요.':r.creatable===false?'전시실에서 사진과 3D 모델을 관찰해 보세요.':'설명을 확인한 뒤 이 기종을 선택해 제작을 시작할 수 있습니다.'}</p>${comparisonAction}</section></div><footer class="footer">BAEKJE POTTERY STUDIO</footer></main>`;
  }
  function progress(){return `<div class="steps">${['기본 형태','세부 형태','직접 그리기','완성'].map((s,i)=>`<div class="step ${state.step===i+1?'active':''} ${state.step>i+1?'done':''}"><span class="num">${state.step>i+1?'✓':i+1}</span><span>${s}</span></div>${i<3?'<i class="step-line"></i>':''}`).join('')}</div>`}
  function createOptions(){
    if(state.step===1)return `<h2>기본 토기 형태 선택</h2><p class="subhead">세 가지 백제 대표 기종 중 하나를 골라보세요.</p><div class="shape-option-grid">${shapes.map((s,i)=>`<button class="option shape-option ${state.shape===s.id?'selected':''}" data-shape="${s.id}" aria-pressed="${state.shape===s.id}"><span class="option-art">${potSVG(s.id,'none','round','opt'+i)}</span><span class="shape-option-copy"><span class="shape-option-title">${s.name} <small>(${s.hanja})</small></span><span class="shape-option-description">${s.description}</span></span></button>`).join('')}</div><div class="shape-summary">선택한 형태 <b>${currentShape().name}</b><br>실제 유물의 기형을 참고한 창작 모형입니다.</div>`;
    if(state.step===2){
      let groups='';
      if(state.shape==='jar') groups=`
        <div class="shape-summary"><b>몸체 형태</b></div><div class="pattern-list"><button class="pattern-option ${state.detail==='round'?'selected':''}" data-detail="round"><span class="pattern-swatch">○</span><span><b>원형</b><small>둥근 공 모양</small></span></button><button class="pattern-option ${state.detail==='oval'?'selected':''}" data-detail="oval"><span class="pattern-swatch">◯</span><span><b>타원형</b><small>위아래가 넓은 타원</small></span></button></div>
        <div class="pattern-list"><button class="pattern-option ${state.shoulder?'selected':''}" data-toggle="shoulder" aria-pressed="${state.shoulder}"><span class="pattern-swatch">〰</span><span><b>어깨 문양대</b><small>${state.shoulder?'적용됨':'미적용'}</small></span></button><button class="pattern-option ${state.lower?'selected':''}" data-toggle="lower" aria-pressed="${state.lower}"><span class="pattern-swatch">≋</span><span><b>하부 타날문</b><small>${state.lower?'적용됨':'미적용'}</small></span></button></div>`;
      if(state.shape==='pedestal') groups=`
        <div class="shape-summary"><b>뚜껑 구조</b></div><div class="pattern-list"><button class="pattern-option ${state.cover==='open'?'selected':''}" data-cover="open"><span class="pattern-swatch">○</span><span><b>무개식</b><small>뚜껑받이턱 없음</small></span></button><button class="pattern-option ${state.cover==='closed'?'selected':''}" data-cover="closed"><span class="pattern-swatch">◡</span><span><b>유개식</b><small>뚜껑받이턱 있음</small></span></button></div><div class="shape-summary">※ 뚜껑이 없더라도 뚜껑받이턱이 있으면 유개식으로 분류합니다.</div>`;
      if(state.shape==='threeleg') groups=`
        <div class="shape-summary"><b>몸체 형태와 구조</b></div><div class="pattern-list"><button class="pattern-option ${state.body==='bowl'?'selected':''}" data-body="bowl"><span class="pattern-swatch">반</span><span><b>반형</b><small>얕은 반 모양</small></span></button><button class="pattern-option ${state.body==='dish'?'selected':''}" data-body="dish"><span class="pattern-swatch">배</span><span><b>배형</b><small>배 모양의 몸체</small></span></button><button class="pattern-option ${state.cover==='open'?'selected':''}" data-cover="open"><span class="pattern-swatch">무</span><span><b>무개식</b><small>뚜껑 구조 없음</small></span></button><button class="pattern-option ${state.cover==='closed'?'selected':''}" data-cover="closed"><span class="pattern-swatch">유</span><span><b>유개식</b><small>뚜껑받이턱 구조</small></span></button></div>
        <div class="shape-summary"><b>단순화된 시대적 변화 옵션</b></div><div class="pattern-list"><button class="pattern-option ${state.depth==='deep'?'selected':''}" data-depth="deep"><span><b>깊은 형태</b><small>초기형에 가까움</small></span></button><button class="pattern-option ${state.depth==='shallow'?'selected':''}" data-depth="shallow"><span><b>얕은 형태</b><small>후기형에 가까움</small></span></button><button class="pattern-option ${state.legs==='inside'?'selected':''}" data-legs="inside"><span><b>안쪽 배치</b><small>세 다리를 모아 배치</small></span></button><button class="pattern-option ${state.legs==='outside'?'selected':''}" data-legs="outside"><span><b>바깥쪽 분산</b><small>세 다리를 벌려 배치</small></span></button></div><div class="shape-summary">※ 깊이와 다리 위치는 시대별 변화의 단순화된 제작 옵션이며 개별 유물을 그대로 재현한 선택지는 아닙니다.</div>`;
      return `<h2>세부 형태 선택</h2><p class="subhead">선택한 기종의 세부 요소를 조합하세요.</p>${groups}`;
    }
    if(state.step===3)return `<h2>직접 무늬 그리기</h2><p class="subhead">캔버스에 그린 장식이 3D 토기 표면에 바로 적용됩니다.</p><div class="paint-tools"><label>토기 색상 <input id="clay-color" type="color" value="${state.clayColor}"></label><label>붓 색상 <input id="draw-color" type="color" value="${state.drawColor}"></label><label class="brush-size">붓 굵기 <input id="brush-size" type="range" min="3" max="36" value="${state.brushSize}"><span id="brush-size-value">${state.brushSize}</span></label><div class="paint-actions"><button class="btn btn-outline" data-action="undo-stroke" ${state.strokes.length?'':'disabled'}>실행 취소</button><button class="btn btn-quiet" data-action="clear-drawing" ${state.strokes.length?'':'disabled'}>모두 지우기</button></div></div><div class="drawing-board-wrap"><canvas id="drawing-canvas" class="drawing-board" width="1024" height="512" aria-label="토기 무늬를 직접 그리는 캔버스"></canvas><span>표면 펼쳐보기 · 좌우는 토기 둘레, 위아래는 높이를 따라 이어집니다</span></div><div class="model-disclaimer">직접 그린 장식은 창작 요소이며 실제 유물의 문양을 재현한 것이 아닙니다.</div>`;
    return `<h2>나만의 토기 완성</h2><p class="subhead">선택한 요소를 확인하고 실제 유물과 비교해 보세요.</p><div class="shape-summary"><b>${currentShape().name}</b><br>${chosenDetailName()} · 직접 그린 창작 문양</div><div class="model-disclaimer">실제 스캔 파일이 아닌, 선택한 형태와 색상·그림을 반영한 3D 제작 모형입니다.</div>`;
  }
  function creator(){return `<main><div class="container"><div class="creator-top"><div><span class="eyebrow">YOUR POTTERY WORKSHOP</span><h1 style="font-size:34px;margin:7px 0 0">나만의 토기 제작실</h1><p class="subhead">형태를 고르고 빚은 뒤, 직접 그린 장식을 입혀보세요.</p></div><button class="btn btn-quiet" data-page="gallery">유물 먼저 관찰하기</button></div>${progress()}<div class="creator-layout"><section class="preview-card"><span class="preview-hint">3D 미리보기 · 드래그 회전 · 휠 확대/축소</span><div class="preview-pot" id="pottery-preview"></div></section><section class="options-card">${createOptions()}<div class="options-footer"><span>STEP 0${state.step} / 04</span><div style="display:flex;gap:8px">${state.step>1?'<button class="btn btn-outline" data-action="prev-step">이전</button>':''}<button class="btn btn-primary" data-action="next-step">${state.step===4?'유물 설명 보기':'다음 단계'} <span>→</span></button></div></div></section></div></div><footer class="footer">BAEKJE POTTERY STUDIO</footer></main>`}
  function compare(){const r=relics[state.compareRelic];return `<main><div class="container"><div class="page-heading"><div><span class="eyebrow">FORM & PROPORTION</span><h1>실제 유물과 비교하기</h1><p class="subhead">내가 만든 토기와 실제 출토 유물을 3D로 나란히 살펴보세요.</p></div><button class="btn btn-outline" data-page="create">제작실로 돌아가기</button></div><div class="chips">${relics.map((x,i)=>`<button class="chip ${i===state.compareRelic?'active':''}" data-compare-relic="${i}">${x.name}</button>`).join('')}</div><div class="compare-grid"><figure class="compare-figure"><div class="figure-art"><div id="compare-relic-preview" class="pottery-stage-3d"></div></div><figcaption>${r.objUrl?'사용자 제공 스캔(결손부 포함)':'기종 참고용 3D 모델'} · ${r.name}</figcaption></figure><figure class="compare-figure"><div class="figure-art"><div id="compare-own-preview" class="pottery-stage-3d"></div></div><figcaption>내가 만든 3D 토기 · ${currentShape().name}</figcaption></figure><section class="compare-stats"><h3>형태 비교</h3><div class="stat-row"><span>참고 유물</span><span><b>${r.name}</b></span></div><div class="stat-row"><span>내 토기</span><span><b>${currentShape().name}</b></span></div><div class="stat-row"><span>세부 형태</span><span><b>${esc(chosenDetailName())}</b></span></div><p>${state.shape===r.id?'같은 기종을 바탕으로 형태를 비교하고 있어요.':'서로 다른 기종입니다. 몸체와 받침 구조를 중심으로 살펴보세요.'} 비교 수치는 제공된 치수가 없어 표시하지 않습니다.</p></section></div><section class="note-box"><label for="pot-note">나만의 토기 특징을 적어보세요.</label><textarea id="pot-note" placeholder="예) 둥근 몸통과 좁은 입구가 특징이에요.">${esc(state.note)}</textarea><div class="note-row"><span class="subhead" style="font-size:11px">메모는 토기 기록에 함께 저장됩니다.</span><button class="btn btn-primary" data-action="save">기록 저장하기 <span>→</span></button></div></section></div><footer class="footer">BAEKJE POTTERY STUDIO</footer></main>`}
  function records(){return `<main><div class="container"><div class="page-heading"><div><span class="eyebrow">YOUR COLLECTION</span><h1>나의 토기 기록실</h1><p class="subhead">지금까지 만든 나의 토기를 확인해 보세요.</p></div><button class="btn btn-primary" data-page="create">새 토기 만들기 <span>→</span></button></div>${state.records.length?`<div class="record-list">${state.records.map((r,i)=>`<article class="record-card"><div class="record-image">${potSVG(r.shape,r.pattern,r.detail,'record'+i,r.color,r.strokes)}</div><div class="record-info"><span class="period-tag">${esc(r.shapeName)}</span><h3 style="margin-top:10px">${esc(r.title)}</h3><p>제작일　${esc(r.date)}<br>${esc(r.patternName)} · ${esc(r.detailName)}${r.note?`<br>${esc(r.note)}`:''}</p><div class="record-actions"><button class="btn btn-outline" data-download="${i}">이미지 저장</button><button class="btn btn-quiet" data-record-download="${i}">기록 다운로드</button></div></div></article>`).join('')}</div>`:`<div class="record-list"><div class="empty-state"><div class="empty-icon">◌</div><h3>아직 기록한 토기가 없어요</h3><p>제작실에서 첫 번째 토기를 만들어 보세요.</p><button class="btn btn-primary" data-page="create">토기 만들기 <span>→</span></button></div></div>`}</div><footer class="footer">BAEKJE POTTERY STUDIO</footer></main>`}
  function drawTexture(canvas,options=state){
    const ctx=canvas.getContext('2d');
    const width=canvas.width,height=canvas.height;
    ctx.clearRect(0,0,width,height);
    ctx.fillStyle=options.clayColor||'#875844';
    ctx.fillRect(0,0,width,height);
    const glaze=ctx.createLinearGradient(0,0,0,height);
    glaze.addColorStop(0,'rgba(255,244,218,.12)');
    glaze.addColorStop(.52,'rgba(255,255,255,.01)');
    glaze.addColorStop(1,'rgba(34,20,12,.14)');
    ctx.fillStyle=glaze;
    ctx.fillRect(0,0,width,height);
    if(options.surfacePattern==='impressed'){
      ctx.save();
      ctx.globalAlpha=.14;
      ctx.strokeStyle='#3d281c';
      ctx.lineWidth=3;
      for(let offset=-height;offset<width;offset+=34){
        ctx.beginPath();
        ctx.moveTo(offset,0);ctx.lineTo(offset+height,height);
        ctx.moveTo(offset+height,0);ctx.lineTo(offset,height);
        ctx.stroke();
      }
      ctx.restore();
    }
    (options.strokes||[]).forEach(stroke=>{
      ctx.strokeStyle=stroke.color;
      ctx.lineWidth=stroke.size;
      ctx.lineCap='round';
      ctx.lineJoin='round';
      if(stroke.points.length===1){
        ctx.beginPath();
        ctx.arc(stroke.points[0].x*width,stroke.points[0].y*height,stroke.size/2,0,Math.PI*2);
        ctx.fillStyle=stroke.color;
        ctx.fill();
      }else{
        ctx.beginPath();
        stroke.points.forEach((point,index)=>{
          const x=point.x*width,y=point.y*height;
          if(index===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
        });
        ctx.stroke();
      }
    });
  }
  function createPotProfile(options=state){
    if(options.shape==='sinbal'){
      const profile=[
        [0,.07],[.23,.07],[.28,.10],[.30,.16],[.34,.35],[.40,.65],
        [.46,.98],[.50,1.25],[.49,1.40],[.57,1.43],[.58,1.48],
        [.54,1.51],[.47,1.47],[.46,1.37],[.45,1.20],[.41,.95],
        [.35,.65],[.29,.38],[.23,.21],[0,.18]
      ];
      return profile.map(([radius,height])=>new THREE.Vector2(radius,height));
    }
    if(options.shape==='pedestal'){
      const profile=[
        [0,.08],[.38,.08],[.41,.12],[.39,.17],[.20,.20],[.18,.78],
        [.38,.78],[.66,.86],[.88,1.04],[1.00,1.26],[1.02,1.34],[.91,1.39],
        [.82,1.22],[.62,1.08],[.38,1.03],[0,1.03]
      ];
      return profile.map(([r,y])=>new THREE.Vector2(r,y));
    }
    if(options.shape==='threeleg'){
      const depth=(options.depth==='deep'?1.18:.78)*(options.body==='dish'?.76:1);
      const profile=[
        [0,.48],[.40,.48],[.68,.54],[.88,.68],[.98,.86],[1.00,.92],
          [.90,.98],[.79,.82],[.62,.68],[.38,.61],[0,.61]
      ];
      return profile.map(([r,y],i)=>{
        if(i>1 && i<profile.length-1) return new THREE.Vector2(r,.48+(y-.48)*depth);
        return new THREE.Vector2(r,y);
      });
    }
    const profile=[
      [0,.12],[.34,.12],[.57,.22],[.79,.43],[.91,.73],[.90,.94],
      [.78,1.14],[.52,1.28],[.29,1.30],[.29,1.54],[.35,1.57],
      [.35,1.63],[.25,1.63],[.24,1.53],[.24,1.34],[.48,1.30],
      [.69,1.14],[.81,.94],[.82,.74],[.72,.50],[.52,.31],[.32,.23],[0,.23]
    ];
    const oval=options.detail==='oval';
    return profile.map(([r,y])=>new THREE.Vector2(r*(oval?.91:1),y*(oval?1.06:1)));
  }
  function addPotDetails(group,material,options=state){
    const showJarBands=options.shape==='jar'&&(options.shoulder||options.lower);
    const darkBand=showJarBands?new THREE.MeshStandardMaterial({color:0x593a2b,roughness:.88}):material;
    const lightBand=showJarBands?new THREE.MeshStandardMaterial({color:0xc49b73,roughness:.82}):material;
    const torus=(radius,y,tube=.016,bandMaterial=material)=>{
      const mesh=new THREE.Mesh(new THREE.TorusGeometry(radius,tube,8,96),bandMaterial);
      mesh.rotation.x=Math.PI/2;
      mesh.position.y=y;
      mesh.castShadow=true;
      group.add(mesh);
    };
    if(options.shape==='jar'){
      if(options.shoulder){
        torus(.724,1.17,.012,lightBand);
        torus(.668,1.20,.014,darkBand);
        torus(.612,1.23,.012,lightBand);
      }
      if(options.lower){
        torus(.81,.47,.012,darkBand);
        torus(.83,.52,.010,lightBand);
        torus(.85,.57,.012,darkBand);
        torus(.87,.62,.010,lightBand);
      }
    }else if(options.shape==='pedestal'&&options.cover==='closed'){
      torus(.98,1.36,.022);
    }else if(options.shape==='threeleg'){
      const lean=options.legs==='outside'?.3:.12;
      const radius=options.legs==='outside'?.66:.48;
      for(let index=0;index<3;index++){
        const angle=(index/3)*Math.PI*2+Math.PI/2;
        const leg=new THREE.Mesh(new THREE.CylinderGeometry(.075,.12,.52,18,1),material);
        leg.position.set(Math.cos(angle)*radius,.28,Math.sin(angle)*radius);
        leg.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),new THREE.Vector3(Math.cos(angle)*lean,1,Math.sin(angle)*lean).normalize());
        leg.castShadow=true;leg.receiveShadow=true;group.add(leg);
      }
      if(options.cover==='closed')torus(.99,.91,.025);
    }
  }
  function destroyCreatorView(){
    creatorViews.forEach(view=>{
      cancelAnimationFrame(view.frame);
      view.resizeObserver?.disconnect();
      view.controls.dispose();
      view.scene.traverse(object=>{
        object.geometry?.dispose();
        if(Array.isArray(object.material))object.material.forEach(material=>material.dispose());
        else object.material?.dispose();
      });
      view.texture?.dispose();
      view.renderer.dispose();
    });
    creatorViews=[];
  }
  function renderPotteryPreview(hostId='pottery-preview',options=state){
    const host=document.getElementById(hostId);
    if(!host)return;
    if(!window.THREE || !THREE.OrbitControls){
      host.textContent='3D 미리보기를 불러오지 못했습니다. 페이지를 새로고침해 주세요.';
      if(hostId==='pottery-preview')notify('3D 라이브러리를 불러오지 못했어요.');
      return;
    }
    try{
      const scene=new THREE.Scene();
      const camera=new THREE.PerspectiveCamera(36,host.clientWidth/host.clientHeight,.1,100);
      camera.position.set(3.1,1.7,4.6);
      const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,preserveDrawingBuffer:true});
      renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
      renderer.setSize(host.clientWidth,host.clientHeight);
      renderer.shadowMap.enabled=true;
      renderer.shadowMap.type=THREE.PCFSoftShadowMap;
      renderer.outputEncoding=THREE.sRGBEncoding;
      renderer.domElement.className='pottery-canvas';
      host.appendChild(renderer.domElement);
      scene.add(new THREE.HemisphereLight(0xfff5e6,0x52392a,.65));
      const keyLight=new THREE.DirectionalLight(0xffedcf,1.35);
      keyLight.position.set(-3,5,4);keyLight.castShadow=true;scene.add(keyLight);
      const fillLight=new THREE.DirectionalLight(0xffffff,.45);
      fillLight.position.set(4,2,-3);scene.add(fillLight);
      const textureCanvas=document.createElement('canvas');
      textureCanvas.width=1024;textureCanvas.height=512;
      drawTexture(textureCanvas,options);
      const texture=new THREE.CanvasTexture(textureCanvas);
      texture.encoding=THREE.sRGBEncoding;
      texture.wrapS=THREE.RepeatWrapping;
      texture.anisotropy=renderer.capabilities.getMaxAnisotropy();
      const material=new THREE.MeshStandardMaterial({map:texture,roughness:.72,metalness:0});
      const profile=createPotProfile(options);
      const geometry=new THREE.LatheGeometry(profile,128);
      const positions=geometry.attributes.position;
      const uvs=geometry.attributes.uv;
      const heights=profile.map(point=>point.y);
      const minHeight=Math.min(...heights),maxHeight=Math.max(...heights);
      for(let index=0;index<positions.count;index++){
        uvs.setY(index,(positions.getY(index)-minHeight)/(maxHeight-minHeight));
      }
      uvs.needsUpdate=true;
      const lathe=new THREE.Mesh(geometry,material);
      lathe.castShadow=true;lathe.receiveShadow=true;
      const group=new THREE.Group();
      group.add(lathe);
      addPotDetails(group,material,options);
      group.position.y=options.shape==='jar'?-.95:options.shape==='sinbal'?-.90:-.84;
      scene.add(group);
      const floor=new THREE.Mesh(new THREE.PlaneGeometry(200,200),new THREE.ShadowMaterial({opacity:.16}));
      floor.rotation.x=-Math.PI/2;floor.position.y=-.84;floor.receiveShadow=true;scene.add(floor);
      const controls=new THREE.OrbitControls(camera,renderer.domElement);
      controls.target.set(0,.05,0);controls.enableDamping=true;controls.dampingFactor=.075;
      controls.minDistance=2.3;controls.maxDistance=8;controls.maxPolarAngle=Math.PI*.48;
      const resizeObserver=new ResizeObserver(()=>{
        const width=host.clientWidth,height=host.clientHeight;
        if(!width||!height)return;
        camera.aspect=width/height;camera.updateProjectionMatrix();renderer.setSize(width,height);
      });
      resizeObserver.observe(host);
      const view={hostId,scene,camera,renderer,controls,texture,textureCanvas,resizeObserver,frame:0,material};
      creatorViews.push(view);
      const animate=()=>{if(!creatorViews.includes(view))return;view.frame=requestAnimationFrame(animate);controls.update();renderer.render(scene,camera)};
      animate();
    }catch(error){
      host.textContent='3D 모델을 생성하지 못했습니다.';
      console.error('Unable to build pottery preview:',error);
      if(hostId==='pottery-preview')notify('3D 모형을 만드는 중 오류가 발생했어요.');
    }
  }
  function updatePotteryTexture(){
    const view=creatorViews.find(item=>item.hostId==='pottery-preview');
    if(!view)return;
    drawTexture(view.textureCanvas);
    view.texture.needsUpdate=true;
  }
  function bindDrawingCanvas(){
    const canvas=document.getElementById('drawing-canvas');
    if(!canvas)return;
    drawTexture(canvas);
    const pointFromEvent=event=>{
      const rect=canvas.getBoundingClientRect();
      return {x:Math.max(0,Math.min(1,(event.clientX-rect.left)/rect.width)),y:Math.max(0,Math.min(1,(event.clientY-rect.top)/rect.height))};
    };
    canvas.addEventListener('pointerdown',event=>{
      event.preventDefault();
      canvas.setPointerCapture(event.pointerId);
      state.strokes.push({color:state.drawColor,size:state.brushSize,points:[pointFromEvent(event)]});
      drawTexture(canvas);updatePotteryTexture();
      document.querySelectorAll('[data-action="undo-stroke"],[data-action="clear-drawing"]').forEach(button=>button.disabled=false);
    });
    canvas.addEventListener('pointermove',event=>{
      if(!canvas.hasPointerCapture(event.pointerId))return;
      const stroke=state.strokes[state.strokes.length-1];
      if(!stroke)return;
      stroke.points.push(pointFromEvent(event));
      drawTexture(canvas);updatePotteryTexture();
    });
    const finish=event=>{if(canvas.hasPointerCapture(event.pointerId))canvas.releasePointerCapture(event.pointerId)};
    canvas.addEventListener('pointerup',finish);
    canvas.addEventListener('pointercancel',finish);
  }
  function relicModelOptions(relic){
    const shape=shapes.find(item=>item.id===relic.id)||shapes[0];
    return {
      shape:relic.id,
      detail:'round',
      shoulder:true,
      lower:true,
      cover:'closed',
      body:'dish',
      depth:'shallow',
      legs:'outside',
      clayColor:relic.id==='sinbal'?'#956044':shape.color,
      surfacePattern:relic.id==='sinbal'?'impressed':undefined,
      strokes:[],
    };
  }
  function showObjObject(object,label,hostId='gallery-relic-preview'){
    const host=document.getElementById(hostId);
    if(!host)return;
    const scene=new THREE.Scene();
    const camera=new THREE.PerspectiveCamera(35,host.clientWidth/host.clientHeight,0.1,100);
    camera.position.set(2.8,1.5,4);
    const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,preserveDrawingBuffer:true});
    renderer.setSize(host.clientWidth,host.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
    renderer.outputEncoding=THREE.sRGBEncoding;
    renderer.shadowMap.enabled=true;
    renderer.domElement.className='pottery-canvas';
    host.replaceChildren(renderer.domElement);
    scene.add(new THREE.HemisphereLight(0xfff5e6,0x4a3427,.8));
    const light=new THREE.DirectionalLight(0xffffff,1.1);light.position.set(3,5,4);scene.add(light);
    object.traverse(child=>{
      if(!child.isMesh)return;
      if(Array.isArray(child.material))child.material.forEach(material=>material.dispose());
      else child.material?.dispose();
      const hasVertexColors=Boolean(child.geometry?.attributes?.color);
      child.material=new THREE.MeshStandardMaterial({
        color:hasVertexColors?0xffffff:0x956d51,
        vertexColors:hasVertexColors,
        roughness:.82,
        metalness:0,
      });
      child.castShadow=true;
      child.receiveShadow=true;
    });
    const box=new THREE.Box3().setFromObject(object);
    const size=box.getSize(new THREE.Vector3());
    const center=box.getCenter(new THREE.Vector3());
    const extent=Math.max(size.x,size.y,size.z);
    if(!Number.isFinite(extent)||extent===0)throw new Error('OBJ 모델에 표시할 수 있는 면이 없습니다.');
    object.scale.setScalar(2.2/extent);
    object.position.copy(center).multiplyScalar(-object.scale.x);
    scene.add(object);
    const controls=new THREE.OrbitControls(camera,renderer.domElement);
    controls.target.set(0,0,0);
    controls.enableDamping=true;controls.dampingFactor=.08;controls.enablePan=false;
    controls.minDistance=2;controls.maxDistance=8;
    const resizeObserver=new ResizeObserver(()=>{
      const width=host.clientWidth,height=host.clientHeight;
      if(!width||!height)return;
      camera.aspect=width/height;camera.updateProjectionMatrix();renderer.setSize(width,height);
    });
    resizeObserver.observe(host);
    const view={hostId,scene,camera,renderer,controls,resizeObserver,frame:0,texture:null};
    creatorViews.push(view);
    const animate=()=>{if(!creatorViews.includes(view))return;view.frame=requestAnimationFrame(animate);controls.update();renderer.render(scene,camera)};
    animate();
    state.objName=label;
    if(state.page==='gallery')notify(`${label} 스캔 모델을 열었어요.`);
  }
  function loadObjFile(file){
    if(!file || !window.THREE || !window.THREE.OBJLoader){notify('3D 뷰어 라이브러리를 불러오지 못했어요.');return}
    const reader=new FileReader();
    reader.onload=()=>{
      try{
        showObjObject(new THREE.OBJLoader().parse(reader.result),file.name);
      }catch(error){
        console.error('Unable to parse selected OBJ:',error);
        notify('OBJ 파일을 읽지 못했습니다. 파일 형식을 확인해 주세요.');
      }
    };
    reader.onerror=()=>notify('OBJ 파일을 읽지 못했습니다.');
    reader.readAsText(file);
  }
  function loadObjUrl(url,label,hostId='gallery-relic-preview'){
    const host=document.getElementById(hostId);
    if(!host)return;
    if(!window.THREE || !window.THREE.OBJLoader){
      host.textContent='OBJ 뷰어 라이브러리를 불러오지 못했습니다.';
      notify('3D 뷰어 라이브러리를 불러오지 못했어요.');
      return;
    }
    host.textContent='사용자 제공 스캔 모델 불러오는 중…';
    new THREE.OBJLoader().load(url,
      object=>{
        try{
          showObjObject(object,label,hostId);
        }catch(error){
          console.error(`Unable to render OBJ model "${url}":`,error);
          host.textContent='스캔 모델을 표시하지 못했습니다.';
          notify('OBJ 모델을 표시할 수 없어 기종 참고용 3D 모델을 대신 표시합니다.');
          renderPotteryPreview(hostId,relicModelOptions(relics.find(item=>item.name===label)||relics[state.compareRelic]||relics[state.relicIndex]));
        }
      },
      xhr=>{
        if(xhr.total)host.textContent=`스캔 모델 불러오는 중… ${Math.round(xhr.loaded/xhr.total*100)}%`;
      },
      error=>{
        console.error(`Unable to load OBJ model "${url}":`,error);
        host.textContent='스캔 모델을 불러오지 못했습니다.';
        notify('OBJ 스캔 파일을 불러오지 못했습니다. 기종 참고용 3D 모델을 대신 표시합니다.');
        const relic=relics.find(item=>item.name===label)||relics[state.compareRelic]||relics[state.relicIndex];
        if(relic)renderPotteryPreview(hostId,relicModelOptions(relic));
      }
    );
  }
  function renderRelicPreview(relic,hostId){
    if(relic.objUrl){
      loadObjUrl(relic.objUrl,relic.name,hostId);
      return;
    }
    renderPotteryPreview(hostId,relicModelOptions(relic));
  }
  function render(){
    destroyCreatorView();
    const pages={home,gallery,create:creator,compare,records,'relic-detail':relicDetail};
    app.innerHTML=`<div class="shell">${header()}${(pages[state.page]||home)()}<div class="toast" id="toast"></div></div>`;
    if(state.page==='create')requestAnimationFrame(()=>{
      renderPotteryPreview();
      bindDrawingCanvas();
    });
    if(state.page==='gallery')requestAnimationFrame(()=>renderRelicPreview(relics[state.relicIndex],'gallery-relic-preview'));
    if(state.page==='relic-detail')requestAnimationFrame(()=>renderRelicPreview(relics[state.relicIndex],'relic-detail-preview'));
    if(state.page==='compare')requestAnimationFrame(()=>{
      renderRelicPreview(relics[state.compareRelic],'compare-relic-preview');
      renderPotteryPreview('compare-own-preview',state);
    });
  }
  function notify(message){const el=document.getElementById('toast');if(!el)return;el.textContent=message;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),2400)}
  async function apiRequest(path,options={}){
    let response;
    try{
      response=await fetch(path,{...options,headers:{'Content-Type':'application/json',...options.headers}});
    }catch(error){
      throw new Error('API 서버에 연결할 수 없습니다. `node server.js`가 실행 중인지 확인해 주세요.',{cause:error});
    }
    const text=await response.text();
    let payload;
    try{
      payload=JSON.parse(text);
    }catch(error){
      throw new Error(`API가 JSON이 아닌 응답을 반환했습니다 (${response.status}).`,{cause:error});
    }
    if(!response.ok){
      throw new Error(payload.error?.message||`API 요청 실패 (${response.status}).`);
    }
    return payload;
  }
  function readLegacyRecords(){
    let value;
    try{
      value=localStorage.getItem('baekje-pottery-records');
    }catch(error){
      console.warn('이전 브라우저 기록을 읽을 수 없습니다.',error);
      return [];
    }
    if(!value)return [];
    let records;
    try{
      records=JSON.parse(value);
    }catch(error){
      throw new Error('이전 브라우저 기록을 해석할 수 없어 API로 옮기지 못했습니다.',{cause:error});
    }
    if(!Array.isArray(records))throw new Error('이전 브라우저 기록 형식이 올바르지 않습니다.');
    return records;
  }
  async function migrateLegacyRecords(){
    const legacyRecords=readLegacyRecords();
    for(let index=legacyRecords.length-1;index>=0;index--){
      const old=legacyRecords[index];
      if(!old||typeof old!=='object')continue;
      const shape=['jar','pedestal','threeleg'].includes(old.shape)?old.shape:'jar';
      const color=typeof old.color==='string'&&/^#[0-9a-fA-F]{6}$/.test(old.color)?old.color:'#875844';
      await apiRequest('/api/creations',{
        method:'POST',
        body:JSON.stringify({
          shape,
          detail:typeof old.detail==='string'?old.detail:'',
          detailName:typeof old.detailName==='string'?old.detailName:'',
          color,
          strokes:Array.isArray(old.strokes)?old.strokes:[],
          note:typeof old.note==='string'?old.note:'',
          migrationKey:`legacy:${String(old.id??index)}`,
        }),
      });
    }
    try{
      localStorage.removeItem('baekje-pottery-records');
    }catch(error){
      console.warn('이전 브라우저 기록의 마이그레이션 표시를 지우지 못했습니다.',error);
    }
  }
  async function bootstrap(){
    app.innerHTML='<main class="api-state"><p>유물과 제작 기록을 불러오는 중입니다…</p></main>';
    try{
      const catalog=await apiRequest('/api/relics');
      if(!Array.isArray(catalog.items)||catalog.items.length===0)throw new Error('API 유물 목록이 비어 있거나 형식이 잘못되었습니다.');
      relics=catalog.items;
      await migrateLegacyRecords();
      const saved=await apiRequest('/api/creations');
      if(!Array.isArray(saved.items))throw new Error('API 제작 기록 응답 형식이 잘못되었습니다.');
      state.records=saved.items;
      render();
    }catch(error){
      console.error('서비스 API 초기화 실패:',error);
      app.innerHTML=`<main class="api-state"><span class="eyebrow">API CONNECTION</span><h1>서비스 데이터를 불러오지 못했습니다.</h1><p>${esc(error.message)}</p><button class="btn btn-primary" data-action="retry-api">다시 연결하기</button></main>`;
    }
  }
  function chosenDetailName(){
    if(state.shape==='jar') return state.detail==='oval'?'타원형 몸체':'원형 몸체';
    if(state.shape==='pedestal') return state.cover==='closed'?'유개고배':'무개고배';
    if(state.shape==='threeleg') return `${state.body==='dish'?'배형':'반형'} · ${state.cover==='closed'?'유개식':'무개식'} · ${state.depth==='shallow'?'얕은 형태':'깊은 형태'} · ${state.legs==='outside'?'바깥쪽 다리':'안쪽 다리'}`;
    return state.detail;
  }
  function resetCreator(){
    Object.assign(state,{
      step:1,shape:'jar',detail:'round',shoulder:true,lower:true,cover:'open',
      body:'bowl',depth:'deep',legs:'inside',pattern:'none',clayColor:'#875844',
      drawColor:'#f6e8d2',brushSize:12,strokes:[],note:'',completedCreation:false,
    });
  }
  function navigateToPage(page){
    if((state.page==='create'&&page!=='compare')||(page==='create'&&state.page!=='create'&&state.page!=='compare')){
      resetCreator();
    }
    state.page=page;
    render();
  }
  async function save(){
    const result=await apiRequest('/api/creations',{
      method:'POST',
      body:JSON.stringify({
        shape:state.shape,
        detail:state.detail,
        detailName:chosenDetailName(),
        options:{
          detail:state.detail,
          shoulder:state.shoulder,
          lower:state.lower,
          cover:state.cover,
          body:state.body,
          depth:state.depth,
          legs:state.legs,
        },
        color:state.clayColor,
        strokes:state.strokes,
        note:state.note,
      }),
    });
    state.records.unshift(result.item);
    state.page='records';
    render();
    notify('토기 기록을 서버에 저장했어요.');
  }
  function svgDownload(index){const item=state.records[index];const svg=potSVG(item.shape,item.pattern,item.detail,'download'+index,item.color,item.strokes).replace('class="pot-svg"','');const full=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 104" width="1200" height="1248"><rect width="100%" height="100%" fill="#efe3d2"/>${svg}</svg>`;const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([full],{type:'image/svg+xml'}));a.download=`baekje-pottery-${item.id}.svg`;a.click();URL.revokeObjectURL(a.href);notify('토기 이미지를 저장했어요.')}
  function jsonDownload(index){const item=state.records[index];const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(item,null,2)],{type:'application/json'}));a.download=`baekje-pottery-record-${item.id}.json`;a.click();URL.revokeObjectURL(a.href);notify('토기 기록 파일을 저장했어요.')}
  app.addEventListener('click',e=>{
    const page=e.target.closest('[data-page]');if(page){navigateToPage(page.dataset.page);window.scrollTo({top:0,behavior:'smooth'});return}
    const relicChoice=e.target.closest('[data-relic-index]');if(relicChoice){state.relicIndex=Number(relicChoice.dataset.relicIndex);render();return}
    const relic=e.target.closest('[data-relic]');if(relic){state.relicIndex=(state.relicIndex+(relic.dataset.relic==='next'?1:relics.length-1))%relics.length;render();return}
    const shape=e.target.closest('[data-shape]');if(shape){state.shape=shape.dataset.shape;render();return}
    const detail=e.target.closest('[data-detail]');if(detail){state.detail=detail.dataset.detail;render();return}
    const toggle=e.target.closest('[data-toggle]');if(toggle){const key=toggle.dataset.toggle;state[key]=!state[key];render();return}
    const cover=e.target.closest('[data-cover]');if(cover){state.cover=cover.dataset.cover;render();return}
    const body=e.target.closest('[data-body]');if(body){state.body=body.dataset.body;render();return}
    const depth=e.target.closest('[data-depth]');if(depth){state.depth=depth.dataset.depth;render();return}
    const legs=e.target.closest('[data-legs]');if(legs){state.legs=legs.dataset.legs;render();return}
    const pattern=e.target.closest('[data-pattern]');if(pattern){state.pattern=pattern.dataset.pattern;render();return}
    const cr=e.target.closest('[data-compare-relic]');if(cr){state.compareRelic=Number(cr.dataset.compareRelic);render();return}
    const dl=e.target.closest('[data-download]');if(dl){svgDownload(Number(dl.dataset.download));return}
    const jd=e.target.closest('[data-record-download]');if(jd){jsonDownload(Number(jd.dataset.recordDownload));return}
    const action=e.target.closest('[data-action]')?.dataset.action;
    if(action==='use-relic'){const r=relics[state.relicIndex];resetCreator();state.shape=r.id;state.page='create';render();return}
    if(action==='relic-guide'){state.completedCreation=false;state.page='relic-detail';render();return}
    if(action==='compare-relic'){state.compareRelic=state.relicIndex;state.page='compare';render();return}
    if(action==='prev-step'){state.step=Math.max(1,state.step-1);render();return}
    if(action==='next-step'){if(state.step<4){state.step++;render()}else{state.compareRelic=Math.max(0,relics.findIndex(r=>r.id===state.shape));state.relicIndex=state.compareRelic;state.completedCreation=true;state.page='relic-detail';render()}return}
    if(action==='undo-stroke'){state.strokes.pop();render();return}
    if(action==='clear-drawing'){state.strokes=[];render();return}
    if(action==='save'){
      state.note=document.getElementById('pot-note')?.value.trim()||'';
      const button=e.target.closest('[data-action="save"]');
      if(button)button.disabled=true;
      save().catch(error=>{
        if(button?.isConnected)button.disabled=false;
        notify(error.message);
      });
      return;
    }
    if(action==='retry-api'){bootstrap();return}
  });
  app.addEventListener('input',e=>{
    if(e.target.id==='pot-note')state.note=e.target.value;
    if(e.target.id==='clay-color'){
      state.clayColor=e.target.value;
      const canvas=document.getElementById('drawing-canvas');
      if(canvas)drawTexture(canvas);
      updatePotteryTexture();
    }
    if(e.target.id==='draw-color')state.drawColor=e.target.value;
    if(e.target.id==='brush-size'){
      state.brushSize=Number(e.target.value);
      const value=document.getElementById('brush-size-value');
      if(value)value.textContent=String(state.brushSize);
    }
  });
  app.addEventListener('change',e=>{
    if(e.target.id==='obj-file' && e.target.files?.[0]) loadObjFile(e.target.files[0]);
  });
  bootstrap();
})();
