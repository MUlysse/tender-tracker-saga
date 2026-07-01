var tasks=[
  {id:1, cat:'Onoris',    text:"Finaliser l'article Dubai Resilience",              prio:'U',done:false},
  {id:2, cat:'Onoris',    text:'Publier la rubrique Sovereign Advisory',             prio:'M',done:false},
  {id:3, cat:'Onoris',    text:'Contacter nouveaux contributeurs Finance',           prio:'M',done:false},
  {id:4, cat:'Sovereign', text:'Contacter Rodolphe !',                               prio:'U',done:false},
  {id:5, cat:'Sovereign', text:'Ajouter les contacts LinkedIn dans le bloc notes',   prio:'M',done:false},
  {id:6, cat:'Sovereign', text:'Preparer pitch SAGA pour le 29 juin',               prio:'U',done:false},
  {id:7, cat:'EDHEC',     text:'Rendu rapport de stage avant le 15',                prio:'U',done:false},
  {id:8, cat:'EDHEC',     text:'Valider UE Fintech avec prof Delorme',              prio:'M',done:false},
  {id:9, cat:'EDHEC',     text:'Inscription semestre 2 avant date limite',          prio:'L',done:false},
  {id:10,cat:'Logistique',text:'Creer une appli check list en ligne gratuitement',  prio:'U',done:false},
  {id:11,cat:'Logistique',text:'Faire la MAJ WebCatalog',                           prio:'U',done:false},
  {id:12,cat:'Logistique',text:'Reparer le clavier de mon ordinateur',              prio:'U',done:false},
  {id:13,cat:'Logistique',text:'Renouveler abonnement Figma',                       prio:'L',done:false},
  {id:14,cat:'Manhattan', text:'Chercher profils target to follow (Chertok)',       prio:'M',done:false},
  {id:15,cat:'Manhattan', text:'Inclure projets secondaires : livre, PhD, MSc',     prio:'L',done:false},
  {id:16,cat:'IHEDN',     text:'Ecrire article IHEDN',                              prio:'M',done:false},
  {id:17,cat:'Wish List', text:'Faire des recherches sur un bon defroisseur',       prio:'L',done:false},
  {id:18,cat:'Coiffeur',  text:'Prendre RDV coiffeur',                              prio:'U',done:true}
];
var nid=19,tab='All',np='M',na=false;
var TABS=['All','Aujourd\'hui','Urgent','Onoris','Sovereign','EDHEC','Logistique'];
var TODAY_TAB='Aujourd\'hui';
var SETTINGS_CAT='__settings__';
var settingsId=null;
var PO={U:0,M:1,L:2}, PL={U:'Urgent',M:'Mid-term',L:'Long term'};
var CO=['Onoris','Sovereign','EDHEC','Logistique'];
var STORAGE_KEY='checklistTasksV1';
var SUPABASE_URL='https://xvwfxmzdjmnyewunvtxk.supabase.co';
var SUPABASE_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2d2Z4bXpkam1ueWV3dW52dHhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5Nzg5MzQsImV4cCI6MjA5MDU1NDkzNH0.3yn_kqynOjAmiX_QFMG12nNDrJ73QQZLPm3ObqqF8d0';
var SUPABASE_TABLE='tasks';
var SUPABASE_TABLE_BOOKS='books';
var SUPABASE_BUCKET='book-covers';
var books=[];
var contacts=[];
var currentView='Home';
var todayOrderList=[];
var bookNotes={};
var financesData={depenses:[{label:'Loyer Nice',amount:650},{label:'Claude',amount:21.49},{label:'MGCN',amount:25},{label:'Assurance',amount:26.20}],ressources:[{label:'Papa',amount:450},{label:'Maman',amount:400},{label:'CAF',amount:100}],epargne:[{label:'Livret A',amount:30},{label:'Livret Jeune',amount:1689.15},{label:'Livret d\'épargne populaire',amount:6101.71}],comptesCourants:[{label:'Fortuneo',amount:2.53},{label:'Crédit Mutuel',amount:174.69}],depensesAvenir:[{label:'Prêt to',amount:40000}],autresSorties:[{label:'Fortuneo',amount:100},{label:'Livret A',amount:85.20}],mamanReste:15000};
var boazData={pages:[''],toc:[]};
var _bookReaderOpen=null;
var _bookReaderPage=0;
var SUPABASE_TABLE_CONTACTS='contacts';
var PROX_ORDER={'Fort':0,'Moyen':1,'Faible':2};
var netSearch='';
var _editContactId=null;
var companyLogos={};
var BOOK_STATUS_LABELS={reading:'En lecture',to_read:'A lire',read:'Lu'};
var CULTURE_CAT_ORDER=['Littérature','Philosophie','Société','Economie','Finance','Politique','Arts','Sports','Management'];
var BOOK_STATUS_ORDER=['reading','to_read','read'];
var supabaseClient = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY) : null;
var deleteTimers={};

// ── Projection data ──
var PROJ_START_YEAR=2024;
var PROJ_NUM_YEARS=5;
var PROJ_COL_W=65;
var PROJ_LABEL_W=160;
var PROJ_ROW_H=96;
var PROJ_DATA_VERSION=4;
var PROJ_BIRTH_YEAR=2003; // né le 29/03/2003
var projGoals=[];
var PROJ_MONTHS=['Septembre','Octobre','Novembre','Décembre','Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août'];
var PROJ_CATS={education:{label:'Éducation',color:'#4A90D9'},professional:{label:'Professionnel',color:'#34C759'},projects:{label:'Projets',color:'#FF9500'}};
var projRows=[
  {id:'pr1',label:'PM — Pré-Master',order:0},
  {id:'pr2',label:'M1 — Master 1',order:1},
  {id:'pr3',label:'P1 / P2 — Césure',order:2},
  {id:'pr4',label:'M2 — Master 2',order:3},
  {id:'pr5',label:"Fin d'études",order:4},
];
var projPeriods=[
  // ── PM 2024-2025 ──
  {id:'pp1', rowId:'pr1',name:'Semestre 1',      startDate:'2024-09',endDate:'2024-12',cat:'education',   desc:''},
  {id:'pp2', rowId:'pr1',name:'Semestre 2',      startDate:'2025-01',endDate:'2025-05',cat:'education',   desc:''},
  {id:'pp3', rowId:'pr1',name:'Stage PM',        startDate:'2025-06',endDate:'2025-08',cat:'professional',desc:''},
  // ── M1 2025-2026 ──
  {id:'pp4', rowId:'pr2',name:'Semestre 1 EDHEC (Nice)',startDate:'2025-09',endDate:'2025-12',cat:'education',desc:''},
  {id:'pp5', rowId:'pr2',name:'Semestre 2',      startDate:'2026-01',endDate:'2026-05',cat:'education',   desc:''},
  {id:'pp6', rowId:'pr2',name:'Stage M1',        startDate:'2026-06',endDate:'2026-08',cat:'professional',desc:''},
  {id:'pp13',rowId:'pr2',name:'Onoris',          startDate:'2025-09',endDate:'2026-08',cat:'projects',    desc:'Fondation Onoris'},
  // ── P1 / P2 Césure 2026-2027 ──
  {id:'pp7', rowId:'pr3',name:'Sovereign Advisory',startDate:'2026-09',endDate:'2027-02',cat:'professional',desc:'Stage de césure P1'},
  {id:'pp8', rowId:'pr3',name:'Stage P2',        startDate:'2027-03',endDate:'2027-08',cat:'professional',desc:'Stage de césure P2'},
  {id:'pp14',rowId:'pr3',name:'Onoris',          startDate:'2026-09',endDate:'2027-08',cat:'projects',    desc:'Fondation Onoris'},
  // ── M2 2027-2028 ──
  {id:'pp9', rowId:'pr4',name:'Semestre 1',      startDate:'2027-09',endDate:'2027-12',cat:'education',   desc:''},
  {id:'pp10',rowId:'pr4',name:'Semestre 2',      startDate:'2028-01',endDate:'2028-05',cat:'education',   desc:''},
  {id:'pp11',rowId:'pr4',name:'Stage M2',        startDate:'2028-06',endDate:'2028-08',cat:'professional',desc:''},
  {id:'pp15',rowId:'pr4',name:'Onoris',          startDate:'2027-09',endDate:'2028-08',cat:'projects',    desc:'Fondation Onoris'},
  {id:'pp16',rowId:'pr4',name:'IHEDN',           startDate:'2027-09',endDate:'2028-05',cat:'projects',    desc:'Session nationale'},
  // ── Fin d\'études 2028-2029 ──
  {id:'pp12',rowId:'pr5',name:"Stage fin d'études",startDate:'2028-09',endDate:'2029-06',cat:'professional',desc:''},
  {id:'pp17',rowId:'pr5',name:'Onoris',          startDate:'2028-09',endDate:'2029-06',cat:'projects',    desc:'Fondation Onoris'},
];
var _pPeriodId=null;
var _pRowId=null;

function rHome(){
  var el=document.getElementById('list');
  if(!el)return;
  var cards=[
    {view:'Checklist',title:'Checklist'},
    {view:'Culture',title:'Culture'},
    {view:'Projection',title:'Projection'},
    {view:'Networking',title:'Networking'},
    {view:'Exams',title:'Exams'},
    {view:'Chess',title:'Chess'},
    {view:'Finances',title:'Finances'},
    {view:'BOAZ',title:'BOAZ'},
  ];
  var h='<div class="home-hal-title">HAL9000</div>';
  h+='<div class="home-grid">';
  cards.forEach(function(c){
    h+='<div class="home-card" onclick="setView(\''+c.view+'\')">'
      +'<div class="home-card-title">'+e(c.title)+'</div>'
      +'</div>';
  });
  h+='</div>';
  el.innerHTML=h;
}

function fmtEur(n){return (parseFloat(n)||0).toLocaleString('fr-FR',{minimumFractionDigits:2,maximumFractionDigits:2})+' €';}
function fmtFinNum(n){return (parseFloat(n)||0).toLocaleString('fr-FR',{minimumFractionDigits:2,maximumFractionDigits:2});}
function parseFinNum(s){return parseFloat(String(s).replace(/\s/g,'').replace(',','.'))||0;}
function rFinances(){
  var el=document.getElementById('list');
  if(!el)return;
  var fd=financesData;
  function sumArr(arr){return arr.reduce(function(s,x){return s+(parseFloat(x.amount)||0);},0);}
  var totalDep=sumArr(fd.depenses);
  var totalRes=sumArr(fd.ressources);
  var totalEp=sumArr(fd.epargne);
  var totalCC=sumArr(fd.comptesCourants);
  var totalDA=sumArr(fd.depensesAvenir);
  var totalSorties=sumArr(fd.autresSorties||[]);
  var reste=totalRes-totalDep-totalSorties;
  var montantRestant=totalCC+totalEp-totalDA;
  var mamanReste=parseFloat(fd.mamanReste)||0;
  function finRow(key,i,d,amtClass){
    var raw=String(parseFloat(d.amount)||0);
    return '<div class="fin-row">'
      +'<span class="fin-label"><input class="fin-inp-label" value="'+e(d.label)+'" onchange="updateFinances(\''+key+'\','+i+',\'label\',this.value)"></span>'
      +'<span class="fin-amount '+amtClass+'"><input class="fin-inp" type="text" value="'+fmtFinNum(d.amount)+'" onfocus="this.value=\''+raw+'\'" onblur="updateFinances(\''+key+'\','+i+',\'amount\',parseFinNum(this.value))"></span>'
      +'<button class="fin-del" onclick="deleteFinanceRow(\''+key+'\','+i+')">×</button>'
      +'</div>';
  }
  var h='<div class="fin-wrap">';
  h+='<div class="fin-header"><button class="home-btn" onclick="setView(\'Home\')">Home</button></div>';
  h+='<div class="fin-cols">';
  // LEFT — Sorties
  h+='<div class="fin-col fin-col-out">';
  h+='<div class="fin-col-hdr fin-col-hdr-out">Sorties</div>';
  h+='<div class="fin-section"><div class="fin-section-title">Dépenses mensuelles</div>';
  fd.depenses.forEach(function(d,i){h+=finRow('depenses',i,d,'fin-amt-out');});
  h+='<button class="fin-add-row" onclick="addFinanceRow(\'depenses\')">+ Ajouter</button>';
  h+='<div class="fin-row-total fin-row-total-out">Total : <strong>'+fmtEur(totalDep)+'</strong></div>';
  h+='</div>';
  h+='<div class="fin-section"><div class="fin-section-title">Autres sorties</div>';
  (fd.autresSorties||[]).forEach(function(d,i){h+=finRow('autresSorties',i,d,'fin-amt-out');});
  h+='<button class="fin-add-row" onclick="addFinanceRow(\'autresSorties\')">+ Ajouter</button>';
  h+='<div class="fin-row-total fin-row-total-out">Total : <strong>'+fmtEur(totalSorties)+'</strong></div>';
  h+='</div>';
  h+='<div class="fin-section"><div class="fin-section-title">Dépenses à venir</div>';
  fd.depensesAvenir.forEach(function(d,i){h+=finRow('depensesAvenir',i,d,'fin-amt-out');});
  h+='<button class="fin-add-row" onclick="addFinanceRow(\'depensesAvenir\')">+ Ajouter</button>';
  h+='<div class="fin-row-total fin-row-total-out">Total : <strong>'+fmtEur(totalDA)+'</strong></div>';
  h+='</div>';
  h+='</div>';
  // Divider
  h+='<div class="fin-divider"></div>';
  // RIGHT — Entrées
  h+='<div class="fin-col fin-col-in">';
  h+='<div class="fin-col-hdr fin-col-hdr-in">Entrées</div>';
  h+='<div class="fin-section"><div class="fin-section-title">Ressources mensuelles</div>';
  fd.ressources.forEach(function(d,i){h+=finRow('ressources',i,d,'fin-amt-in');});
  h+='<button class="fin-add-row" onclick="addFinanceRow(\'ressources\')">+ Ajouter</button>';
  h+='<div class="fin-row-total fin-row-total-in">Total : <strong>'+fmtEur(totalRes)+'</strong></div>';
  h+='</div>';
  h+='<div class="fin-section"><div class="fin-section-title">Comptes courants</div>';
  fd.comptesCourants.forEach(function(d,i){h+=finRow('comptesCourants',i,d,'fin-amt-in');});
  h+='<button class="fin-add-row" onclick="addFinanceRow(\'comptesCourants\')">+ Ajouter</button>';
  h+='<div class="fin-row-total fin-row-total-in">Total : <strong>'+fmtEur(totalCC)+'</strong></div>';
  h+='</div>';
  h+='<div class="fin-section"><div class="fin-section-title">Épargne</div>';
  fd.epargne.forEach(function(d,i){h+=finRow('epargne',i,d,'fin-amt-in');});
  h+='<button class="fin-add-row" onclick="addFinanceRow(\'epargne\')">+ Ajouter</button>';
  h+='<div class="fin-row-total fin-row-total-in">Total : <strong>'+fmtEur(totalEp)+'</strong></div>';
  h+='</div>';
  h+='</div>';
  h+='</div>'; // fin-cols
  // Synthesis block
  h+='<div class="fin-synth-block">';
  h+='<div class="fin-synth-cell"><div class="fin-synth-lbl">Reste mensuel</div>'
    +'<div class="fin-synth-val '+(reste>=0?'fin-synth-val-in':'fin-synth-val-out')+'">'+fmtEur(reste)+'</div></div>';
  h+='<div class="fin-synth-cell"><div class="fin-synth-lbl">Disponible total</div>'
    +'<div class="fin-synth-val '+(montantRestant>=0?'fin-synth-val-in':'fin-synth-val-out')+'">'+fmtEur(montantRestant)+'</div></div>';
  h+='<div class="fin-synth-cell"><div class="fin-synth-lbl">Maman reste (prêt)</div>'
    +'<div class="fin-synth-val"><input class="fin-inp fin-inp-synth" type="text" value="'+fmtFinNum(mamanReste)+'" '
    +'onfocus="this.value=\''+String(mamanReste)+'\'" '
    +'onblur="financesData.mamanReste=parseFinNum(this.value);financesData._ts=Date.now();saveTasks();scheduleSettingsSync();rFinances();">'
    +' <span class="fin-synth-eur">€</span></div></div>';
  h+='</div>'; // fin-synth-block
  h+='</div>'; // fin-wrap
  el.innerHTML=h;
}

function updateFinances(key,idx,field,val){
  if(!financesData[key])financesData[key]=[];
  if(financesData[key][idx]!==undefined)financesData[key][idx][field]=val;
  financesData._ts=Date.now();saveTasks();scheduleSettingsSync();rFinances();
}
function addFinanceRow(key){
  if(!financesData[key])financesData[key]=[];
  financesData[key].push({label:'',amount:0});
  financesData._ts=Date.now();saveTasks();scheduleSettingsSync();rFinances();
}
function deleteFinanceRow(key,idx){
  if(!financesData[key])return;
  financesData[key].splice(idx,1);
  financesData._ts=Date.now();saveTasks();scheduleSettingsSync();rFinances();
}

function rBOAZ(){
  var el=document.getElementById('list');
  if(!el)return;
  var pages=boazData.pages;
  if(!pages||!pages.length){pages=[''];boazData.pages=pages;}
  var toc=boazData.toc||[];
  var totalPages=pages.length;
  var pageIdx=typeof boazData._currentPage==='number'?boazData._currentPage:0;
  if(pageIdx>=totalPages)pageIdx=totalPages-1;
  if(pageIdx<0)pageIdx=0;
  var leftPageIdx=pageIdx>0?pageIdx-1:-1;
  var rightPageText=pages[pageIdx]||'';
  var leftPageText=leftPageIdx>=0?pages[leftPageIdx]:'';
  var h='<div class="boaz-wrap">'
    +'<div class="boaz-header"><button class="home-btn" onclick="setView(\'Home\')">Home</button><span class="boaz-title">BOAZ</span></div>'
    +'<div class="boaz-layout">'
    // TOC sidebar
    +'<div class="boaz-toc">'
    +'<div class="boaz-toc-title">Table des matières</div>'
    +'<div class="boaz-toc-list" id="boaz-toc-list">';
  toc.forEach(function(entry,i){
    h+='<div class="boaz-toc-item" onclick="boazGoPage('+entry.page+')">'
      +'<span class="boaz-toc-pg">p.'+entry.page+'</span>'
      +'<span class="boaz-toc-lbl">'+e(entry.label)+'</span>'
      +'<button class="boaz-toc-del" onclick="event.stopPropagation();boazTocDel('+i+')">×</button>'
      +'</div>';
  });
  h+='</div>'
    +'<div class="boaz-toc-add"><input id="boaz-toc-inp" class="boaz-toc-input" placeholder="Titre du chapitre..." onkeydown="if(event.key===\'Enter\')boazTocAdd()">'
    +'<button class="fin-add-row" onclick="boazTocAdd()">+ Ajouter</button></div>'
    +'</div>'
    // Book spread
    +'<div class="boaz-book">'
    +'<div class="boaz-spread">'
    +'<div class="boaz-page boaz-left">'
    +(leftPageIdx>=0?'<textarea class="boaz-page-textarea" placeholder="Écrire ici..." onblur="boazSavePage('+leftPageIdx+',this.value)" onchange="boazSavePage('+leftPageIdx+',this.value)">'+e(leftPageText)+'</textarea><div class="boaz-pgnum">'+(leftPageIdx+1)+'</div>':'<div class="boaz-cover-face"><div style="font-size:28px;font-weight:800;color:#1C1C1E;letter-spacing:-1px;">BOAZ</div></div>')
    +'</div>'
    +'<div class="boaz-spine"></div>'
    +'<div class="boaz-page">'
    +'<textarea class="boaz-page-textarea" placeholder="Écrire ici..." onblur="boazSavePage('+pageIdx+',this.value)" onchange="boazSavePage('+pageIdx+',this.value)">'+e(rightPageText)+'</textarea>'
    +'<div class="boaz-pgnum">'+(pageIdx+1)+'</div>'
    +'</div>'
    +'</div>'
    +'<div style="display:flex;align-items:center;justify-content:space-between;padding:10px 20px;background:#F5F5F5;border-top:1px solid #E5E5E5;flex-shrink:0;">'
    +'<button class="br-nav-btn2" onclick="boazPrev()" '+(pageIdx<=0?'disabled':'')+'>&#9664; Précédent</button>'
    +'<span style="font-size:12px;color:#888;">Page '+(pageIdx+1)+' / '+totalPages+'</span>'
    +'<button class="br-nav-btn2" onclick="boazNext()">Suivant &#9654;</button>'
    +'</div>'
    +'</div>'
    +'</div>'
    +'</div>';
  el.innerHTML=h;
}
function boazSavePage(idx,val){
  if(!boazData.pages)boazData.pages=[];
  while(boazData.pages.length<=idx)boazData.pages.push('');
  boazData.pages[idx]=val;
  saveTasks();scheduleSettingsSync();
}
function boazNext(){
  var pages=boazData.pages;if(!pages)pages=boazData.pages=[''];
  var cur=typeof boazData._currentPage==='number'?boazData._currentPage:0;
  cur++;
  if(cur>=pages.length)pages.push('');
  boazData._currentPage=cur;
  saveTasks();rBOAZ();
}
function boazPrev(){
  var cur=typeof boazData._currentPage==='number'?boazData._currentPage:0;
  if(cur<=0)return;
  boazData._currentPage=cur-1;
  rBOAZ();
}
function boazGoPage(pg){
  boazData._currentPage=Math.max(0,(pg||1)-1);
  saveTasks();rBOAZ();
}
function boazTocAdd(){
  var inp=document.getElementById('boaz-toc-inp');
  if(!inp)return;
  var label=inp.value.trim();if(!label)return;
  var cur=typeof boazData._currentPage==='number'?boazData._currentPage:0;
  if(!boazData.toc)boazData.toc=[];
  boazData.toc.push({label:label,page:cur+1});
  inp.value='';
  saveTasks();rBOAZ();
}
function boazTocDel(idx){
  if(!boazData.toc)return;
  boazData.toc.splice(idx,1);
  saveTasks();rBOAZ();
}

async function checkSession() {
  if (!supabaseClient) return false;
  const { data: { session } } = await supabaseClient.auth.getSession();
  return !!session;
}

function showLogin() {
  document.getElementById('login-backdrop').classList.add('open');
  document.getElementById('login-email').focus();
}

function closeLogin() {
  document.getElementById('login-backdrop').classList.remove('open');
  document.getElementById('login-error').textContent = '';
}

async function login() {
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value.trim();
  if (!email || !password) return;

  document.getElementById('login-error').textContent = 'Connexion en cours...';
  const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
  if (error) {
    document.getElementById('login-error').textContent = error.message;
  } else {
    closeLogin();
    initApp();
  }
}

async function initApp() {
  loadTasks();
  loadExamData();
  examData._loaded=true;
  scheduleAllAutoDelete();
  render();
  initSupabase();
}

function loadTasks(){
  var stored=localStorage.getItem(STORAGE_KEY);
  if(stored){
    try{
      var data=JSON.parse(stored);
      if(Array.isArray(data.tasks)){
        tasks=data.tasks.filter(function(t){return t.cat!==SETTINGS_CAT;});
        nid=typeof data.nid==='number'&&data.nid>0?data.nid:1;
        if(typeof data.tab==='string')tab=data.tab;
        if(Array.isArray(data.tabs)){TABS=data.tabs;if(TABS.indexOf('All')<0)TABS.unshift('All');if(TABS.indexOf(TODAY_TAB)<0)TABS.splice(1,0,TODAY_TAB);if(TABS.indexOf('Urgent')<0)TABS.splice(2,0,'Urgent');}
      }
      if(Array.isArray(data.books)) books=data.books;
      if(Array.isArray(data.contacts)) contacts=data.contacts;
      buildCompanyLogos();
      if(typeof data.view==='string') currentView=data.view;
      if(Array.isArray(data.projRows)&&data.projRows.length) projRows=data.projRows;
      if(Array.isArray(data.projPeriods)&&data.projPeriods.length&&data.projDataVersion===PROJ_DATA_VERSION) projPeriods=data.projPeriods;
      if(Array.isArray(data.projGoals)) projGoals=data.projGoals;
      if(Array.isArray(data.todayOrderList)) todayOrderList=data.todayOrderList;
      if(data.bookNotes&&typeof data.bookNotes==='object') bookNotes=data.bookNotes;
      if(data.financesData&&typeof data.financesData==='object') Object.assign(financesData,data.financesData);
      if(data.boazData&&typeof data.boazData==='object') Object.assign(boazData,data.boazData);
    }catch(e){}
  }
  // Ensure all task categories are in TABS
  var cats = [];
  tasks.forEach(function(t){ if(cats.indexOf(t.cat)<0) cats.push(t.cat); });
  cats.forEach(function(c){ if(TABS.indexOf(c)<0 && c !== 'Completed') TABS.push(c); });
  CO = TABS.filter(x => !['All','Urgent','Completed',TODAY_TAB].includes(x));
  // Sanitize: today and prio=U are mutually exclusive
  tasks.forEach(function(t){ if(t.today && t.prio==='U') t.prio='M'; });
}
function saveTasks(){
  try{localStorage.setItem(STORAGE_KEY, JSON.stringify({tasks:tasks.filter(function(t){return t.cat!==SETTINGS_CAT;}),nid:nid,tab:tab,tabs:TABS,books:books,contacts:contacts,view:currentView,projRows:projRows,projPeriods:projPeriods,projDataVersion:PROJ_DATA_VERSION,projGoals:projGoals,todayOrderList:todayOrderList,bookNotes:bookNotes,financesData:financesData,boazData:boazData}));}catch(e){}
}
function clearAutoDelete(id){
  if(deleteTimers[id]){ clearTimeout(deleteTimers[id]); delete deleteTimers[id]; }
}
function scheduleAutoDelete(task){
  clearAutoDelete(task.id);
  if(!task.done) return;
  if(!task.doneAt) task.doneAt = Date.now();
  var delay = 24*60*60*1000 - (Date.now() - Number(task.doneAt || 0));
  if(delay <= 0){ autoDeleteTask(task.id); return; }
  deleteTimers[task.id] = setTimeout(function(){ autoDeleteTask(task.id); }, delay);
}
function autoDeleteTask(id){
  var t = tasks.find(function(t){return String(t.id)===String(id);});
  if(!t||!t.done) return;
  var elapsed = Date.now() - Number(t.doneAt || 0);
  if(elapsed < 24*60*60*1000){ scheduleAutoDelete(t); return; }
  tasks = tasks.filter(function(t){return String(t.id)!==String(id);});
  clearAutoDelete(id);
  render();
  saveTasks();
  if(supabaseClient) deleteRemoteTask(id);
}
function scheduleAllAutoDelete(){
  tasks.forEach(function(t){ if(t.done) scheduleAutoDelete(t); });
}
function newId(){
  if(window.crypto&&crypto.randomUUID) return crypto.randomUUID();
  return 't'+Math.random().toString(36).slice(2)+Date.now().toString(36);
}
function setSyncState(state){
  var d=document.getElementById('sync-dot');
  if(!d)return;
  d.classList.remove('syncing','error');
  if(state) d.classList.add(state);
}
function initSupabase(){
  if(!supabaseClient) return;
  setSyncState('syncing');
  Promise.all([loadTasksRemote(), loadBooksRemote(), loadContactsRemote()]).then(function(){ setSyncState(); }).catch(function(e){ console.warn('Supabase load failed',e); setSyncState('error'); }).finally(function(){ subscribeToRemoteChanges(); });
}
async function loadBooksRemote(){
  if(!supabaseClient) return;
  const { data: { user } } = await supabaseClient.auth.getUser();
  if (!user) return;
  var res = await supabaseClient.from(SUPABASE_TABLE_BOOKS).select().eq('user_id', user.id).order('id',{ascending:true});
  if(res.error) throw res.error;
  if(Array.isArray(res.data)){
    // Preserve local data-URL covers and categories (not always in Supabase)
    var localCovers = {};
    var localCategories = {};
    books.forEach(function(b){
      if(b.coverUrl && b.coverUrl.startsWith('data:')) localCovers[b.id] = b.coverUrl;
      if(b.category) localCategories[b.id] = b.category;
    });
    books = res.data.map(function(b){
      return {
        id: b.id,
        title: b.title || '',
        author: b.author || '',
        status: b.status || 'to_read',
        coverUrl: b.cover_url || localCovers[b.id] || '',
        sortOrder: typeof b.sort_order === 'number' ? b.sort_order : 0,
        category: b.category || localCategories[b.id] || ''
      };
    });
    books.sort(function(a,b){ var d=(b.sortOrder||0)-(a.sortOrder||0); if(d!==0)return d; if(typeof a.id==='number'&&typeof b.id==='number')return b.id-a.id; return String(b.id).localeCompare(String(a.id)); });
    // Migrate local categories up to Supabase for books missing them
    var { data: { user: u2 } } = await supabaseClient.auth.getUser();
    var migrationPromises = [];
    books.forEach(function(bk){
      if(bk.category && localCategories[bk.id]){
        // Check if the remote was missing the category (came from localCategories fallback)
        var remote = res.data.find(function(r){return r.id===bk.id;});
        if(remote && !remote.category){
          migrationPromises.push(
            supabaseClient.from(SUPABASE_TABLE_BOOKS).update({category:bk.category}).eq('id',bk.id).eq('user_id',u2.id)
          );
        }
      }
    });
    if(migrationPromises.length) await Promise.all(migrationPromises);
    saveTasks();
    render();
  }
}
async function loadTasksRemote(){
  if(!supabaseClient) return;
  setSyncState('syncing');
  const { data: { user } } = await supabaseClient.auth.getUser();
  if (!user) return;
  var localById = {};
  tasks.forEach(function(t){ localById[t.id] = t; });
  var res=await supabaseClient.from(SUPABASE_TABLE).select().eq('user_id', user.id).order('id',{ascending:true});
  if(res.error) throw res.error;
  if(Array.isArray(res.data)){
    var rows = res.data.map(function(t){
      var doneAt = typeof t.doneAt==='number'?t.doneAt:(typeof t.doneAt==='string'?parseInt(t.doneAt,10):undefined);
      return {id:t.id,cat:t.cat,text:t.text,prio:t.prio,done:t.done,today:t.today||false,doneAt:doneAt};
    });
    var settingsTask = rows.find(function(t){return t.cat === SETTINGS_CAT;});
    if(settingsTask){
      settingsId = settingsTask.id;
      try{
        var s = JSON.parse(settingsTask.text);
        if(Array.isArray(s.tabs)) TABS = s.tabs;
        if(TABS.indexOf('All')<0) TABS.unshift('All');
        if(TABS.indexOf(TODAY_TAB)<0) TABS.splice(1,0,TODAY_TAB);
        if(TABS.indexOf('Urgent')<0) TABS.splice(2,0,'Urgent');
        if(typeof s.tab === 'string') tab = s.tab;
        CO = TABS.filter(function(x){return !['All','Urgent','Completed',TODAY_TAB].includes(x);});
        if(Array.isArray(s.projRows)&&s.projRows.length) projRows=s.projRows;
        if(Array.isArray(s.projPeriods)&&s.projPeriods.length&&s.projDataVersion===PROJ_DATA_VERSION) projPeriods=s.projPeriods;
        if(Array.isArray(s.projGoals)) projGoals=s.projGoals;
        if(s.examData&&typeof s.examData==='object'){loadExamData(s.examData);examData._loaded=true;}
        if(s.companyLogos&&typeof s.companyLogos==='object'){Object.assign(companyLogos,s.companyLogos);}
        if(s.chessData&&typeof s.chessData==='object')loadChessData(s.chessData);
        if(Array.isArray(s.todayOrderList)) todayOrderList=s.todayOrderList;
        if(s.bookNotes&&typeof s.bookNotes==='object') bookNotes=s.bookNotes;
        if(s.financesData&&typeof s.financesData==='object'){
          var remTs=s.financesData._ts||0;var locTs=financesData._ts||0;
          if(!locTs||remTs>=locTs)Object.assign(financesData,s.financesData);
        }
        if(s.boazData&&typeof s.boazData==='object') Object.assign(boazData,s.boazData);
      }catch(e){}
    }
    var merged = rows.map(function(rt){
      var local = localById[rt.id];
      if(local){
        // Preserve local done=true if remote hasn't caught up yet (race condition protection)
        if(local.done && local.doneAt && !rt.done) { rt.done = true; }
        if(local.doneAt && !rt.doneAt) rt.doneAt = local.doneAt;
        if(local.today && !rt.today){ rt.today = local.today; if(rt.prio==='U') rt.prio='M'; }
      }
      return rt;
    });
    // Supabase is the single source of truth — local-only tasks are discarded.
    // Exception: preserve tasks added within the last 60s that haven't been confirmed yet
    // (handles the race between optimistic add and realtime refresh).
    var now60=Date.now()-60000;
    Object.keys(localById).forEach(function(id){
      var t=localById[id];
      if(t._pendingAt&&t._pendingAt>now60) merged.push(t);
    });
    tasks = merged.filter(function(t){return t.cat !== SETTINGS_CAT;});
    // Sanitize: today and prio=U are mutually exclusive
    tasks.forEach(function(t){ if(t.today && t.prio==='U') t.prio='M'; });
    // Rebuild TABS/CO from actual remote categories (drop orphaned local-only categories)
    var SYSTEM_TABS=['All',TODAY_TAB,'Urgent','Completed'];
    var remoteCats=[];
    tasks.forEach(function(t){ if(remoteCats.indexOf(t.cat)<0) remoteCats.push(t.cat); });
    TABS=TABS.filter(function(x){
      return SYSTEM_TABS.indexOf(x)>=0 || remoteCats.indexOf(x)>=0;
    });
    remoteCats.forEach(function(c){ if(TABS.indexOf(c)<0 && c!=='Completed') TABS.push(c); });
    CO = TABS.filter(function(x){return SYSTEM_TABS.indexOf(x)<0;});
    saveTasks();
    render();
    scheduleAllAutoDelete();
  }
  setSyncState();
}
async function insertRemoteTask(task){
  if(!supabaseClient) return;
  setSyncState('syncing');
  // Save today intent before any async op — realtime can overwrite it via loadTasksRemote()
  var intendedToday = !!task.today;
  var taskCat = task.cat, taskText = task.text;
  const { data: { user } } = await supabaseClient.auth.getUser();
  if (!user) return;
  var payload={cat:task.cat,text:task.text,prio:task.prio,done:task.done,user_id:user.id};
  if(task.today!==undefined) payload.today=task.today;
  if(task.doneAt!==undefined) payload.doneAt=task.doneAt;
  var res=await supabaseClient.from(SUPABASE_TABLE).insert([payload]).select();
  if(res.error){
    var msg=String(res.error.message||res.error);
    if(/today/.test(msg)) delete payload.today;
    if(/doneAt/.test(msg)) delete payload.doneAt;
    if(/today/.test(msg)||/doneAt/.test(msg)) res=await supabaseClient.from(SUPABASE_TABLE).insert([payload]).select();
  }
  if(res.error){ console.warn('Supabase insert failed',res.error); setSyncState('error'); }
  else {
    if(Array.isArray(res.data)&&res.data[0]&&res.data[0].id!==undefined&&res.data[0].id!==task.id){
      var oldId=task.id;
      var newId=res.data[0].id;
      var t=tasks.find(function(x){return x.id===oldId;});
      if(t) t.id=newId;
    }
    // Always clear _pendingAt — task is confirmed in Supabase, loadTasksRemote() must not re-add it
    delete task._pendingAt;
    saveTasks();
    // if the task changed while the insert was pending, reapply latest state and force a remote refresh
    var current = tasks.find(function(x){return x.id===task.id;});
    if(current){
      var updatePayload={};
      if(current.today!==payload.today) updatePayload.today=current.today;
      if(current.doneAt!==payload.doneAt) updatePayload.doneAt=current.doneAt;
      if(current.done!==payload.done) updatePayload.done=current.done;
      if(current.prio!==payload.prio) updatePayload.prio=current.prio;
      if(current.text!==payload.text) updatePayload.text=current.text;
      if(Object.keys(updatePayload).length){ await updateRemoteTask(current.id, updatePayload); }
    }
    if(!res.error){ await loadTasksRemote(); }
    // Restore today if lost during the async sync cycle (race with realtime subscription)
    if(intendedToday){
      var restored = tasks.find(function(x){return x.id===task.id;})
                  || tasks.find(function(x){return x.cat===taskCat&&x.text===taskText&&!x.done;});
      if(restored && !restored.today){ restored.today=true; saveTasks(); render(); }
    }
    setSyncState();
  }
}
async function updateRemoteTask(id,changes){
  if(!supabaseClient) return;
  setSyncState('syncing');
  var res=await supabaseClient.from(SUPABASE_TABLE).update(changes).eq('id',id);
  if(res.error){
    var msg=String(res.error.message||res.error);
    var next = Object.assign({},changes);
    if(/today/.test(msg)) delete next.today;
    if(/doneAt/.test(msg)) delete next.doneAt;
    if(JSON.stringify(next)!==JSON.stringify(changes)) res=await supabaseClient.from(SUPABASE_TABLE).update(next).eq('id',id);
  }
  if(res.error){ console.warn('Supabase update failed',res.error); setSyncState('error'); } else { setSyncState(); }
  // No loadTasksRemote() here — real-time subscription handles cross-device sync
  // Calling it immediately would race with Supabase and revert local changes
}
async function deleteRemoteTask(id){
  if(!supabaseClient) return;
  setSyncState('syncing');
  var res=await supabaseClient.from(SUPABASE_TABLE).delete().eq('id',id);
  if(res.error){ console.warn('Supabase delete failed',res.error); setSyncState('error'); } else { setSyncState(); }
}
var _rtTaskTimer=null,_rtBooksTimer=null;
function scheduleTaskRefresh(){ if(_rtTaskTimer)clearTimeout(_rtTaskTimer); _rtTaskTimer=setTimeout(function(){_rtTaskTimer=null;loadTasksRemote();},1500); }
function scheduleBooksRefresh(){ if(_rtBooksTimer)clearTimeout(_rtBooksTimer); _rtBooksTimer=setTimeout(function(){_rtBooksTimer=null;loadBooksRemote();},1500); }
function subscribeToRemoteChanges(){
  if(!supabaseClient) return;
  var channel=supabaseClient.channel('realtime-tasks');
  channel.on('postgres_changes',{event:'INSERT',schema:'public',table:SUPABASE_TABLE},function(){ scheduleTaskRefresh(); });
  channel.on('postgres_changes',{event:'UPDATE',schema:'public',table:SUPABASE_TABLE},function(){ scheduleTaskRefresh(); });
  channel.on('postgres_changes',{event:'DELETE',schema:'public',table:SUPABASE_TABLE},function(){ scheduleTaskRefresh(); });
  channel.on('postgres_changes',{event:'INSERT',schema:'public',table:SUPABASE_TABLE_BOOKS},function(){ scheduleBooksRefresh(); });
  channel.on('postgres_changes',{event:'UPDATE',schema:'public',table:SUPABASE_TABLE_BOOKS},function(){ scheduleBooksRefresh(); });
  channel.on('postgres_changes',{event:'DELETE',schema:'public',table:SUPABASE_TABLE_BOOKS},function(){ scheduleBooksRefresh(); });
  channel.on('postgres_changes',{event:'INSERT',schema:'public',table:SUPABASE_TABLE_CONTACTS},function(){ loadContactsRemote(); });
  channel.on('postgres_changes',{event:'UPDATE',schema:'public',table:SUPABASE_TABLE_CONTACTS},function(){ loadContactsRemote(); });
  channel.on('postgres_changes',{event:'DELETE',schema:'public',table:SUPABASE_TABLE_CONTACTS},function(){ loadContactsRemote(); });
  channel.subscribe();
}
window.addEventListener('storage', function(ev){
  if(ev.key!==STORAGE_KEY||!ev.newValue)return;
  try{
    var data=JSON.parse(ev.newValue);
    if(Array.isArray(data.tasks)){
      tasks=data.tasks.filter(function(t){return t.cat!==SETTINGS_CAT;});
      nid=typeof data.nid==='number'&&data.nid>0?data.nid:1;
      if(typeof data.tab==='string')tab=data.tab;
      if(Array.isArray(data.tabs)){TABS=data.tabs;if(TABS.indexOf('All')<0)TABS.unshift('All');if(TABS.indexOf(TODAY_TAB)<0)TABS.splice(1,0,TODAY_TAB);if(TABS.indexOf('Urgent')<0)TABS.splice(2,0,'Urgent');}
      CO = TABS.filter(x => !['All','Urgent','Completed',TODAY_TAB].includes(x));
      render();
      scheduleAllAutoDelete();
    }
  }catch(e){}
});

function sc(a,b){var ai=CO.indexOf(a.cat),bi=CO.indexOf(b.cat);if(ai<0&&bi<0)return a.cat.localeCompare(b.cat);if(ai<0)return 1;if(bi<0)return-1;return ai-bi;}
function normalizeTab(x){return String(x||'').replace(/[\u2018\u2019\u201B\u2032]/g, "'");}
function isTodayTab(x){return normalizeTab(x)===TODAY_TAB;}

function otabs(){var c=[],r=TABS.slice();tasks.forEach(function(t){if(c.indexOf(t.cat)<0)c.push(t.cat);});c.forEach(function(x){if(r.indexOf(x)<0&&x!=='Completed')r.push(x);});r.push('Completed');return r;}
function vtabs(){return otabs().filter(function(x){if(x==='All')return true;if(isTodayTab(x))return true;if(x==='Urgent')return tasks.some(function(t){return t.prio==='U'&&!t.done;});if(x==='Completed')return tasks.some(function(t){return t.done;});return tasks.some(function(t){return t.cat===x&&!t.done;});});}
function tc(x){if(x==='All')return tasks.filter(function(t){return!t.done;}).length;if(isTodayTab(x))return tasks.filter(function(t){return t.today&&!t.done;}).length;if(x==='Urgent')return tasks.filter(function(t){return t.prio==='U'&&!t.done;}).length;if(x==='Completed')return tasks.filter(function(t){return t.done;}).length;return tasks.filter(function(t){return t.cat===x&&!t.done;}).length;}

function render(){
  rViewBar();
  var bc=document.querySelector('.body-card');
  var appEl=document.querySelector('.app');
  if(bc){bc.classList.remove('exams-mode');bc.classList.remove('boaz-mode');}
  if(currentView!=='Networking'){
    var _no=document.getElementById('net-full-overlay');
    if(_no)_no.style.display='none';
    if(appEl)appEl.classList.remove('net-view');
  }
  if(currentView!=='Exams'){
    var _eo=document.getElementById('exam-full-overlay');
    if(_eo)_eo.style.display='none';
    if(appEl)appEl.classList.remove('exam-view');
  }
  // Hide sidebar for Home, Finances, BOAZ, Culture
  var sidebarEl=document.querySelector('.sidebar');
  var SIDEBAR_HIDDEN_VIEWS=['Home','Finances','BOAZ','Culture','Exams','Networking'];
  if(sidebarEl)sidebarEl.style.display=SIDEBAR_HIDDEN_VIEWS.indexOf(currentView)>=0?'none':'';
  // Show Home button in header on all views except Home itself
  var mainHomeBtn=document.getElementById('main-home-btn');
  if(mainHomeBtn)mainHomeBtn.style.display=currentView!=='Home'?'':'none';
  // Checklist "+" button
  var clAddBtn=document.getElementById('checklist-add-btn');
  if(clAddBtn)clAddBtn.style.display=currentView==='Checklist'?'':'none';
  // Culture "+" button
  var cultAddBtn=document.getElementById('culture-add-btn');
  if(cultAddBtn)cultAddBtn.style.display=currentView==='Culture'?'':'none';
  var projAddBtn=document.getElementById('projection-add-btn');
  if(projAddBtn)projAddBtn.style.display=currentView==='Projection'?'':'none';
  if(currentView==='Home'){
    if(bc){bc.classList.remove('proj-mode');bc.classList.remove('net-mode');}
    var mti=document.getElementById('main-title-icon');var mtt=document.getElementById('main-title-text');
    if(mti){mti.textContent='';mti.style.background='transparent';mti.style.boxShadow='none';mti.style.width='0';mti.style.padding='0';}
    if(mtt)mtt.textContent='';
    rHome();
  } else if(currentView==='Culture'){
    if(appEl)appEl.classList.remove('proj-view');
    var twb=document.getElementById('tabs-wrap');
    if(twb){twb.style.display='none';}
    var ctmB=document.getElementById('cat-treemap');if(ctmB)ctmB.style.display='none';
    if(bc){bc.classList.remove('proj-mode');bc.classList.remove('net-mode');}
    var mti=document.getElementById('main-title-icon');var mtt=document.getElementById('main-title-text');
    if(mti){mti.textContent='';mti.style.background='transparent';mti.style.boxShadow='none';mti.style.width='0';mti.style.padding='0';}
    if(mtt)mtt.textContent='Culture';
    rCulture();
  } else if(currentView==='Projection'){
    if(appEl)appEl.classList.add('proj-view');
    document.getElementById('tabs-wrap').style.display='block';
    var ctmP=document.getElementById('cat-treemap');if(ctmP)ctmP.style.display='none';
    if(bc){bc.classList.add('proj-mode');bc.classList.remove('net-mode');}
    var mti=document.getElementById('main-title-icon');var mtt=document.getElementById('main-title-text');
    if(mti){mti.textContent='';mti.style.background='transparent';mti.style.boxShadow='none';mti.style.width='0';mti.style.padding='0';}
    if(mtt)mtt.textContent='Projection';
    rProjectionGoals();
    rProjection();
  } else if(currentView==='Networking'){
    if(appEl){appEl.classList.remove('proj-view');appEl.classList.add('net-view');}
    var twn=document.getElementById('tabs-wrap');
    if(twn){twn.style.display='none';}
    if(bc){bc.classList.remove('proj-mode');bc.classList.add('net-mode');}
    var mti=document.getElementById('main-title-icon');var mtt=document.getElementById('main-title-text');
    if(mti){mti.textContent='';mti.style.background='transparent';mti.style.boxShadow='none';mti.style.width='0';mti.style.padding='0';}
    if(mtt)mtt.textContent='Networking';
    rNetworking();
  } else if(currentView==='Exams'){
    if(appEl){appEl.classList.remove('proj-view');appEl.classList.remove('net-view');appEl.classList.add('exam-view');}
    var twe=document.getElementById('tabs-wrap');
    if(twe){twe.style.display='none';}
    if(bc){bc.classList.remove('proj-mode');bc.classList.remove('net-mode');bc.classList.add('exams-mode');}
    var mti=document.getElementById('main-title-icon');var mtt=document.getElementById('main-title-text');
    if(mti){mti.textContent='';mti.style.background='transparent';mti.style.boxShadow='none';mti.style.width='0';mti.style.padding='0';}
    if(mtt)mtt.textContent='Exams';
    rExams();
  } else if(currentView==='Chess'){
    if(appEl){appEl.classList.remove('proj-view');appEl.classList.remove('net-view');appEl.classList.remove('exam-view');}
    var twch=document.getElementById('tabs-wrap');
    if(twch){twch.style.display='block';twch.style.flexDirection='';twch.style.padding='';}
    if(bc){bc.classList.remove('proj-mode');bc.classList.remove('net-mode');}
    var mti=document.getElementById('main-title-icon');var mtt=document.getElementById('main-title-text');
    if(mti){mti.textContent='';mti.style.background='transparent';mti.style.boxShadow='none';mti.style.width='0';mti.style.padding='0';}
    if(mtt)mtt.textContent='Chess';
    rChessNav();
    rChess();
  } else if(currentView==='Finances'){
    if(bc){bc.classList.remove('proj-mode');bc.classList.remove('net-mode');}
    var mti=document.getElementById('main-title-icon');var mtt=document.getElementById('main-title-text');
    if(mti){mti.textContent='';mti.style.background='transparent';mti.style.boxShadow='none';mti.style.width='0';mti.style.padding='0';}
    if(mtt)mtt.textContent='Finances';
    rFinances();
  } else if(currentView==='BOAZ'){
    if(bc){bc.classList.remove('proj-mode');bc.classList.remove('net-mode');bc.classList.add('boaz-mode');}
    var mti=document.getElementById('main-title-icon');var mtt=document.getElementById('main-title-text');
    if(mti){mti.textContent='';mti.style.background='transparent';mti.style.boxShadow='none';mti.style.width='0';mti.style.padding='0';}
    if(mtt)mtt.textContent='BOAZ';
    rBOAZ();
  } else {
    if(appEl)appEl.classList.remove('proj-view');
    var tw2=document.getElementById('tabs-wrap');
    if(tw2){tw2.style.display='block';tw2.style.flexDirection='';tw2.style.padding='';}
    if(bc){bc.classList.remove('proj-mode');bc.classList.remove('net-mode');}
    rTabs();
    rTasks();
    var _mti=document.getElementById('main-title-icon');var _mtt=document.getElementById('main-title-text');
    if(_mti){_mti.textContent='';_mti.style.background='transparent';_mti.style.boxShadow='none';_mti.style.width='0';_mti.style.padding='0';}
    if(_mtt)_mtt.textContent=currentView==='Checklist'?tab:tab;
  }
  rGauge();
  rDl();
}

function rViewBar(){
  document.querySelectorAll('#view-bar .view-btn, #mobile-nav .mobile-nav-btn, #nav-drawer .nav-drawer-item').forEach(function(b){
    b.classList.toggle('active', b.getAttribute('data-view')===currentView);
  });
}
function openNavDrawer(){
  document.getElementById('nav-overlay').classList.add('open');
  document.getElementById('nav-drawer').classList.add('open');
}
function closeNavDrawer(){
  document.getElementById('nav-overlay').classList.remove('open');
  document.getElementById('nav-drawer').classList.remove('open');
}
function navDrawerGo(view){
  closeNavDrawer();
  setView(view);
}

function getCatTreemapColor(name){
  if(name==='EDHEC') return '#E53935';
  if(name==='Onoris') return '#4A90D9';
  if(name==='Sovereign') return '#D4A017';
  if(['Logistique','Perso','Wish List','Business'].indexOf(name)>=0) return '#34C759';
  return '#8A8680';
}
function getTabIcon(name){
  var icons={'All':{bg:'#4A90D9',icon:'☰'},'Completed':{bg:'#34C759',icon:'✓'},'Aujourd\'hui':{bg:'#34C759',icon:'★'},'Urgent':{bg:'#FF9500',icon:'!'}};
  if(icons[name]) return icons[name];
  return {bg:getCatTreemapColor(name),icon:name.charAt(0).toUpperCase()};
}
function rTabs(){
  var SYSTEM=['All',TODAY_TAB,'Urgent','Completed'];
  var ts=vtabs().filter(function(x){return SYSTEM.indexOf(x)>=0;});
  if(ts.indexOf(tab)<0&&SYSTEM.indexOf(tab)>=0) tab='All';
  var h='';
  ts.forEach(function(x){
    var cnt=tc(x);
    h+='<div class="tab'+(tab===x?' active':'')+'" data-tab="'+x+'" onclick="setTab(this.dataset.tab)">'
      +'<span class="tab-label">'+x+'</span>'
      +(cnt>0?'<span class="tab-badge">'+cnt+'</span>':'')
      +'</div>';
  });
  document.getElementById('tabs').innerHTML=h;
  rCategoryTreemap();
}
function rCategoryTreemap(){
  var el=document.getElementById('cat-treemap');
  if(!el) return;
  var SYSTEM=['All',TODAY_TAB,'Urgent','Completed'];
  var seen={}, cats=[];
  otabs().forEach(function(x){
    if(SYSTEM.indexOf(x)>=0||seen[x]) return;
    seen[x]=true;
    var cnt=tc(x);
    if(cnt>0) cats.push({name:x,count:cnt});
  });
  if(!cats.length){el.style.display='none';return;}
  el.style.display='block';
  cats.sort(function(a,b){return b.count-a.count;});
  var html='<div class="tm-label">Catégories</div><div class="cat-list">';
  cats.forEach(function(c){
    var color=getCatTreemapColor(c.name);
    var isActive=tab===c.name;
    html+='<div class="cat-list-item'+(isActive?' active':'')+'" data-tab="'+e(c.name)+'" onclick="setTab(this.dataset.tab)" style="--cat-color:'+color+';">'
      +'<span class="cat-list-dot" style="background:'+color+';"></span>'
      +'<span class="cat-list-name">'+e(c.name)+'</span>'
      +'<span class="cat-list-badge">'+c.count+'</span>'
      +'</div>';
  });
  html+='</div>';
  el.innerHTML=html;
}
var draggedTab=null;
var dropTarget=null;
var pointerDrag={active:false,startX:0,startY:0,moved:false,pointerId:null,draggedTab:null};
var ignoreClick=false;
function tabPointerDown(e){ var t=e.target.closest('.tab'); if(!t) return; pointerDrag.active=true; pointerDrag.startX=e.clientX; pointerDrag.startY=e.clientY; pointerDrag.moved=false; pointerDrag.pointerId=e.pointerId||null; pointerDrag.draggedTab=t; if(t.setPointerCapture) t.setPointerCapture(e.pointerId); }
function tabPointerMove(e){ if(!pointerDrag.active||!pointerDrag.draggedTab) return; var dx=Math.abs(e.clientX-pointerDrag.startX); var dy=Math.abs(e.clientY-pointerDrag.startY); if(dx<12&&dy<12) return; pointerDrag.moved=true; var target=document.elementFromPoint(e.clientX,e.clientY); var t=target&&target.closest('.tab'); if(t&&t!==pointerDrag.draggedTab){ if(dropTarget&&dropTarget!==t) dropTarget.classList.remove('drag-over'); dropTarget=t; dropTarget.classList.add('drag-over'); }}
function tabPointerUp(e){ if(!pointerDrag.active) return; if(pointerDrag.draggedTab&&pointerDrag.draggedTab.releasePointerCapture&&pointerDrag.pointerId!==null){ pointerDrag.draggedTab.releasePointerCapture(pointerDrag.pointerId); }
 if(pointerDrag.moved&&pointerDrag.draggedTab&&dropTarget&&dropTarget!==pointerDrag.draggedTab){ reorderTabs(pointerDrag.draggedTab.getAttribute('data-tab'),dropTarget.getAttribute('data-tab')); ignoreClick=true; } pointerDrag.active=false; pointerDrag.draggedTab=null; pointerDrag.pointerId=null; if(dropTarget){ dropTarget.classList.remove('drag-over'); dropTarget=null; } setTimeout(function(){ignoreClick=false;},0); }
function reorderTabs(fromTab,toTab){ var fromIndex=TABS.indexOf(fromTab); var toIndex=TABS.indexOf(toTab); if(fromIndex===-1||toIndex===-1||fromIndex===toIndex) return; var item=TABS.splice(fromIndex,1)[0]; TABS.splice(toIndex,0,item); CO=TABS.filter(function(x){return!['All','Urgent','Completed',TODAY_TAB].includes(x);}); render(); saveTasks(); saveSettingsRemote(); }
function dragStart(e) { draggedTab = e.target.closest('.tab'); if(draggedTab){ e.dataTransfer && (e.dataTransfer.effectAllowed = 'move'); }}
function dragOver(e) { e.preventDefault(); e.dataTransfer && (e.dataTransfer.dropEffect = 'move'); var t = e.target.closest('.tab'); if(t && t !== draggedTab){ dropTarget = t; }}
function dragEnter(e){ var t = e.target.closest('.tab'); if(t && t !== draggedTab){ dropTarget = t; t.classList.add('drag-over'); }}
function dragLeave(e){ var t = e.target.closest('.tab'); if(t && t !== draggedTab){ t.classList.remove('drag-over'); if(dropTarget===t) dropTarget=null; }}
var _settingsSyncTimer=null;
function scheduleSettingsSync(){
  if(!supabaseClient)return;
  if(_settingsSyncTimer)clearTimeout(_settingsSyncTimer);
  _settingsSyncTimer=setTimeout(function(){saveSettingsRemote();},1500);
}
async function saveSettingsRemote(){
  if(!supabaseClient) return;
  const { data: { user } } = await supabaseClient.auth.getUser();
  if (!user) return;
  var settingsData = JSON.stringify({tabs: TABS, tab: tab, projRows: projRows, projPeriods: projPeriods, projDataVersion: PROJ_DATA_VERSION, projGoals: projGoals, examData:{subjects:examData.subjects,s1NumExams:examData.s1NumExams,s2NumExams:examData.s2NumExams,s1Grades:examData.s1Grades,s2Grades:examData.s2Grades}, companyLogos:companyLogos, chessData:{boards:chessData.boards}, todayOrderList:todayOrderList, bookNotes:bookNotes, financesData:financesData, boazData:boazData});
  var payload={cat:SETTINGS_CAT,text:settingsData,prio:'L',done:true,user_id:user.id};
  if(settingsId){
    await updateRemoteTask(settingsId,{text:settingsData});
  } else {
    var res=await supabaseClient.from(SUPABASE_TABLE).insert([payload]).select();
    if(!res.error && Array.isArray(res.data)&&res.data[0]&&res.data[0].id!==undefined){ settingsId=res.data[0].id; }
  }
}
function drop(e) { e.preventDefault(); var target = e.target.closest('.tab')||dropTarget; if(target && draggedTab && target !== draggedTab){ var fromTab = draggedTab.getAttribute('data-tab'); var toTab = target.getAttribute('data-tab'); var fromIndex = TABS.indexOf(fromTab); var toIndex = TABS.indexOf(toTab); if(fromIndex !== -1 && toIndex !== -1){ var item = TABS.splice(fromIndex, 1)[0]; TABS.splice(toIndex, 0, item); CO = TABS.filter(x => !['All','Urgent','Completed',TODAY_TAB].includes(x)); render(); saveTasks(); saveSettingsRemote(); } } document.querySelectorAll('.tab.drag-over').forEach(function(el){el.classList.remove('drag-over');}); draggedTab=null; dropTarget=null; }

function gf(){if(tab==='All')return tasks.filter(function(t){return!t.done;});if(isTodayTab(tab))return tasks.filter(function(t){return t.today&&!t.done;});if(tab==='Urgent')return tasks.filter(function(t){return t.prio==='U'&&!t.done;});if(tab==='Completed')return tasks.filter(function(t){return t.done;});return tasks.filter(function(t){return t.cat===tab&&!t.done;});}

function taskSortKey(t){
  // Today+Urgent > Today > Urgent > normal; within each tier, preserve prio order
  if(t.today && t.prio==='U') return 0;
  if(t.today) return 1;
  if(t.prio==='U') return 2;
  return 3+(PO[t.prio]!==undefined?PO[t.prio]:1);
}
function rTasks(){
  var el=document.getElementById('list'),rows=gf();
  if(!rows.length){el.innerHTML='<div class="empty"><div class="empty-icon">&#10003;</div><div class="empty-txt">Aucune tache a afficher.</div></div>';return;}
  var isG=(tab==='All'||tab==='Completed'),h='',i=0;
  if(isG){
    var cats=[];rows.forEach(function(t){if(cats.indexOf(t.cat)<0)cats.push(t.cat);});cats.sort(function(a,b){return sc({cat:a},{cat:b});});
    cats.forEach(function(cat){var cr=rows.filter(function(t){return t.cat===cat;});cr.sort(function(a,b){return taskSortKey(a)-taskSortKey(b);});h+='<div class="cat-grp"><div class="cat-sep">'+cat+'</div>';cr.forEach(function(t){h+=rh(t,true,i++%2===0?'sa':'sb');});h+='</div>';});
  } else if(isTodayTab(tab)){
    // Today tab: numbered ordered tasks with drag-and-drop
    var todayRows=rows.slice();
    // Sort by todayOrderList first, then remaining tasks
    todayRows.sort(function(a,b){
      var ai=todayOrderList.indexOf(String(a.id));
      var bi=todayOrderList.indexOf(String(b.id));
      if(ai>=0&&bi>=0) return ai-bi;
      if(ai>=0) return -1;
      if(bi>=0) return 1;
      return taskSortKey(a)-taskSortKey(b);
    });
    // Sync todayOrderList: add new, remove gone, preserve existing order
    var _curIdSet={};todayRows.forEach(function(t){_curIdSet[String(t.id)]=true;});
    todayOrderList=todayOrderList.filter(function(id){return _curIdSet[id];});
    todayRows.forEach(function(t){var sid=String(t.id);if(todayOrderList.indexOf(sid)<0)todayOrderList.push(sid);});
    h='<div class="today-ordered-list" id="today-ordered-list">';
    todayRows.forEach(function(t,idx){
      h+='<div class="today-row" data-tid="'+e(String(t.id))+'" onpointerdown="todayPointerDown(event,\''+e(String(t.id))+'\')" onpointermove="todayPointerMove(event)" onpointerup="todayPointerUp(event)" onpointercancel="todayPointerUp(event)">'
        +'<span class="today-num">'+(idx+1)+'.</span>'
        +rh(t,false,'sa',true)
        +'</div>';
    });
    h+='</div>';
  } else {
    // No Urgent separator — just sort: Today first, then by priority
    var sorted=rows.slice().sort(function(a,b){return taskSortKey(a)-taskSortKey(b);});
    sorted.forEach(function(t){h+=rh(t,false,i++%2===0?'sa':'sb');});
  }
  el.innerHTML=h;
}
var todayDrag={active:false,startY:0,moved:false,pointerId:null,tid:null,el:null,clone:null};
var todayDropTarget=null;
function todayPointerDown(e,tid){
  if(e.target.closest('input,button,textarea,select,a'))return;
  var row=e.target.closest('.today-row');
  if(!row)return;
  e.stopPropagation();
  todayDrag.active=true;todayDrag.startY=e.clientY;todayDrag.moved=false;
  todayDrag.pointerId=e.pointerId||null;todayDrag.tid=tid;todayDrag.el=row;
  if(row.setPointerCapture)row.setPointerCapture(e.pointerId);
}
function todayPointerMove(e){
  if(!todayDrag.active)return;
  var dy=Math.abs(e.clientY-todayDrag.startY);
  if(dy<10)return;
  todayDrag.moved=true;
  if(todayDrag.el)todayDrag.el.classList.add('today-row-dragging');
  var target=document.elementFromPoint(e.clientX,e.clientY);
  var row=target&&target.closest('.today-row[data-tid]');
  if(row&&row.getAttribute('data-tid')!==todayDrag.tid){
    if(todayDropTarget&&todayDropTarget!==row)todayDropTarget.classList.remove('today-row-over');
    todayDropTarget=row;todayDropTarget.classList.add('today-row-over');
  }else if(!row||row.getAttribute('data-tid')===todayDrag.tid){
    if(todayDropTarget){todayDropTarget.classList.remove('today-row-over');todayDropTarget=null;}
  }
}
function todayPointerUp(e){
  if(!todayDrag.active)return;
  if(todayDrag.el)todayDrag.el.classList.remove('today-row-dragging');
  if(todayDrag.moved&&todayDrag.tid&&todayDropTarget){
    var fromId=todayDrag.tid,toId=todayDropTarget.getAttribute('data-tid');
    var fi=todayOrderList.indexOf(fromId),ti=todayOrderList.indexOf(toId);
    if(fi>=0&&ti>=0){var item=todayOrderList.splice(fi,1)[0];todayOrderList.splice(ti,0,item);}
    saveTasks();scheduleSettingsSync();rTasks();
  }
  if(todayDropTarget){todayDropTarget.classList.remove('today-row-over');todayDropTarget=null;}
  todayDrag.active=false;todayDrag.tid=null;todayDrag.el=null;
}

function rBooksChart(){
  var el=document.getElementById('tabs');
  if(!el)return;
  var tw=document.getElementById('tabs-wrap');
  if(tw){tw.style.display='flex';tw.style.flexDirection='column';tw.style.padding='0';}
  var CHART_COLORS=['#4A90D9','#34C759','#FF9500','#FF3B30','#AF52DE','#5AC8FA','#FFCC00','#FF6B35','#8A8680'];
  // Group books by category
  var catMap={};
  books.forEach(function(b){
    var cat=b.category&&b.category.trim()?b.category:'Sans catégorie';
    if(!catMap[cat])catMap[cat]={total:0,read:0};
    catMap[cat].total++;
    if(b.status==='read')catMap[cat].read++;
  });
  var catNames=Object.keys(catMap);
  var totalRead=books.filter(function(b){return b.status==='read';}).length;
  var h='<div class="proj-goals-title">Livres par catégorie</div>';
  if(!books.length){el.innerHTML=h+'<div style="padding:14px 6px;font-size:11.5px;color:#B0ADA8;text-align:center;">Aucun livre</div>';return;}
  // SVG donut — slices based on total books per category (read shown in legend)
  var readSlices=catNames.map(function(c,i){return{name:c,count:catMap[c].read,total:catMap[c].total,color:CHART_COLORS[i%CHART_COLORS.length]};}).filter(function(s){return s.count>0;});
  var sz=120,cx=60,cy=60,ro=50,ri=30;
  var svg='<svg width="'+sz+'" height="'+sz+'" viewBox="0 0 '+sz+' '+sz+'">';
  if(!totalRead||!readSlices.length){
    svg+='<circle cx="'+cx+'" cy="'+cy+'" r="'+((ro+ri)/2)+'" fill="none" stroke="#E5E2DC" stroke-width="'+(ro-ri)+'"/>';
  } else {
    var angle=-Math.PI/2;
    readSlices.forEach(function(s){
      var slice=(s.count/totalRead)*2*Math.PI;
      var ea=angle+slice;
      var x1=cx+ro*Math.cos(angle),y1=cy+ro*Math.sin(angle);
      var x2=cx+ro*Math.cos(ea),y2=cy+ro*Math.sin(ea);
      var xi1=cx+ri*Math.cos(angle),yi1=cy+ri*Math.sin(angle);
      var xi2=cx+ri*Math.cos(ea),yi2=cy+ri*Math.sin(ea);
      var la=slice>Math.PI?1:0;
      svg+='<path d="M '+xi1+' '+yi1+' L '+x1+' '+y1+' A '+ro+' '+ro+' 0 '+la+' 1 '+x2+' '+y2+' L '+xi2+' '+yi2+' A '+ri+' '+ri+' 0 '+la+' 0 '+xi1+' '+yi1+' Z" fill="'+s.color+'"/>';
      angle=ea;
    });
  }
  svg+='<text x="'+cx+'" y="'+(cy-5)+'" text-anchor="middle" font-size="17" font-weight="700" fill="#1C1C1E">'+totalRead+'</text>';
  svg+='<text x="'+cx+'" y="'+(cy+9)+'" text-anchor="middle" font-size="8" fill="#8A8680">lus</text>';
  svg+='</svg>';
  h+='<div style="display:flex;justify-content:center;padding:8px 0 4px;">'+svg+'</div>';
  h+='<div style="padding:0 6px 8px;overflow-y:auto;flex:1;">';
  catNames.forEach(function(c,i){
    var info=catMap[c];
    h+='<div style="display:flex;align-items:center;gap:6px;padding:3px 2px;font-size:11px;color:#3D3B38;">'
      +'<div style="width:8px;height:8px;border-radius:2px;background:'+CHART_COLORS[i%CHART_COLORS.length]+';flex-shrink:0;"></div>'
      +'<span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">'+e(c)+'</span>'
      +'<span style="color:#8A8680;font-weight:600;white-space:nowrap;">'+info.read+' / '+info.total+'</span>'
      +'</div>';
  });
  h+='</div>';
  el.innerHTML=h;
}

function rBooks(){rCulture();}
function rCulture(){
  var el=document.getElementById('list');
  if(!books.length){el.innerHTML='<div class="empty"><div class="empty-icon">&#128214;</div><div class="empty-txt">Aucun livre enregistré.</div></div>';return;}
  var catMap={};
  var noCat='Sans catégorie';
  books.forEach(function(b){
    var cat=b.category&&b.category.trim()?b.category:noCat;
    if(!catMap[cat])catMap[cat]=[];
    catMap[cat].push(b);
  });
  var catNames=Object.keys(catMap).sort(function(a,b){
    if(a===noCat&&b===noCat)return 0;
    if(a===noCat)return 1;
    if(b===noCat)return-1;
    var ai=CULTURE_CAT_ORDER.indexOf(a);
    var bi=CULTURE_CAT_ORDER.indexOf(b);
    if(ai>=0&&bi>=0)return ai-bi;
    if(ai>=0)return-1;
    if(bi>=0)return 1;
    return a.localeCompare(b);
  });
  // TOC
  var toc='<div class="culture-toc" id="culture-toc"><div class="culture-toc-title">Sommaire</div>';
  catNames.forEach(function(cat){
    var cnt=catMap[cat].length;
    toc+='<button class="culture-toc-item" onclick="scrollToCat(this,\''+e(cat)+'\')">'+e(cat)+'<span class="culture-toc-count">'+cnt+'</span></button>';
  });
  toc+='</div>';
  // Content
  var content='<div class="culture-content">';
  catNames.forEach(function(cat){
    var group=catMap[cat];
    group.sort(function(a,b){ var d=(b.sortOrder||0)-(a.sortOrder||0); if(d!==0)return d; if(typeof a.id==='number'&&typeof b.id==='number')return b.id-a.id; return String(b.id).localeCompare(String(a.id)); });
    var catId='bcat-'+cat.replace(/[^a-zA-Z0-9]/g,'-');
    content+='<div class="book-status-group" id="'+catId+'"><div class="book-status-heading"><span>'+e(cat)+'</span></div><div class="book-grid">';
    group.forEach(function(b){
      var sid=e(String(b.id));var scat=e(cat);
      content+='<div class="book-row" data-book-id="'+sid+'" data-book-cat="'+scat+'" onpointerdown="bookPointerDown(event,\''+sid+'\',\''+scat+'\')" onpointermove="bookPointerMove(event)" onpointerup="bookPointerUp(event)" onpointercancel="bookPointerUp(event)">'+rhBook(b)+'</div>';
    });
    content+='</div></div>';
  });
  content+='</div>';
  el.innerHTML='<div class="culture-layout">'+toc+content+'</div>';
}
function scrollToCat(btn,cat){
  var catId='bcat-'+cat.replace(/[^a-zA-Z0-9]/g,'-');
  var el=document.getElementById(catId);
  if(el){el.scrollIntoView({behavior:'smooth',block:'start'});}
  document.querySelectorAll('.culture-toc-item').forEach(function(b){b.classList.remove('active');});
  if(btn)btn.classList.add('active');
}

function openBookReader(bookId){
  var book=books.find(function(b){return String(b.id)===String(bookId);});
  if(!book)return;
  _bookReaderOpen=String(bookId);
  if(!bookNotes[_bookReaderOpen])bookNotes[_bookReaderOpen]=[''];
  brTrimEmptyPages(_bookReaderOpen);
  _bookReaderPage=0;
  rBookReader();
  var ov=document.getElementById('book-reader-overlay');
  if(ov)ov.style.display='flex';
}
function closeBookReader(){
  if(_bookReaderOpen){
    var _idx=_brIndices();
    var _lc=document.getElementById('br-left-content');
    var _rc=document.getElementById('br-right-content');
    if(_lc&&_idx.leftIdx>=0)saveBookPage(_idx.leftIdx,_lc.innerHTML);
    if(_rc&&_idx.rightIdx>=0)saveBookPage(_idx.rightIdx,_rc.innerHTML);
    brTrimEmptyPages(_bookReaderOpen);
    saveTasks();scheduleSettingsSync();
  }
  var ov=document.getElementById('book-reader-overlay');
  if(ov)ov.style.display='none';
  _bookReaderOpen=null;
  if(currentView==='Culture')rCulture();
}
function _brPageContent(pageIdx){
  if(!bookNotes[_bookReaderOpen])return '';
  return bookNotes[_bookReaderOpen][pageIdx]||'';
}
function _brIndices(){
  var isFirst=_bookReaderPage<0;
  var leftIdx=isFirst?-1:_bookReaderPage;
  var rightIdx=isFirst?-2:_bookReaderPage+1;
  return{isFirst:isFirst,leftIdx:leftIdx,rightIdx:rightIdx};
}
function rBookReader(){
  var ov=document.getElementById('book-reader-overlay');
  if(!ov||!_bookReaderOpen)return;
  var book=books.find(function(b){return String(b.id)===String(_bookReaderOpen);});
  if(!book)return;
  if(!bookNotes[_bookReaderOpen])bookNotes[_bookReaderOpen]=[''];
  var pages=bookNotes[_bookReaderOpen];
  var idx=_brIndices();
  var isFirst=idx.isFirst,leftIdx=idx.leftIdx,rightIdx=idx.rightIdx;
  var leftContent=isFirst
    ?('<div class="br-cover-face">'
      +'<div style="font-size:18px;font-weight:700;color:#1C1C1E;font-family:\'Libre Baskerville\',serif;text-align:center;">'+e(book.title)+'</div>'
      +(book.author?'<div style="font-size:12px;color:#8A8680;margin-top:6px;font-family:\'Libre Baskerville\',serif;">'+e(book.author)+'</div>':'')
      +'</div>')
    :('<div class="br-page-content" id="br-left-content" contenteditable="true" data-placeholder="Écrire ici…" onblur="saveBookPage('+leftIdx+',this.innerHTML)" oninput="brHandleInput(this,'+leftIdx+')" onpaste="brHandlePaste(event,'+leftIdx+')">'+(_brPageContent(leftIdx))+'</div>'
      +'<div class="br-pgnum">'+(leftIdx+1)+'</div>');
  var pgLabel=isFirst?'Couverture':'Pages '+(leftIdx+1)+'-'+(rightIdx+1);
  var rightPageHTML=isFirst
    ?'<div class="br-cover-face" style="color:#C0BDB7;font-style:italic;font-family:\'Libre Baskerville\',serif;font-size:13px;">Tournez la page →</div>'
    :'<div class="br-page-content" id="br-right-content" contenteditable="true" data-placeholder="Écrire ici…" onblur="saveBookPage('+rightIdx+',this.innerHTML)" oninput="brHandleInput(this,'+rightIdx+')" onpaste="brHandlePaste(event,'+rightIdx+')">'+(_brPageContent(rightIdx))+'</div>'
      +'<div class="br-pgnum" id="br-right-pgnum">'+(rightIdx+1)+'</div>';
  ov.innerHTML=
    '<div class="br-shell">'
    +'<div class="br-topbar">'
    +'<span class="br-book-name">'+e(book.title)+'</span>'
    +'<div class="br-tools">'
    +'<button class="br-tool-btn" onclick="brToolBold()" title="Gras"><b style="font-family:sans-serif;">B</b></button>'
    +'<label class="br-tool-btn" title="Insérer image" style="cursor:pointer;">Image<input type="file" accept="image/*" style="display:none" onchange="brInsertImage(this)"></label>'
    +'<button class="br-tool-btn" onclick="brClearAllContent()" title="Effacer tout le contenu" style="color:#FF6B6B;border-color:rgba(255,107,107,0.4);">Effacer</button>'
    +'<button class="br-x-btn" onclick="closeBookReader()">&#10005;</button>'
    +'</div>'
    +'</div>'
    +'<div class="br-stage">'
    +'<div class="br-spread" id="br-spread">'
    +'<div class="br-pg br-pg-left" id="br-pg-left">'+leftContent+'</div>'
    +'<div class="br-spine-line"></div>'
    +'<div class="br-pg br-pg-right" id="br-pg-right">'
    +rightPageHTML
    +'</div>'
    +'</div>'
    +'</div>'
    +'<div class="br-bottombar">'
    +'<button class="br-nav-btn2" id="br-prev-btn" onclick="bookPagePrev()" '+(_bookReaderPage===0?'disabled':'')+'>&lsaquo; Précédent</button>'
    +'<span class="br-pg-info" id="br-pg-info">'+pgLabel+' / '+pages.length+' p.</span>'
    +'<button class="br-nav-btn2" onclick="bookPageNext()">Suivant &#9654;</button>'
    +'</div>'
    +'</div>';
}
function updateBrSpread(){
  var book=books.find(function(b){return String(b.id)===String(_bookReaderOpen);});
  if(!book)return;
  if(!bookNotes[_bookReaderOpen])bookNotes[_bookReaderOpen]=[''];
  var pages=bookNotes[_bookReaderOpen];
  var idx=_brIndices();
  var isFirst=idx.isFirst,leftIdx=idx.leftIdx,rightIdx=idx.rightIdx;
  var leftPg=document.getElementById('br-pg-left');
  var rightPg=document.getElementById('br-pg-right');
  var pgInfo=document.getElementById('br-pg-info');
  var prevBtn=document.getElementById('br-prev-btn');
  if(leftPg){
    if(isFirst){
      leftPg.innerHTML='<div class="br-cover-face">'
        +'<div style="font-size:18px;font-weight:700;color:#1C1C1E;font-family:\'Libre Baskerville\',serif;text-align:center;">'+e(book.title)+'</div>'
        +(book.author?'<div style="font-size:12px;color:#8A8680;margin-top:6px;font-family:\'Libre Baskerville\',serif;">'+e(book.author)+'</div>':'')
        +'</div>';
    } else {
      leftPg.innerHTML='<div class="br-page-content" id="br-left-content" contenteditable="true" data-placeholder="Écrire ici…" onblur="saveBookPage('+leftIdx+',this.innerHTML)" oninput="brHandleInput(this,'+leftIdx+')" onpaste="brHandlePaste(event,'+leftIdx+')">'+(_brPageContent(leftIdx))+'</div>'
        +'<div class="br-pgnum">'+(leftIdx+1)+'</div>';
    }
  }
  if(rightPg){
    if(isFirst){
      rightPg.innerHTML='<div class="br-cover-face" style="color:#C0BDB7;font-style:italic;font-family:\'Libre Baskerville\',serif;font-size:13px;">Tournez la page →</div>';
    } else {
      rightPg.innerHTML='<div class="br-page-content" id="br-right-content" contenteditable="true" data-placeholder="Écrire ici…" onblur="saveBookPage('+rightIdx+',this.innerHTML)" oninput="brHandleInput(this,'+rightIdx+')" onpaste="brHandlePaste(event,'+rightIdx+')">'+(_brPageContent(rightIdx))+'</div>'
        +'<div class="br-pgnum" id="br-right-pgnum">'+(rightIdx+1)+'</div>';
    }
  }
  var pgLabel=isFirst?'Couverture':'Pages '+(leftIdx+1)+'-'+(rightIdx+1);
  if(pgInfo)pgInfo.textContent=pgLabel+' / '+pages.length+' p.';
  if(prevBtn)prevBtn.disabled=isFirst;
}
function brExtractOverflow(el){
  if(el.scrollHeight<=el.clientHeight)return '';
  var overflowNodes=[];
  while(el.childNodes.length>0&&el.scrollHeight>el.clientHeight){
    var last=el.lastChild;
    if(last.nodeType===3){
      var t=last.textContent;
      if(!t.trim()){el.removeChild(last);overflowNodes.unshift(document.createTextNode(t));continue;}
      var lo=0,hi=t.length,best=0;
      while(lo<=hi){var mid=(lo+hi)>>1;last.textContent=t.slice(0,mid);if(el.scrollHeight<=el.clientHeight){best=mid;lo=mid+1;}else hi=mid-1;}
      var kept=t.slice(0,best),extra=t.slice(best);
      if(kept&&extra){var sp=kept.lastIndexOf(' ');if(sp>0){extra=kept.slice(sp)+extra;kept=kept.slice(0,sp);}}
      if(kept)last.textContent=kept;else el.removeChild(last);
      if(extra)overflowNodes.unshift(document.createTextNode(extra));
      break;
    }else{el.removeChild(last);overflowNodes.unshift(last);}
  }
  var tmp=document.createElement('div');
  overflowNodes.forEach(function(n){tmp.appendChild(n.cloneNode?n.cloneNode(true):n);});
  return tmp.innerHTML;
}
function brCheckOverflow(el,pageIdx){
  if(!el||el.scrollHeight<=el.clientHeight)return;
  if(bookNotes[_bookReaderOpen]&&bookNotes[_bookReaderOpen].length>150)return;
  var overflow=brExtractOverflow(el);
  if(!overflow)return;
  saveBookPage(pageIdx,el.innerHTML);
  var nextIdx=pageIdx+1;
  if(!bookNotes[_bookReaderOpen])bookNotes[_bookReaderOpen]=[''];
  while(bookNotes[_bookReaderOpen].length<=nextIdx)bookNotes[_bookReaderOpen].push('');
  bookNotes[_bookReaderOpen][nextIdx]=overflow+(bookNotes[_bookReaderOpen][nextIdx]||'');
  saveTasks();
  var idx=_brIndices();
  var nextElId=nextIdx===idx.leftIdx?'br-left-content':nextIdx===idx.rightIdx?'br-right-content':null;
  if(nextElId){
    var nextEl=document.getElementById(nextElId);
    if(nextEl){nextEl.innerHTML=bookNotes[_bookReaderOpen][nextIdx];setTimeout(function(){brCheckOverflow(nextEl,nextIdx);},0);}
    return;
  }
  scheduleSettingsSync();
}
function brHandleInput(el,pageIdx){
  if(el.scrollHeight<=el.clientHeight)return;
  var _el=el,_pg=pageIdx;
  setTimeout(function(){if(document.contains(_el))brCheckOverflow(_el,_pg);},0);
}
function brTrimEmptyPages(bookId){
  var pages=bookNotes[bookId];
  if(!pages)return;
  while(pages.length>1){
    var last=pages[pages.length-1];
    var txt=(last||'').replace(/<br\s*\/?>/gi,'').replace(/<[^>]*>/g,'').trim();
    if(!txt)pages.pop();else break;
  }
}
function brSanitizePasteHtml(raw){
  raw=raw.replace(/<!--\[if[^\]]*\]>[\s\S]*?<!\[endif\]-->/gi,'');
  raw=raw.replace(/<\?xml[^>]*>/gi,'');
  raw=raw.replace(/<\/?[a-zA-Z]+:[^>]*>/g,'');
  var doc=(new DOMParser()).parseFromString(raw,'text/html');
  ['style','script','meta','link','object','embed','iframe'].forEach(function(t){doc.querySelectorAll(t).forEach(function(n){n.remove();});});
  var ALLOWED=['b','strong','i','em','u','span','p','br','div','h1','h2','h3','h4','h5','h6','ul','ol','li'];
  function clean(node){
    if(node.nodeType!==1)return;
    var rm=[];
    for(var a=0;a<node.attributes.length;a++){
      var at=node.attributes[a];
      if(/^on/i.test(at.name)||at.name==='class'||at.name==='lang'||at.name==='id')rm.push(at.name);
      else if(at.name==='style'){
        var ss='',ps=at.value.split(';');
        ps.forEach(function(p){var k=p.split(':')[0].trim().toLowerCase();if(['font-weight','font-style','text-decoration'].indexOf(k)>=0)ss+=p+';';});
        if(ss)node.setAttribute('style',ss);else rm.push('style');
      }
    }
    rm.forEach(function(a){node.removeAttribute(a);});
    Array.from(node.childNodes).forEach(clean);
    if(ALLOWED.indexOf(node.tagName.toLowerCase())<0){while(node.firstChild)node.parentNode.insertBefore(node.firstChild,node);node.remove();}
  }
  Array.from(doc.body.childNodes).forEach(clean);
  return doc.body.innerHTML;
}
function brFlattenPasteHtml(html){
  var d=document.createElement('div');
  d.innerHTML=html;
  var out='';
  var INLINE=['b','strong','i','em','u','span'];
  var BLOCK=['p','div','h1','h2','h3','h4','h5','h6','li','blockquote','ul','ol'];
  function proc(node){
    if(node.nodeType===3){out+=node.textContent.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');return;}
    if(node.nodeType!==1)return;
    var tag=node.tagName.toLowerCase();
    if(tag==='br'){out+='<br>';return;}
    if(INLINE.indexOf(tag)>=0){
      var st=node.getAttribute('style');
      out+='<'+tag+(st?' style="'+st+'"':'')+'>'; Array.from(node.childNodes).forEach(proc); out+='</'+tag+'>';
    } else if(BLOCK.indexOf(tag)>=0){
      Array.from(node.childNodes).forEach(proc); out+='<br>';
    } else {
      Array.from(node.childNodes).forEach(proc);
    }
  }
  Array.from(d.childNodes).forEach(proc);
  return out.replace(/(<br>)+$/,'');
}
function brHandlePaste(e,pageIdx){
  e.preventDefault();
  if(!_bookReaderOpen)return;
  var el=e.target.closest('.br-page-content');
  if(!el)return;
  var pageH=el.clientHeight,pageW=el.clientWidth;
  if(!pageH||!pageW)return;
  var rawHtml=e.clipboardData?e.clipboardData.getData('text/html'):'';
  var plain=e.clipboardData?e.clipboardData.getData('text/plain'):'';
  var flatHtml;
  if(rawHtml){
    flatHtml=brFlattenPasteHtml(brSanitizePasteHtml(rawHtml));
  } else if(plain){
    flatHtml=plain.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\r\n|\r/g,'\n').replace(/\n/g,'<br>');
  }
  if(!flatHtml||!flatHtml.trim())return;
  var tmp=document.createElement('div');
  tmp.style.cssText='position:fixed;left:-9999px;top:0;width:'+pageW+'px;overflow:hidden;font-size:14px;font-family:\'Libre Baskerville\',serif;line-height:1.9;word-break:break-word;box-sizing:border-box;';
  document.body.appendChild(tmp);
  var lines=flatHtml.split('<br>');
  var groups=[],cur=[],MAX=100;
  function fits(arr){tmp.innerHTML=arr.join('<br>');return tmp.scrollHeight<=pageH;}
  function flush(){if(cur.length){groups.push(cur);cur=[];}}
  for(var i=0;i<lines.length&&groups.length<MAX;i++){
    var line=lines[i];
    if(fits(cur.concat([line]))){cur=cur.concat([line]);}
    else{if(cur.length>0){flush();if(fits([line])){cur=[line];}else{groups.push([line]);}}else{groups.push([line]);}}
  }
  flush();
  document.body.removeChild(tmp);
  if(!groups.length)return;
  if(!bookNotes[_bookReaderOpen])bookNotes[_bookReaderOpen]=[''];
  groups.forEach(function(lineArr,i){
    var idx=pageIdx+i;
    while(bookNotes[_bookReaderOpen].length<=idx)bookNotes[_bookReaderOpen].push('');
    var html=lineArr.join('<br>');
    if(i===0){bookNotes[_bookReaderOpen][idx]=html;}
    else{var ex=bookNotes[_bookReaderOpen][idx]||'';bookNotes[_bookReaderOpen][idx]=html+(ex.trim()?'<br>'+ex:'');}
  });
  saveTasks();scheduleSettingsSync();
  updateBrSpread();
  setTimeout(function(){
    var ids=_brIndices();
    var tgtId=pageIdx===ids.leftIdx?'br-left-content':'br-right-content';
    var tgt=document.getElementById(tgtId);
    if(tgt){tgt.focus();var r=document.createRange();r.selectNodeContents(tgt);r.collapse(false);window.getSelection().removeAllRanges();window.getSelection().addRange(r);}
  },50);
}
function brClearAllContent(){
  if(!_bookReaderOpen)return;
  if(!confirm('Effacer tout le contenu de ce livre-simulation ?'))return;
  bookNotes[_bookReaderOpen]=[''];
  _bookReaderPage=0;
  saveTasks();scheduleSettingsSync();
  rBookReader();
}
function saveBookPage(pageIdx,html){
  if(!_bookReaderOpen||pageIdx<0)return;
  if(!bookNotes[_bookReaderOpen])bookNotes[_bookReaderOpen]=[''];
  while(bookNotes[_bookReaderOpen].length<=pageIdx)bookNotes[_bookReaderOpen].push('');
  bookNotes[_bookReaderOpen][pageIdx]=html;
  saveTasks();scheduleSettingsSync();
}
function bookPageNext(){
  if(!_bookReaderOpen)return;
  if(!bookNotes[_bookReaderOpen])bookNotes[_bookReaderOpen]=[''];
  var idx=_brIndices();
  var rightContent=document.getElementById('br-right-content');
  if(rightContent)saveBookPage(idx.rightIdx,rightContent.innerHTML);
  var leftContent=document.getElementById('br-left-content');
  if(leftContent&&idx.leftIdx>=0)saveBookPage(idx.leftIdx,leftContent.innerHTML);
  var spread=document.getElementById('br-spread');
  if(spread){
    var rightPg=document.getElementById('br-pg-right');
    var flipHTML=rightPg&&rightPg.querySelector('.br-page-content')?rightPg.querySelector('.br-page-content').innerHTML:'';
    var flip=document.createElement('div');
    flip.style.cssText='position:absolute;top:0;right:0;width:calc(50% - 1px);height:100%;background:#fff;transform-origin:left center;transform-style:preserve-3d;z-index:20;overflow:hidden;padding:32px 28px 20px;box-sizing:border-box;font-family:\'Libre Baskerville\',serif;font-size:14px;color:#1C1C1E;line-height:1.9;border-left:1px solid #E0E0E0;box-shadow:-4px 0 12px rgba(0,0,0,0.12);';
    flip.innerHTML=flipHTML;
    spread.appendChild(flip);
    if(_bookReaderPage<0){_bookReaderPage=0;}else{_bookReaderPage+=2;}
    while(bookNotes[_bookReaderOpen].length<=_bookReaderPage+1)bookNotes[_bookReaderOpen].push('');
    saveTasks();scheduleSettingsSync();
    updateBrSpread();
    flip.style.animation='brFlipFwd 0.55s cubic-bezier(0.45,0,0.55,1) forwards';
    flip.addEventListener('animationend',function(){if(flip.parentNode)flip.parentNode.removeChild(flip);});
    return;
  }
  if(_bookReaderPage<0){_bookReaderPage=0;}else{_bookReaderPage+=2;}
  while(bookNotes[_bookReaderOpen].length<=_bookReaderPage+1)bookNotes[_bookReaderOpen].push('');
  saveTasks();scheduleSettingsSync();
  rBookReader();
}
function bookPagePrev(){
  if(!_bookReaderOpen||_bookReaderPage<=0)return;
  var idx=_brIndices();
  var leftContent=document.getElementById('br-left-content');
  if(leftContent&&idx.leftIdx>=0)saveBookPage(idx.leftIdx,leftContent.innerHTML);
  var rightContent=document.getElementById('br-right-content');
  if(rightContent&&idx.rightIdx>=0)saveBookPage(idx.rightIdx,rightContent.innerHTML);
  var spread=document.getElementById('br-spread');
  if(spread){
    var leftPg=document.getElementById('br-pg-left');
    var flipHTML=leftPg&&leftPg.querySelector('.br-page-content')?leftPg.querySelector('.br-page-content').innerHTML:'';
    var flip=document.createElement('div');
    flip.style.cssText='position:absolute;top:0;left:0;width:calc(50% - 1px);height:100%;background:#fff;transform-origin:right center;transform-style:preserve-3d;z-index:20;overflow:hidden;padding:32px 28px 20px;box-sizing:border-box;font-family:\'Libre Baskerville\',serif;font-size:14px;color:#1C1C1E;line-height:1.9;border-right:1px solid #E0E0E0;box-shadow:4px 0 12px rgba(0,0,0,0.12);';
    flip.innerHTML=flipHTML;
    spread.appendChild(flip);
    if(_bookReaderPage>0){_bookReaderPage-=2;}
    saveTasks();scheduleSettingsSync();
    updateBrSpread();
    flip.style.animation='brFlipBwd 0.55s cubic-bezier(0.45,0,0.55,1) forwards';
    flip.addEventListener('animationend',function(){if(flip.parentNode)flip.parentNode.removeChild(flip);});
    return;
  }
  if(_bookReaderPage>0){_bookReaderPage-=2;}
  saveTasks();scheduleSettingsSync();
  rBookReader();
}
function brToolBold(){
  document.execCommand('bold');
}
var _brImgTimer=null;
function brInsertImage(input){
  if(!input.files||!input.files[0])return;
  var file=input.files[0];
  (async function(){
    var imgSrc='';
    try{
      if(supabaseClient){
        var authRes=await supabaseClient.auth.getUser();
        var usr=authRes&&authRes.data&&authRes.data.user?authRes.data.user:null;
        if(usr){
          var ts=Date.now();
          var path='pages/'+usr.id+'/'+ts+'-'+file.name.replace(/[^a-zA-Z0-9._-]/g,'_');
          var res=await supabaseClient.storage.from('book-covers').upload(path,file,{upsert:true});
          if(!res.error){
            var pub=supabaseClient.storage.from('book-covers').getPublicUrl(path);
            imgSrc=pub.data&&pub.data.publicUrl?pub.data.publicUrl:'';
          }
        }
      }
    }catch(err){}
    if(!imgSrc){
      imgSrc=await new Promise(function(resolve){
        var fr=new FileReader();
        fr.onload=function(ev){resolve(ev.target.result);};
        fr.readAsDataURL(file);
      });
    }
    var target=document.querySelector('#br-right-content');
    if(!target)target=document.querySelector('.br-page-content');
    if(target){
      target.focus();
      document.execCommand('insertHTML',false,'<img src="'+imgSrc+'" style="max-width:100%;height:auto;border-radius:4px;margin:4px 0;">');
      var idx2=_brIndices();
      saveBookPage(idx2.rightIdx,target.innerHTML);
    }
  })();
  input.value='';
}

function rhBook(b){
  var bid=String(b.id);
  var status=b.status||'to_read';
  var cover=b.coverUrl
    ?'<img class="book-cover" src="'+e(b.coverUrl)+'" alt="" onclick="openBookReader(\''+e(bid)+'\')" title="Ouvrir le livre">'
    :'<div class="book-cover-placeholder" onclick="openBookReader(\''+e(bid)+'\')" title="Ouvrir le livre">&#9632;</div>';
  var statusBadge='<span class="book-status-badge '+status+'">'+e(BOOK_STATUS_LABELS[status]||status)+'</span>';
  var hasNotes=bookNotes[bid]&&bookNotes[bid].some(function(p){return p&&p.replace(/<[^>]*>/g,'').trim();});
  var dragDots='⠿'+(hasNotes?'<span style="color:#E53935;">⠿</span>':'');
  return '<div class="book-drag-handle" title="Déplacer">'+dragDots+'</div>'
    +cover
    +'<div class="book-card">'
    +'<div class="book-title">'+e(b.title)+'</div>'
    +'<div class="book-author">'+e(b.author||'')+'</div>'
    +statusBadge
    +'<div class="book-actions" style="margin-top:6px;">'
    +'<button class="book-action book-action-edit" data-bid="'+b.id+'" onclick="event.stopPropagation();editBook(+this.dataset.bid)">Modifier</button>'
    +'<button class="book-action book-action-del" title="Supprimer" data-bid="'+b.id+'" onclick="event.stopPropagation();deleteBook(+this.dataset.bid)">&#10005;</button>'
    +'</div>'
    +'</div>';
}


function rh(t,hc,s,noOuterDiv){
  var catSpan=hc?'':'<span class="rc">'+e(t.cat)+'</span>';
  var todayCls=t.today?' on':'';
  var urgCls=t.prio==='U'?' on':'';
  var inner='<div class="chk-wrap"><input type="checkbox" class="chk"'+(t.done?' checked':'')+' onclick="tgl(\''+t.id+'\',this.checked)"></div>'
    +'<div class="rt-wrap"><span class="rt" id="s'+t.id+'">'+e(t.text)+'</span>'+catSpan+'</div>'
    +'<button class="edit-btn" onclick="ed(\''+t.id+'\')">&#9999;</button>'
    +'<div class="act">'
    +'<button class="pb A'+todayCls+'" onclick="st(\''+t.id+'\')">A</button>'
    +'<button class="pb U'+urgCls+'" onclick="sp(\''+t.id+'\',\'U\')">U</button>'
    +'</div>';
  if(noOuterDiv) return inner;
  return '<div class="row '+(t.done?'done':'')+' '+s+'" id="r'+t.id+'">'+inner+'</div>';
}


function e(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}

function rGauge(){
  var footer=document.querySelector('.sidebar-footer');
  if(['Projection','Networking','Exams','Home','Finances','BOAZ'].indexOf(currentView)>=0){if(footer)footer.style.display='none';return;}
  if(footer)footer.style.display='';
  var dnEl=document.getElementById('dn'),totEl=document.getElementById('tot');
  var fill=document.getElementById('gauge-fill');
  var label=document.getElementById('gauge-label');
  if(currentView==='Culture'){
    var total=books.length;
    var read=books.filter(function(b){return b.status==='read';}).length;
    var pct=total>0?Math.round(read/total*100):0;
    if(dnEl)dnEl.textContent=read;
    if(totEl)totEl.textContent=total;
    if(fill)fill.style.width=pct+'%';
    if(label)label.textContent='lus';
  } else {
    var all=tasks.filter(function(t){return!t.archived;});
    var done=all.filter(function(t){return t.done;});
    var tot=all.length,dn=done.length;
    var pct=tot>0?Math.round(dn/tot*100):0;
    if(dnEl)dnEl.textContent=dn;
    if(totEl)totEl.textContent=tot;
    if(fill)fill.style.width=pct+'%';
    if(label)label.textContent='faites';
  }
}

function rDl(){var c=[];tasks.forEach(function(t){if(c.indexOf(t.cat)<0)c.push(t.cat);});document.getElementById('cl').innerHTML=c.map(function(x){return'<option value="'+e(x)+'">';}).join('');}

function setTab(x){var ico=getTabIcon(x);var mti=document.getElementById("main-title-icon");var mtt=document.getElementById("main-title-text");if(mti){mti.textContent=ico.icon;mti.style.background=ico.bg;mti.style.color="#fff";}if(mtt)mtt.textContent=x;if(ignoreClick){ignoreClick=false;return;}tab=x;render();pfc();saveTasks();saveSettingsRemote();if(window.innerWidth<=680)mobGoList();}
function mobGoList(){var a=document.querySelector('.app');if(a)a.classList.add('mob-list');}
function mobBack(){var a=document.querySelector('.app');if(a)a.classList.remove('mob-list');}
function setView(v){if(window.innerWidth<=680&&v!=='Checklist')return;currentView=v;render();saveTasks();}
async function tgl(id,v){var t=tasks.find(function(t){return String(t.id)===String(id);});if(t){t.done=v;if(v){t.doneAt=Date.now();scheduleAutoDelete(t);}else{delete t.doneAt;clearAutoDelete(id);}}render();saveTasks(); if(supabaseClient) await updateRemoteTask(id,{done:v,doneAt:v?t.doneAt:null});}
async function sp(id,p){var t=tasks.find(function(t){return String(t.id)===String(id);});if(t){if(t.prio===p){t.prio='M';}else{t.prio=p;t.today=false;}t.done=false;delete t.doneAt;clearAutoDelete(id);}render();saveTasks();if(supabaseClient) await updateRemoteTask(id,{prio:t?t.prio:'M',done:false,doneAt:null,today:t?!!t.today:false});}
async function st(id){var t=tasks.find(function(t){return String(t.id)===String(id);});if(t){t.today=!t.today;if(t.today)t.prio='M';}render();saveTasks();if(supabaseClient) await updateRemoteTask(id,{today:t.today,prio:t.prio});}
async function dt(id){tasks=tasks.filter(function(t){return String(t.id)!==String(id);});render();saveTasks(); if(supabaseClient) await deleteRemoteTask(id);}

function ed(id){
  var t=tasks.find(function(t){return String(t.id)===String(id);});if(!t)return;
  var sp=document.getElementById('s'+id);if(!sp)return;
  var w=sp.parentElement;
  var cats=[];tasks.forEach(function(x){if(cats.indexOf(x.cat)<0)cats.push(x.cat);});
  var dlId='ecdl'+id;
  w.innerHTML='<input class="rt-input" id="ei'+id+'" value="'+e(t.text)+'" style="margin-bottom:4px;" onkeydown="if(event.key===\'Enter\')sv(\''+id+'\');if(event.key===\'Escape\')render();" autofocus>'
    +'<div style="display:flex;gap:5px;align-items:center;">'
    +'<input class="rt-input" id="ec'+id+'" value="'+e(t.cat)+'" list="'+dlId+'" placeholder="Catégorie…" style="font-size:12px;flex:1;" onkeydown="if(event.key===\'Enter\')sv(\''+id+'\');if(event.key===\'Escape\')render();">'
    +'<datalist id="'+dlId+'">'+cats.map(function(c){return'<option value="'+e(c)+'">';}).join('')+'</datalist>'
    +'<button class="save-btn" onclick="sv(\''+id+'\')">OK</button>'
    +'</div>';
  document.getElementById('ei'+id).focus();
}
async function sv(id){
  var ti=document.getElementById('ei'+id);var ci=document.getElementById('ec'+id);
  if(!ti)return;var v=ti.value.trim();if(!v)return;
  var newCat=ci?ci.value.trim():'';
  var t=tasks.find(function(t){return String(t.id)===String(id);});
  if(!t)return;
  var changes={text:v};
  t.text=v;
  if(newCat&&newCat!==t.cat){
    changes.cat=newCat;t.cat=newCat;
    if(TABS.indexOf(newCat)<0&&newCat!=='Completed'){TABS.push(newCat);CO=TABS.filter(function(x){return!['All','Urgent','Completed',TODAY_TAB].includes(x);});}
  }
  render();saveTasks();
  if(supabaseClient) await updateRemoteTask(id,changes);
}

function openModal(){if(currentView==='Projection'){openProjPeriodModal(null,null);return;}if(currentView==='Culture'||currentView==='Books'){openBookModal();return;}if(currentView==='Networking'){openContactModal(null);return;}if(currentView==='Chess'){openChessModal();return;}if(currentView==='Exams'||currentView==='Home'||currentView==='Finances'||currentView==='BOAZ')return;document.getElementById('bd').classList.add('open');document.querySelectorAll('.apb').forEach(function(b){b.classList.remove('sel');});np='M';na=false;if(isTodayTab(tab)){na=true;var ab=document.querySelector('#bd .apb.A');if(ab)ab.classList.add('sel');}setTimeout(function(){document.getElementById('new-task').focus();},80);}
function closeModal(){document.getElementById('bd').classList.remove('open');}
function bdClick(ev){if(ev.target===document.getElementById('bd'))closeModal();}

function openBookModal(){
  document.getElementById('book-bd').classList.add('open');
  document.getElementById('book-bd').removeAttribute('data-editing');
  document.getElementById('book-modal-action').textContent='+ Ajouter le livre';
  var catEl=document.getElementById('new-book-cat');
  if(catEl)catEl.value='';
  var dl=document.getElementById('book-cat-list');
  if(dl){var cats=[];books.forEach(function(b){if(b.category&&cats.indexOf(b.category)<0)cats.push(b.category);});dl.innerHTML=cats.map(function(c){return'<option value="'+e(c)+'">';}).join('');}
  setTimeout(function(){document.getElementById('new-title').focus();},80);
}
function closeBookModal(){document.getElementById('book-bd').classList.remove('open');document.getElementById('book-bd').removeAttribute('data-editing');document.getElementById('book-modal-action').textContent='+ Ajouter le livre';}
function bookBdClick(ev){if(ev.target===document.getElementById('book-bd'))closeBookModal();}

function selP(btn){if(btn.classList.contains('sel')){btn.classList.remove('sel');np='M';}else{document.querySelectorAll('.apb').forEach(function(b){b.classList.remove('sel');});btn.classList.add('sel');np=btn.getAttribute('data-p');na=false;}}
function selA(btn){if(btn.classList.contains('sel')){btn.classList.remove('sel');na=false;}else{document.querySelectorAll('.apb').forEach(function(b){b.classList.remove('sel');});btn.classList.add('sel');na=true;np='M';}}

async function addTask(){
  var ce=document.getElementById('new-cat'),te=document.getElementById('new-task');
  var cat=ce.value.trim(),txt=te.value.trim();
  if(!cat){ce.style.borderColor='#C0392B';setTimeout(function(){ce.style.borderColor='';},1200);}
  if(!txt){te.style.borderColor='#C0392B';setTimeout(function(){te.style.borderColor='';},1200);}
  if(!cat||!txt)return;
  var task={id:newId(),cat:cat,text:txt,prio:np,done:false,today:na,doneAt:undefined,_pendingAt:Date.now()};
  tasks.push(task);
  te.value='';na=false;pfc();closeModal();render();saveTasks(); if(supabaseClient) await insertRemoteTask(task);
}

async function addBook(){
  var titleEl=document.getElementById('new-title');
  var authorEl=document.getElementById('new-author');
  var coverEl=document.getElementById('new-cover');
  var statusEl=document.getElementById('new-status');
  var catEl=document.getElementById('new-book-cat');
  var title=titleEl.value.trim();
  var author=authorEl.value.trim();
  var status=statusEl.value;
  var category=catEl?catEl.value.trim():'';
  if(!title){titleEl.style.borderColor='#C0392B';setTimeout(function(){titleEl.style.borderColor='';},1200);}
  if(!author){authorEl.style.borderColor='#C0392B';setTimeout(function(){authorEl.style.borderColor='';},1200);}
  if(!title||!author)return;
  var editing = document.getElementById('book-bd').getAttribute('data-editing');
  var book = editing ? books.find(function(b){return String(b.id)===String(editing);}) : null;
  if(book){
    book.title=title; book.author=author; book.status=status; book.category=category;
    var file = coverEl.files && coverEl.files[0];
    if(file){
      var dataUrl = await fileToDataUrl(file);
      if(dataUrl) book.coverUrl = dataUrl;
      if(supabaseClient){
        var uploadedUrl = await uploadBookCover(book.id, file);
        if(uploadedUrl) book.coverUrl = uploadedUrl;
      }
    }
    document.getElementById('book-bd').removeAttribute('data-editing');
    closeBookModal();saveTasks();render();
    if(supabaseClient) await updateRemoteBook(book.id,{title:book.title,author:book.author,status:book.status,cover_url:book.coverUrl,category:book.category||''});
    return;
  }
  var newBook={id:newId(),title:title,author:author,status:status,coverUrl:'',sortOrder:bookNextSortOrder(status),category:category};
  var file = coverEl.files && coverEl.files[0];
  if(file){
    var dataUrl = await fileToDataUrl(file);
    if(dataUrl) newBook.coverUrl = dataUrl;
    if(supabaseClient){
      var uploadedUrl = await uploadBookCover(newBook.id, file);
      if(uploadedUrl) newBook.coverUrl = uploadedUrl;
    }
  }
  books.push(newBook);
  saveTasks();
  titleEl.value='';authorEl.value='';coverEl.value='';statusEl.value='to_read';if(catEl)catEl.value='';
  closeBookModal();render();
  if(supabaseClient) await insertRemoteBook(newBook);
}

function fileToDataUrl(file){
  return new Promise(function(resolve){
    var reader = new FileReader();
    reader.onload = function(ev){ resolve(ev.target.result); };
    reader.onerror = function(){ resolve(''); };
    reader.readAsDataURL(file);
  });
}

async function uploadBookCover(bookId,file){
  if(!supabaseClient||!file) return '';
  const { data: { user } } = await supabaseClient.auth.getUser();
  if (!user) return '';
  var path = 'covers/'+user.id+'/'+bookId+'-'+file.name.replace(/[^a-zA-Z0-9_.-]/g,'_');
  console.log('[BookCover] Uploading to bucket:', SUPABASE_BUCKET, 'path:', path);
  var res = await supabaseClient.storage.from(SUPABASE_BUCKET).upload(path, file, {upsert:true});
  if(res.error){
    console.error('[BookCover] Upload failed:', res.error.message, res.error);
    return '';
  }
  console.log('[BookCover] Upload success');
  var pub = await supabaseClient.storage.from(SUPABASE_BUCKET).getPublicUrl(path);
  if(pub.data && pub.data.publicUrl){ console.log('[BookCover] Public URL:', pub.data.publicUrl); return pub.data.publicUrl; }
  var signed = await supabaseClient.storage.from(SUPABASE_BUCKET).createSignedUrl(path, 3600);
  if(!signed.error && signed.data && signed.data.signedUrl) return signed.data.signedUrl;
  return SUPABASE_URL + '/storage/v1/object/public/' + SUPABASE_BUCKET + '/' + path.split('/').map(encodeURIComponent).join('/');
}

async function insertRemoteBook(book){
  if(!supabaseClient) return;
  setSyncState('syncing');
  const { data: { user } } = await supabaseClient.auth.getUser();
  if (!user) return;
  // Never send base64 data URLs to Supabase — they exceed API limits
  var remoteUrl = book.coverUrl && !book.coverUrl.startsWith('data:') ? book.coverUrl : '';
  var payload={title:book.title,author:book.author,status:book.status,cover_url:remoteUrl,sort_order:book.sortOrder||0,category:book.category||'',user_id:user.id};
  var res = await supabaseClient.from(SUPABASE_TABLE_BOOKS).insert([payload]).select();
  if(res.error){
    // Try without cover_url/sort_order but keep category
    var payload2={title:book.title,author:book.author,status:book.status,category:book.category||'',user_id:user.id};
    res = await supabaseClient.from(SUPABASE_TABLE_BOOKS).insert([payload2]).select();
    if(res.error){
      // Last resort: minimal payload
      var payload3={title:book.title,author:book.author,status:book.status,user_id:user.id};
      res = await supabaseClient.from(SUPABASE_TABLE_BOOKS).insert([payload3]).select();
    }
  }
  if(res.error){ console.warn('Supabase book insert failed',res.error); setSyncState('error'); }
  else { setSyncState(); await loadBooksRemote(); }
}

async function updateRemoteBook(id,changes){
  if(!supabaseClient) return;
  setSyncState('syncing');
  var remoteChanges = Object.assign({},changes);
  if(remoteChanges.cover_url && remoteChanges.cover_url.startsWith('data:')) remoteChanges.cover_url = '';
  var res = await supabaseClient.from(SUPABASE_TABLE_BOOKS).update(remoteChanges).eq('id',id);
  if(res.error){
    // Retry with core fields only, keeping category if present
    var fallback={title:remoteChanges.title,author:remoteChanges.author,status:remoteChanges.status};
    if(remoteChanges.category!==undefined) fallback.category=remoteChanges.category;
    var res2=await supabaseClient.from(SUPABASE_TABLE_BOOKS).update(fallback).eq('id',id);
    if(res2.error){ console.warn('Supabase book update failed',res2.error); setSyncState('error'); return; }
  }
  setSyncState(); await loadBooksRemote();
}

async function deleteBook(id){
  if(!confirm('Supprimer ce livre ?')) return;
  books = books.filter(function(b){return String(b.id)!==String(id);});
  saveTasks();
  render();
  await deleteRemoteBook(id);
}
async function deleteRemoteBook(id){
  if(!supabaseClient) return;
  setSyncState('syncing');
  var res = await supabaseClient.from(SUPABASE_TABLE_BOOKS).delete().eq('id',id);
  if(res.error){ console.warn('Supabase book delete failed',res.error); setSyncState('error'); }
  else { setSyncState(); }
}

var bookDrag={active:false,startX:0,startY:0,moved:false,pointerId:null,bookId:null,status:null,el:null};
var bookDropTarget=null;

function bookNextSortOrder(status,excludeId){
  var group=books.filter(function(b){return b.status===status&&(!excludeId||String(b.id)!==String(excludeId));});
  if(!group.length) return 1;
  return Math.max.apply(null,group.map(function(b){return b.sortOrder||0;}))+1;
}

function bookPointerDown(e,bookId,status){
  if(!e.target.classList.contains('book-drag-handle')&&!e.target.closest('.book-drag-handle')) return;
  e.preventDefault();
  bookDrag.active=true; bookDrag.startX=e.clientX; bookDrag.startY=e.clientY;
  bookDrag.moved=false; bookDrag.pointerId=e.pointerId||null;
  bookDrag.bookId=bookId; bookDrag.status=status;
  bookDrag.el=e.target.closest('.book-row');
  if(bookDrag.el&&bookDrag.el.setPointerCapture) bookDrag.el.setPointerCapture(e.pointerId);
}
function bookPointerMove(e){
  if(!bookDrag.active) return;
  var dx=Math.abs(e.clientX-bookDrag.startX),dy=Math.abs(e.clientY-bookDrag.startY);
  if(dx<8&&dy<8) return;
  if(!bookDrag.moved){ bookDrag.moved=true; if(bookDrag.el) bookDrag.el.classList.add('book-dragging'); }
  var target=document.elementFromPoint(e.clientX,e.clientY);
  var row=target&&target.closest('.book-row[data-book-id]');
  if(row&&row.getAttribute('data-book-cat')===bookDrag.status&&row.getAttribute('data-book-id')!==bookDrag.bookId){
    if(bookDropTarget&&bookDropTarget!==row) bookDropTarget.classList.remove('book-drag-over');
    bookDropTarget=row; bookDropTarget.classList.add('book-drag-over');
  } else if(!row||row.getAttribute('data-book-id')===bookDrag.bookId){
    if(bookDropTarget){ bookDropTarget.classList.remove('book-drag-over'); bookDropTarget=null; }
  }
}
function bookPointerUp(e){
  if(!bookDrag.active) return;
  if(bookDrag.el) bookDrag.el.classList.remove('book-dragging');
  if(bookDrag.moved&&bookDrag.bookId&&bookDropTarget){
    reorderBooks(bookDrag.bookId,bookDropTarget.getAttribute('data-book-id'),bookDrag.status);
  }
  if(bookDropTarget){ bookDropTarget.classList.remove('book-drag-over'); bookDropTarget=null; }
  bookDrag.active=false; bookDrag.bookId=null; bookDrag.status=null; bookDrag.el=null;
}
async function reorderBooks(fromId,toId,cat){
  var noCat='Sans catégorie';
  var group=books.filter(function(b){var bc=b.category&&b.category.trim()?b.category:noCat;return bc===cat;});
  group.sort(function(a,b){ var d=(b.sortOrder||0)-(a.sortOrder||0); if(d!==0)return d; if(typeof a.id==='number'&&typeof b.id==='number')return b.id-a.id; return String(b.id).localeCompare(String(a.id)); });
  var fromIdx=group.findIndex(function(b){return String(b.id)===String(fromId);});
  var toIdx=group.findIndex(function(b){return String(b.id)===String(toId);});
  if(fromIdx===-1||toIdx===-1||fromIdx===toIdx) return;
  var item=group.splice(fromIdx,1)[0]; group.splice(toIdx,0,item);
  var n=group.length;
  var updates=[];
  group.forEach(function(b,i){ b.sortOrder=n-i; updates.push({id:b.id,sort_order:b.sortOrder}); });
  saveTasks(); render();
  if(supabaseClient){
    setSyncState('syncing');
    try{
      for(var i=0;i<updates.length;i++){
        await supabaseClient.from(SUPABASE_TABLE_BOOKS).update({sort_order:updates[i].sort_order}).eq('id',updates[i].id);
      }
      setSyncState();
    }catch(err){ console.warn('Supabase book reorder failed',err); setSyncState('error'); }
  }
}

function setBookStatus(id,status){
  var book = books.find(function(b){return String(b.id)===String(id);});
  if(!book) return;
  book.status=status;
  book.sortOrder=bookNextSortOrder(status,id);
  saveTasks();
  render();
  if(supabaseClient) updateRemoteBook(id,{status:status,sort_order:book.sortOrder});
}

function editBook(id){
  var book = books.find(function(b){return String(b.id)===String(id);});
  if(!book) return;
  openBookModal();
  document.getElementById('new-title').value = book.title;
  document.getElementById('new-author').value = book.author;
  document.getElementById('new-status').value = book.status;
  document.getElementById('new-cover').value = '';
  var ce=document.getElementById('new-book-cat');if(ce)ce.value=book.category||'';
  document.getElementById('book-modal-action').textContent='Enregistrer les modifications';
  document.getElementById('book-bd').setAttribute('data-editing', id);
}

function pfc(){var sp=['All','Urgent','Completed'];document.getElementById('new-cat').value=(sp.indexOf(tab)<0&&!isTodayTab(tab))?tab:'';}

document.addEventListener('keydown',function(e){if(e.ctrlKey&&e.key==='r'){e.preventDefault();var ae=document.activeElement;if(ae&&(ae.tagName==='INPUT'||ae.tagName==='TEXTAREA'))ae.blur();saveTasks();if(supabaseClient){saveSettingsRemote().then(function(){location.reload();}).catch(function(){location.reload();});}else{location.reload();}}if(e.key==='Escape'){closeModal();closeBookModal();closeProjPeriodModal();closeProjRowModal();closeContactModal();closeNavDrawer();closeCommentEditor();}});
window.addEventListener('resize',function(){if(currentView==='Projection')rProjection();if(currentView==='Networking')rNetworking();});

// ── Pull-to-refresh (iPhone) ──
(function(){
  var ptr=document.getElementById('ptr-indicator');
  var startY=0,pulling=false,threshold=60;
  function ptStart(e){startY=e.touches[0].clientY;pulling=true;}
  function ptMove(e){
    if(!pulling)return;
    var dy=e.touches[0].clientY-startY;
    if(dy>8&&ptr){ptr.classList.add('visible');ptr.style.transform='translateX(-50%) translateY('+(Math.min(dy,threshold)+8)+'px)';}
  }
  function ptEnd(e){
    if(!pulling)return;pulling=false;
    var dy=e.changedTouches[0].clientY-startY;
    if(ptr){ptr.classList.remove('visible');ptr.style.transform='';}
    if(dy>threshold){location.reload();}
  }
  // Works from sidebar header
  var header=document.querySelector('.sidebar-header');
  if(header){
    header.addEventListener('touchstart',ptStart,{passive:true});
    header.addEventListener('touchmove',ptMove,{passive:true});
    header.addEventListener('touchend',ptEnd,{passive:true});
  }
  // Also works from body-card when scrolled to top
  var bc=document.querySelector('.body-card');
  if(bc){
    bc.addEventListener('touchstart',function(e){if(bc.scrollTop===0)ptStart(e);},{passive:true});
    bc.addEventListener('touchmove',function(e){if(bc.scrollTop<=0)ptMove(e);},{passive:true});
    bc.addEventListener('touchend',ptEnd,{passive:true});
  }
})();
// ── Mobile init & swipe-right to go back ──
(function(){
  if(window.innerWidth>680)return;
  // Swipe right on list page → back to nav
  var sx=0,sy=0;
  document.addEventListener('touchstart',function(e){sx=e.touches[0].clientX;sy=e.touches[0].clientY;},{passive:true});
  document.addEventListener('touchend',function(e){
    var dx=e.changedTouches[0].clientX-sx;
    var dy=Math.abs(e.changedTouches[0].clientY-sy);
    if(dx>60&&dy<60&&document.querySelector('.app.mob-list')&&!document.getElementById('contact-bd').classList.contains('open'))mobBack();
  },{passive:true});
})();
document.getElementById('new-task').addEventListener('keydown',function(e){if(e.key==='Enter')addTask();});
document.getElementById('new-title').addEventListener('keydown',function(e){if(e.key==='Enter')addBook();});
document.getElementById('new-author').addEventListener('keydown',function(e){if(e.key==='Enter')addBook();});
document.getElementById('new-status').addEventListener('keydown',function(e){if(e.key==='Enter')addBook();});
document.getElementById('new-book-cat').addEventListener('keydown',function(e){if(e.key==='Enter')addBook();});
document.getElementById('login-email').addEventListener('keydown',function(e){if(e.key==='Enter')document.getElementById('login-password').focus();});
document.getElementById('login-password').addEventListener('keydown',function(e){if(e.key==='Enter')login();});

// Check session on load
(async function() {
  const hasSession = await checkSession();
  if (hasSession) {
    initApp();
  } else {
    showLogin();
  }
})();

// ── Networking ──
function newContactId(){return Date.now()+Math.floor(Math.random()*1000);}
function buildCompanyLogos(){companyLogos={};contacts.forEach(function(c){if(c.company&&c.company_logo)companyLogos[c.company]=c.company_logo;});}
function propagateCompanyLogo(company,logoUrl,excludeId){
  if(!company||!logoUrl)return;
  companyLogos[company]=logoUrl;
  contacts.forEach(function(co){
    if(co.company===company&&String(co.id)!==String(excludeId)&&co.company_logo!==logoUrl){
      co.company_logo=logoUrl;
      if(supabaseClient)updateRemoteContact(co.id,{company_logo:logoUrl});
    }
  });
  scheduleSettingsSync();
}

function rNetworkingSidebar(){
  var el=document.getElementById('tabs');
  if(!el)return;
  var total=contacts.length;
  var fort=contacts.filter(function(c){return c.prox==='Fort';}).length;
  var moyen=contacts.filter(function(c){return c.prox==='Moyen';}).length;
  var faible=contacts.filter(function(c){return c.prox==='Faible';}).length;
  var companies=[];contacts.forEach(function(c){if(c.company&&companies.indexOf(c.company)<0)companies.push(c.company);});
  var h='<div class="net-sidebar-title">Vue d\'ensemble</div>';
  h+='<div class="net-stat-row"><div class="net-stat-dot" style="background:#4A90D9"></div><span style="flex:1">Total contacts</span><span style="font-weight:600;color:#1C1C1E;">'+total+'</span></div>';
  h+='<div class="net-stat-row"><div class="net-stat-dot" style="background:#8A8680"></div><span style="flex:1">Entreprises</span><span style="font-weight:600;color:#1C1C1E;">'+companies.length+'</span></div>';
  h+='<div class="net-sidebar-title" style="margin-top:6px">Par proximité</div>';
  h+='<div class="net-stat-row"><div class="net-stat-dot" style="background:#2E7D32"></div><span style="flex:1">Fort</span><span style="font-weight:600;color:#1C1C1E;">'+fort+'</span></div>';
  h+='<div class="net-stat-row"><div class="net-stat-dot" style="background:#E65100"></div><span style="flex:1">Moyen</span><span style="font-weight:600;color:#1C1C1E;">'+moyen+'</span></div>';
  h+='<div class="net-stat-row"><div class="net-stat-dot" style="background:#B0ADA8"></div><span style="flex:1">Faible</span><span style="font-weight:600;color:#1C1C1E;">'+faible+'</span></div>';
  el.innerHTML=h;
}

function companyLogoUrl(name){
  if(!name||name==='(Sans entreprise)')return '';
  var d=name.toLowerCase()
    .replace(/[àâä]/g,'a').replace(/[éèêë]/g,'e').replace(/[îï]/g,'i').replace(/[ôö]/g,'o').replace(/[ùûü]/g,'u').replace(/ç/g,'c')
    .replace(/\b(sa|sas|sarl|sca|group|groupe|banque|bank|holding|partners|advisor|advisory|capital|management|asset|invest|finance|financial)\b/g,'')
    .replace(/[^a-z0-9\s]/g,'').trim().replace(/\s+/g,'');
  return d?'https://logo.clearbit.com/'+d+'.com':'';
}

function rNetworking(){
  var el=document.getElementById('list');
  if(!el)return;

  // Rebuild toolbar only if needed (first render or view switch)
  if(!document.getElementById('net-toolbar-el')){
    el.innerHTML='<div class="net-toolbar" id="net-toolbar-el">'
      +'<input class="net-search" id="net-search-input" type="text" placeholder="Rechercher…" value="'+e(netSearch)+'" autocomplete="off">'
      +'<span id="net-count-label" style="font-size:12px;color:#8A8680;white-space:nowrap;flex-shrink:0;padding:0 8px;">'+contacts.length+' contact'+(contacts.length!==1?'s':'')+'</span>'
      +'<button class="add-btn" style="margin:0;padding:7px 14px;font-size:13px" onclick="openContactModal(null)">+ Ajouter</button>'
      +'</div>';
    var si=document.getElementById('net-search-input');
    if(si){si.addEventListener('input',function(){netSearch=this.value;rNetworkingContacts();});}
  } else {
    var si2=document.getElementById('net-search-input');
    if(si2&&si2!==document.activeElement)si2.value=netSearch;
    var cl=document.getElementById('net-count-label');
    if(cl)cl.textContent=contacts.length+' contact'+(contacts.length!==1?'s':'');
  }

  var needsInit=contacts.some(function(c){return c.sortOrder===undefined;});
  if(needsInit){contacts.forEach(function(c,i){if(c.sortOrder===undefined)c.sortOrder=i;});saveTasks();}

  // Get or create full-width overlay
  var overlay=document.getElementById('net-full-overlay');
  if(!overlay){
    overlay=document.createElement('div');
    overlay.id='net-full-overlay';
    document.body.appendChild(overlay);
  }

  // Position overlay just below toolbar
  var toolbar=document.getElementById('net-toolbar-el');
  var overlayTop=toolbar?Math.round(toolbar.getBoundingClientRect().bottom):66;
  overlay.style.top=overlayTop+'px';
  overlay.style.display='block';
  rNetworkingContacts();
}

function rNetworkingContacts(){
  var overlay=document.getElementById('net-full-overlay');
  if(!overlay)return;
  var q=netSearch.toLowerCase().trim();
  var filtered=contacts.filter(function(c){
    if(!q)return true;
    return (c.fname+' '+c.lname+' '+c.company+' '+c.pos+' '+c.notes).toLowerCase().indexOf(q)>=0;
  });
  filtered.sort(function(a,b){return (a.sortOrder||0)-(b.sortOrder||0);});

  if(!filtered.length){
    overlay.innerHTML='<div class="empty"><div class="empty-icon">&#128100;</div><div class="empty-txt">'+(contacts.length?'Aucun contact trouvé.':'Aucun contact enregistré.')+'</div></div>';
    return;
  }

  var gh='<div class="net-contacts-flat-grid">';
  filtered.forEach(function(c){
    var initials=((c.fname||'').charAt(0)+(c.lname||'').charAt(0)).toUpperCase();
    var photo=c.photo?'<img src="'+e(c.photo)+'" alt="">':'<span>'+e(initials)+'</span>';
    var proxCls=(c.prox||'faible').toLowerCase();
    var proxLabel=c.prox||'Faible';
    var liBtn=c.linkedin?'<a class="net-li-btn" href="'+e(c.linkedin)+'" target="_blank" rel="noopener" title="LinkedIn" onclick="event.stopPropagation()">in</a>':'';
    var waRaw=(c.phone||'').replace(/[^0-9]/g,'');
    var waBtn=waRaw?'<a class="net-wa-btn" href="https://wa.me/'+waRaw+'" target="_blank" rel="noopener" title="WhatsApp" onclick="event.stopPropagation()"><svg width="15" height="15" viewBox="0 0 32 32" fill="white"><path d="M16 3C8.83 3 3 8.83 3 16c0 2.32.63 4.49 1.72 6.37L3 29l6.83-1.7A12.98 12.98 0 0016 29c7.17 0 13-5.83 13-13S23.17 3 16 3zm5.73 17.1c-.27.76-1.59 1.45-2.18 1.54-.56.08-1.27.12-2.04-.13a18.5 18.5 0 01-1.85-.68C12.41 19.44 10.28 16.24 10.11 16c-.16-.22-1.3-1.72-1.3-3.28s.8-2.33 1.08-2.65c.29-.31.62-.39.83-.39h.6c.19 0 .44-.07.68.52l.97 2.35c.09.2.04.44-.06.62l-.38.55-.53.6c-.17.18-.37.38-.15.74.21.37.94 1.54 2.01 2.5 1.38 1.22 2.55 1.6 2.9 1.77.36.18.57.15.79-.09l.84-.98c.24-.3.47-.22.79-.08l2.36 1.1c.35.16.58.24.67.38.08.14.08.82-.22 1.63z"/></svg></a>':'';
    var emailBtn=c.mail_url?'<a class="net-email-btn" href="'+e(c.mail_url)+'" target="_blank" rel="noopener" title="Email" onclick="event.stopPropagation()"><svg width="15" height="11" viewBox="0 0 20 15" fill="none"><rect x="0.75" y="0.75" width="18.5" height="13.5" rx="2.25" stroke="white" stroke-width="1.5"/><path d="M1 2.5L10 9.5L19 2.5" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></a>':'';
    var cid=e(String(c.id));
    var coLogo=companyLogos[c.company||'']||c.company_logo||companyLogoUrl(c.company||'');
    var coInitial=e((c.company||'?').charAt(0).toUpperCase());
    var coLogoContent=coLogo
      ?'<img src="'+e(coLogo)+'" alt="" loading="lazy" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'\'">'
       +'<span style="display:none">'+coInitial+'</span>'
      :'<span>'+coInitial+'</span>';
    var coLogoBlock=c.company?'<div class="net-co-logo-blk">'+coLogoContent+'</div>':'';
    gh+='<div class="net-contact-row" data-contact-id="'+cid+'" onclick="if(!event.target.closest(\'.net-drag-handle\'))openContactModal(\''+cid+'\')" onpointerdown="contactPointerDown(event,\''+cid+'\')" onpointermove="contactPointerMove(event)" onpointerup="contactPointerUp(event)" onpointercancel="contactPointerUp(event)">'
      +'<div class="net-drag-handle">⠿</div>'
      +coLogoBlock
      +'<div class="net-photo">'+photo+'</div>'
      +'<div class="net-contact-info">'
      +'<div class="net-card-top">'
      +'<div class="net-name">'+e((c.fname+' '+c.lname).trim())+'</div>'
      +'<span class="net-prox '+proxCls+'">'+e(proxLabel)+'</span>'
      +'</div>'
      +(c.pos?'<div class="net-pos">'+e(c.pos)+'</div>':'')
      +(c.company?'<div class="net-co-tag">'+e(c.company)+'</div>':'')
      +'<div class="net-card-footer">'
      +(c.date?'<span class="net-date">'+e(c.date)+'</span>':'<span></span>')
      +'<div style="display:flex;align-items:center;gap:3px;">'
      +emailBtn+waBtn+liBtn
      +'<div class="net-contact-actions">'
      +'<button class="net-act-btn del" title="Supprimer" onclick="event.stopPropagation();deleteContactDirect(\''+cid+'\')">&#10005;</button>'
      +'</div>'
      +'</div>'
      +'</div>'
      +(c.notes?'<div class="net-contact-notes-preview">'+e(c.notes)+'</div>':'')
      +'</div>'
      +'</div>';
  });
  gh+='</div>';
  overlay.innerHTML=gh;
}

function openContactModal(id){
  _editContactId=id?String(id):null;
  var modal=document.getElementById('contact-bd');
  var titleEl=document.getElementById('contact-modal-title');
  var rowEdit=document.getElementById('ct-row-edit');
  var rowNew=document.getElementById('ct-row-new');
  if(_editContactId){
    var c=contacts.find(function(x){return String(x.id)===_editContactId;});
    if(!c)return;
    document.getElementById('ct-fname').value=c.fname||'';
    document.getElementById('ct-lname').value=c.lname||'';
    document.getElementById('ct-company').value=c.company||'';
    document.getElementById('ct-pos').value=c.pos||'';
    document.getElementById('ct-date').value=c.date||'';
    document.getElementById('ct-prox').value=c.prox||'Faible';
    document.getElementById('ct-email').value=c.mail_url||'';
    document.getElementById('ct-phone').value=c.phone||'';
    document.getElementById('ct-linkedin').value=c.linkedin||'';
    document.getElementById('ct-photo').value=c.photo||'';
    document.getElementById('ct-company-logo').value=c.company_logo||(c.company?companyLogos[c.company]||'':'');
    document.getElementById('ct-notes').value=c.notes||'';
    if(titleEl)titleEl.childNodes[0].textContent='Modifier le contact ';
    if(rowEdit)rowEdit.style.display='flex';
    if(rowNew)rowNew.style.display='none';
  } else {
    document.getElementById('ct-fname').value='';
    document.getElementById('ct-lname').value='';
    document.getElementById('ct-company').value='';
    document.getElementById('ct-pos').value='';
    document.getElementById('ct-date').value='';
    document.getElementById('ct-prox').value='Faible';
    document.getElementById('ct-email').value='';
    document.getElementById('ct-phone').value='';
    document.getElementById('ct-linkedin').value='';
    document.getElementById('ct-photo').value='';
    document.getElementById('ct-company-logo').value='';
    document.getElementById('ct-notes').value='';
    if(titleEl)titleEl.childNodes[0].textContent='Nouveau contact ';
    if(rowEdit)rowEdit.style.display='none';
    if(rowNew)rowNew.style.display='';
  }
  // Populate company datalist
  var dl=document.getElementById('ct-company-list');
  if(dl){var cos=[];contacts.forEach(function(c){if(c.company&&cos.indexOf(c.company)<0)cos.push(c.company);});dl.innerHTML=cos.map(function(c){return'<option value="'+e(c)+'">';}).join('');}
  var _coEl=document.getElementById('ct-company');var _coLogoEl=document.getElementById('ct-company-logo');
  _coEl.oninput=function(){var co=this.value.trim();if(co&&companyLogos[co]&&!_coLogoEl.value)_coLogoEl.value=companyLogos[co];};
  modal.classList.add('open');
  setTimeout(function(){document.getElementById('ct-fname').focus();},80);
}

function closeContactModal(){
  var modal=document.getElementById('contact-bd');
  if(modal)modal.classList.remove('open');
  _editContactId=null;
}

async function saveContact(){
  var fname=document.getElementById('ct-fname').value.trim();
  var lname=document.getElementById('ct-lname').value.trim();
  var company=document.getElementById('ct-company').value.trim();
  var pos=document.getElementById('ct-pos').value.trim();
  var date=document.getElementById('ct-date').value.trim();
  var prox=document.getElementById('ct-prox').value;
  var mailUrl=document.getElementById('ct-email').value.trim();
  var phone=document.getElementById('ct-phone').value.trim();
  var linkedin=document.getElementById('ct-linkedin').value.trim();
  var photo=document.getElementById('ct-photo').value.trim();
  var companyLogo=document.getElementById('ct-company-logo').value.trim();
  var notes=document.getElementById('ct-notes').value.trim();
  if(!fname&&!lname){
    var fi=document.getElementById('ct-fname');
    fi.style.borderColor='#C0392B';setTimeout(function(){fi.style.borderColor='';},1200);return;
  }
  if(_editContactId){
    var c=contacts.find(function(x){return String(x.id)===_editContactId;});
    if(c){c.fname=fname;c.lname=lname;c.company=company;c.pos=pos;c.date=date;c.prox=prox;c.mail_url=mailUrl;c.phone=phone;c.linkedin=linkedin;c.photo=photo;c.notes=notes;c.company_logo=companyLogo||(company?companyLogos[company]||'':'');}
    if(company&&companyLogo) propagateCompanyLogo(company,companyLogo,c?c.id:null);
    buildCompanyLogos();scheduleSettingsSync();
    closeContactModal();saveTasks();render();
    if(supabaseClient&&c) await updateRemoteContact(c.id,contactToPayload(c));
  } else {
    var resolvedLogo=companyLogo||(company?companyLogos[company]||'':'');
    var nc={id:newContactId(),fname:fname,lname:lname,company:company,pos:pos,date:date,prox:prox,mail_url:mailUrl,phone:phone,linkedin:linkedin,photo:photo,notes:notes,company_logo:resolvedLogo};
    if(company&&resolvedLogo) propagateCompanyLogo(company,resolvedLogo,nc.id);
    contacts.push(nc);
    buildCompanyLogos();scheduleSettingsSync();
    closeContactModal();saveTasks();render();
    if(supabaseClient) await insertRemoteContact(nc);
  }
}

async function deleteContact(){
  if(!_editContactId)return;
  if(!confirm('Supprimer ce contact ?'))return;
  contacts=contacts.filter(function(c){return String(c.id)!==_editContactId;});
  var delId=_editContactId;
  closeContactModal();saveTasks();render();
  if(supabaseClient) await deleteRemoteContact(delId);
}

async function deleteContactDirect(id){
  if(!confirm('Supprimer ce contact ?'))return;
  contacts=contacts.filter(function(c){return String(c.id)!==String(id);});
  saveTasks();render();
  if(supabaseClient) await deleteRemoteContact(id);
}

function contactToPayload(c){
  return {fname:c.fname||'',lname:c.lname||'',company:c.company||'',pos:c.pos||'',date:c.date||'',prox:c.prox||'Faible',mail_url:c.mail_url||'',phone:c.phone||'',linkedin:c.linkedin||'',photo:c.photo||'',notes:c.notes||'',company_logo:c.company_logo||'',sort_order:c.sortOrder||0};
}
async function handleContactLogoFile(inp){
  var file=inp.files&&inp.files[0];
  if(!file)return;
  var dataUrl=await fileToDataUrl(file);
  if(!dataUrl)return;
  var el=document.getElementById('ct-company-logo');
  if(!el)return;
  if(supabaseClient){
    var uploadedUrl=await uploadContactPhoto(file,'logos');
    if(uploadedUrl){el.value=uploadedUrl;return;}
  }
  el.value=dataUrl;
}
async function handleContactPhotoFile(inp){
  var file=inp.files&&inp.files[0];
  if(!file)return;
  var dataUrl=await fileToDataUrl(file);
  if(!dataUrl)return;
  var el=document.getElementById('ct-photo');
  if(!el)return;
  if(supabaseClient){
    var uploadedUrl=await uploadContactPhoto(file,'photos');
    if(uploadedUrl){el.value=uploadedUrl;return;}
  }
  el.value=dataUrl;
}
async function uploadContactPhoto(file,folder){
  if(!supabaseClient||!file)return'';
  const {data:{user}}=await supabaseClient.auth.getUser();
  if(!user)return'';
  var path=folder+'/'+user.id+'/'+Date.now()+'-'+file.name.replace(/[^a-zA-Z0-9_.-]/g,'_');
  var res=await supabaseClient.storage.from(SUPABASE_BUCKET).upload(path,file,{upsert:true});
  if(res.error)return'';
  var pub=await supabaseClient.storage.from(SUPABASE_BUCKET).getPublicUrl(path);
  return(pub.data&&pub.data.publicUrl)?pub.data.publicUrl:'';
}

async function loadContactsRemote(){
  if(!supabaseClient)return;
  const { data: { user } } = await supabaseClient.auth.getUser();
  if(!user)return;
  var res=await supabaseClient.from(SUPABASE_TABLE_CONTACTS).select().eq('user_id',user.id).order('id',{ascending:true});
  if(res.error)throw res.error;
  if(Array.isArray(res.data)){
    // Snapshot ALL local fields before overwriting
    var localById={};
    contacts.forEach(function(c){localById[String(c.id)]=c;});
    // best(): prefer non-empty Supabase value, fall back to local
    function best(rv,lv){return(rv!=null&&rv!=='')?rv:(lv||'');}
    var syncBack=[];
    contacts=res.data.map(function(c){
      var loc=localById[String(c.id)]||{};
      var resolvedPhone=best(c.phone,loc.phone);
      var resolvedPhoto=best(c.photo,loc.photo);
      var resolvedMail=best(c.mail_url,loc.mail_url);
      var resolvedLinkedin=best(c.linkedin,loc.linkedin);
      var resolvedNotes=best(c.notes,loc.notes);
      var resolvedLogo=best(c.company_logo,loc.company_logo||companyLogos[c.company||'']||'');
      var resolvedOrder=typeof c.sort_order==='number'?c.sort_order:(loc.sortOrder!==undefined?loc.sortOrder:undefined);
      // Push back to Supabase any field that local had but remote was missing
      var patch={};
      if(!c.phone&&resolvedPhone)patch.phone=resolvedPhone;
      if(!c.photo&&resolvedPhoto)patch.photo=resolvedPhoto;
      if(!c.mail_url&&resolvedMail)patch.mail_url=resolvedMail;
      if(!c.linkedin&&resolvedLinkedin)patch.linkedin=resolvedLinkedin;
      if(!c.company_logo&&resolvedLogo)patch.company_logo=resolvedLogo;
      if(Object.keys(patch).length)syncBack.push({id:c.id,patch:patch});
      return {id:c.id,fname:c.fname||'',lname:c.lname||'',company:c.company||'',pos:c.pos||'',date:c.date||'',prox:c.prox||'Faible',mail_url:resolvedMail,phone:resolvedPhone,linkedin:resolvedLinkedin,photo:resolvedPhoto,notes:resolvedNotes,company_logo:resolvedLogo,sortOrder:resolvedOrder};
    });
    if(syncBack.length){
      syncBack.forEach(function(item){
        supabaseClient.from(SUPABASE_TABLE_CONTACTS).update(item.patch).eq('id',item.id).eq('user_id',user.id).then(function(){}).catch(function(){});
      });
    }
    buildCompanyLogos();
    saveTasks();
    if(currentView==='Networking')render();
  }
}

async function insertRemoteContact(c){
  if(!supabaseClient)return;
  setSyncState('syncing');
  const { data: { user } } = await supabaseClient.auth.getUser();
  if(!user)return;
  var payload=Object.assign({user_id:user.id},contactToPayload(c));
  var res=await supabaseClient.from(SUPABASE_TABLE_CONTACTS).insert([payload]).select();
  if(res.error){
    // Retry without sort_order (column might not exist yet)
    var p2=Object.assign({},payload);delete p2.sort_order;
    res=await supabaseClient.from(SUPABASE_TABLE_CONTACTS).insert([p2]).select();
    if(res.error){
      // Last resort: drop company_logo only — NEVER drop phone/mail_url/photo/linkedin
      var p3=Object.assign({},p2);delete p3.company_logo;
      res=await supabaseClient.from(SUPABASE_TABLE_CONTACTS).insert([p3]).select();
    }
  }
  if(res.error){console.warn('Supabase contact insert failed',res.error);setSyncState('error');}
  else{setSyncState();await loadContactsRemote();}
}

async function updateRemoteContact(id,changes){
  if(!supabaseClient)return;
  setSyncState('syncing');
  var res=await supabaseClient.from(SUPABASE_TABLE_CONTACTS).update(changes).eq('id',id);
  if(res.error){
    // Retry without sort_order (might not exist yet)
    var c2=Object.assign({},changes);delete c2.sort_order;
    res=await supabaseClient.from(SUPABASE_TABLE_CONTACTS).update(c2).eq('id',id);
    if(res.error){
      // Last resort: drop company_logo only — NEVER drop phone/mail_url/photo/linkedin
      var c3=Object.assign({},c2);delete c3.company_logo;
      res=await supabaseClient.from(SUPABASE_TABLE_CONTACTS).update(c3).eq('id',id);
    }
  }
  if(res.error){console.warn('Supabase contact update failed',res.error);setSyncState('error');}
  else{setSyncState();}
}

async function deleteRemoteContact(id){
  if(!supabaseClient)return;
  setSyncState('syncing');
  var res=await supabaseClient.from(SUPABASE_TABLE_CONTACTS).delete().eq('id',id);
  if(res.error){console.warn('Supabase contact delete failed',res.error);setSyncState('error');}
  else{setSyncState();}
}

var contactDrag={active:false,startX:0,startY:0,moved:false,pointerId:null,contactId:null,el:null};
var contactDropTarget=null;
function contactPointerDown(e,contactId){
  if(!e.target.classList.contains('net-drag-handle')&&!e.target.closest('.net-drag-handle'))return;
  e.preventDefault();
  contactDrag.active=true;contactDrag.startX=e.clientX;contactDrag.startY=e.clientY;
  contactDrag.moved=false;contactDrag.pointerId=e.pointerId||null;contactDrag.contactId=contactId;
  contactDrag.el=e.target.closest('.net-contact-row');
  if(contactDrag.el&&contactDrag.el.setPointerCapture)contactDrag.el.setPointerCapture(e.pointerId);
}
function contactPointerMove(e){
  if(!contactDrag.active)return;
  var dx=Math.abs(e.clientX-contactDrag.startX),dy=Math.abs(e.clientY-contactDrag.startY);
  if(dx<8&&dy<8)return;
  if(!contactDrag.moved){contactDrag.moved=true;if(contactDrag.el)contactDrag.el.classList.add('net-contact-dragging');}
  var target=document.elementFromPoint(e.clientX,e.clientY);
  var row=target&&target.closest('.net-contact-row[data-contact-id]');
  if(row&&row.getAttribute('data-contact-id')!==contactDrag.contactId){
    if(contactDropTarget&&contactDropTarget!==row)contactDropTarget.classList.remove('net-contact-drag-over');
    contactDropTarget=row;contactDropTarget.classList.add('net-contact-drag-over');
  }else if(!row||row.getAttribute('data-contact-id')===contactDrag.contactId){
    if(contactDropTarget){contactDropTarget.classList.remove('net-contact-drag-over');contactDropTarget=null;}
  }
}
function contactPointerUp(e){
  if(!contactDrag.active)return;
  if(contactDrag.el)contactDrag.el.classList.remove('net-contact-dragging');
  if(contactDrag.moved&&contactDrag.contactId&&contactDropTarget){
    reorderContacts(contactDrag.contactId,contactDropTarget.getAttribute('data-contact-id'));
  }
  if(contactDropTarget){contactDropTarget.classList.remove('net-contact-drag-over');contactDropTarget=null;}
  contactDrag.active=false;contactDrag.contactId=null;contactDrag.el=null;
}
function reorderContacts(fromId,toId){
  contacts.forEach(function(c,i){if(c.sortOrder===undefined)c.sortOrder=i;});
  contacts.sort(function(a,b){return (a.sortOrder||0)-(b.sortOrder||0);});
  var fi=contacts.findIndex(function(c){return String(c.id)===String(fromId);});
  var ti=contacts.findIndex(function(c){return String(c.id)===String(toId);});
  if(fi===-1||ti===-1||fi===ti)return;
  var item=contacts.splice(fi,1)[0];contacts.splice(ti,0,item);
  contacts.forEach(function(c,i){c.sortOrder=i;});
  saveTasks();rNetworking();
  if(supabaseClient){
    setSyncState('syncing');
    Promise.all(contacts.map(function(c){
      return supabaseClient.from(SUPABASE_TABLE_CONTACTS).update({sort_order:c.sortOrder}).eq('id',c.id);
    })).then(function(){setSyncState();}).catch(function(err){console.warn('sort_order sync failed',err);setSyncState('error');});
  }
}

// ── Exams ──
var EXAM_DATA_KEY='examDataV1';
var EXAM_STEPS=[
  {icon:'1',label:'Consignes & docs'},
  {icon:'2',label:'Fiches & cheat sheet'},
  {icon:'3',label:'Réviser'},
  {icon:'4',label:"Passer l'exam"}
];
var examData={
  subjects:[
    {id:'spanish',  name:'Spanish',                          color:'#AF52DE',step:0,examDate:''},
    {id:'climate',  name:'Climate Finance',                  color:'#34C759',step:0,examDate:''},
    {id:'pof',      name:'Principles of Finance',            color:'#4A90D9',step:0,examDate:''},
    {id:'fav',      name:'Financial Analysis & Valuation',   color:'#FF9500',step:0,examDate:''},
    {id:'pct',      name:'Portfolio Construction Theory',    color:'#FF2D55',step:0,examDate:''},
    {id:'excel',    name:'Financial Modelling (Excel)',       color:'#5AC8FA',step:0,examDate:''},
    {id:'python',   name:'Financial Econometrics (Python)',  color:'#5856D6',step:0,examDate:''},
    {id:'mgmt',     name:'Managerial Skills',                color:'#34C759',step:0,examDate:''}
  ],
  s1NumExams:3,
  s2NumExams:3,
  s1Grades:[
    {name:'Spanish',                        ects:'',numExams:2,exams:[{label:'',date:'',coeff:'1',note:''},{label:'',date:'',coeff:'1',note:''},{label:'',date:'',coeff:'1',note:''}]},
    {name:'Climate Finance',                ects:'',numExams:2,exams:[{label:'',date:'',coeff:'1',note:''},{label:'',date:'',coeff:'1',note:''},{label:'',date:'',coeff:'1',note:''}]},
    {name:'Principles of Finance',          ects:'',numExams:2,exams:[{label:'',date:'',coeff:'1',note:''},{label:'',date:'',coeff:'1',note:''},{label:'',date:'',coeff:'1',note:''}]},
    {name:'Financial Analysis & Valuation', ects:'',numExams:2,exams:[{label:'',date:'',coeff:'1',note:''},{label:'',date:'',coeff:'1',note:''},{label:'',date:'',coeff:'1',note:''}]},
    {name:'Portfolio Construction Theory',  ects:'',numExams:2,exams:[{label:'',date:'',coeff:'1',note:''},{label:'',date:'',coeff:'1',note:''},{label:'',date:'',coeff:'1',note:''}]},
    {name:'Financial Modelling (Excel)',     ects:'',numExams:2,exams:[{label:'',date:'',coeff:'1',note:''},{label:'',date:'',coeff:'1',note:''},{label:'',date:'',coeff:'1',note:''}]},
    {name:'Financial Econometrics (Python)',ects:'',numExams:2,exams:[{label:'',date:'',coeff:'1',note:''},{label:'',date:'',coeff:'1',note:''},{label:'',date:'',coeff:'1',note:''}]},
    {name:'Managerial Skills',              ects:'',numExams:2,exams:[{label:'',date:'',coeff:'1',note:''},{label:'',date:'',coeff:'1',note:''},{label:'',date:'',coeff:'1',note:''}]}
  ],
  s2Grades:[
    {name:'',ects:'',numExams:2,exams:[{label:'',date:'',coeff:'1',note:''},{label:'',date:'',coeff:'1',note:''},{label:'',date:'',coeff:'1',note:''}]},
    {name:'',ects:'',numExams:2,exams:[{label:'',date:'',coeff:'1',note:''},{label:'',date:'',coeff:'1',note:''},{label:'',date:'',coeff:'1',note:''}]},
    {name:'',ects:'',numExams:2,exams:[{label:'',date:'',coeff:'1',note:''},{label:'',date:'',coeff:'1',note:''},{label:'',date:'',coeff:'1',note:''}]},
    {name:'',ects:'',numExams:2,exams:[{label:'',date:'',coeff:'1',note:''},{label:'',date:'',coeff:'1',note:''},{label:'',date:'',coeff:'1',note:''}]},
    {name:'',ects:'',numExams:2,exams:[{label:'',date:'',coeff:'1',note:''},{label:'',date:'',coeff:'1',note:''},{label:'',date:'',coeff:'1',note:''}]},
    {name:'',ects:'',numExams:2,exams:[{label:'',date:'',coeff:'1',note:''},{label:'',date:'',coeff:'1',note:''},{label:'',date:'',coeff:'1',note:''}]},
    {name:'',ects:'',numExams:2,exams:[{label:'',date:'',coeff:'1',note:''},{label:'',date:'',coeff:'1',note:''},{label:'',date:'',coeff:'1',note:''}]},
    {name:'',ects:'',numExams:2,exams:[{label:'',date:'',coeff:'1',note:''},{label:'',date:'',coeff:'1',note:''},{label:'',date:'',coeff:'1',note:''}]}
  ]
};

// ── Chess Data ──
var chessData={boards:[]};
var _chessInst={};
var currentChessBoard=null;
var CHESS_UNI={w:{k:'♔',q:'♕',r:'♖',b:'♗',n:'♘',p:'♙'},b:{k:'♚',q:'♛',r:'♜',b:'♝',n:'♞',p:'♟'}};

function loadChessData(d){if(d&&Array.isArray(d.boards))chessData.boards=d.boards;}
function saveChessData(){scheduleSettingsSync();}

function openChessModal(){
  document.getElementById('chess-bd').classList.add('open');
  document.getElementById('chess-new-title').value='';
  document.getElementById('chess-new-pgn').value='';
  selectChessSide('w');
  setTimeout(function(){document.getElementById('chess-new-title').focus();},80);
}
function closeChessModal(){document.getElementById('chess-bd').classList.remove('open');}
function chessBdClick(ev){if(ev.target===document.getElementById('chess-bd'))closeChessModal();}

function selectChessSide(s){
  document.getElementById('chess-side-w').classList.toggle('active-w',s==='w');
  document.getElementById('chess-side-b').classList.toggle('active-b',s==='b');
}

function addChessBoard(){
  var titleEl=document.getElementById('chess-new-title');
  var pgnEl=document.getElementById('chess-new-pgn');
  var title=titleEl.value.trim();
  var pgn=pgnEl.value.trim();
  if(!title){titleEl.style.borderColor='#C0392B';setTimeout(function(){titleEl.style.borderColor='';},1200);return;}
  var id='cb'+Date.now();
  var side=document.getElementById('chess-side-b').classList.contains('active-b')?'b':'w';
  chessData.boards.push({id:id,title:title,pgn:pgn,currentMove:-1,side:side});
  closeChessModal();
  saveChessData();
  rChess();
}

function deleteChessBoard(id){
  chessData.boards=chessData.boards.filter(function(b){return b.id!==id;});
  delete _chessInst[id];
  if(currentChessBoard===id)currentChessBoard=null;
  saveChessData();
  rChessNav();
  rChess();
}

function flipChessBoard(id){
  var board=chessData.boards.find(function(b){return b.id===id;});
  if(!board) return;
  board.side=(board.side==='b'?'w':'b');
  saveChessData();
  rChessNav();
  _renderChessBoard(id);
}

function rChessNav(){
  var tabsEl=document.getElementById('tabs');
  if(!tabsEl) return;
  var ctm=document.getElementById('cat-treemap');
  if(ctm)ctm.style.display='none';
  var h='<div class="tab'+(currentChessBoard===null?' active':'')+'" onclick="selectChessBoard(null)">';
  h+='<span class="tab-label">Tous les pièges</span>';
  h+='<span class="tab-badge">'+chessData.boards.length+'</span></div>';
  chessData.boards.forEach(function(board){
    var active=currentChessBoard===board.id;
    h+='<div class="tab'+(active?' active':'')+'" onclick="selectChessBoard(\''+board.id+'\''+')">';
    h+='<span class="tab-label">'+e(board.title||'Sans titre')+'</span></div>';
  });
  tabsEl.innerHTML=h;
}

function selectChessBoard(id){
  currentChessBoard=id;
  rChessNav();
  rChess();
}

function rChess(){
  var el=document.getElementById('list');
  if(!el) return;
  if(!chessData.boards.length){
    el.innerHTML='<div class="empty"><div class="empty-icon">♟</div><div class="empty-txt">Aucun échiquier. Cliquez sur + pour en ajouter un.</div></div>';
    return;
  }
  if(currentChessBoard){
    var board=chessData.boards.find(function(b){return b.id===currentChessBoard;});
    if(board){
      el.innerHTML='<div class="chess-single">'+_chessCardHTML(board)+'</div>';
      _initChessInst(board);
      _renderChessBoard(board.id);
      return;
    }
  }
  var html='<div class="chess-grid">';
  chessData.boards.forEach(function(board){html+=_chessCardHTML(board);});
  html+='</div>';
  el.innerHTML=html;
  chessData.boards.forEach(function(board){_initChessInst(board);_renderChessBoard(board.id);});
}

function _chessCardHTML(board){
  var bid=board.id;
  var h='<div class="chess-card" id="chess-card-'+bid+'">';
  h+='<div class="chess-card-header"><span class="chess-card-title">'+e(board.title||'Sans titre')+'</span>';
  h+='<div style="display:flex;align-items:center;gap:4px;">';
  h+='<button class="chess-card-flip" onclick="flipChessBoard(\''+bid+'\')" title="Rotation">⇅</button>';
  h+='<button class="chess-card-del" onclick="deleteChessBoard(\''+bid+'\')">&#10005;</button>';
  h+='</div></div>';
  h+='<div class="chess-board-wrap"><div class="chess-frame"><div class="chess-board" id="chess-board-'+bid+'"></div></div></div>';
  h+='<div class="chess-move-label" id="chess-mlabel-'+bid+'"></div>';
  h+='<div class="chess-controls">';
  h+='<button class="chess-ctrl-btn" onclick="chessNav(\''+bid+'\',\'first\')" title="Début">&#x23EE;</button>';
  h+='<button class="chess-ctrl-btn" onclick="chessNav(\''+bid+'\',\'prev\')" title="Précédent">&#9664;</button>';
  h+='<button class="chess-ctrl-btn" onclick="chessNav(\''+bid+'\',\'next\')" title="Suivant">&#9654;</button>';
  h+='<button class="chess-ctrl-btn" onclick="chessNav(\''+bid+'\',\'last\')" title="Fin">&#x23ED;</button>';
  h+='</div></div>';
  return h;
}

function _frenchToEnglishPgn(pgn){
  /* Translate French SAN piece letters to English before passing to chess.js
     C=Cavalier→N, F=Fou→B, D=Dame→Q, T=Tour→R, R=Roi→K */
  var map={C:'N',F:'B',D:'Q',T:'R',R:'K'};
  // Promotions: =C, =F, =D, =T (followed by +, !, end of token)
  pgn=pgn.replace(/=([CFDT])/g,function(m,p){return'='+(map[p]||p);});
  // Regular piece moves: piece letter before file/rank/capture
  pgn=pgn.replace(/([CFDTR])(?=[a-h1-8x])/g,function(m,p){return map[p]||p;});
  return pgn;
}

function _initChessInst(board){
  var history=[];
  try{
    if(board.pgn&&typeof Chess!=='undefined'){
      var full=new Chess();
      var pgn=_frenchToEnglishPgn(board.pgn);
      if(full.load_pgn(pgn))history=full.history({verbose:true});
    }
  }catch(ex){}
  var mi=typeof board.currentMove==='number'?board.currentMove:history.length-1;
  if(mi>=history.length)mi=history.length-1;
  _chessInst[board.id]={history:history,moveIdx:mi};
}

function _chessAtMove(history,mi){
  if(typeof Chess==='undefined')return{chess:null,lastMove:null};
  var c=new Chess();var lm=null;
  for(var i=0;i<=mi&&i<history.length;i++){c.move(history[i].san);lm=history[i];}
  return{chess:c,lastMove:lm};
}

var _PIECE_LETTERS={k:'K',q:'Q',r:'R',b:'B',n:'N',p:'P'};
var _PIECE_CDN='https://cdn.jsdelivr.net/gh/lichess-org/lila@master/public/piece/cburnett/';

function _pieceUrl(color,type){return _PIECE_CDN+color+_PIECE_LETTERS[type]+'.svg';}

function _renderChessBoard(boardId){
  var inst=_chessInst[boardId];
  if(!inst)return;
  var boardEl=document.getElementById('chess-board-'+boardId);
  var labelEl=document.getElementById('chess-mlabel-'+boardId);
  if(!boardEl)return;
  var mi=inst.moveIdx;var history=inst.history;
  var res=(mi>=0&&history.length)?_chessAtMove(history,mi):{chess:(typeof Chess!=='undefined'?new Chess():null),lastMove:null};
  var chess=res.chess;var lm=res.lastMove;
  if(!chess){boardEl.innerHTML='<div style="color:#B0ADA8;font-size:11px;padding:8px;text-align:center;">chess.js non disponible</div>';return;}
  var fromSq=lm?lm.from:null;var toSq=lm?lm.to:null;
  var inCheck=chess.in_check();var checkSq=null;
  if(inCheck){
    var turn=chess.turn();var bd2=chess.board();
    outer:for(var rr=0;rr<8;rr++){for(var ff=0;ff<8;ff++){var pp=bd2[rr][ff];if(pp&&pp.type==='k'&&pp.color===turn){checkSq=String.fromCharCode(97+ff)+(8-rr);break outer;}}}
  }
  var bd=chess.board();var html='';
  var boardObj=chessData.boards.find(function(b){return b.id===boardId;});
  var flipped=boardObj&&boardObj.side==='b';
  if(flipped){
    for(var rank=0;rank<8;rank++){
      for(var file=7;file>=0;file--){
        var sqName=String.fromCharCode(97+file)+(rank+1);
        var isLight=(rank+file)%2!==0;
        var isHL=(sqName===fromSq||sqName===toSq);
        var isChk=(sqName===checkSq);
        var sqBg=isHL?(isLight?'hl-light':'hl-dark'):isChk?'sq-check':(isLight?'sq-light':'sq-dark');
        var coordCls=isLight?'coord-on-light':'coord-on-dark';
        var piece=bd[7-rank][file];var pHtml='';
        if(piece){pHtml='<img class="chess-piece-img" src="'+_pieceUrl(piece.color,piece.type)+'" alt="">';}
        var coordR=(file===7)?'<span class="chess-coord chess-coord-rank '+coordCls+'">'+(rank+1)+'</span>':'';
        var coordF=(rank===7)?'<span class="chess-coord chess-coord-file '+coordCls+'">'+String.fromCharCode(97+file)+'</span>':'';
        html+='<div class="chess-sq '+sqBg+'">'+pHtml+coordR+coordF+'</div>';
      }
    }
  } else {
    for(var rank=7;rank>=0;rank--){
      for(var file=0;file<8;file++){
        var sqName=String.fromCharCode(97+file)+(rank+1);
        var isLight=(rank+file)%2!==0;
        var isHL=(sqName===fromSq||sqName===toSq);
        var isChk=(sqName===checkSq);
        var sqBg=isHL?(isLight?'hl-light':'hl-dark'):isChk?'sq-check':(isLight?'sq-light':'sq-dark');
        var coordCls=isLight?'coord-on-light':'coord-on-dark';
        var piece=bd[7-rank][file];var pHtml='';
        if(piece){pHtml='<img class="chess-piece-img" src="'+_pieceUrl(piece.color,piece.type)+'" alt="">';}
        var coordR=(file===0)?'<span class="chess-coord chess-coord-rank '+coordCls+'">'+(rank+1)+'</span>':'';
        var coordF=(rank===0)?'<span class="chess-coord chess-coord-file '+coordCls+'">'+String.fromCharCode(97+file)+'</span>':'';
        html+='<div class="chess-sq '+sqBg+'">'+pHtml+coordR+coordF+'</div>';
      }
    }
  }
  boardEl.innerHTML=html;
  if(labelEl){
    if(!history.length)labelEl.textContent='Position initiale';
    else if(mi<0)labelEl.textContent='Position initiale · '+history.length+' coup'+(history.length>1?'s':'');
    else{var mNum=Math.floor(mi/2)+1;var side=mi%2===0?'Blancs':'Noirs';labelEl.textContent='Coup '+mNum+' ('+side+') · '+history[mi].san;}
  }
}

function chessNav(boardId,dir){
  var inst=_chessInst[boardId];if(!inst)return;
  var h=inst.history;
  if(dir==='first')inst.moveIdx=-1;
  else if(dir==='last')inst.moveIdx=h.length-1;
  else if(dir==='prev')inst.moveIdx=Math.max(-1,inst.moveIdx-1);
  else if(dir==='next')inst.moveIdx=Math.min(h.length-1,inst.moveIdx+1);
  var board=chessData.boards.find(function(b){return b.id===boardId;});
  if(board)board.currentMove=inst.moveIdx;
  saveChessData();
  _renderChessBoard(boardId);
}

function loadExamData(remoteData){
  try{
    var d=remoteData||(function(){var s=localStorage.getItem(EXAM_DATA_KEY);return s?JSON.parse(s):null;})();
    if(!d)return;
    if(Array.isArray(d.subjects)&&d.subjects.length){
      var _ec=['#4A90D9','#34C759','#FF9500','#FF2D55','#AF52DE','#5AC8FA','#5856D6','#FF6B35'];
      examData.subjects=d.subjects.map(function(s,i){
        return {id:s.id||('sub'+i),name:s.name||'',color:s.color||_ec[i%_ec.length],step:typeof s.step==='number'?s.step:0,examDate:s.examDate||'',comment:s.comment||''};
      });
    }
    function migrateGrade(g){
      if(!g.exams)g.exams=[];
      g.exams=g.exams.map(function(ex){return Object.assign({label:'',date:'',coeff:'1',note:''},ex);});
      if(typeof g.numExams!=='number'){
        var has3=g.exams[2]&&(g.exams[2].note||g.exams[2].label||g.exams[2].date);
        g.numExams=has3?3:2;
      }
      while(g.exams.length<(g.numExams||2))g.exams.push({label:'',date:'',coeff:'1',note:''});
      return g;
    }
    if(typeof d.s1NumExams==='number')examData.s1NumExams=d.s1NumExams;
    if(typeof d.s2NumExams==='number')examData.s2NumExams=d.s2NumExams;
    if(Array.isArray(d.s1Grades)){
      d.s1Grades.forEach(function(g,i){
        migrateGrade(g);
        if(i<examData.s1Grades.length)Object.assign(examData.s1Grades[i],g);
      });
    }
    if(Array.isArray(d.s2Grades)){
      d.s2Grades.forEach(function(g,i){
        migrateGrade(g);
        if(i<examData.s2Grades.length)Object.assign(examData.s2Grades[i],g);
        else examData.s2Grades.push(g);
      });
    }
  }catch(ex){}
}

function saveExamData(){
  try{localStorage.setItem(EXAM_DATA_KEY,JSON.stringify(examData));}catch(e){}
  scheduleSettingsSync();
}

function setExamStep(subjectId,stepIdx){
  var s=examData.subjects.find(function(x){return x.id===subjectId;});
  if(!s)return;
  s.step=(s.step===stepIdx+1)?stepIdx:stepIdx+1;
  saveExamData();
  rExams();
}

function saveExamComment(id,val){
  var s=examData.subjects.find(function(x){return x.id===id;});
  if(s){s.comment=val;saveExamData();}
}
var _commentEditorId=null;
function openCommentEditor(id){
  var s=examData.subjects.find(function(x){return x.id===id;});
  if(!s)return;
  _commentEditorId=id;
  document.getElementById('exam-comment-modal-subject').textContent=s.name||'Notes';
  document.getElementById('exam-comment-textarea').value=s.comment||'';
  document.getElementById('exam-comment-overlay').classList.add('open');
  setTimeout(function(){
    var ta=document.getElementById('exam-comment-textarea');
    if(ta){ta.focus();ta.setSelectionRange(ta.value.length,ta.value.length);}
  },80);
}
function saveCommentEditor(){
  if(!_commentEditorId)return;
  var val=document.getElementById('exam-comment-textarea').value;
  saveExamComment(_commentEditorId,val);
  closeCommentEditor();
  rExams();
}
function closeCommentEditor(){
  document.getElementById('exam-comment-overlay').classList.remove('open');
  _commentEditorId=null;
}
function saveExamDate(subjectId,val){
  var s=examData.subjects.find(function(x){return x.id===subjectId;});
  if(s){s.examDate=val;saveExamData();}
}

function updateGrade(sem,rowIdx,examIdx,field,val){
  var grades=sem==='s1'?examData.s1Grades:examData.s2Grades;
  if(grades[rowIdx]&&grades[rowIdx].exams[examIdx]){
    grades[rowIdx].exams[examIdx][field]=val;
    saveExamData();
    var row=grades[rowIdx];
    var meanEl=document.getElementById('mean-'+sem+'-'+rowIdx);
    if(meanEl)meanEl.innerHTML=calcExamMean(row);
    var semMeanEl=document.getElementById('sem-mean-'+sem);
    if(semMeanEl)semMeanEl.innerHTML=calcSemMean(grades);
    if(field==='date'){
      var dateInp=document.querySelector('[data-date-key="'+sem+'-'+rowIdx+'-'+examIdx+'"]');
      if(dateInp){
        var _dfut=false;if(val){var _ddp=val.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);if(_ddp){var _ddd=new Date(parseInt(_ddp[3]),parseInt(_ddp[2])-1,parseInt(_ddp[1]));var _dtd=new Date();_dtd.setHours(0,0,0,0);_dfut=_ddd>_dtd;}}
        dateInp.style.color=_dfut?'#FF3B30':'#B0ADA8';
        dateInp.style.fontWeight=_dfut?'700':'400';
      }
      var _rn3=row.numExams||2;
      for(var _k=0;_k<_rn3;_k++){var _cw3=document.querySelector('[data-confirm-wrap="'+sem+'-'+rowIdx+'-'+_k+'"]');if(_cw3&&row.exams[_k])_cw3.style.display=row.exams[_k].note?'inline':'none';}
    }
    if(field==='note'){
      updateExamGradeColor(sem,rowIdx,examIdx);
    }
    if(field==='note'||field==='coeff'){
      var n=row.numExams||2;
      for(var i=0;i<n;i++){
        var ex=row.exams[i];
        if(ex&&!ex.note){
          var inp=document.querySelector('[data-grade-key="'+sem+'-'+rowIdx+'-'+i+'"]');
          if(inp){
            var mn=calcMinNeeded(row,i);
            if(mn===null){inp.placeholder='—';inp.classList.remove('min-needed');}
            else if(mn==='>20'){inp.placeholder='impossible';inp.classList.remove('min-needed');}
            else{inp.placeholder=String(mn);inp.classList.add('min-needed');}
          }
        }
      }
    }
  }
}

function updateExamEcts(sem,rowIdx,val){
  var grades=sem==='s1'?examData.s1Grades:examData.s2Grades;
  if(grades[rowIdx]){grades[rowIdx].ects=val;saveExamData();
    var semMeanEl=document.getElementById('sem-mean-'+sem);
    if(semMeanEl)semMeanEl.innerHTML=calcSemMean(grades);
  }
}

function updateSubjectName(sem,rowIdx,val){
  var grades=sem==='s1'?examData.s1Grades:examData.s2Grades;
  if(grades[rowIdx]){grades[rowIdx].name=val;saveExamData();}
}

function addExamGradeRow(sem){
  var grades=sem==='s1'?examData.s1Grades:examData.s2Grades;
  var tableN=examData[sem+'NumExams']||3;
  var exams=[];
  for(var i=0;i<tableN;i++)exams.push({label:'',date:'',coeff:'1',note:''});
  grades.push({name:'',ects:'',numExams:2,exams:exams});
  saveExamData();rExams();
}

function activateRowExam(sem,rowIdx,examIdx){
  var grades=sem==='s1'?examData.s1Grades:examData.s2Grades;
  if(!grades[rowIdx])return;
  var row=grades[rowIdx];
  row.numExams=examIdx+1;
  while(row.exams.length<row.numExams)row.exams.push({label:'',date:'',coeff:'1',note:''});
  saveExamData();
  rExams();
}

function calcExamMean(row){
  var exams=row.exams.slice(0,row.numExams||2);
  var allFilled=exams.every(function(ex){return ex.note!==''&&!isNaN(parseFloat(ex.note));});
  if(!allFilled)return '<span class="grade-mean-empty">—</span>';
  var total=0,totalCoeff=0;
  exams.forEach(function(ex){
    var n=parseFloat(ex.note),c=parseFloat(ex.coeff)||1;
    total+=n*c;totalCoeff+=c;
  });
  if(totalCoeff===0)return '<span class="grade-mean-empty">—</span>';
  var mean=Math.round(total/totalCoeff*100)/100;
  var color=mean>=10?'#34C759':'#FF3B30';
  return '<span class="grade-mean" style="color:'+color+'">'+mean.toFixed(2)+'</span>';
}

function calcSemMean(grades){
  var weightedSum=0,totalEcts=0;
  grades.forEach(function(row){
    var ects=parseFloat(row.ects)||0;
    if(ects===0)return;
    var exams=row.exams.slice(0,row.numExams||2);
    var allFilled=exams.every(function(ex){return ex.note!==''&&!isNaN(parseFloat(ex.note));});
    if(!allFilled)return;
    var total=0,totalCoeff=0;
    exams.forEach(function(ex){
      var n=parseFloat(ex.note),c=parseFloat(ex.coeff)||1;
      total+=n*c;totalCoeff+=c;
    });
    if(totalCoeff>0){weightedSum+=(total/totalCoeff)*ects;totalEcts+=ects;}
  });
  if(totalEcts===0)return '<span class="grade-mean-empty">—</span>';
  var mean=Math.round(weightedSum/totalEcts*100)/100;
  var color=mean>=10?'#34C759':'#FF3B30';
  return '<span class="grade-mean" style="color:'+color+'">'+mean.toFixed(2)+'/20</span>';
}

function rExams(){
  var el=document.getElementById('list');
  if(!el)return;
  if(!examData._loaded){loadExamData();examData._loaded=true;}

  // Toolbar anchored in body-card
  el.innerHTML='<div id="exam-toolbar-el" style="height:0;overflow:hidden;"></div>';

  // Get or create full-width overlay
  var overlay=document.getElementById('exam-full-overlay');
  if(!overlay){
    overlay=document.createElement('div');
    overlay.id='exam-full-overlay';
    document.body.appendChild(overlay);
  }

  // Position overlay just below toolbar
  var toolbar=document.getElementById('exam-toolbar-el');
  var overlayTop=toolbar?Math.round(toolbar.getBoundingClientRect().bottom):66;
  overlay.style.top=overlayTop+'px';
  overlay.style.display='block';

  // Layout: S1+S2 side by side, then matières + cards below
  var gh='<div class="exams-layout">';

  // ── TOP: S1 and S2 tables side by side ──
  gh+='<div class="exams-grades-row">';
  gh+='<div><div class="exams-col-title">Notes — M1 Semestre 1</div>';
  gh+=buildGradesTable('s1');
  gh+='</div>';
  gh+='<div><div class="exams-col-title">Notes — M1 Semestre 2</div>';
  gh+=buildGradesTable('s2');
  gh+='</div>';
  gh+='</div>';

  // ── BOTTOM: Matières header + revision cards ──
  gh+='<div>';
  gh+='<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">';
  gh+='<span class="exams-col-title" style="margin:0;">Progression — Révisions</span>';
  gh+='<button class="add-btn" style="margin:0;padding:7px 14px;font-size:13px" onclick="addExamSubject()">+ Ajouter</button>';
  gh+='</div>';
  gh+='<div class="exam-cards-grid">';
  examData.subjects.forEach(function(s){
    var stepsDone=s.step;
    var daysHtml='';
    if(s.examDate){
      var parts=s.examDate.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
      if(parts){
        var examDt=new Date(parseInt(parts[3]),parseInt(parts[2])-1,parseInt(parts[1]));
        var today2=new Date();today2.setHours(0,0,0,0);
        var diff=Math.ceil((examDt-today2)/(1000*60*60*24));
        if(diff>0)daysHtml='<span style="font-size:11px;font-weight:600;color:#FF9500;margin-left:6px;">J-'+diff+'</span>';
        else if(diff===0)daysHtml='<span style="font-size:11px;font-weight:600;color:#FF3B30;margin-left:6px;">Aujourd\'hui</span>';
        else daysHtml='<span style="font-size:11px;color:#B0ADA8;margin-left:6px;">Passé</span>';
      }
    }
    gh+='<div class="exam-card" data-id="'+e(s.id)+'">';
    gh+='<div class="exam-card-header">';
    gh+='<div class="exam-card-name" onclick="startEditExamName(\''+s.id+'\')">'+e(s.name)+'</div>';
    gh+='<button class="exam-del-btn" onclick="deleteExamSubject(\''+s.id+'\')" title="Supprimer">&#10005;</button>';
    gh+='</div>';
    gh+='<div class="exam-steps-circles">';
    EXAM_STEPS.forEach(function(step,idx){
      var done=stepsDone>idx;
      if(idx>0)gh+='<div class="exam-step-connector'+(stepsDone>idx?' done':'')+'"></div>';
      gh+='<div class="exam-step-circ'+(done?' done':'')+'" onclick="setExamStep(\''+s.id+'\','+idx+')" title="'+step.label+'">';
      gh+='<div class="exam-step-circle">'+(done?'&#10003;':step.icon)+'</div>';
      gh+='</div>';
    });
    gh+='</div>';
    gh+='<div class="exam-steps-labels">';
    EXAM_STEPS.forEach(function(step,idx){
      var done=stepsDone>idx;
      gh+='<div class="exam-step-lbl'+(done?' done':'')+'">'+step.label+'</div>';
    });
    gh+='</div>';
    gh+='<div class="exam-date-row">';
    gh+='<span class="exam-date-label">Date exam :</span>';
    gh+='<input class="exam-date-input" type="text" placeholder="jj/mm/aaaa" value="'+e(s.examDate||'')+'" onchange="saveExamDate(\''+s.id+'\',this.value)">';
    gh+=daysHtml;
    gh+='</div>';
    var _commentPreview=s.comment?e(s.comment.length>120?s.comment.slice(0,120)+'…':s.comment):'';
    gh+='<div class="exam-comment-preview'+(s.comment?'':' empty')+'" onclick="openCommentEditor(\''+s.id+'\')">'
      +(_commentPreview||'Notes, conseils, stratégie…')
      +'</div>';
    gh+='</div>';
  });
  gh+='</div>'; // exam-cards-grid
  gh+='</div>'; // matières section

  gh+='</div>'; // exams-layout
  overlay.innerHTML=gh;
  overlay.querySelectorAll('td.subject-name textarea').forEach(function(ta){ta.style.height='auto';ta.style.height=ta.scrollHeight+'px';});
}

function deleteExamSubject(id){
  examData.subjects=examData.subjects.filter(function(x){return x.id!==id;});
  saveExamData();
  rExams();
}

function startEditExamName(id){
  var card=document.querySelector('.exam-card[data-id="'+id+'"]');
  if(!card)return;
  var nameEl=card.querySelector('.exam-card-name');
  if(!nameEl)return;
  var s=examData.subjects.find(function(x){return x.id===id;});
  if(!s)return;
  var input=document.createElement('input');
  input.style.cssText='font-size:14px;font-weight:600;color:#1C1C1E;flex:1;border:1px solid #4A90D9;border-radius:6px;padding:2px 6px;outline:none;font-family:inherit;background:#fff;min-width:0;';
  input.value=s.name;
  input.onblur=function(){saveExamSubjectName(id,input.value);};
  input.onkeydown=function(ev){
    if(ev.key==='Enter'){ev.preventDefault();saveExamSubjectName(id,input.value);}
    if(ev.key==='Escape'){ev.preventDefault();rExams();}
  };
  nameEl.replaceWith(input);
  input.focus();input.select();
}

function saveExamSubjectName(id,val){
  var s=examData.subjects.find(function(x){return x.id===id;});
  if(!s)return;
  if(val.trim())s.name=val.trim();
  saveExamData();
  rExams();
}

function addExamSubject(){
  var _ec=['#4A90D9','#34C759','#FF9500','#FF2D55','#AF52DE','#5AC8FA','#5856D6','#FF6B35'];
  var id='sub'+Date.now();
  var color=_ec[examData.subjects.length%_ec.length];
  examData.subjects.push({id:id,name:'Nouvelle matière',color:color,step:0,examDate:'',comment:''});
  saveExamData();
  rExams();
  setTimeout(function(){startEditExamName(id);},30);
}

function calcMinNeeded(row,examIdx){
  var numExams=row.numExams||2;
  var exams=row.exams.slice(0,numExams);
  var totalCoeff=0;
  exams.forEach(function(ex){totalCoeff+=parseFloat(ex.coeff)||1;});
  var thisCoeff=parseFloat(exams[examIdx]&&exams[examIdx].coeff)||1;
  var otherEmptyWeighted=0;
  exams.forEach(function(ex,i){
    if(i===examIdx)return;
    var c=parseFloat(ex.coeff)||1;
    var n=parseFloat(ex.note);
    if(isNaN(n))otherEmptyWeighted+=10*c;
    else otherEmptyWeighted+=n*c;
  });
  var needed=(10*totalCoeff-otherEmptyWeighted)/thisCoeff;
  if(needed<=0)return null;
  if(needed>20)return '>20';
  return Math.round(needed*100)/100;
}

function rowAllDatesPast(row){
  var rowN=row.numExams||2;
  for(var i=0;i<rowN;i++){
    var ex=row.exams[i];
    if(!ex||!ex.date)return false;
    var dp=ex.date.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
    if(!dp)return false;
    var d=new Date(parseInt(dp[3]),parseInt(dp[2])-1,parseInt(dp[1]));var td=new Date();td.setHours(0,0,0,0);if(d>td)return false;
  }
  return true;
}

function getGradeStyle(ex){
  if(!ex.note)return{color:'',fontWeight:''};
  if(ex.confirmed===true)return{color:'#34C759',fontWeight:'600'};
  return{color:'#1C1C1E',fontWeight:'600'};
}

function updateExamGradeColor(sem,rowIdx,examIdx){
  var grades=sem==='s1'?examData.s1Grades:examData.s2Grades;
  var row=grades[rowIdx];if(!row)return;
  var ex=row.exams[examIdx];if(!ex)return;
  var gi=document.querySelector('[data-grade-key="'+sem+'-'+rowIdx+'-'+examIdx+'"]');
  var cw=document.querySelector('[data-confirm-wrap="'+sem+'-'+rowIdx+'-'+examIdx+'"]');
  if(gi){
    if(ex.note){var gs=getGradeStyle(ex);gi.style.color=gs.color;gi.style.fontWeight=gs.fontWeight;gi.style.fontStyle='';}
    else{gi.style.color='';gi.style.fontWeight='';gi.style.fontStyle='';}
  }
  if(cw){cw.style.display=ex.note?'inline':'none';cw.textContent=(ex.confirmed===true)?'B':'V';}
}

function toggleGradeConfirmed(sem,rowIdx,examIdx){
  var grades=sem==='s1'?examData.s1Grades:examData.s2Grades;
  var row=grades[rowIdx];if(!row||!row.exams[examIdx])return;
  row.exams[examIdx].confirmed=(row.exams[examIdx].confirmed===true)?null:true;
  saveExamData();
  updateExamGradeColor(sem,rowIdx,examIdx);
}

function buildGradesTable(sem){
  var grades=sem==='s1'?examData.s1Grades:examData.s2Grades;
  var tableN=examData[sem+'NumExams']||3;
  var html='<div class="grades-section"><div class="grades-table-wrap">';
  html+='<table class="grades-table">';
  html+='<colgroup><col style="width:105px"><col style="width:34px">';
  for(var ci=0;ci<tableN;ci++)html+='<col style="width:74px">';
  html+='<col style="width:48px"></colgroup>';
  html+='<thead><tr>';
  html+='<th class="subject-col">Matière</th><th>ECTS</th>';
  for(var ci=0;ci<tableN;ci++)html+='<th>Éval. '+(ci+1)+'</th>';
  html+='<th>Moy.</th>';
  html+='</tr></thead><tbody>';

  var totalEcts=0;
  grades.forEach(function(row,rowIdx){
    var rowN=row.numExams||2;
    var _allPast=rowAllDatesPast(row);
    html+='<tr>';
    html+='<td class="subject-name"><textarea rows="1" style="width:100%;border:none;background:transparent;font-size:13px;font-weight:500;color:#1C1C1E;outline:none;font-family:inherit;resize:none;overflow:hidden;padding:0;margin:0;display:block;line-height:1.4;box-sizing:border-box;" placeholder="Matière..." oninput="this.style.height=\'auto\';this.style.height=this.scrollHeight+\'px\';updateSubjectName(\''+sem+'\','+rowIdx+',this.value)">'+e(row.name)+'</textarea></td>';
    html+='<td class="ects-cell"><input class="ects-input" type="number" min="0" max="30" value="'+e(row.ects)+'" placeholder="—" oninput="updateExamEcts(\''+sem+'\','+rowIdx+',this.value)"></td>';
    for(var i=0;i<tableN;i++){
      if(i<rowN){
        var ex=row.exams[i]||{label:'',date:'',coeff:'1',note:''};
        var minNeed=(!ex.note)?calcMinNeeded(row,i):null;
        var minPlaceholder=(minNeed===null)?'—':(minNeed==='>20'?'impossible':String(minNeed));
        var minIsBlue=(minNeed!==null&&minNeed!=='>20');
        html+='<td><div class="grade-cell">';
        html+='<input class="grade-label-input" type="text" placeholder="Épreuve…" value="'+e(ex.label||'')+'" oninput="updateGrade(\''+sem+'\','+rowIdx+','+i+',\'label\',this.value)">';
        var dateFuture=false;if(ex.date){var _dp=ex.date.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);if(_dp){var _dd=new Date(parseInt(_dp[3]),parseInt(_dp[2])-1,parseInt(_dp[1]));var _td=new Date();_td.setHours(0,0,0,0);dateFuture=_dd>_td;}}
        var dateColor=dateFuture?'#FF3B30':'#B0ADA8';var dateFW=dateFuture?'700':'400';
        html+='<input data-date-key="'+sem+'-'+rowIdx+'-'+i+'" style="width:100%;border:none;background:transparent;font-size:9px;color:'+dateColor+';font-weight:'+dateFW+';text-align:center;outline:none;font-family:inherit;padding:1px 0;" type="text" placeholder="date" value="'+e(ex.date||'')+'" oninput="updateGrade(\''+sem+'\','+rowIdx+','+i+',\'date\',this.value)">';
        html+='<div style="display:flex;align-items:center;gap:2px;justify-content:center;margin-top:2px;">';
        html+='<input class="grade-coeff-input" style="width:30px;border:1px solid #E0DDD8;border-radius:5px;padding:2px 3px;font-size:11px;font-weight:600;text-align:center;outline:none;font-family:inherit;background:#FAFAF8;" type="number" min="0" max="100" step="0.5" value="'+e(ex.coeff||'1')+'" oninput="updateGrade(\''+sem+'\','+rowIdx+','+i+',\'coeff\',this.value)">';
        var _gradeStyle=getGradeStyle(ex);
        var _gradeStyleStr=ex.note?'color:'+_gradeStyle.color+';font-weight:'+_gradeStyle.fontWeight+';':'';
        var _showBV=!!ex.note;
        var _bvLabel=(ex.confirmed===true)?'B':'V';
        html+='<input class="grade-input'+(ex.note?' has-value':'')+(minIsBlue?' min-needed':'')+'" style="'+_gradeStyleStr+'" data-grade-key="'+sem+'-'+rowIdx+'-'+i+'" type="number" min="0" max="20" step="0.25" value="'+e(ex.note||'')+'" placeholder="'+minPlaceholder+'" oninput="updateGrade(\''+sem+'\','+rowIdx+','+i+',\'note\',this.value)">';
        html+='<span data-confirm-wrap="'+sem+'-'+rowIdx+'-'+i+'" onclick="toggleGradeConfirmed(\''+sem+'\','+rowIdx+','+i+')" style="display:'+(_showBV?'inline':'none')+';font-size:9px;color:#C8C4BF;cursor:pointer;font-weight:700;user-select:none;flex-shrink:0;line-height:1;">'+_bvLabel+'</span>';
        html+='</div></div></td>';
      } else {
        html+='<td class="grade-add-col-cell"><button class="grade-add-col-btn" onclick="activateRowExam(\''+sem+'\','+rowIdx+','+i+')" title="Ajouter cette épreuve">+</button></td>';
      }
    }
    html+='<td id="mean-'+sem+'-'+rowIdx+'">'+calcExamMean(row)+'</td>';
    html+='</tr>';
    var ects=parseFloat(row.ects)||0;totalEcts+=ects;
  });

  var totalEctsDisp=totalEcts>0?totalEcts:'—';
  html+='<tr class="grades-total-row">';
  html+='<td class="subject-name">Total / Moyenne pondérée</td>';
  html+='<td class="ects-cell" style="font-weight:700;">'+totalEctsDisp+'</td>';
  html+='<td colspan="'+tableN+'"></td>';
  html+='<td id="sem-mean-'+sem+'">'+calcSemMean(grades)+'</td>';
  html+='</tr>';

  html+='</tbody></table>';
  html+='<div style="padding:10px 14px;border-top:1px solid #F0EDE8;background:#fff;">';
  html+='<button onclick="addExamGradeRow(\''+sem+'\')" style="font-size:12px;color:#4A90D9;background:none;border:none;cursor:pointer;padding:2px 0;font-family:inherit;">+ Ajouter une matière</button>';
  html+='</div>';
  html+='</div></div>';
  return html;
}
