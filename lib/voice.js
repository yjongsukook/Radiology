// 판독지 공통: 음성 받아쓰기 (Chrome/Edge 음성인식, ko-KR)
// 핵심 키워드만 말하면("우측 3시 유두 2 1.2 오벌 하이포에코익 노듈") 판독문 용어로 바꿔
// "기존 판독문 불러오기" 칸(id="src")에 한 줄씩 넣음. 불러오기는 사용자가 직접 누름.
// 사용법: Voice.attach({module:"breast"})  — module: thyroid | mammo | breast | abd
// 주의: 브라우저 음성인식은 음성을 Google 서버로 보냄 → 환자 식별 정보는 말하지 않기
window.Voice=(()=>{
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  const $=id=>document.getElementById(id);
  const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[c]);

  // [들린 말, 바꿀 말]. 들린 말의 띄어쓰기는 있어도 없어도 맞춤. 긴 말을 먼저 둠
  const COMMON=[
    ["오른쪽|우측|라이트","Right"],["왼쪽|좌측|레프트","Left"],["양쪽|바이레터럴","양측"],
    ["마크드 하이포 에코익|마크드 하이포에코익|현저한 저에코","marked hypoechoic"],
    ["아이소 투 하이포 에코익","iso to hypoechoic"],
    ["하이포 에코익|하이포에코|저에코","hypoechoic"],["아이소 에코익|아이소에코|등에코","isoechoic"],["하이퍼 에코익|하이퍼에코|고에코","hyperechoic"],
    ["오벌|오발|타원형","oval"],["라운드|원형","round"],["이레귤러|이레귤라|불규칙","irregular"],
    ["써컴스크라이브드|서컴스크라이브드|서컴스크라이브|경계 좋은","circumscribed"],["인디스팅트|인디스팅","indistinct"],["앵귤러|앵귤라","angular"],
    ["마이크로 로뷸레이티드|마이크로로뷸","microlobulated"],["스피큘레이티드|스피큘","spiculated"],
    ["낫 패럴렐|논 패럴렐|비평행","not parallel"],["패럴렐|평행","parallel"],
    ["웰 디파인드|웰디파인","well-defined"],["일 디파인드|일디파인","ill-defined"],
    ["마이크로 캘시피케이션|마이크로 칼시피케이션|미세 석회화","microcalcification"],["캘시피케이션|칼시피케이션|석회화","calcification"],
    ["림프 노드|림프노드|임파선|림프절","lymph node"],["노듈|노들|결절","nodule"],["매스|종괴","mass"],["시스트|씨스트|낭종","cyst"],
    ["바이옵시|조직 검사","biopsy"],["프로버블리 비나인|아마 양성","probably benign"],["비나인|양성","benign"],["서스피셔스|의심","suspicious"],
    ["변화 없음|변화없음|스테이블|stable","변화 없음"],["새로|신규","새로"],["사이즈 증가|커짐","증가"],["사이즈 감소|작아짐","감소"],
    ["에프 유|에프유","F/U"],["카테고리","Category"]
  ];
  const EXTRA={
    thyroid:[["미드 포션|중간부","mid portion"],["어퍼 폴|상극","upper pole"],["로워 폴|하극","lower pole"],["이스머스|협부","isthmus"],
      ["솔리드","solid"],["파셜리 시스틱|부분 낭성","partially cystic"],["스펀지 폼|스폰지폼|해면","spongiform"],
      ["칼시파이드|캘시파이드","calcified"],["케이 티라즈|케이티라즈","K-TIRADS"],["레벨","level"]],
    mammo:[["하이 덴시티","high density"],["이퀄 덴시티","equal density"],["로우 덴시티","low density"],["팻 컨테이닝","fat-containing"],
      ["포컬 어시메트리|국소 비대칭","focal asymmetry"],["디벨로핑 어시메트리","developing asymmetry"],["어시메트리|비대칭","asymmetry"],
      ["디스토션|구조 왜곡","architectural distortion"],["앰포러스|아모퍼스","amorphous"],["파인 플레오모픽|파인 플레오몰픽","fine pleomorphic"],
      ["파인 리니어","fine linear"],["코스 헤테로지니어스","coarse heterogeneous"],["그룹드","grouped"],["리저널","regional"],["세그멘탈","segmental"],["리니어","linear"],
      ["어퍼 아우터|상외측","upper outer"],["어퍼 이너|상내측","upper inner"],["로워 아우터|하외측","lower outer"],["로워 이너|하내측","lower inner"],
      ["서브 아레올라|유륜하","subareolar"],["비나인 캘시피케이션|양성 석회화","benign calcifications"],["니플|유두","nipple"],["버라이즈|바이레즈|비라즈","BI-RADS"]],
    breast:[["유유오큐|유오큐","UOQ"],["유아이큐","UIQ"],["엘오큐","LOQ"],["엘아이큐","LIQ"],
      ["어퍼 아우터|상외측","UOQ"],["어퍼 이너|상내측","UIQ"],["로워 아우터|하외측","LOQ"],["로워 이너|하내측","LIQ"],
      ["서브 아레올라|유륜하","subareolar"],["덕트 엑타시아|유관 확장","duct ectasia"],["파이브로 아데노마|섬유 선종","fibroadenoma"],
      ["리포마|지방종","lipoma"],["스킨 노듈","skin nodule"],["가이네코마스티아|여성형 유방","gynecomastia"],["인트라마머리","intramammary"],
      ["콤플리케이티드 시스트","complicated cyst"],["심플 시스트","simple cyst"],["클러스터드 마이크로 시스트","clustered microcysts"],
      ["포스테리어 쉐도잉|후방 음영","posterior shadowing"],["포스테리어 인핸스먼트|후방 증강","posterior enhancement"],
      ["액실라|액와","axilla"],["오피 사이트|수술 부위","op. site"],["버라이즈|바이레즈|비라즈","BI-RADS"]],
    abd:[["패티 리버|지방간","fatty liver"],["마일드|경도","mild"],["모더레이트|중등도","moderate"],["시비어|중증","severe"],
      ["헤만지오마|혈관종","hemangioma"],["간낭종|간 낭종","hepatic cyst"],["그래뉼로마","granuloma"],["리버 시로시스|간경화","liver cirrhosis"],
      ["지비|쥐비|담낭","GB"],["담석","GB stone"],["스톤","stone"],["슬러지","sludge"],["폴립|용종","polyp"],["콜레시스텍토미|담낭 절제","cholecystectomy"],
      ["아이에이치디","IHD"],["씨비디","CBD"],["다일레이션|확장","dilatation"],["스플레노메갈리|비장 비대|비장종대","splenomegaly"],
      ["어사이티스|복수","ascites"],["플루럴 이퓨전|흉수","pleural effusion"],["판크레아스|췌장","pancreas"],["스플린|비장","spleen"],["리버","liver"]]
  };
  const NUM={영:0,공:0,일:1,이:2,삼:3,사:4,오:5,육:6,륙:6,칠:7,팔:8,구:9};
  const k2n=w=>{if(w.includes("십")){const[a,b]=w.split("십");return(a?NUM[a]:1)*10+(b?NUM[b]:0)}return+[...w].map(c=>NUM[c]).join("")};
  const rx=s=>new RegExp(s.split("|").map(a=>a.trim().split(/\s+/).map(x=>x.replace(/[.*+?^${}()[\]\\/]/g,"\\$&")).join("\\s*")).join("|"),"gi");
  let mod="",user=[],rules=[];
  const build=()=>{rules=[...user.map(([a,b])=>[rx(a),b]),...(EXTRA[mod]||[]).map(([a,b])=>[rx(a),b]),...COMMON.map(([a,b])=>[rx(a),b])]};

  // 받아쓴 말 → 판독문 한 줄
  function normalize(raw){
    let t=" "+raw.trim()+" ";
    // 한글 숫자: "일 점 이" → 1.2, "이 센치" → 2cm
    t=t.replace(/([영공일이삼사오육륙칠팔구십]+)\s*(?:점|쩜)\s*([영공일이삼사오육륙칠팔구]+)/g,(m,a,b)=>k2n(a)+"."+[...b].map(c=>NUM[c]).join(""));
    t=t.replace(/(\d+)\s*(?:점|쩜)\s*(\d+)/g,"$1.$2");
    t=t.replace(/(^|\s)([일이삼사오육칠팔구십]+)\s*(센치|센티|밀리|미리|시\b)/g,(m,s,a,u)=>s+k2n(a)+u);
    for(const[re,rep] of rules)t=t.replace(re,rep);
    // 단위
    t=t.replace(/(\d+(?:\.\d+)?)\s*(?:센치미터|센티미터|센치|센티|씨엠|cm)/gi,"$1cm").replace(/(\d+(?:\.\d+)?)\s*(?:밀리미터|밀리|미리|mm)/gi,"$1mm");
    if(mod==="mammo"||mod==="breast"){
      t=t.replace(/(\d{1,2})\s*시(?:\s*방향)?/g,"$1H");
      // "유두 2" / "nipple에서 2" → "2cm 거리"
      t=t.replace(/(?:nipple|유두)\s*(?:에서|로부터|부터)?\s*(\d+(?:\.\d+)?)\s*(?:cm)?\s*(?:거리)?/gi,mod==="mammo"?" nipple로부터 $1cm 거리에 ":", $1cm 거리 ");
    }
    if(mod==="abd")t=t.replace(/(?:에스|세그먼트|segment|S)\s*([1-8])\b/gi,"S$1");
    if(mod==="thyroid")t=t.replace(/(?:레벨|level)\s*(\d|[IV]+)/gi,(m,n)=>"level "+({2:"II",3:"III",4:"IV",5:"V",6:"VI"}[n]||n));
    // 숫자만 말하면 크기(cm)로 봄 (S6, 3H, level, Category, 개월 등은 제외)
    t=t.replace(/(^|[\s,])(\d+(?:\.\d+)?)(?![\d.]|\s*(?:cm|mm|H|개월|%|개|번|차))/g,(m,s,n,off,str)=>/(?:Category|K-TIRADS|BI-RADS|level|S)\s*$/i.test(str.slice(0,off+s.length))?m:`${s}${n}cm`);
    t=t.replace(/마침표/g,".").replace(/쉼표/g,",");
    t=t.replace(/\s+/g," ").replace(/\s+([,.])/g,"$1").trim();
    // 병변 이름(nodule/mass/cyst…)은 맨 뒤로 → "Right 3H 1.2cm oval hypoechoic nodule"
    const NOUN=/\b(lymph node|nodule|mass|cyst|calcifications?|microcalcification|asymmetry|architectural distortion|hemangioma|hepatic cyst|lipoma|fibroadenoma|duct ectasia|gynecomastia)\b/i;
    // 변화 표현(변화 없음/새로/증가/감소)은 그 뒤 맨 끝에 둠
    const nm=t.match(NOUN);
    if(nm){
      const CHG=/변화 없음|새로|증가|감소/g;
      const before=t.slice(0,nm.index),after=t.slice(nm.index+nm[0].length);
      const chg=(after.match(CHG)||[]).join(" "),rest=after.replace(CHG,"").replace(/[.,]/g," ").trim();
      t=[before.trim(),rest,nm[0],chg].filter(Boolean).join(" ");
    }
    return t.replace(/\s+/g," ").trim();
  }

  /* ---------- 항목 문구 (Reason, Category, Rec, Comment, 검사 정보) ---------- */
  const SEP="====== [Conclusion] ======";
  const side=t=>/우측|오른|right|라이트/i.test(t)?"right":/좌측|왼|left|레프트/i.test(t)?"left":/양측|양쪽|both/i.test(t)?"both":"";
  const Side=t=>{const s=side(t);return s?s[0].toUpperCase()+s.slice(1):""};
  // 검사 이유: 판독지별 자주 쓰는 Reason 으로 맞춤 (구체적인 것 먼저)
  const REASON={
    thyroid:[[/전\s*절제|토탈|total/i,"Postop., S/P Total thyroidectomy."],[/(우엽|우측|오른|right).*(절제|lobectomy)/i,"S/P Right lobectomy for malignancy."],[/(좌엽|좌측|왼|left).*(절제|lobectomy)/i,"S/P Left lobectomy for malignancy."],
      [/부갑상선|hyperpara/i,"Screening, hyperparathyroidism"],[/외부/,"Outside US abnormality."],[/추적|팔로|f\s*\/?\s*u/i,"F/U for US abnormality."],[/스크리닝|검진|선별|screening/i,"Screening"]],
    breast:[[/(우측|오른|right).*(부분|partial|비씨에스|bcs)/i,"Screening after right partial mastectomy."],[/(좌측|왼|left).*(부분|partial|비씨에스|bcs)/i,"Screening after left partial mastectomy."],
      [/(우측|오른|right).*(전\s*절제|total|엠알엠|mrm)/i,"Postop screening after right total mastectomy."],[/(좌측|왼|left).*(전\s*절제|total|엠알엠|mrm)/i,"Postop screening after left total mastectomy."],
      [/(우측|오른|right).*(촉지|만져|palpable|종괴|멍울)/i,"Right palpable mass."],[/(좌측|왼|left).*(촉지|만져|palpable|종괴|멍울)/i,"Left palpable mass."],
      [/외부.*(유방\s*촬영|맘모|mg)/i,"Abnormal outside MG."],[/추적|팔로|f\s*\/?\s*u/i,"F/U for US abnormality."],[/스크리닝|검진|선별|screening/i,"Screening"]]
  };
  const REC={
    mammo:[[/6\s*개월|육\s*개월|단기/,"Short-term follow-up mammography (6 months)."],[/조직|바이옵시|biopsy|병리/i,"USG and pathologic confirmation."],[/초음파/,"치밀유방으로 병변이 가려져 발견이 안 될수 있으므로 초음파 검사를 권유."],[/정기|루틴|routine/i,"정기적 진찰"]],
    breast:[[/12\s*개월|십이\s*개월|1\s*년/,"F/U US in 12 months."],[/6\s*개월|육\s*개월|단기/,"F/U US in 6 months."],[/병리\s*확인|pathologic/i,"Pathologic confirm."],[/조직|바이옵시|biopsy|core/i,"US-guided core needle biopsy."],[/정기|루틴|routine/i,"Routine mammography screening with/without breast USG"]],
    thyroid:[[/세침|fna|에프엔에이/i,"FNA"]],abd:[[/6\s*개월|육\s*개월/,"F/U US in 6 months."],[/1\s*년|12\s*개월/,"F/U US in 1 year."]]
  };
  const pick=(list,t)=>((list||[]).find(([re])=>re.test(t))||[])[1];
  const cap=s=>s?s[0].toUpperCase()+s.slice(1):s;
  function catOf(raw){
    let t=raw.replace(/영|공/g,"0").replace(/일/g,"1").replace(/이(?![가-힣])/g,"2").replace(/삼/g,"3").replace(/사/g,"4").replace(/오/g,"5").replace(/육|륙/g,"6");
    t=t.replace(/에이/g,"a").replace(/비/g,"b").replace(/씨|시/g,"c");
    const m=t.match(/([0-6])\s*([abc])?/i);return m?(m[1]+(m[1]==="4"&&m[2]?m[2].toLowerCase():"")):"";
  }
  // 항목 문구면 {line, where:"top"|"concl"} 를, 아니면 null (→ 병변 줄로 처리)
  function fieldLine(raw){
    const t=raw.trim();let m;
    if((m=t.match(/^(?:검사\s*(?:이유|사유|목적)|리즌(?:\s*포\s*이그잼)?|reason(?:\s*for\s*exam)?|사유)\s*(?:은|는|:)?\s*(.*)$/i))){
      if(mod==="mammo"||mod==="abd")return{note:"이 판독지에는 Reason 칸이 없어요."};
      const v=m[1].trim();return{where:"top",line:"Reason for Exam : "+(pick(REASON[mod],v)||cap(normalize(v)))}}
    if((m=t.match(/^(?:카테고리|category|버라이즈|바이레즈|비라즈|bi-?rads)\s*(?:카테고리|category)?\s*(.+)$/i))){
      if(mod!=="mammo"&&mod!=="breast")return{note:"이 판독지는 Category 를 자동으로 정해요."};
      const c=catOf(m[1]);if(c)return{where:"concl",line:"Category : "+c}}
    if((m=t.match(/^(?:권고|권유|리코멘(?:데이션)?|recommendation|렉|rec)\s*(?:는|은|:)?\s*(.+)$/i))){
      const v=m[1].trim();return{where:"concl",line:"Recommendation : "+(pick(REC[mod],v)||cap(normalize(v)))}}
    if((m=t.match(/^(?:코멘트|comment)\s*(?:는|은|:)?\s*(.+)$/i)))return{where:"concl",line:"Comment : "+normalize(m[1])};
    if(mod==="mammo"){
      if(/컴포지션|유방\s*실질|실질\s*분포|치밀\s*유방|덴스|지방형|팻|스캐터드|산재/i.test(t)&&!/노듈|매스|석회|캘시|종괴/.test(t)){
        const v=/익스트림|극|매우|extremely/i.test(t)?"Extremely dense":/헤테로|불균질|치밀|덴스|dense/i.test(t)?"Heterogeneous dense":/스캐터|산재|scattered/i.test(t)?"Scattered fibroglandular tissue":/지방|팻|fat/i.test(t)?"Almost entirely fat":"";
        if(v)return{where:"top",line:"Breast Composition : "+v}}
      if(/확대|매그니|magnif/i.test(t))return{where:"top",line:`<Mammography와 ${side(t)||"both"} magnification view를 함께 판독함>`};
      if(/편측|유니래터럴|unilateral/i.test(t))return{where:"top",line:"MAMMOGRAPHY (UNILATERAL) "+(Side(t)||"Right")};
      if(/수술\s*후|비씨에스|bcs|부분\s*절제/i.test(t)&&!/노듈|매스|석회|캘시|종괴/.test(t))
        return{where:"top",line:`${Side(t)||"Right"} breast에 postoperative change 가 관찰되며 Local recurrence를 시사하는 소견은 뚜렷하지 않음.`};
      if(/임플란트|보형물|implant/i.test(t))return{where:"top",line:`${side(t)&&side(t)!=="both"?Side(t)+" breast":"양측"}에 breast implant가 삽입되어 있음.`};
    }
    if(mod==="breast"){
      if(/조직\s*구성|티슈|컴포지션|배경\s*에코|백그라운드/i.test(t)){
        const v=/헤테로|불균질|hetero/i.test(t)?"Heterogeneous background echotexture":/파이브로|섬유|fibro/i.test(t)?"Homogeneous background echotexture - fibroglandular":"Homogeneous background echotexture - fat";
        return{where:"top",line:"Tissue composition: "+v}}
      if(/디테일드|정밀|detailed/i.test(t))return{where:"top",line:"<BREAST Detailed US>"};
      if(/임플란트|보형물|implant/i.test(t))return{where:"top",line:`${side(t)&&side(t)!=="both"?Side(t)+" breast":"양측 breast"}에 implant가 삽입되어 있음이며 implant는 intact함.`};
      if(/재발\s*(?:없|소견\s*없)|recurrence\s*없/i.test(t))return{where:"top",line:"Operation site에 local recurrence의 evidence 없음."};
    }
    if(mod==="thyroid"&&/미만성|디퓨즈|diffuse\s*parenchymal|갑상선염/i.test(t))
      return{where:"top",line:/의심|알오|r\/o/i.test(t)?"Thyroid gland에 diffuse parenchymal echopattern change가 보여 diffuse parenchymal disease가 의심됨.":"Thyroid gland에 diffuse parenchymal echopattern change가 보임."};
    return null;
  }

  /* ---------- 학습: 받아쓴 줄을 사용자가 고치면 기억했다가 다음에 반영 (lib/learn.js) ----------
     불러오기를 누를 때, 이번에 받아쓴 줄과 지금 칸의 줄을 비교해서 학습 */
  let L=null,recent=[];
  async function learn(){
    if(!recent.length||!L)return;
    const n=await L.learnPairs(recent.map(r=>r.line),$("src").value.split("\n"));
    recent=[];
    if(n){$("v-raw").textContent=`고친 표현을 학습했어요 (${n}개). 다음에 비슷하게 말하면 반영돼요.`;showLearned()}
  }
  function showLearned(){
    const el=$("v-learn");if(!el||!L)return;const items=L.list();
    el.innerHTML=items.length?items.map(x=>`<div class="row"><span style="flex:1;font-size:12px">${esc(x.txt)}</span><button class="x" style="margin:0" onclick="Voice.forget('${x.t}',${x.i})">잊기</button></div>`).join(""):`<p class="sub">아직 없어요. 받아쓴 줄을 고친 뒤 불러오기를 누르면 여기에 쌓여요.</p>`;
  }
  async function forget(t,i){if(L){await L.forget(t,i);showLearned()}}
  // 받아쓴 줄 하나를 최종 결정: 학습 반영 → 기록
  function finalize(line){const r=L?L.apply(line):{line,hit:false};const out=r.line==null?line:r.line;recent.push({line:out});return{line:out,hit:r.hit}}

  let rec=null,on=false;
  // 줄 넣기: 검사 정보는 맨 위, Category·Rec·Comment 는 결론 구분선 아래, 병변 줄은 결론 구분선 위
  function place(line,where){
    const s=$("src");
    const L=s.value.split("\n").map(x=>x.replace(/\s+$/,"")).filter(x=>x.trim());
    const isTop=x=>/^(?:Reason for Exam|Breast Composition|Tissue composition|<|MAMMOGRAPHY)/i.test(x);
    const key=line.split(/\s*:/)[0];   // 같은 항목(예: Category)을 다시 말하면 바꿔 넣음
    if(where==="top"){
      let at=0;while(at<L.length&&isTop(L[at]))at++;
      const same=isTop(line)?L.slice(0,at).findIndex(x=>x.split(/\s*:/)[0]===key):-1;
      if(same>=0)L[same]=line;else L.splice(isTop(line)?at:at,0,line);
    }else if(where==="concl"){
      let si=L.indexOf(SEP);if(si<0){L.push(SEP);si=L.length-1}
      const same=L.findIndex((x,i)=>i>si&&x.split(/\s*:/)[0]===key);
      if(same>=0)L[same]=line;else L.push(line);
    }else{const si=L.indexOf(SEP);if(si>=0)L.splice(si,0,line);else L.push(line)}
    s.value=L.join("\n");s.scrollTop=s.scrollHeight;
  }
  const append=line=>place(line,"");
  function command(u){
    const s=$("src");
    if(/^(다음 ?줄|줄 ?바꿈|엔터)$/.test(u)){s.value+="\n";return true}
    if(/^결론$/.test(u)){append("====== [Conclusion] ======");return true}
    if(/^(마지막 ?줄 ?지워(?:줘)?|한 ?줄 ?지워(?:줘)?|취소)$/.test(u)){const L=s.value.replace(/\s+$/,"").split("\n");L.pop();s.value=L.join("\n");return true}
    if(/^(받아쓰기 ?(?:끝|중지|그만)|그만)$/.test(u)){stop();return true}
    return false;
  }
  function start(){
    if(!SR)return;
    rec=new SR();rec.lang="ko-KR";rec.continuous=true;rec.interimResults=true;
    rec.onresult=e=>{
      let interim="";
      for(let i=e.resultIndex;i<e.results.length;i++){
        const r=e.results[i],txt=r[0].transcript.trim();
        if(!r.isFinal){interim+=txt;continue}
        if(!txt||command(txt))continue;
        const fl=fieldLine(txt);
        if(fl&&fl.note){$("v-raw").textContent=`들은 말: "${txt}" → ${fl.note}`;continue}
        const res=finalize(fl?fl.line:normalize(txt));place(res.line,fl?fl.where:"");
        $("v-raw").textContent=`들은 말: "${txt}" → ${res.line}${res.hit?"  (학습한 표현 반영)":""}`;
      }
      $("v-stat").textContent=interim?"… "+interim:"듣는 중";
    };
    rec.onerror=e=>{
      if(e.error==="not-allowed"||e.error==="service-not-allowed"){on=false;$("v-stat").textContent="마이크 권한이 없어요. 사이트 주소(https://…github.io)로 열었는지, 브라우저 주소창의 마이크 권한을 확인하세요.";ui()}
      else if(e.error!=="no-speech"&&e.error!=="aborted")$("v-stat").textContent="음성인식 오류: "+e.error;
    };
    rec.onend=()=>{if(on)try{rec.start()}catch(x){}else ui()};   // 말을 멈추면 Chrome 이 끊으므로 다시 시작
    on=true;$("fresh").checked=true;
    try{rec.start()}catch(x){}
    ui();
  }
  function stop(){on=false;if(rec)rec.stop();ui()}
  function ui(){
    const b=$("v-btn");if(!b)return;
    b.textContent=on?"■ 받아쓰기 중지":"🎤 받아쓰기";b.classList.toggle("p",on);
    if(!on&&!/권한|오류/.test($("v-stat").textContent))$("v-stat").textContent="";
  }

  // 내 음성 사전: 로그인했으면 저장소(items, module "voice")에, 아니면 이 브라우저에만
  async function loadUser(){
    user=[];
    try{
      if(window.RDB&&await RDB.user()){const ps=await RDB.list("voice","phrase");user=ps.map(p=>{const[a,b]=p.body.split("=>");return[a,b,p.id]}).filter(x=>x[0]&&x[1])}
      else user=JSON.parse(localStorage.getItem("voice-dict")||"[]");
    }catch(x){}
    build();showUser();
  }
  function showUser(){
    const el=$("v-list");if(!el)return;
    el.innerHTML=user.length?user.map((u,i)=>`<div class="row"><span style="flex:1">${esc(u[0])} → ${esc(u[1])}</span><button class="x" style="margin:0" onclick="Voice.delWord(${i})">삭제</button></div>`).join(""):`<p class="sub">아직 없어요.</p>`;
  }
  async function addWord(){
    const a=$("v-heard").value.trim(),b=$("v-want").value.trim();if(!a||!b)return;
    try{
      if(window.RDB&&await RDB.user())await RDB.add({module:"voice",kind:"phrase",field:"dict",body:a+"=>"+b});
      else localStorage.setItem("voice-dict",JSON.stringify([...user,[a,b]]));
    }catch(x){}
    $("v-heard").value="";$("v-want").value="";loadUser();
  }
  async function delWord(i){
    const u=user[i];if(!u)return;
    try{
      if(u[2]&&window.RDB)await RDB.remove(u[2]);
      else localStorage.setItem("voice-dict",JSON.stringify(user.filter((_,j)=>j!==i).map(x=>[x[0],x[1]])));
    }catch(x){}
    loadUser();
  }

  function attach(cfg){
    mod=cfg.module;build();
    const src=$("src");if(!src)return;const box=src.parentNode;   // "기존 판독문 불러오기" 칸 (판독지마다 id 가 다름)
    const d=document.createElement("div");
    d.innerHTML=`<div class="row"><button type="button" id="v-btn">🎤 받아쓰기</button>
        <label class="ck"><input type="checkbox" id="fresh"> 새 검사 (받아쓴 내용: "변화 없음"으로 시작하지 않음)</label>
        <span id="v-stat" class="sub" style="margin:0"></span></div>
      <p class="sub" id="v-raw" style="margin:0 0 6px"></p>
      <details style="margin:0 0 6px"><summary class="sub" style="display:list-item">음성 받아쓰기 사용법 · 내 음성 사전</summary>
        <p class="sub">핵심 키워드만 말하세요. 한 번 말할 때마다 한 줄이 들어가요. 예: "우측 3시 유두 2 일 점 이 오벌 하이포에코익 노듈" → <b>Right 3H, 2cm 거리 1.2cm oval hypoechoic nodule</b><br>
        항목은 이름으로 시작해서 말하세요: "<b>검사 이유</b> 우측 부분 절제 후 검진" · "<b>카테고리</b> 사 비" · "<b>권고</b> 육 개월 추적" · "<b>코멘트</b> …" ·
        "<b>조직 구성</b> 헤테로" / "<b>치밀 유방</b>" · "<b>디테일드</b>" · "우측 <b>확대 촬영</b>" · "좌측 <b>수술 후</b>" · "양측 <b>임플란트</b>" · "<b>미만성</b> 실질 질환 의심". 같은 항목을 다시 말하면 바꿔 넣어요.<br>
        명령: "결론"(결론 구분선) · "마지막 줄 지워" · "받아쓰기 끝". 다 말한 뒤 내용을 확인하고 <b>불러오기</b>를 누르세요.<br>
        음성은 브라우저 음성인식(Google)으로 처리돼요. <b>환자 이름·등록번호 등은 말하지 마세요.</b></p>
        <div class="row"><input type="text" id="v-heard" placeholder="잘못 들린 말 (예: 하이포)"><input type="text" id="v-want" placeholder="바꿀 말 (예: hypoechoic)"><button type="button" onclick="Voice.addWord()">사전에 추가</button></div>
        <div id="v-list"></div>
        <p class="sub" style="margin:8px 0 2px"><b>학습한 표현</b> — 받아쓴 줄을 고친 뒤 불러오기를 누르면 기억했다가, 다음에 비슷하게 말하면 고친 형태로 넣어요 (○ 는 숫자 자리).</p>
        <div id="v-learn"></div></details>`;
    box.insertBefore(d,src);
    if(!SR){$("v-btn").disabled=true;$("v-stat").textContent="이 브라우저는 음성인식을 지원하지 않아요 (Chrome 또는 Edge를 쓰세요).";}
    else $("v-btn").onclick=()=>on?stop():start();
    loadUser();
    // 학습: 불러오기 버튼을 누를 때 고친 줄을 학습
    if(window.Learner){L=Learner("voice-"+mod);L.load().then(showLearned)}
    const imp=[...box.querySelectorAll("button")].find(b=>/importReport/.test(b.getAttribute("onclick")||""));
    if(imp)imp.addEventListener("click",()=>{learn()});
  }
  // 불러오기 후: 받아쓴 새 검사이면 병변 변화를 말한 대로 (기본 "보임")
  function chgOf(text){
    const t=text||"";
    return/변화\s*(?:는|가)?\s*없|no change|stable/i.test(t)?"u":/새로|new\b/i.test(t)?"n":/증가|increase/i.test(t)?"i":/감소|decrease/i.test(t)?"d":"s";
  }
  // 시험·확인용: 말 하나를 넣었을 때와 똑같이 처리
  function feed(txt){if(command(txt))return;const fl=fieldLine(txt);if(fl&&fl.note)return fl.note;const r=finalize(fl?fl.line:normalize(txt));place(r.line,fl?fl.where:"");return r.line}
  return{attach,normalize,feed,learn,forget,addWord,delWord,chgOf,fresh:()=>!!($("fresh")&&$("fresh").checked)};
})();
