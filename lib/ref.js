// 판독지 공통: 판독 참고 카드 (BI-RADS lexicon, K-TIRADS 기준)
// 사용: Ref.attach({type:"mammo"|"breast"|"ktirads"})  → "내 저장소" 카드 아래에 접었다 펴는 카드로 들어감
// 출처: ACR BI-RADS Atlas 5th ed. (2013) / 2021 K-TIRADS (KSThR consensus, Korean J Radiol 2021;22:2094)
window.Ref=(()=>{
  const row=(a,b)=>`<tr><th>${a}</th><td>${b}</td></tr>`;
  const tbl=rows=>`<table>${rows.map(r=>row(r[0],r[1])).join("")}</table>`;
  const CAT=`<table class="cat"><tr><th>Category</th><th>판정</th><th>악성 가능성</th><th>권고</th></tr>
    <tr><td>0</td><td>Incomplete</td><td>N/A</td><td>추가 영상 / 이전 영상 비교</td></tr>
    <tr><td>1</td><td>Negative</td><td>≈ 0%</td><td>정기 검진</td></tr>
    <tr><td>2</td><td>Benign</td><td>≈ 0%</td><td>정기 검진</td></tr>
    <tr><td>3</td><td>Probably benign</td><td>&gt; 0 – ≤ 2%</td><td>단기 추적 (6 → 12 → 24개월). 24개월 안정 시 2로</td></tr>
    <tr><td>4A</td><td>Low suspicion</td><td>&gt; 2 – ≤ 10%</td><td rowspan="3">조직 검사</td></tr>
    <tr><td>4B</td><td>Moderate suspicion</td><td>&gt; 10 – ≤ 50%</td></tr>
    <tr><td>4C</td><td>High suspicion</td><td>&gt; 50 – &lt; 95%</td></tr>
    <tr><td>5</td><td>Highly suggestive of malignancy</td><td>≥ 95%</td><td>조직 검사</td></tr>
    <tr><td>6</td><td>Known biopsy-proven malignancy</td><td>N/A</td><td>임상적으로 적절하면 수술</td></tr></table>
    <p class="note">Category 3은 진단 검사(재검·촉지 등)에서만 쓰고 screening에서는 쓰지 않음.</p>`;

  const SECTIONS={
    mammo:[
      ["Composition",tbl([
        ["a","Almost entirely fatty"],["b","Scattered areas of fibroglandular density"],
        ["c","Heterogeneously dense, which may obscure small masses"],["d","Extremely dense, which lowers the sensitivity of mammography"]])],
      ["Mass",tbl([
        ["Shape","oval · round · irregular"],
        ["Margin","circumscribed · obscured · microlobulated · indistinct · spiculated"],
        ["Density","high · equal · low · fat-containing (지방 함유 → benign)"]])],
      ["Calcification",tbl([
        ["Typically benign","skin · vascular · coarse (popcorn-like) · large rod-like · round (punctate &lt; 0.5mm) · rim · dystrophic · milk of calcium · suture"],
        ["Suspicious morphology","amorphous · coarse heterogeneous · fine pleomorphic · fine linear / fine-linear branching (뒤로 갈수록 의심도 ↑)"],
        ["Distribution","diffuse · regional · grouped · linear · segmental (linear·segmental은 의심도 ↑)"]])],
      ["Asymmetry · 기타",tbl([
        ["Asymmetry","asymmetry (한 방향에서만) · global asymmetry (≥ 1 quadrant) · focal asymmetry (&lt; 1 quadrant, 두 방향) · developing asymmetry (새로 생기거나 커짐 → 의심)"],
        ["Architectural distortion","수술·외상력 없으면 의심 소견"],
        ["Intramammary LN","보통 &lt; 1cm, fatty hilum → benign"],
        ["Skin lesion · Solitary dilated duct","solitary dilated duct는 드물지만 의심 가능"],
        ["Associated features","skin retraction · nipple retraction · skin thickening · trabecular thickening · axillary adenopathy · architectural distortion · calcifications"],
        ["Location","laterality → quadrant / clock face → depth (anterior · middle · posterior third) → distance from nipple"]])],
      ["Category",CAT]
    ],
    breast:[
      ["Composition",tbl([
        ["a","Homogeneous background echotexture – fat"],["b","Homogeneous background echotexture – fibroglandular"],["c","Heterogeneous background echotexture"]])+`<p class="note">Tissue composition은 screening 검사에서 기재.</p>`],
      ["Mass",tbl([
        ["Shape","oval · round · irregular"],
        ["Orientation","parallel · not parallel (taller-than-wide → 의심)"],
        ["Margin","circumscribed · <b>not circumscribed</b>: indistinct · angular · microlobulated · spiculated"],
        ["Echo pattern","anechoic · hyperechoic · complex cystic and solid · hypoechoic · isoechoic · heterogeneous"],
        ["Posterior features","no posterior features · enhancement · shadowing · combined pattern"]])+
        `<p class="note">Probably benign (3)의 전형: oval, circumscribed, parallel, hypoechoic mass (presumed fibroadenoma) · isolated complicated cyst · clustered microcysts.</p>`],
      ["Calc · 관련 소견",tbl([
        ["Calcifications","in a mass · outside of a mass · intraductal"],
        ["Associated features","architectural distortion · duct changes · skin changes (thickening, retraction) · edema · vascularity (absent · internal · rim) · elasticity (soft · intermediate · hard)"]])],
      ["Special cases",tbl([
        ["Simple cyst","→ 2"],["Clustered microcysts","→ 2 (또는 3)"],["Complicated cyst","isolated → 3, multiple bilateral → 2"],
        ["기타","mass in or on skin · foreign body (implant 포함) · intramammary LN · axillary LN · vascular abnormalities (AVM, Mondor disease) · postsurgical fluid collection · fat necrosis"]])],
      ["Category",CAT]
    ],
    ktirads:[
      ["Category",`<table class="cat"><tr><th>K-TIRADS</th><th>US 소견</th><th>악성 위험</th></tr>
        <tr><td>5<br>High</td><td><b>Solid hypoechoic</b> + 의심 소견 ≥ 1개</td><td>&gt; 60%</td></tr>
        <tr><td>4<br>Intermediate</td><td>① Solid hypoechoic, 의심 소견 없음<br>② Partially cystic 또는 iso/hyperechoic + 의심 소견 ≥ 1개<br>③ Entirely calcified nodule</td><td>15 – 50%</td></tr>
        <tr><td>3<br>Low</td><td>Partially cystic 또는 iso/hyperechoic, 의심 소견 없음</td><td>3 – 15%</td></tr>
        <tr><td>2<br>Benign</td><td>Spongiform · partially cystic + intracystic echogenic foci with comet-tail artifact · pure cyst</td><td>&lt; 3%</td></tr>
        <tr><td>1</td><td>Nodule 없음</td><td>—</td></tr></table>
        <p class="note">Hypoechoic = 주변 갑상선 실질보다 낮은 echo (mild hypoechoic 포함).</p>`],
      ["의심 소견",tbl([
        ["Punctate echogenic foci","solid 부분 안의 ≤ 1mm echogenic foci (microcalcification)"],
        ["Nonparallel orientation","횡단면에서 AP 직경 &gt; 가로 직경 (taller-than-wide)"],
        ["Irregular margin","spiculated 또는 microlobulated margin"]])],
      ["FNA 기준",`<table class="cat"><tr><th>K-TIRADS</th><th>FNA 크기 기준</th></tr>
        <tr><td>5</td><td>&gt; 1cm<br>&gt; 0.5 ~ ≤ 1cm: 고위험 소견(ETE, LN·원격 전이 의심 등) 있으면 권고, 없으면 고려 (소아는 시행 고려)</td></tr>
        <tr><td>4</td><td>&gt; 1.5cm 권고 · 1 ~ 1.5cm는 US 소견·위험 인자에 따라 결정</td></tr>
        <tr><td>3</td><td>&gt; 2cm</td></tr>
        <tr><td>2</td><td>일반적으로 시행하지 않음 (계속 커지거나 시술·수술 전에는 가능)</td></tr></table>
        <p class="note">FNA 기준 미만 K5 nodule 추적: 1~2년간 6개월마다, 이후 변화 없으면 1년마다.</p>`],
      ["Lymph node",tbl([
        ["Suspicious","cystic change · echogenic foci (calcification) · cortical hyperechogenicity · abnormal vascularity 중 하나 이상"],
        ["Indeterminate","suspicious도 probably benign도 아님 (예: echogenic hilum·hilar vascularity 소실된 ovoid/round node)"],
        ["Probably benign","의심 소견 없고 echogenic hilum 또는 hilar vascularity"],
        ["FNA (수술 전)","suspicious: 단경 &gt; 3–5mm · indeterminate: 단경 &gt; 5mm"]])]
    ]
  };
  const TITLE={mammo:"📖 BI-RADS lexicon (Mammography)",breast:"📖 BI-RADS lexicon (Ultrasound)",ktirads:"📖 K-TIRADS 기준 (2021)"};
  const SRC={mammo:"ACR BI-RADS Atlas 5th ed. (2013)",breast:"ACR BI-RADS Atlas 5th ed. (2013)",ktirads:"2021 K-TIRADS, KSThR consensus (Korean J Radiol 2021)"};

  // Report 옆에 세 번째 열로 붙임. 모든 항목을 한 번에 펼쳐 보이고, 스크롤을 따라 내려옴. [숨기기]로 얇게 접을 수 있음
  function attach(cfg){
    const secs=SECTIONS[cfg.type];if(!secs)return;
    const main=document.querySelector("main"),rp=main&&main.querySelector("section:last-of-type");if(!rp)return;
    rp.classList.add("rp-col");main.classList.add("with-ref");
    const css=document.createElement("style");
    css.textContent=`
      main.with-ref{max-width:1760px;grid-template-columns:minmax(0,1.05fr) minmax(0,.85fr) minmax(0,.8fr)}
      main.with-ref.ref-hidden{grid-template-columns:minmax(0,1.1fr) minmax(0,.9fr) 34px}
      main.with-ref>section.rp-col,#refcol{position:sticky;top:8px;align-self:start;height:calc(100vh - 16px);display:flex;flex-direction:column;overflow:auto}
      main.with-ref>section.rp-col #out{flex:1 1 auto;min-height:260px}
      #refcol{background:var(--card);border:1px solid var(--line);border-radius:6px;padding:8px 10px}
      #refcol .hd{display:flex;align-items:center;gap:6px;margin-bottom:4px}
      #refcol .hd b{font-size:13px;flex:1}
      #refcol .hd button{padding:2px 8px;font-size:12px}
      #refcol h3{font-size:12px;margin:10px 0 2px;color:var(--ink);border-bottom:2px solid var(--acc);padding-bottom:2px}
      #refcol table{width:100%;border-collapse:collapse;font-size:11.5px;line-height:1.4}
      #refcol th,#refcol td{border-top:1px solid var(--line);padding:3px 4px;text-align:left;vertical-align:top}
      #refcol table:not(.cat) th{width:28%;color:var(--acc);font-weight:600}
      #refcol table.cat th{color:var(--mute);font-weight:600}
      #refcol table.cat td:first-child{font-weight:600;color:var(--acc);white-space:nowrap}
      #refcol .note{font-size:11px;color:var(--mute);margin:3px 0 0}
      #refcol .src{font-size:10.5px;color:var(--mute);margin:10px 0 0}
      #refcol .open{display:none}
      main.ref-hidden #refcol{padding:6px 2px;overflow:hidden}
      main.ref-hidden #refcol>*:not(.open){display:none}
      main.ref-hidden #refcol .open{display:block;writing-mode:vertical-rl;border:0;background:none;color:var(--acc);font-weight:600;font-size:12px;padding:4px 0;cursor:pointer;width:100%}
      @media(max-width:1050px){
        main.with-ref,main.with-ref.ref-hidden{grid-template-columns:minmax(0,1.1fr) minmax(0,.9fr)}
        #refcol{grid-column:1/-1;position:static;height:auto;overflow:visible}
        main.ref-hidden #refcol .open{writing-mode:horizontal-tb;text-align:left}}
      @media(max-width:900px){main.with-ref,main.with-ref.ref-hidden{grid-template-columns:1fr}
        main.with-ref>section.rp-col{position:static;height:auto;overflow:visible}}`;
    document.head.appendChild(css);
    const col=document.createElement("aside");col.id="refcol";
    col.innerHTML=`<button type="button" class="open" title="참고 열 펼치기">📖 ${TITLE[cfg.type].replace("📖 ","")}</button>
      <div class="hd"><b>${TITLE[cfg.type]}</b><button type="button" class="hide" title="참고 열 접기">숨기기</button></div>
      ${secs.map(s=>`<h3>${s[0]}</h3>${s[1]}`).join("")}
      <p class="src">출처: ${SRC[cfg.type]}. 판독 참고용 요약이며 최종 판단은 원문 기준을 따르세요.</p>`;
    main.appendChild(col);
    const set=h=>{main.classList.toggle("ref-hidden",h);try{localStorage.setItem("ref-hide-"+cfg.type,h?"1":"0")}catch(x){}};
    col.querySelector(".hide").onclick=()=>set(true);
    col.querySelector(".open").onclick=()=>set(false);
    try{if(localStorage.getItem("ref-hide-"+cfg.type)==="1")main.classList.add("ref-hidden")}catch(x){}
  }
  return{attach};
})();
