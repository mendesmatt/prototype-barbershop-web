function goTo(name){
    document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
    document.getElementById('screen-'+name).classList.add('active');
    document.querySelectorAll('.tab-btn').forEach(b=>b.classList.toggle('active', b.dataset.tab===name));
  }

  let booking = { pro:null, services:[], day:null, time:null, isReschedule:false };
  let currentStep = 1;

  function resetBooking(){
    booking = { pro:null, services:[], day:null, time:null, isReschedule:false };
    currentStep = 1;
    document.querySelectorAll('.pro-card').forEach(c=>c.classList.remove('selected'));
    document.querySelectorAll('.svc-card').forEach(c=>{ c.classList.remove('selected'); c.querySelector('.svc-check').innerHTML=''; });
    document.getElementById('agendar-title').textContent = 'Agendar horário';
    renderStep();
  }

  function selectPro(name, el){
    booking.pro = name;
    document.querySelectorAll('.pro-card').forEach(c=>{ c.style.borderColor='var(--border)'; c.style.background='var(--surface)'; });
    el.style.borderColor = 'var(--gold)';
    el.style.background = 'rgba(201,161,90,.08)';
    updateSummary();
  }

  function toggleSvc(el){
    const name = el.dataset.name, price = +el.dataset.price, time = +el.dataset.time;
    const idx = booking.services.findIndex(s=>s.name===name);
    if(idx>-1){
      booking.services.splice(idx,1);
      el.classList.remove('selected');
      el.style.borderColor='var(--border)'; el.style.background='var(--surface)';
      el.querySelector('.svc-check').innerHTML='';
      el.querySelector('.svc-check').style.background='transparent';
    } else {
      booking.services.push({name, price, time});
      el.classList.add('selected');
      el.style.borderColor='var(--gold)'; el.style.background='rgba(201,161,90,.08)';
      el.querySelector('.svc-check').style.background='var(--gold)';
      el.querySelector('.svc-check').innerHTML='<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#141108" stroke-width="3"><path d="M20 6L9 17l-5-5"/></svg>';
    }
    updateSummary();
  }

  function buildDayTimeGrid(){
    const dayRow = document.getElementById('day-row');
    const dayNames = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
    dayRow.innerHTML='';
    const today = new Date();
    for(let i=0;i<10;i++){
      const d = new Date(today); d.setDate(today.getDate()+i);
      const div = document.createElement('div');
      div.className = 'flex-shrink-0 w-14 text-center py-2 rounded-xl cursor-pointer day-chip';
      div.style.border = '1px solid var(--border)'; div.style.background='var(--surface2)';
      div.innerHTML = `<p class="text-[10px]" style="color:var(--text-dim)">${dayNames[d.getDay()]}</p><p class="text-sm font-semibold">${d.getDate()}</p>`;
      div.onclick = () => {
        document.querySelectorAll('.day-chip').forEach(c=>{c.style.borderColor='var(--border)'; c.style.background='var(--surface2)'; c.style.color='var(--text)';});
        div.style.borderColor='var(--gold)'; div.style.background='var(--gold)'; div.style.color='#141108';
        booking.day = `${d.getDate()}/${d.getMonth()+1}`;
        updateSummary();
      };
      dayRow.appendChild(div);
      if(i===1) div.click();
    }

    const timeGrid = document.getElementById('time-grid');
    const times = ['09:00','09:40','10:20','11:00','11:40','14:00','14:40','15:30','16:10','16:50','17:30','18:10'];
    const unavailable = ['10:20','14:40','17:30'];
    timeGrid.innerHTML='';
    times.forEach(t=>{
      const chip = document.createElement('div');
      chip.className = 'chip time-chip text-center py-2 rounded-lg text-sm cursor-pointer' + (unavailable.includes(t)?' disabled':'');
      chip.textContent = t;
      chip.onclick = () => {
        document.querySelectorAll('.time-chip').forEach(c=>c.classList.remove('selected'));
        chip.classList.add('selected');
        booking.time = t;
        updateSummary();
      };
      timeGrid.appendChild(chip);
    });
  }

  function updateSummary(){
    const sumLine = document.getElementById('sum-line');
    const sumTotal = document.getElementById('sum-total');
    const total = booking.services.reduce((a,s)=>a+s.price,0);
    sumTotal.textContent = 'R$ ' + total;

    let ready = false, label = 'Selecione um profissional';
    if(currentStep===1){ ready = !!booking.pro; label = booking.pro ? `Profissional: ${booking.pro}` : 'Selecione um profissional'; }
    if(currentStep===2){ ready = booking.services.length>0; label = booking.services.length ? `${booking.services.length} serviço(s) selecionado(s)` : 'Selecione ao menos um serviço'; }
    if(currentStep===3){ ready = booking.day && booking.time; label = (booking.day && booking.time) ? `${booking.day} às ${booking.time}` : 'Selecione dia e horário'; }

    document.getElementById('sum-line').textContent = label;
    const btn = document.getElementById('next-btn');
    btn.classList.toggle('opacity-40', !ready);
    btn.classList.toggle('pointer-events-none', !ready);
    btn.textContent = currentStep < 3 ? 'Continuar' : 'Confirmar agendamento';
  }

  function renderStep(){
    document.querySelectorAll('.step-panel').forEach(p=>p.classList.add('hidden'));
    document.getElementById('step-'+currentStep).classList.remove('hidden');
    document.getElementById('summary-bar').style.display = 'block';
    [1,2,3].forEach(n=>{
      const dot = document.getElementById('dot-'+n);
      dot.classList.remove('current','done');
      if(n<currentStep) dot.classList.add('done');
      else if(n===currentStep) dot.classList.add('current');
      dot.textContent = n<currentStep ? '✓' : n;
      if(n<3) document.getElementById('line-'+n).classList.toggle('done', n<currentStep);
    });
    if(currentStep===3) buildDayTimeGrid();
    updateSummary();
  }

  function nextStep(){
    if(currentStep < 3){ currentStep++; renderStep(); }
    else { confirmBooking(); }
  }

  function confirmBooking(){
    document.querySelectorAll('.step-panel').forEach(p=>p.classList.add('hidden'));
    document.getElementById('step-confirm').classList.remove('hidden');
    document.getElementById('summary-bar').style.display = 'none';
    document.getElementById('confirm-title').textContent = booking.isReschedule ? 'Horário remarcado!' : 'Agendamento confirmado!';
    document.getElementById('rc-pro').textContent = booking.pro || '—';
    document.getElementById('rc-svc').textContent = booking.services.map(s=>s.name).join(', ') || '—';
    document.getElementById('rc-datetime').textContent = `${booking.day} às ${booking.time}`;
    document.getElementById('rc-total').textContent = 'R$ ' + booking.services.reduce((a,s)=>a+s.price,0);
    if(booking.isReschedule) showToast('Seu horário anterior foi liberado');
  }

  function quickBook(name){
    resetBooking();
    goTo('agendar');
    currentStep = 1; renderStep();
    setTimeout(()=>{
      const target = [...document.querySelectorAll('.pro-card')].find(c=>c.textContent.includes(name));
      if(target) target.click();
    }, 50);
  }

  function startReschedule(){
    resetBooking();
    booking.isReschedule = true;
    booking.pro = 'Renan';
    booking.services = [{name:'Corte + Barba', price:105, time:65}];
    document.getElementById('agendar-title').textContent = 'Remarcar horário';
    goTo('agendar');
    currentStep = 3; renderStep();
    showToast('Escolha o novo dia e horário');
  }

  function toggleSubStatus(){
    document.getElementById('sub-guest').classList.toggle('hidden');
    document.getElementById('sub-active').classList.toggle('hidden');
  }
  function subscribe(plan){
    document.getElementById('active-plan-name').textContent = 'Plano ' + plan;
    document.getElementById('sub-guest').classList.add('hidden');
    document.getElementById('sub-active').classList.remove('hidden');
    showToast('Assinatura ' + plan + ' ativada!');
  }
  function openCancelSubModal(){ showToast('Que tal pausar por 1 mês em vez de cancelar?'); }
  function openCancelModal(){ showToast('Agendamento cancelado'); }

  let toastTimer;
  function showToast(msg){
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(()=>t.classList.remove('show'), 2400);
  }

  document.querySelectorAll('#step-1 .pro-card').forEach(c=>c.classList.add('pro-card'));
  renderStep();
