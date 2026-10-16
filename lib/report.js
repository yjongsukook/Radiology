// 판독지 공통: Report 직접 수정 + 고친 내용 학습 (lib/learn.js 필요)
// - Report 칸을 고치기 시작하면 "직접 수정 중"이 되어 입력 칸을 바꿔도 덮어쓰지 않음 ("자동 생성으로 되돌리기"로 해제)
// - 고친 Report 를 [복사] 하면 자동으로 만든 Report 와 비교해서 고친 줄을 학습 → 다음에 만들 때 고친 형태로
// - 좌우·숫자·Category 처럼 그 환자에게만 해당하는 수정은 학습하지 않음
// 사용: Report.attach({module:"mammo"})  (판독지 script 맨 끝에서. upd()·importReport()·copyOut() 가 있어야 함)
window.Report=(()=>{
  const $=id=>document.getElementById(id);
  const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[c]);
  const SKIP=/^(?:BI-?RADS\s*)?Category\b|^K-?TIRADS|^=+|^<[^>]*>$/i;   // 학습하지 않을 줄
  let L=null,manual=false,lastGen="",hits=0;

  function stat(t){const s=$("rp-stat");if(s)s.textContent=t}
  function ui(){
    $("rp-back").hidden=!manual;
    stat(manual?"직접 수정 중 — 입력 칸을 바꿔도 Report 를 다시 만들지 않아요.":hits?`학습한 수정 ${hits}곳을 반영했어요.`:"");
  }
  // 자동으로 만든 Report 에 학습한 수정을 줄마다 반영
  function post(){
    const out=$("out");hits=0;
    if(L){
      const res=[];
      for(const l of out.value.split("\n")){
        if(!l.trim()||SKIP.test(l.trim())){res.push(l);continue}
        const r=L.apply(l);if(r.hit)hits++;if(r.line!==null)res.push(r.line);
      }
      out.value=res.join("\n");
    }
    lastGen=out.value;ui();
  }
  async function learnNow(){
    if(!manual||!L)return;
    const n=await L.learnPairs(lastGen.split("\n"),$("out").value.split("\n"),{del:true,spans:false,skip:SKIP});
    if(n){stat(`Report 수정 ${n}개를 학습했어요. 다음 Report 부터 반영돼요.`);show()}
  }
  function show(){
    const el=$("rp-list"),sm=$("rp-sum");if(!el||!L)return;const items=L.list();
    sm.textContent=`학습한 Report 수정 (${items.length})`;
    el.innerHTML=items.length?items.map(x=>`<div class="row"><span style="flex:1;font-size:12px">${esc(x.txt)}</span><button class="x" style="margin:0" onclick="Report.forget('${x.t}',${x.i})">잊기</button></div>`).join("")
      :`<p class="sub">아직 없어요. Report 를 고친 뒤 [복사]를 누르면 여기에 쌓여요.</p>`;
  }
  async function forget(t,i){if(L){await L.forget(t,i);show();if(!manual)window.upd()}}

  function attach(cfg){
    const out=$("out");if(!out||typeof window.upd!=="function")return;
    const btnRow=out.nextElementSibling;
    const bar=document.createElement("div");
    bar.innerHTML=`<div class="row"><span class="sub" id="rp-stat" style="margin:0"></span><button type="button" id="rp-back" hidden>자동 생성으로 되돌리기</button></div>
      <details style="margin-top:6px"><summary class="sub" id="rp-sum" style="display:list-item">학습한 Report 수정</summary>
        <p class="sub">Report 를 직접 고친 뒤 [복사]를 누르면, 자동으로 만든 문장과 비교해서 고친 형태를 기억해요. 다음에 같은 형태의 문장이 만들어지면 고친 형태로 나와요 (○ 는 숫자 자리, "(지움)"은 늘 지우던 줄).<br>좌우·숫자·Category 처럼 환자마다 다른 수정은 학습하지 않아요.</p>
        <div id="rp-list"></div></details>`;
    (btnRow||out).after(bar);
    // upd 를 감싸서: 직접 수정 중이면 다시 만들지 않고, 만들 때마다 학습 반영
    const orig=window.upd;
    window.upd=function(){if(manual)return;orig.apply(this,arguments);post()};
    // 새 판독문을 불러오면 직접 수정 상태 해제
    if(typeof window.importReport==="function"){const oi=window.importReport;window.importReport=function(){manual=false;ui();return oi.apply(this,arguments)}}
    out.addEventListener("input",()=>{if(!manual){manual=true;ui()}});
    $("rp-back").onclick=()=>{manual=false;window.upd()};
    const copyBtn=[...(btnRow||document).querySelectorAll("button")].find(b=>/copyOut/.test(b.getAttribute("onclick")||""));
    if(copyBtn)copyBtn.addEventListener("click",()=>{learnNow()});
    if(window.Learner){L=Learner("report-"+cfg.module);L.load().then(()=>{show();if(!manual)window.upd()})}
    window.upd();
  }
  return{attach,forget,isManual:()=>manual};
})();
