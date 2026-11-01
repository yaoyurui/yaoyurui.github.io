(function(){
  'use strict';
  var data=window.CASE_DATA,step=0,sampleId='SIM-025',selections={},reviews={};
  var $=function(id){return document.getElementById(id)};
  var panel=$('demoPanel'),snapshot=data.verified_run;
  function node(tag,text,className){var n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(className)n.className=className;return n}
  function current(){return data.rows.find(function(r){return r.id===sampleId})}
  function selected(){return selections[sampleId]||(selections[sampleId]=new Set())}
  function notice(text){return node('p',text,'inline-notice')}
  function heading(title,lead){panel.appendChild(node('h3',title));panel.appendChild(node('p',lead,'panel-lead'))}
  function switchToSnapshot(){sampleId='SIM-025';$('sampleSelect').value=sampleId;render()}
  function snapshotUnavailable(){panel.appendChild(notice('本页仅收录 SIM-025 的真实检索与模型回答快照。当前样本用于演示版本分类，不会展示编造的模型答案。'));var b=node('button','切换到 SIM-025','button small primary');b.type='button';b.style.marginTop='16px';b.addEventListener('click',switchToSnapshot);panel.appendChild(b)}
  function renderDiff(){
    var s=current();heading('先确认：到底发生了什么变化？',s.reason);
    var table=node('table',undefined,'comparison-table'),head=node('thead'),tr=node('tr');
    ['字段','旧版本','新版本'].forEach(function(t){tr.appendChild(node('th',t))});head.appendChild(tr);table.appendChild(head);
    var body=node('tbody');[['人工标签',s.old_label,s.new_label],['模型预测',s.old_prediction||'缺失',s.new_prediction||'缺失']].forEach(function(row){var r=node('tr');row.forEach(function(v){r.appendChild(node('td',v))});body.appendChild(r)});table.appendChild(body);panel.appendChild(table);
    var message=sampleId==='SIM-025'?'人工标签发生变更，两版结果不具备同一比较参照。此样本单列复核，不计为“模型已修复”。':sampleId==='SIM-026'?'旧版预测缺失，无法判断新旧版本效果变化。先补齐测试记录，不把新版有结果当成模型改善。':'在相同人工标签下，旧版正确而新版错误，按确定规则归为“新增错误”，优先进入问题清单。';
    panel.appendChild(notice(message));
    panel.appendChild(node('p','模拟数据整体口径：30 条合并记录，22 条可比，8 条需核对标签或数据。','source-meta'));
  }
  function sourceCard(source){
    var card=node('article',undefined,'source-card'),title=node('div',undefined,'source-title'),label=node('label'),check=node('input');
    check.type='checkbox';check.checked=selected().has(source.ref);check.setAttribute('aria-label','选用 '+source.ref+' 作为复核依据');
    check.addEventListener('change',function(){if(check.checked)selected().add(source.ref);else selected().delete(source.ref);updateSelectionCount()});
    label.appendChild(check);label.appendChild(node('span','['+source.ref+'] '+source.clause_id+' · '+source.section));title.appendChild(label);card.appendChild(title);
    card.appendChild(node('p',source.title+' / '+source.product+' / '+source.version+' / '+source.part,'source-meta'));
    card.appendChild(node('blockquote',source.excerpt));card.appendChild(node('p',source.location,'location'));return card;
  }
  function updateSelectionCount(){var count=$('selectionCount');if(count)count.textContent='已选择 '+selected().size+' 条依据'}
  function renderSources(){
    heading('查找适用规则，先确认产品与版本。','原型先按产品、部位和指定版本过滤，再做关键词检索。此处展示 SIM-025 实际检索到的规则快照。');
    if(sampleId!=='SIM-025'){snapshotUnavailable();return}
    var summary=node('div',undefined,'source-summary');summary.appendChild(node('span','4 条相关片段 · 均为模拟资料'));var count=node('span','已选择 '+selected().size+' 条依据');count.id='selectionCount';summary.appendChild(count);panel.appendChild(summary);
    snapshot.sources.forEach(function(source){panel.appendChild(sourceCard(source))});
  }
  function answerGroup(title,items){
    var box=node('section',undefined,'answer-group');box.appendChild(node('h4',title));var list=node('ol');
    items.forEach(function(item){var li=node('li',item.text);(item.evidence||[]).forEach(function(e){var chip=node('span','['+e.ref+']','citation-chip');chip.title='引用原文：'+e.quote;li.appendChild(chip);li.appendChild(node('span','“'+e.quote+'”','citation-excerpt'))});list.appendChild(li)});
    box.appendChild(list);return box;
  }
  function renderAnswer(){
    heading('模型解释规则，保留未知与待核查项。','以下是一次真实 API 调用的结果快照，回答已通过结构、引用编号与逐字摘录校验，仍需人工核对内容。');
    if(sampleId!=='SIM-025'){snapshotUnavailable();return}
    panel.appendChild(node('span','✓ 真实调用快照 · '+snapshot.resolved_model+' · '+snapshot.created_at.slice(0,10),'snapshot-label'));
    panel.appendChild(node('p',snapshot.answer.dispute,'panel-lead'));
    [['规则如何区分',snapshot.answer.distinctions],['还需核查的信息',snapshot.answer.information_needed],['建议的人工复核步骤',snapshot.answer.review_steps],['规则冲突',snapshot.answer.conflicts]].forEach(function(pair){if(pair[1].length)panel.appendChild(answerGroup(pair[0],pair[1]))});
    panel.appendChild(notice('引用校验只能确认编号和摘录对应，不能替代语义审核。没有图像或实物证据，模型不能判定真实缺陷。'));
  }
  function renderReview(){
    heading('确认依据，记录你的复核意见。','这里只演示人工复核交互。记录保留在当前页面内存，不会上传，刷新后清空，也不会改变原始标签或版本统计。');
    var saved=reviews[sampleId]||{},form=node('form',undefined,'review-form'),stateLabel=node('label'),stateText=node('span','复核状态'),state=node('select');
    ['待确认','已确认'].forEach(function(v){var opt=node('option',v);opt.value=v;state.appendChild(opt)});state.value=saved.state||'待确认';stateLabel.appendChild(stateText);stateLabel.appendChild(state);form.appendChild(stateLabel);
    var labelBox=node('label');labelBox.appendChild(node('span','最终类别或待确认意见'));var label=node('input');label.type='text';label.maxLength=100;label.value=saved.label||'';label.placeholder='例如：待补充原图后复核';labelBox.appendChild(label);form.appendChild(labelBox);
    var noteBox=node('label');noteBox.appendChild(node('span','复核说明'));var notes=node('textarea');notes.maxLength=1000;notes.value=saved.notes||'';notes.placeholder='记录需要补充的证据、剩余争议或处理建议';noteBox.appendChild(notes);form.appendChild(noteBox);
    var citationText=selected().size?'已选规则：'+Array.from(selected()).join('、'):'尚未选择规则依据。可回到“规则依据”勾选相关条款。';form.appendChild(node('p',citationText,'source-meta'));
    var authority=node('label',undefined,'authority'),check=node('input');check.type='checkbox';check.checked=!!saved.authority;authority.appendChild(check);authority.appendChild(node('span','演示：最终结论由有权限的人员给出'));form.appendChild(authority);
    var save=node('button','保存演示记录','button small primary');save.type='submit';form.appendChild(save);var status=node('p');status.setAttribute('role','status');form.appendChild(status);
    form.addEventListener('submit',function(event){event.preventDefault();
      if(state.value==='已确认'&&(!check.checked||!label.value.trim()||selected().size===0)){status.textContent='确认结论前，请选择规则依据、填写类别并确认人工权限。';status.className='inline-notice';return}
      reviews[sampleId]={state:state.value,label:label.value.trim(),notes:notes.value.trim(),authority:check.checked,refs:Array.from(selected())};
      status.textContent='已保存当前页面的演示记录，状态：'+state.value+'。原始标签与统计保持不变。';status.className='saved-message';
    });panel.appendChild(form);
    if(saved.state){var p=node('p','本页已有一条演示记录：'+saved.state,'saved-message');p.style.marginTop='12px';panel.appendChild(p)}
  }
  function render(){
    var s=current();$('sampleId').textContent=s.id;$('sampleStatus').textContent=s.status;panel.replaceChildren();
    document.querySelectorAll('[data-step]').forEach(function(b){var chosen=Number(b.dataset.step)===step;b.setAttribute('aria-selected',String(chosen));b.tabIndex=chosen?0:-1});panel.setAttribute('aria-labelledby','tab-'+step);
    [renderDiff,renderSources,renderAnswer,renderReview][step]();
    $('stepHint').textContent=['先核对版本变化，再查询判定依据。','查看原文，并勾选拟用于复核的规则。','这是已验证的真实回答快照，不实时请求模型。','人工确认与记录，构成复核流程的最后一步。'][step];
    $('nextStep').textContent=['下一步：规则依据 →','下一步：模型解释 →','下一步：人工复核 →','查看运行截图 ↗'][step];
  }
  $('sampleSelect').addEventListener('change',function(){sampleId=this.value;step=0;render()});
  document.querySelectorAll('[data-step]').forEach(function(b){b.addEventListener('click',function(){step=Number(b.dataset.step);render()});b.addEventListener('keydown',function(event){var next=step;if(event.key==='ArrowRight')next=(step+1)%4;else if(event.key==='ArrowLeft')next=(step+3)%4;else if(event.key==='Home')next=0;else if(event.key==='End')next=3;else return;event.preventDefault();step=next;render();$('tab-'+step).focus()})});
  $('nextStep').addEventListener('click',function(){if(step<3){step++;render();panel.focus({preventScroll:true})}else document.querySelector('.evidence-section').scrollIntoView({behavior:'smooth'})});
  var dialog=$('imageDialog');document.querySelectorAll('[data-image]').forEach(function(b){b.addEventListener('click',function(){$('fullImage').src=b.dataset.image;$('fullImage').alt=b.dataset.caption;$('imageCaption').textContent=b.dataset.caption;dialog.showModal()})});$('closeImage').addEventListener('click',function(){dialog.close()});dialog.addEventListener('click',function(event){if(event.target===dialog){var r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close()}});
  $('copyResume').addEventListener('click',async function(){var text='视觉质检版本对比与 RAG 规则检索助手｜个人项目\n针对测试版本回归与争议样本复核需求，搭建本地原型，支持数据导入、样本匹配、错误分类、统计筛选及导出，单列标签变更、争议及数据不全样本。\n实现质检标准解析、分块及按产品、部位、版本过滤的关键词检索，接入 GLM 生成依据解释与复核建议；校验引用编号及原文摘录，展示来源并记录人工复核结论，完成模拟资料下的检索—生成链路验证。';try{await navigator.clipboard.writeText(text);$('copyStatus').textContent='已复制，可以粘贴到简历。'}catch{window.prompt('请复制以下简历描述：',text);$('copyStatus').textContent='已打开可手动复制的文本。'}});
  render();
})();
