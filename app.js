(() => {
  const D=window.LAW_DATA, $=id=>document.getElementById(id), esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const modes=['Exams','Videos','Readings','Midterm','Fact Patterns'];let mode=location.hash==='#midterm'?'Midterm':location.hash==='#fact-patterns'?'Fact Patterns':'Exams',set=D.sets[0],filter='all',index=0,factModule='all';
  const referenceMode=()=>mode==='Midterm'||mode==='Fact Patterns';
  const responses={},positions={};
  function filtered(){return set.questions.filter(q=>filter==='all'||filter==='mc'&&q.type==='multi'||filter==='fr'&&q.type==='fr'||filter==='numeric'&&q.type==='numeric'||filter==='outside'&&q.offScope||filter==='background'&&!q.offScope)}
  const posKey=()=>set.id+':'+filter;
  function nav(){
    $('modes').innerHTML=modes.map(m=>`<button data-mode="${m}" class="${mode===m?'active':''}" aria-pressed="${mode===m}">${m}</button>`).join('');
    if(mode==='Fact Patterns'){
      $('sets').innerHTML='';
      $('setintro').innerHTML='<h2>Fact Patterns &amp; Lecture Hypotheticals</h2><p>Full original wording. Select “Show answer” to reveal each answer, calculation, and analytical note.</p>';
      const tabs=[['all','All modules'],['slides','Slides & handouts'],['remedies','Contract remedies'],['lectures','Lecture hypotheticals']];
      $('filters').innerHTML=tabs.map(([id,title])=>`<button data-fact-module="${id}" class="${factModule===id?'active':''}" aria-pressed="${factModule===id}">${title}</button>`).join('');return;
    }
    if(mode==='Midterm'){
      $('sets').innerHTML='';
      $('setintro').innerHTML='<h2>Midterm</h2><p>Your uploaded notes, including all six pages and diagrams. Select a page to enlarge it.</p><p class="document-links"><a href="sources/midterm.pdf" target="_blank" rel="noopener">Open full-size PDF ↗</a> · <a href="sources/midterm.pdf" download="Midterm.pdf">Download PDF</a></p>';
      $('filters').innerHTML='';return;
    }
    $('sets').innerHTML=D.sets.filter(s=>s.mode===mode).map(s=>`<button class="setbtn ${set.id===s.id?'active':''}" data-set="${s.id}" aria-pressed="${set.id===s.id}">${esc(s.title)}<small>${s.questions.length} questions · ${s.id==='real'?'source paper':s.id.startsWith('exam')?'new scenarios':s.mode==='Readings'?'source + study prompts':'source bank'}</small></button>`).join('');
    $('setintro').innerHTML=`<h2>${esc(set.title)}</h2><p>${esc(set.desc)}</p>${set.note?`<p class="caution">${esc(set.note)}</p>`:''}`;
    let fs=[['all',mode==='Exams'?'Full exam':'All questions']];
    if(set.questions.some(q=>q.type==='multi'))fs.push(['mc','Multiple choice']);
    if(set.questions.some(q=>q.type==='fr'))fs.push(['fr','Written responses']);
    if(set.questions.some(q=>q.type==='numeric'))fs.push(['numeric','Calculations']);
    $('filters').innerHTML=fs.map(([id,name])=>`<button data-filter="${id}" class="${filter===id?'active':''}" aria-pressed="${filter===id}">${name} <span>(${set.questions.filter(q=>id==='all'||id==='mc'&&q.type==='multi'||id==='fr'&&q.type==='fr'||id==='numeric'&&q.type==='numeric'||id==='outside'&&q.offScope||id==='background'&&!q.offScope).length})</span></button>`).join('');
  }
  function render(){
    nav();$('quiz').classList.toggle('document-host',mode==='Midterm');
    $('quiz').classList.toggle('compilation-host',mode==='Fact Patterns');
    document.querySelector('.scope').hidden=referenceMode();
    if(mode==='Fact Patterns'){
      const compilation=window.LAW_FACT_PATTERNS;
      $('quiz').innerHTML=`<div class="compilation">${factModule==='all'?`<div class="compilation-intro">${compilation.introHtml}</div>`:''}${compilation.modules.filter(m=>factModule==='all'||factModule===m.id).map(m=>`<section class="compilation-module"><h3>${esc(m.title)}</h3>${m.entries.map(e=>`<article class="fact-pattern">${e.html}</article>`).join('')}</section>`).join('')}${factModule==='all'?`<div class="compilation-outro">${compilation.outroHtml}</div>`:''}</div>`;return;
    }
    if(mode==='Midterm'){
      const labels=['Jurisprudence and property','Contracts and remedies','Agency, terminology, and cases','Business forms and examples','Law and intellectual property diagrams','Business forms, contracts, and agency diagrams'];
      $('quiz').innerHTML=`<div class="midterm-pages">${labels.map((label,i)=>`<figure><figcaption>Page ${i+1} of 6 · ${esc(label)}</figcaption><a href="sources/midterm-pages/page-${i+1}.png" target="_blank" rel="noopener" aria-label="Enlarge page ${i+1}: ${esc(label)}"><img src="sources/midterm-pages/page-${i+1}.png" alt="Midterm notes, page ${i+1}: ${esc(label)}" width="1855" height="2400" loading="${i===0?'eager':'lazy'}"></a></figure>`).join('')}</div>`;return;
    }
    const qs=filtered();index=Math.min(index,Math.max(0,qs.length-1));positions[posKey()]=index;
    if(!qs.length){$('quiz').innerHTML='<p class="empty">No questions in this subtab.</p>';return}
    const q=qs[index],r=responses[q.id],answered=qs.filter(q=>responses[q.id]).length;
    const type=q.type==='multi'?'Select all that apply':q.type==='numeric'?'Numeric answer':'Written response';
    $('quiz').innerHTML=`<div class="topline"><span>QUESTION ${index+1} OF ${qs.length} · ${answered} ANSWERED</span><span class="tag">${type}</span></div><div class="progress"><div style="width:${answered/qs.length*100}%"></div></div><div class="label">${esc(q.origin)}</div>${q.warning?`<p class="uncertain">${esc(q.warning)}</p>`:''}${q.context?`<p class="prompt">${esc(q.context)}</p>`:''}<h3 class="prompt">${esc(q.prompt)}</h3><form id="answerForm"><div id="inputs">${q.type==='multi'?`<p class="hint">More than one answer may be correct. Select every supported choice.</p><div class="options">${q.options.map((v,i)=>`<label class="option ${r?(q.correct.includes(i)?'key':r.value.includes(i)?'wrong':''):''}"><input type="checkbox" name="choice" value="${i}" ${r?.value.includes(i)?'checked':''} ${r?'disabled':''}><span><b>${String.fromCharCode(65+i)}.</b> ${esc(v)}</span></label>`).join('')}</div>`:q.type==='numeric'?`<label class="hint" for="response">Dollar amount — commas and a dollar sign are accepted.</label><br><input id="response" name="response" type="text" inputmode="decimal" placeholder="e.g. 1,800,000" ${r?'disabled':''} value="${esc(r?.value??'')}" required>`:`<label class="hint" for="response">Write your argument before viewing the example.</label><textarea id="response" name="response" placeholder="State the rule, apply the facts, and explain your conclusion…" ${r?'disabled':''} required>${esc(r?.value??'')}</textarea>`}</div>${!r?'<div class="actions"><button class="primary" type="submit">Submit answer</button><span class="hint" id="formError" role="alert"></span></div>':''}</form>${r?feedback(q,r):''}<div class="navrow"><button class="secondary" id="prev" ${index===0?'disabled':''}>← Previous</button><div class="dots" aria-label="Go to question">${qs.map((n,i)=>`<button data-index="${i}" aria-label="Question ${i+1}${responses[n.id]?', answered':''}" ${i===index?'aria-current="step"':''} class="${responses[n.id]?'done ':''}${i===index?'current':''}">${i+1}</button>`).join('')}</div><button class="primary" id="next" ${!r?'disabled':''}>${index===qs.length-1?'Finish set':'Next question →'}</button></div>`;
    if(!r)$('answerForm').addEventListener('submit',e=>{e.preventDefault();let value;
      if(q.type==='multi'){value=[...document.querySelectorAll('input[name=choice]:checked')].map(el=>Number(el.value));if(!value.length){$('formError').textContent='Select at least one choice.';return}}
      else{value=$('response').value.trim();if(!value){$('formError').textContent='Enter a response first.';return}if(q.type==='numeric'&&!Number.isFinite(Number(value.replace(/[$,\s]/g,'')))){$('formError').textContent='Enter a numeric amount.';return}}
      const correct=q.type==='multi'?JSON.stringify([...value].sort())===JSON.stringify([...q.correct].sort()):q.type==='numeric'?Number(value.replace(/[$,\s]/g,''))===q.correct:null;
      responses[q.id]={value,correct};render();$('feedback').scrollIntoView({behavior:'smooth',block:'nearest'});
    });
    $('prev').onclick=()=>{if(index>0){index--;render()}};$('next').onclick=()=>{if(index<qs.length-1){index++;render();$('quiz').scrollIntoView({behavior:'smooth',block:'start'})}else finish(qs)};
  }
  function feedback(q,r){
    const heading=q.type==='fr'?'Use AI to grade your response but an example response is below':r.correct?'Correct':'Review the answer';
    const key=q.type==='multi'?`<p><b>${q.keyStatus==='supplied'?'Answer key':'Proposed key'}: ${q.correct.map(i=>String.fromCharCode(65+i)).join(', ')}</b>${q.warning&&set.id==='real'?' · see source qualification above':''}</p>`:q.type==='numeric'?`<p><b>Answer: $${q.correct.toLocaleString('en-US')}</b></p>`:'';
    let links=q.link?`<a href="${esc(q.link)}" target="_blank" rel="noopener">Open source ↗</a>`:'';
    if(q.sources?.length)links+=q.sources.map(s=>`<p><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.text)} ↗</a></p>`).join('');
    return `<section id="feedback" class="feedback"><h3>${heading}</h3>${key}${q.type==='fr'?`<div class="yourresponse"><b>Your response</b><br>${esc(r.value)}</div>`:''}<p class="answer">${esc(q.answer)}</p>${q.rubric?.length?`<p class="hint"><b>Check your reasoning against these points:</b></p><ul class="rubric">${q.rubric.map(v=>`<li>${esc(v)}</li>`).join('')}</ul>`:''}${q.type==='fr'?'<button class="secondary" id="copyAI" type="button">Copy question + response for AI grading</button><span id="copyStatus" class="hint" role="status"></span>':''}<details><summary>Source &amp; wording</summary><p>${esc(q.source)}</p>${links}${q.excerpt?`<p>Original auto-generated captions (unmodified). Caption errors may remain.</p><pre>${esc(q.excerpt)}</pre>`:''}</details></section>`;
  }
  function finish(qs){
    const done=qs.filter(q=>responses[q.id]),auto=done.filter(q=>q.type!=='fr'),right=auto.filter(q=>responses[q.id].correct),written=done.filter(q=>q.type==='fr');
    $('quiz').innerHTML=`<div class="label">SET REVIEW</div><h2>${done.length} of ${qs.length} answered</h2><p>${auto.length?`${right.length} of ${auto.length} automatically checked answers matched the ${auto.every(q=>q.keyStatus==='supplied')?'answer key':'proposed key'}.`:'This set uses written responses.'}</p><p>${written.length} written responses submitted for self-review or AI grading. They have not been automatically scored.</p>${done.length<qs.length?'<p class="uncertain">Some questions are unanswered. Use the question buttons to return to them.</p>':''}<div class="actions"><button class="primary" id="backReview">Review questions</button>${set.mode==='Exams'&&set.id!=='exam10'?'<button class="secondary" id="nextExam">Open next exam →</button>':''}</div><p class="hint">Your responses stay available while this page is open. Reloading starts a fresh session.</p>`;
    $('backReview').onclick=()=>{index=0;render()};if($('nextExam'))$('nextExam').onclick=()=>{const exams=D.sets.filter(s=>s.mode==='Exams');set=exams[exams.indexOf(set)+1];filter='all';index=0;render()};
  }
  document.addEventListener('click',async e=>{const b=e.target.closest('button');if(!b)return;
    if(b.dataset.mode){mode=b.dataset.mode;history.replaceState(null,'',mode==='Midterm'?'#midterm':mode==='Fact Patterns'?'#fact-patterns':location.pathname+location.search);if(!referenceMode())set=D.sets.find(s=>s.mode===mode);filter='all';index=referenceMode()?0:positions[posKey()]||0;render()}
    if(b.dataset.factModule){factModule=b.dataset.factModule;render();$('filters').scrollIntoView({behavior:'smooth',block:'start'})}
    if(b.dataset.showAnswer){const show=b.getAttribute('aria-expanded')!=='true';document.querySelectorAll(`[data-answer-group="${b.dataset.showAnswer}"]`).forEach(el=>el.hidden=!show);b.setAttribute('aria-expanded',String(show));b.textContent=show?'Hide answer':'Show answer'}
    if(b.dataset.set){set=D.sets.find(s=>s.id===b.dataset.set);filter='all';index=positions[posKey()]||0;render()}
    if(b.dataset.filter){filter=b.dataset.filter;index=positions[posKey()]||0;render()}
    if(b.dataset.index!==undefined){index=Number(b.dataset.index);render()}
    if(b.id==='copyAI'){const q=filtered()[index],r=responses[q.id];const txt=`Grade my LGST 1010 practice response against the supplied course example, not a generic legal rule. Flag any ambiguity or unsupported assumption. Explain the first substantive mistake, then suggest a better response. The example key may be proposed rather than official.\n\nQuestion:\n${q.context||''}\n${q.prompt}\n\nMy response:\n${r.value}\n\nExample response:\n${q.answer}\n\nReasoning checklist:\n${q.rubric.join('\n')}\n\nSource: ${q.source}`;try{await navigator.clipboard.writeText(txt);$('copyStatus').textContent=' Copied. Paste into your AI tool.'}catch{$('copyStatus').textContent=' Clipboard unavailable. Select and copy the question, your response, and example above.'}}
  });
  $('sourceContent').innerHTML=`<p>${esc(D.coverage)}</p><p>${esc(D.sourceNotes)}</p><ul><li>8 real exam questions; 72 generated questions across nine additional exams.</li><li>43 lecture questions/examples across classes 3, 6, 7 and 10; eight original contract problems.</li><li>Readings practice: source main questions and additional explicitly generated study questions through 015.</li><li>All seven Studocu prompts, including the three essays; four are flagged outside scope.</li><li>Real exam choices can have multiple correct answers. Questions 1–4 use your supplied answer key for exact-set scoring. Question 3 retains “Roger” in the original choice C; the key is B and E.</li><li>The handwritten building answer is $1,800,000, subject to stated loss assumptions; its uncertain words are marked.</li><li>Margin fragment “Capture news?” has unclear wording and no supplied answer. “What’s the promise contract?” is shorthand for identifying the exact enforceable promise. These are not silently made into scored exam questions.</li><li>The photographed Bob–Svetlana venture scenario has no visible questions. Exam #10 includes a labeled generated question inspired by those facts.</li></ul><p><a href="sources/readings-001-015.pdf" target="_blank" rel="noopener">Open original packet pages 1–118 (in-scope readings) ↗</a></p><p><a href="sources/studocu.pdf" target="_blank" rel="noopener">Open the Studocu paper ↗</a></p><p><b>Answer confidence:</b> lecture examples have lecturer-stated answers; real-paper questions 1–4 use your supplied key and explanations; written-response examples are source-supported interpretations; handwritten answers retain ambiguity; generated answers are proposed applications; Studocu is a student resource. No answer in this site is represented as an official professor grading key.</p>`;
  $('about').onclick=()=>$('sourceDialog').showModal();$('closeDialog').onclick=()=>$('sourceDialog').close();$('sourceDialog').onclick=e=>{if(e.target===$('sourceDialog'))$('sourceDialog').close()};render();
})();
