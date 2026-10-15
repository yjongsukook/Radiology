// 판독지 공통: 로그인 확인 + "내 저장소" (템플릿 · 판독문 기록 · 자주 쓰는 문구)
// 사용법: 판독지에 <details class="card" id="store"></details> 를 두고
//   Store.init({module:"thyroid-us", out:"out", fields:{reason:"Reason"}, onUse:body=>{...}})
//   module : items 테이블에 저장할 판독지 이름
//   out    : 판독문이 들어 있는 textarea 의 id
//   fields : 자주 쓰는 문구를 저장할 칸. 그 칸 input 에 list="pl-<키>" 를 달면 추천 목록으로 뜸
//   onUse  : 저장된 판독문 "불러오기"를 눌렀을 때 할 일
window.Store=(()=>{
  const $=id=>document.getElementById(id);
  const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[c]);
  const when=d=>new Date(d).toLocaleString("ko-KR",{dateStyle:"short",timeStyle:"short"});
  let cfg,LIST=[];
  const msg=t=>$("st-msg").textContent=t;
  const err=e=>msg(/items/.test(e.message)&&/exist|schema cache/i.test(e.message)?"저장소 테이블이 아직 없어요. supabase/schema.sql 을 먼저 실행하세요.":"오류: "+e.message);

  async function init(c){
    cfg=c;
    const F=Object.entries(cfg.fields||{});
    $("store").innerHTML=`<summary>내 저장소 (템플릿 · 판독문 기록${F.length?" · 자주 쓰는 문구":""})</summary>
      <p class="sub" id="st-msg"></p>
      <div id="st-body" hidden>
        <div class="row"><input type="text" id="st-title" placeholder="제목 (환자 정보 넣지 말 것)">
          <select id="st-kind"><option value="template">템플릿으로</option><option value="report">기록으로</option></select>
          <button class="p" onclick="Store.save()">현재 판독문 저장</button></div>
        <div class="row"><label>목록</label><select id="st-view" onchange="Store.list()"><option value="template">템플릿</option><option value="report">판독문 기록</option></select></div>
        <div id="st-list"></div>
        ${F.length?`<h2>자주 쓰는 문구</h2>
        <p class="sub">저장한 문구는 ${F.map(f=>f[1]).join(", ")} 칸을 클릭하면 추천 목록에 나와요.</p>
        <div class="row"><select id="st-field">${F.map(([k,v])=>`<option value="${k}">${v}</option>`).join("")}</select>
          <input type="text" id="st-phrase" placeholder="문구"><button onclick="Store.addPhrase()">추가</button></div>
        <div id="st-phrases"></div>`:""}
      </div>`;
    F.forEach(([k])=>{if(!$("pl-"+k)){const d=document.createElement("datalist");d.id="pl-"+k;document.body.appendChild(d)}});
    if(!window.RDB){msg("저장소에 연결할 수 없어요 (인터넷 확인).");return}
    if(!await RDB.user()){   // 판독지 파일을 직접 열었을 때도 로그인 필요
      document.querySelector("main").innerHTML=`<section class="card"><h1>로그인이 필요해요</h1><p class="sub">판독지는 로그인 후 사용할 수 있어요.</p><a href="../index.html#login" target="_top">로그인하러 가기</a></section>`;
      return}
    $("st-body").hidden=false;
    list();if(F.length)phrases();
  }
  async function list(){
    try{LIST=await RDB.list(cfg.module,$("st-view").value)}catch(e){return err(e)}
    $("st-list").innerHTML=LIST.length?LIST.map((r,i)=>`<div class="row"><span style="flex:1">${esc(r.title||"(제목 없음)")} <span class="sub">${when(r.created_at)}</span></span>
      <button onclick="Store.use(${i})">불러오기</button><button onclick="Store.copy(${i})">복사</button><button class="x" style="margin:0" onclick="Store.del('${r.id}',Store.list)">삭제</button></div>`).join("")
      :`<p class="sub">저장된 항목이 없어요.</p>`;
  }
  async function save(){
    const title=$("st-title").value.trim(),kind=$("st-kind").value;
    if(!title){msg("제목을 입력하세요.");$("st-title").focus();return}
    try{await RDB.add({module:cfg.module,kind,title,body:$(cfg.out).value})}catch(e){return err(e)}
    $("st-title").value="";msg(`"${title}" 저장됨`);$("st-view").value=kind;list();
  }
  const use=i=>cfg.onUse(LIST[i].body);
  const copy=i=>navigator.clipboard.writeText(LIST[i].body).then(()=>msg("복사됨"),()=>msg("복사 실패"));
  async function del(id,after){
    if(!confirm("삭제할까요? 되돌릴 수 없어요."))return;
    try{await RDB.remove(id)}catch(e){return err(e)}
    after();
  }
  async function phrases(){
    let ps;try{ps=await RDB.list(cfg.module,"phrase")}catch(e){return err(e)}
    Object.keys(cfg.fields).forEach(f=>$("pl-"+f).innerHTML=ps.filter(p=>p.field===f).map(p=>`<option value="${esc(p.body)}">`).join(""));
    $("st-phrases").innerHTML=ps.map(p=>`<div class="row"><span class="sub" style="min-width:64px">${esc(cfg.fields[p.field]||p.field)}</span><span style="flex:1">${esc(p.body)}</span><button class="x" style="margin:0" onclick="Store.del('${p.id}',Store.phrases)">삭제</button></div>`).join("");
  }
  async function addPhrase(){
    const body=$("st-phrase").value.trim();if(!body)return;
    try{await RDB.add({module:cfg.module,kind:"phrase",field:$("st-field").value,body})}catch(e){return err(e)}
    $("st-phrase").value="";phrases();
  }
  return{init,list,save,use,copy,del,phrases,addPhrase};
})();
