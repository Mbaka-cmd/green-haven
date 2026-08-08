const packages = [
  {id:'romantic', name:'Romantic Escape', event:'Romantic Picnic', price:6500, unit:'per couple', guests:2, icon:'bx-heart', featured:false,
    desc:'An intimate garden setup for two, styled with soft textiles and fresh blooms.',
    features:['Private secluded setup','Fresh flower styling','Charcuterie & snack board','Non-alcoholic drinks','Golden-hour photography spot']},
  {id:'family', name:'Family Fun', event:'Family Picnic', price:12000, unit:'up to 8 guests', guests:8, icon:'bx-home-heart', featured:true,
    desc:'Shaded tents, BBQ, and lawn games for a relaxed family afternoon outdoors.',
    features:['Shaded picnic tent','Charcoal BBQ station','Lawn games for kids & adults','Soft drinks for 8','Dedicated host on site']},
  {id:'birthday', name:'Bloom Birthday', event:'Birthday Party', price:15000, unit:'up to 10 guests', guests:10, icon:'bx-cake',featured:false,
    desc:'Balloon backdrop, birthday centerpiece, and a party playlist ready to go.',
    features:['Themed balloon backdrop','Birthday centerpiece table','Bluetooth speaker & playlist','Party favors for guests','Cake table styling']},
  {id:'corporate', name:'Corporate Retreat', event:'Corporate Event', price:35000, unit:'up to 25 guests', guests:25, icon:'bx-briefcase',featured:false,
    desc:'A full outdoor offsite — catering, presentation gear, and team activities included.',
    features:['Full-service catering','PA system & microphone','Projector & screen','Team-building activity area','Complimentary Wi-Fi']},
  {id:'graduation', name:'Graduation Glow', event:'Graduation Party', price:14000, unit:'up to 12 guests', guests:12, icon:'bx-medal',featured:false,
    desc:'Cap-and-gown photo styling with a celebratory spread for the whole crew.',
    features:['Photo backdrop & props','Grad cap centerpiece','Snack & drinks spread','Bluetooth speaker','Seating for 12']},
  {id:'proposal', name:'The Proposal', event:'Proposal Setup', price:18000, unit:'per couple', guests:2, icon:'bx-diamond',featured:false,
    desc:'Petals, candles, and a hidden photographer to capture the moment.',
    features:['Petal-lined pathway & arch','Candlelight styling','Hidden photographer (1 hr)','Champagne glasses (non-alcoholic option)','Ring box presentation table']},
];

function showToast(msg){
  const el = document.getElementById('toastMsg');
  const t = document.getElementById('toast');
  if(!el || !t) return;
  el.textContent = msg;
  t.classList.add('show');
  clearTimeout(window._toastTimer);
  window._toastTimer = setTimeout(()=>t.classList.remove('show'), 3200);
}
function shakeAndToast(msg){ showToast(msg); }

function handleContactSubmit(e){
  e.preventDefault();
  showToast('Message sent! We will reply within a few hours.');
  e.target.reset();
}

let currentStep = 1;
let booking = {event:null, eventLabel:null, pkg:null, date:null, time:null, guests:null};

function initBookingModal(){
  const eventTypeGrid = document.getElementById('eventTypeGrid');
  if(!eventTypeGrid) return;
  const uniqueEvents = [...new Map(packages.map(p=>[p.event,p])).values()];
  eventTypeGrid.innerHTML = uniqueEvents.map(p => `
    <div class="option-card" data-event="${p.event}" onclick="selectEvent('${p.event}', this)">
      <i class='bx ${p.icon}'></i><b>${p.event}</b>
    </div>
  `).join('');
}

function selectEvent(ev, el){
  booking.event = ev; booking.eventLabel = ev;
  document.querySelectorAll('#eventTypeGrid .option-card').forEach(c=>c.classList.remove('selected'));
  el.classList.add('selected');
  renderPkgOptions();
}
function renderPkgOptions(){
  const list = document.getElementById('pkgOptionList');
  if(!list) return;
  const filtered = booking.event ? packages.filter(p=>p.event===booking.event) : packages;
  list.innerHTML = filtered.map(p => `
    <div class="pkg-option ${booking.pkg===p.id?'selected':''}" data-pkg="${p.id}" onclick="selectPkg('${p.id}', this)">
      <div><b>${p.name}</b><span>${p.unit}</span></div>
      <div class="price">KES ${p.price.toLocaleString()}</div>
    </div>
  `).join('');
}
function selectPkg(id, el){
  booking.pkg = id;
  document.querySelectorAll('.pkg-option').forEach(c=>c.classList.remove('selected'));
  el.classList.add('selected');
}

function openBooking(pkgId){
  const overlay = document.getElementById('bookingOverlay');
  if(!overlay) return;
  overlay.classList.add('open');
  document.body.style.overflow='hidden';
  if(pkgId){
    const p = packages.find(x=>x.id===pkgId);
    if(p){
      booking.event = p.event; booking.pkg = p.id;
      document.querySelectorAll('#eventTypeGrid .option-card').forEach(c=>c.classList.toggle('selected', c.dataset.event===p.event));
      renderPkgOptions();
    }
  }
  goStep(1);
}
function closeBooking(){
  const overlay = document.getElementById('bookingOverlay');
  if(!overlay) return;
  overlay.classList.remove('open');
  document.body.style.overflow='';
  setTimeout(()=>{
    currentStep=1;
    booking={event:null,eventLabel:null,pkg:null,date:null,time:null,guests:null};
    renderSteps();
    showStep(1);
    document.querySelectorAll('.option-card,.pkg-option').forEach(c=>c.classList.remove('selected'));
    const pkgList = document.getElementById('pkgOptionList');
    if(pkgList) pkgList.innerHTML='';
  }, 300);
}
function renderSteps(){
  const track = document.getElementById('stepsTrack');
  if(!track) return;
  track.innerHTML = [1,2,3,4].map(s=>`<div class="step-dot ${s<=currentStep?'done':''}"></div>`).join('');
}
function showStep(step){
  document.querySelectorAll('.step-panel').forEach(p=>p.classList.remove('active'));
  const panel = document.querySelector(`.step-panel[data-step="${step}"]`);
  if(panel) panel.classList.add('active');
}
function goStep(step){
  if(step===2 && !booking.event){ shakeAndToast('Please select an event type first.'); return; }
  if(step===3 && !booking.pkg){ shakeAndToast('Please select a package.'); return; }
  if(step===4){
    booking.date = document.getElementById('bDate').value;
    booking.time = document.getElementById('bTime').value;
    booking.guests = document.getElementById('bGuests').value;
    if(!booking.date){ shakeAndToast('Please choose a preferred date.'); return; }
    updateSummary();
  }
  currentStep = step;
  renderSteps();
  showStep(step);
}
function updateSummary(){
  const p = packages.find(x=>x.id===booking.pkg);
  document.getElementById('sumEvent').textContent = booking.event || '—';
  document.getElementById('sumPkg').textContent = p ? p.name+' (KES '+p.price.toLocaleString()+')' : '—';
  document.getElementById('sumDate').textContent = (booking.date||'—') + ' · ' + (booking.time||'');
  document.getElementById('sumGuests').textContent = booking.guests || '—';
}
function submitBooking(){
  const name = document.getElementById('bName').value.trim();
  const phone = document.getElementById('bPhone').value.trim();
  const terms = document.getElementById('bTerms').checked;
  if(!name || !phone){ shakeAndToast('Please add your name and phone number.'); return; }
  if(!terms){ shakeAndToast('Please agree to the booking terms.'); return; }
  const ref = 'PG-' + Math.random().toString(36).substring(2,8).toUpperCase();
  document.getElementById('refCode').textContent = ref;
  showStep('success');
  document.getElementById('stepsTrack').innerHTML = '';
}

document.addEventListener('DOMContentLoaded', () => {
  initBookingModal();

  const nav = document.getElementById('nav');
  if(nav){
    window.addEventListener('scroll', ()=>{
      nav.classList.toggle('scrolled', window.scrollY>10);
    });
  }

  const revealEls = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
  }, {threshold:0.12});
  revealEls.forEach(el=>io.observe(el));

  const navLinks = document.getElementById('navLinks');
  if(navLinks){
    navLinks.addEventListener('click', (e)=>{
      if(e.target.tagName==='A') navLinks.classList.remove('open');
    });
  }
});

function toggleMobileNav(){
  const el = document.getElementById('navLinks');
  if(el) el.classList.toggle('open');
}
