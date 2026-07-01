// ── Projection helpers ──
function monthToCol(yyyymm){
  if(!yyyymm)return -1;
  var p=yyyymm.split('-'),y=parseInt(p[0]),m=parseInt(p[1]);
  var ay,mi;
  if(m>=9){ay=y-PROJ_START_YEAR;mi=m-9;}
  else{ay=y-1-PROJ_START_YEAR;mi=m+3;}
  return ay*12+mi;
}
function colToDate(col){
  var ay=Math.floor(col/12),mi=col%12;
  var y=PROJ_START_YEAR+ay+(mi<4?1:0);
  var m=mi<4?mi+9:mi-3;
  return y+'-'+String(m).padStart(2,'0');
}

// ── Font fitting helper — shrinks font until text fits in available px ──
function fitFontSize(text, widthPx, maxSize) {
  var avail = Math.max(widthPx - 12, 10); // 5px left + 5px right padding + 2px safety
  for (var sz = maxSize; sz >= 7; sz--) {
    if (text.length * sz * 0.56 <= avail) return sz;
  }
  return 7;
}

// ── Projection render ──
function rProjection(){
  var el=document.getElementById('list');
  var RH=PROJ_ROW_H;
  var mainEl=document.querySelector('.main');
  var availW=mainEl?mainEl.clientWidth:(window.innerWidth-240);
  var MW=Math.max(40,Math.floor((availW-28)/14)); // 14 units: label=2×MW + 12 months; -28 for right margin
  var LW=2*MW;
  var bodyW=12*MW;

  // Three separate bands per row:
  var EDU_TOP=4,  EDU_H=26;   // Éducation (top)
  var PRO_TOP=32, PRO_H=26;   // Professionnel (middle)
  var PROJ_TOP=62, PROJ_H=24; // Projets (bottom)

  // Today
  var now=new Date();
  var nowM=now.getMonth()+1;
  var nowY=now.getFullYear();
  var nowAbsCol=monthToCol(nowY+'-'+String(nowM).padStart(2,'0'));
  var todayBaseYear=nowM>=9?nowY:nowY-1;
  var todayLocalCol=nowM>=9?nowM-9:nowM+3;
  var todayFrac=(now.getDate()-1)/new Date(nowY,nowM,0).getDate();
  var todayLocalPx=(todayLocalCol+todayFrac)*MW;

  var h='<div class="proj-wrap">';

  // Toolbar
  h+='<div class="proj-toolbar">'
    +'<button class="proj-btn-outline" onclick="openProjRowModal(null)">+ Ligne</button>'
    +'<div class="proj-legend">';
  Object.keys(PROJ_CATS).forEach(function(k){
    h+='<span class="proj-legend-lbl"><span class="proj-legend-dot" style="background:'+PROJ_CATS[k].color+'"></span>'+PROJ_CATS[k].label+'</span>';
  });
  h+='</div></div>';

  h+='<div class="proj-scroll"><div class="proj-inner">';

  // Sticky month header
  h+='<div class="proj-head-sticky">';
  h+='<div class="proj-month-row-hdr">';
  h+='<div class="proj-corner" style="width:'+LW+'px;flex-shrink:0;"></div>';
  PROJ_MONTHS.forEach(function(mn,mi){
    var isSem=(mi===4);
    h+='<div class="proj-month-cell-hdr" style="width:'+MW+'px;'+(isSem?'border-left:3px solid rgba(0,0,0,0.22);font-weight:700;color:#5A5755;':'')+'">'+mn+'</div>';
  });
  h+='</div></div>';

  // Data rows
  var rows=projRows.slice().sort(function(a,b){return a.order-b.order;});
  rows.forEach(function(row,idx){
    var rowBaseYear=PROJ_START_YEAR+idx;
    var rowAbsStart=idx*12;
    var rowAbsEnd=rowAbsStart+11;
    var isCurrentYear=(rowBaseYear===todayBaseYear);
    var yearLabel=rowBaseYear+'\u2013'+(rowBaseYear+1);

    var allPeriods=projPeriods.filter(function(p){return p.rowId===row.id;});
    var eduPers=allPeriods.filter(function(p){return p.cat==='education';});
    var proPers=allPeriods.filter(function(p){return p.cat==='professional';});
    var projPers=allPeriods.filter(function(p){return p.cat==='projects';});

    // Age at September of rowBaseYear (birthday 29/03 is before September so already turned)
    var ageAtStart=rowBaseYear-PROJ_BIRTH_YEAR;
    var ageLabel='('+ageAtStart+'\u2013'+(ageAtStart+1)+' ans)';

    h+='<div class="proj-data-row">';
    h+='<div class="proj-row-label-cell" style="width:'+LW+'px;height:'+RH+'px;">'
      +'<div class="proj-label-inner">'
      +'<span class="proj-row-name">'+e(row.label)+'</span>'
      +'<span class="proj-row-year">'+yearLabel+'</span>'
      +'<span class="proj-row-age">'+ageLabel+'</span>'
      +'</div>'
      +'<button class="proj-row-dots" onclick="openProjRowModal(\''+row.id+'\')">⋯</button>'
      +'</div>';

    h+='<div class="proj-row-body" style="width:'+bodyW+'px;height:'+RH+'px;">';

    // Grid lines
    for(var mi=0;mi<12;mi++){
      h+='<div class="proj-grid-cell '+(mi===4?'sem-sep':'month-sep')+'" style="left:'+(mi*MW)+'px;width:'+MW+'px;"></div>';
    }

    // Today marker
    if(isCurrentYear){
      h+='<div class="proj-today-marker" style="left:'+todayLocalPx+'px;">'
        +'<div class="proj-today-tick"></div>'
        +'</div>';
    }

    // Helper: render one set of periods — splits each at today's pixel position
    var todaySplitLocalPx=(nowAbsCol-rowAbsStart+todayFrac)*MW; // px of today within this row
    function renderPeriods(list,top,height,baseSize){
      list.slice().sort(function(a,b){
        return (monthToCol(b.endDate)-monthToCol(b.startDate))-(monthToCol(a.endDate)-monthToCol(a.startDate));
      }).forEach(function(p){
        var pAbsS=monthToCol(p.startDate);
        var pAbsE=monthToCol(p.endDate);
        if(pAbsE<rowAbsStart||pAbsS>rowAbsEnd)return;
        var localS=Math.max(pAbsS,rowAbsStart)-rowAbsStart;
        var localE=Math.min(pAbsE,rowAbsEnd)-rowAbsStart;
        var leftPx=localS*MW;
        var widthPx=(localE-localS+1)*MW-2;
        var cat=PROJ_CATS[p.cat]||PROJ_CATS.education;
        // Split at today
        var pastPx=Math.min(Math.max(Math.round(todaySplitLocalPx-leftPx),0),widthPx);
        var futurePx=widthPx-pastPx;
        // Font size fitting — shrink to avoid ellipsis
        var nameFS=fitFontSize(p.name, widthPx, baseSize);
        var showDesc=height>=20&&p.desc;
        var descFS=Math.max(nameFS-2, 7);
        var labelHTML='<span class="pn" style="font-size:'+nameFS+'px;">'+e(p.name)+'</span>'
          +(showDesc?'<span class="pd" style="font-size:'+descFS+'px;">'+e(p.desc)+'</span>':'');
        var del='<button class="proj-period-del" onclick="event.stopPropagation();deletePeriodDirect(\''+p.id+'\')" title="Supprimer">&#10005;</button>';
        h+='<div class="proj-period" '
          +'style="left:'+leftPx+'px;width:'+widthPx+'px;top:'+top+'px;height:'+height+'px;" '
          +'onclick="openProjPeriodModal(\''+p.id+'\',null)" '
          +'title="'+e(p.name+(p.desc?' — '+p.desc:''))+'">'
          +(pastPx>0?'<div class="proj-period-bg" style="left:0;width:'+pastPx+'px;background:#B0ADA8;"></div>':'')
          +(futurePx>0?'<div class="proj-period-bg" style="left:'+pastPx+'px;width:'+futurePx+'px;background:'+cat.color+';"></div>':'')
          +'<div class="proj-period-label">'+labelHTML+'</div>'
          +del
          +'</div>';
      });
    }

    renderPeriods(eduPers,  EDU_TOP,  EDU_H,  11); // Éducation
    renderPeriods(proPers,  PRO_TOP,  PRO_H,  11); // Professionnel
    renderPeriods(projPers, PROJ_TOP, PROJ_H, 10); // Projets

    h+='</div></div>';
  });

  h+='<div class="proj-add-row-footer">'
    +'<button class="proj-btn-outline" onclick="openProjRowModal(null)" style="font-size:11px;padding:4px 10px;">+ Ligne</button>'
    +'</div>';

  h+='<div class="proj-spacer"></div>';

  h+='</div></div></div>';
  el.innerHTML=h;
}

// ── Delete period directly from block ──
function deletePeriodDirect(id){
  projPeriods=projPeriods.filter(function(p){return p.id!==id;});
  saveTasks();saveSettingsRemote();rProjection();
}

// ── Période modal ──
function rowIdFromDate(yyyymm){
  if(!yyyymm)return projRows.length?projRows[0].id:null;
  var p=yyyymm.split('-'),y=parseInt(p[0]),m=parseInt(p[1]);
  var idx=m>=9?y-PROJ_START_YEAR:y-1-PROJ_START_YEAR;
  var row=projRows.find(function(r){return r.order===idx;});
  return row?row.id:(projRows.length?projRows[0].id:null);
}
function openProjPeriodModal(periodId,forRowId){
  _pPeriodId=periodId||null;
  var p=periodId?projPeriods.find(function(x){return x.id===periodId;}):null;
  document.getElementById('pp-name').value=p?p.name:'';
  document.getElementById('pp-start').value=p?p.startDate:'';
  document.getElementById('pp-end').value=p?p.endDate:'';
  document.getElementById('pp-cat').value=p?(p.cat||'education'):'education';
  document.getElementById('pp-desc').value=p?(p.desc||''):'';
  document.getElementById('proj-p-title').firstChild.textContent=p?'Modifier la période ':'Nouvelle période ';
  document.getElementById('pp-row-edit').style.display=p?'flex':'none';
  document.getElementById('pp-row-new').style.display=p?'none':'flex';
  document.getElementById('proj-p-bd').classList.add('open');
  setTimeout(function(){document.getElementById('pp-name').focus();},80);
}
function closeProjPeriodModal(){document.getElementById('proj-p-bd').classList.remove('open');}
function saveProjPeriod(){
  var name=document.getElementById('pp-name').value.trim();
  var start=document.getElementById('pp-start').value;
  var end=document.getElementById('pp-end').value;
  var cat=document.getElementById('pp-cat').value;
  var desc=document.getElementById('pp-desc').value.trim();
  if(!name){var el=document.getElementById('pp-name');el.style.borderColor='#C0392B';setTimeout(function(){el.style.borderColor='';},1200);return;}
  if(!start||!end||monthToCol(end)<monthToCol(start)){
    var s=document.getElementById('pp-start'),en=document.getElementById('pp-end');
    s.style.borderColor='#C0392B';en.style.borderColor='#C0392B';
    setTimeout(function(){s.style.borderColor='';en.style.borderColor='';},1200);return;
  }
  var rowId=rowIdFromDate(start);
  if(_pPeriodId){
    var p=projPeriods.find(function(x){return x.id===_pPeriodId;});
    if(p){p.name=name;p.startDate=start;p.endDate=end;p.rowId=rowId;p.cat=cat;p.desc=desc;}
  } else {
    projPeriods.push({id:newId(),rowId:rowId,name:name,startDate:start,endDate:end,cat:cat,desc:desc});
  }
  closeProjPeriodModal();saveTasks();saveSettingsRemote();rProjection();
}
function deleteProjPeriod(){
  if(!_pPeriodId)return;
  projPeriods=projPeriods.filter(function(p){return p.id!==_pPeriodId;});
  closeProjPeriodModal();saveTasks();saveSettingsRemote();rProjection();
}

// ── Ligne modal ──
function openProjRowModal(rowId){
  _pRowId=rowId||null;
  var row=rowId?projRows.find(function(r){return r.id===rowId;}):null;
  document.getElementById('pr-label').value=row?row.label:'';
  document.getElementById('proj-r-title').firstChild.textContent=row?'Modifier la ligne ':'Nouvelle ligne ';
  document.getElementById('pr-row-edit').style.display=row?'flex':'none';
  document.getElementById('pr-row-new').style.display=row?'none':'flex';
  document.getElementById('proj-r-bd').classList.add('open');
  setTimeout(function(){document.getElementById('pr-label').focus();},80);
}
function closeProjRowModal(){document.getElementById('proj-r-bd').classList.remove('open');}
function saveProjRow(){
  var label=document.getElementById('pr-label').value.trim();
  if(!label){var el=document.getElementById('pr-label');el.style.borderColor='#C0392B';setTimeout(function(){el.style.borderColor='';},1200);return;}
  if(_pRowId){
    var row=projRows.find(function(r){return r.id===_pRowId;});
    if(row)row.label=label;
  } else {
    var maxO=projRows.length>0?Math.max.apply(null,projRows.map(function(r){return r.order;})):0;
    projRows.push({id:newId(),label:label,order:maxO+1});
  }
  closeProjRowModal();saveTasks();saveSettingsRemote();rProjection();
}
function deleteProjRow(){
  if(!_pRowId||!confirm('Supprimer cette ligne et toutes ses périodes ?'))return;
  projRows=projRows.filter(function(r){return r.id!==_pRowId;});
  projPeriods=projPeriods.filter(function(p){return p.rowId!==_pRowId;});
  closeProjRowModal();saveTasks();saveSettingsRemote();rProjection();
}

// ── Long-term goals sidebar ──
function rProjectionGoals(){
  var el=document.getElementById('tabs');
  if(!el)return;
  var h='<div class="proj-goals-title">Objectifs long terme</div>'
    +'<div class="proj-goal-add">'
    +'<input type="text" id="goal-input" placeholder="Ajouter un objectif..." onkeydown="if(event.key===\'Enter\')addProjGoal()">'
    +'<button onclick="addProjGoal()">+</button>'
    +'</div>'
    +'<div class="proj-goals-list">';
  if(!projGoals.length){
    h+='<div style="padding:12px 6px;font-size:11.5px;color:#B0ADA8;text-align:center;">Aucun objectif pour l\'instant</div>';
  }
  // Undone first (preserve order), done at bottom
  var sorted=projGoals.slice().sort(function(a,b){
    if(!!a.done!==!!b.done) return a.done?1:-1;
    return projGoals.indexOf(a)-projGoals.indexOf(b);
  });
  sorted.forEach(function(g){
    h+='<div class="goal-row'+(g.done?' done':'')+'" data-goal-id="'+e(g.id)+'"'
      +' onpointerdown="goalPointerDown(event,\''+e(g.id)+'\')"'
      +' onpointermove="goalPointerMove(event)"'
      +' onpointerup="goalPointerUp(event)"'
      +' onpointercancel="goalPointerUp(event)">'
      +'<span class="goal-drag-handle">⠿</span>'
      +'<input type="checkbox" class="goal-chk"'+(g.done?' checked':'')+' onchange="toggleProjGoal(\''+e(g.id)+'\',this.checked)">'
      +'<span class="goal-txt">'+e(g.text)+'</span>'
      +'<button class="goal-del" onclick="deleteProjGoal(\''+e(g.id)+'\')">&times;</button>'
      +'</div>';
  });
  h+='</div>';
  el.innerHTML=h;
  var tw=document.getElementById('tabs-wrap');
  if(tw){tw.style.display='flex';tw.style.flexDirection='column';tw.style.padding='0';}
}
var _goalDrag={active:false,startY:0,moved:false,pointerId:null,goalId:null,el:null};
var _goalDropTarget=null;
function goalPointerDown(e,goalId){
  if(!e.target.classList.contains('goal-drag-handle')&&!e.target.closest('.goal-drag-handle'))return;
  e.preventDefault();
  _goalDrag.active=true;_goalDrag.startY=e.clientY;_goalDrag.moved=false;
  _goalDrag.pointerId=e.pointerId||null;_goalDrag.goalId=goalId;
  _goalDrag.el=e.target.closest('.goal-row');
  if(_goalDrag.el&&_goalDrag.el.setPointerCapture)_goalDrag.el.setPointerCapture(e.pointerId);
}
function goalPointerMove(e){
  if(!_goalDrag.active)return;
  if(Math.abs(e.clientY-_goalDrag.startY)<8)return;
  _goalDrag.moved=true;
  var target=document.elementFromPoint(e.clientX,e.clientY);
  var row=target&&target.closest('.goal-row[data-goal-id]');
  if(row&&row.getAttribute('data-goal-id')!==_goalDrag.goalId){
    if(_goalDropTarget&&_goalDropTarget!==row)_goalDropTarget.classList.remove('goal-drag-over');
    _goalDropTarget=row;_goalDropTarget.classList.add('goal-drag-over');
  } else if(!row||row.getAttribute('data-goal-id')===_goalDrag.goalId){
    if(_goalDropTarget){_goalDropTarget.classList.remove('goal-drag-over');_goalDropTarget=null;}
  }
}
function goalPointerUp(e){
  if(!_goalDrag.active)return;
  if(_goalDrag.moved&&_goalDrag.goalId&&_goalDropTarget){
    reorderGoals(_goalDrag.goalId,_goalDropTarget.getAttribute('data-goal-id'));
  }
  if(_goalDropTarget){_goalDropTarget.classList.remove('goal-drag-over');_goalDropTarget=null;}
  _goalDrag.active=false;_goalDrag.goalId=null;_goalDrag.el=null;
}
function reorderGoals(fromId,toId){
  var fi=projGoals.findIndex(function(g){return g.id===fromId;});
  var ti=projGoals.findIndex(function(g){return g.id===toId;});
  if(fi===-1||ti===-1||fi===ti)return;
  var item=projGoals.splice(fi,1)[0];projGoals.splice(ti,0,item);
  saveTasks();saveSettingsRemote();rProjectionGoals();
}
function addProjGoal(){
  var inp=document.getElementById('goal-input');
  if(!inp)return;
  var txt=inp.value.trim();
  if(!txt)return;
  projGoals.push({id:newId(),text:txt,done:false});
  inp.value='';
  saveTasks();saveSettingsRemote();rProjectionGoals();
  // refocus input
  var ni=document.getElementById('goal-input');if(ni)ni.focus();
}
function toggleProjGoal(id,val){
  var g=projGoals.find(function(x){return x.id===id;});
  if(g)g.done=val;
  saveTasks();saveSettingsRemote();rProjectionGoals();
}
function deleteProjGoal(id){
  projGoals=projGoals.filter(function(x){return x.id!==id;});
  saveTasks();saveSettingsRemote();rProjectionGoals();
}
