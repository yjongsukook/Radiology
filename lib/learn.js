// 판독지 공통: "고친 표현 학습"
// 자동으로 만든 줄과 사용자가 고친 줄을 비교해서 ① 단어 바꿈 ② 줄 형태(숫자만 다르면 같은 형태)를 저장하고,
// 다음에 비슷한 줄이 나오면 고친 형태로 바꿔 줌. 로그인했으면 저장소(items, module=<key>)에, 아니면 이 브라우저에만 저장.
// 사용: const L=Learner("report-mammo"); await L.load(); L.apply(line) / await L.learnPairs(만든줄[], 고친줄[])
window.Learner=key=>{
  let spans=[],lines=[];
  const toks=s=>s.trim().split(/\s+/).filter(Boolean);
  const tpl=s=>{const nums=[];const t=s.replace(/\d+(?:\.\d+)?/g,m=>{nums.push(m);return"#"}).replace(/\s+/g," ").trim();return{t,nums}};
  const reEsc=s=>s.replace(/[.*+?^${}()|[\]\\/]/g,"\\$&");
  // 두 줄이 얼마나 비슷한지 (글자 2개씩 묶어 비교 — 한국어 조사가 붙어도 비슷하게 봄). 0~1
  const bi=s=>{const t=s.toLowerCase().replace(/\s+/g,""),m=new Map();for(let i=0;i<t.length-1;i++){const k=t.slice(i,i+2);m.set(k,(m.get(k)||0)+1)}return m};
  const sim=(a,b)=>{const A=bi(a),B=bi(b);let n=0,ta=0,tb=0;A.forEach((v,k)=>{ta+=v;n+=Math.min(v,B.get(k)||0)});B.forEach(v=>tb+=v);return ta+tb?2*n/(ta+tb):0};
  // 줄 하나에 학습 반영. 지우기로 학습한 줄이면 line 이 null
  function apply(line){
    let t=line,hit=false;
    const lead=(t.match(/^\s*/)||[""])[0];
    for(const[a,b] of spans){const re=new RegExp(`(^|\\s)${reEsc(a)}(?=$|[\\s,.)])`,"g");if(re.test(t)){t=t.replace(re,(m,s)=>s+b);hit=true}}
    const tp=tpl(t),L=lines.find(x=>x.k===tp.t);
    if(L){if(L.c==="")return{line:null,hit:true};
      if((L.c.match(/#/g)||[]).length<=tp.nums.length){let i=0;t=lead+L.c.replace(/#/g,()=>tp.nums[i++]);hit=true}}
    return{line:t,hit};
  }
  // 두 줄의 단어 차이 (LCS) → 바뀐 묶음들
  function diffSpans(a,b){
    const n=a.length,m=b.length,dp=Array.from({length:n+1},()=>new Array(m+1).fill(0));
    for(let i=n-1;i>=0;i--)for(let j=m-1;j>=0;j--)dp[i][j]=a[i]===b[j]?dp[i+1][j+1]+1:Math.max(dp[i+1][j],dp[i][j+1]);
    const out=[];let i=0,j=0,cur=null;
    const flush=()=>{if(cur&&(cur.o.length||cur.n.length))out.push(cur);cur=null};
    while(i<n||j<m){
      if(i<n&&j<m&&a[i]===b[j]){flush();i++;j++}
      else if(j<m&&(i>=n||dp[i][j+1]>=dp[i+1][j])){(cur=cur||{o:[],n:[]}).n.push(b[j]);j++}
      else{(cur=cur||{o:[],n:[]}).o.push(a[i]);i++}
    }
    flush();return out;
  }
  async function save(field,body){
    try{if(window.RDB&&await RDB.user()){await RDB.add({module:key,kind:"phrase",field,body});return}}catch(x){}
    try{const a=JSON.parse(localStorage.getItem("learn-"+key)||"[]");a.push({field,body});localStorage.setItem("learn-"+key,JSON.stringify(a))}catch(x){}
  }
  // 좌우·숫자·Category·정도·모양·양성/악성 같은 "사실"을 바꾼 수정은 그 환자에게만 해당하므로 학습하지 않음
  const FACT=/\d|^(?:right|left|both|bilateral|양측|우측|좌측|mild|moderate|severe|marked|oval|round|irregular|benign|probably|suspicious|indeterminate|malignant|malignancy|high|low|intermediate|new|no|single|multiple|two|several|parallel|not|circumscribed|indistinct|angular|microlobulated|spiculated|hypoechoic|isoechoic|hyperechoic|solid|cystic)[,.]?$/i;
  const isFact=s=>s.split(/\s+/).some(w=>FACT.test(w));
  // 만든 줄들(before)과 고친 줄들(after)을 비교해서 학습.
  // opt.del: 통째로 지운 줄도 "지우기"로 학습 / opt.spans: 단어 바꿈도 학습 / opt.skip: 학습하지 않을 줄(정규식)
  async function learnPairs(before,after,opt={}){
    const keep=opt.spans!==false;
    const A=after.map(x=>x.replace(/\s+$/,"")).filter(x=>x.trim()),B=before.map(x=>x.replace(/\s+$/,"")).filter(x=>x.trim()&&!(opt.skip&&opt.skip.test(x.trim())));
    const used=new Set();let n=0;
    for(const g of B){
      if(A.includes(g)){used.add(g);continue}   // 고치지 않은 줄
      let best=null,bs=0.45,near=0;
      for(const l of A){if(used.has(l)||B.includes(l))continue;const s=sim(g,l);near=Math.max(near,s);if(s>bs){bs=s;best=l}}
      const a=tpl(g.trim());
      if(!best){
        // 통째로 지운 줄: 비슷한 줄이 전혀 남아 있지 않을 때만 "지우기"로 학습
        if(opt.del&&near<0.25&&a.t.length>3&&!a.nums.length&&!lines.some(x=>x.k===a.t)){lines.push({k:a.t,c:""});await save("line",JSON.stringify({k:a.t,c:""}));n++}
        continue}
      used.add(best);
      const b=tpl(best.trim());
      if(a.t===b.t)continue;   // 숫자만 고친 것은 학습하지 않음
      const ds=diffSpans(toks(g),toks(best));
      if(ds.some(sp=>sp.o.length&&sp.n.length&&isFact(sp.o.join(" "))&&isFact(sp.n.join(" "))))continue;   // 사실을 바로잡은 줄
      if(keep)for(const sp of ds){
        const o=sp.o.join(" "),nw=sp.n.join(" ");
        if(!o||!nw||sp.o.length>4||/\d/.test(o)||/\d/.test(nw)||isFact(o))continue;
        if(spans.some(x=>x[0]===o))continue;
        spans.push([o,nw]);await save("span",o+"=>"+nw);n++;
      }
      const old=lines.findIndex(x=>x.k===a.t);if(old>=0)lines.splice(old,1);
      lines.push({k:a.t,c:b.t});await save("line",JSON.stringify({k:a.t,c:b.t}));n++;
    }
    if(n)await load();
    return n;
  }
  async function load(){
    let rows=[];
    try{
      if(window.RDB&&await RDB.user())rows=await RDB.list(key,"phrase");   // 최신순
      else rows=JSON.parse(localStorage.getItem("learn-"+key)||"[]").reverse();
    }catch(x){}
    const S=[],L=[],seenS=new Set(),seenL=new Set();
    for(const r of rows){
      if(r.field==="span"){const[a,b]=r.body.split("=>");if(a&&b!==undefined&&!seenS.has(a)){seenS.add(a);S.push([a,b,r.id])}}
      if(r.field==="line"){try{const o=JSON.parse(r.body);if(!seenL.has(o.k)){seenL.add(o.k);L.push({k:o.k,c:o.c,id:r.id})}}catch(x){}}
    }
    spans=S;lines=L;
  }
  function list(){return[...spans.map((s,i)=>({t:"s",i,txt:`${s[0]} → ${s[1]}`})),...lines.map((l,i)=>({t:"l",i,txt:l.c===""?`${l.k}  ⇒  (지움)`:`${l.k}  ⇒  ${l.c}`}))].map(x=>({...x,txt:x.txt.replace(/#/g,"○")}))}
  async function forget(t,i){
    const x=t==="s"?spans[i]:lines[i];if(!x)return;
    const id=t==="s"?x[2]:x.id;
    try{
      if(id&&window.RDB)await RDB.remove(id);
      else{const a=JSON.parse(localStorage.getItem("learn-"+key)||"[]");
        localStorage.setItem("learn-"+key,JSON.stringify(a.filter(r=>t==="s"?!(r.field==="span"&&r.body.startsWith(x[0]+"=>")):!(r.field==="line"&&JSON.parse(r.body).k===x.k))))}
    }catch(e){}
    await load();
  }
  return{apply,learnPairs,load,list,forget,count:()=>spans.length+lines.length};
};
