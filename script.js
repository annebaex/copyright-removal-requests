document.addEventListener('DOMContentLoaded', ()=> {
  const modal    = document.getElementById('modal');
  const openBtn  = document.getElementById('openModal');
  const closeBtn = document.getElementById('closeModal');
  const form     = document.getElementById('requestForm');
  const steps    = Array.from(form.querySelectorAll('.step'));
  const list     = document.getElementById('requestList');
  const linkIn   = form.querySelector('input[name="link"]');
  const details  = document.getElementById('videoDetails');

  // Open & close modal
  openBtn.onclick  = ()=> {
    modal.classList.remove('hidden');
    steps.slice(1).forEach(s=>s.classList.add('hidden'));
    details.innerHTML = '';
  };
  closeBtn.onclick = ()=> {
    modal.classList.add('hidden');
    form.reset();
    steps.slice(1).forEach(s=>s.classList.add('hidden'));
    details.innerHTML = '';
  };

  // Progressive reveal of steps
  form.addEventListener('change', ()=> {
    const filled = steps.filter((s,i)=>{
      if (i===0) return form.type.value!=='';
      return Array.from(s.querySelectorAll('input,select,textarea'))
        .some(el=>el.value||el.checked);
    }).length;
    if (filled < steps.length) steps[filled].classList.remove('hidden');
  });

  // Video oEmbed lookup
  linkIn.addEventListener('blur', async ()=> {
    details.innerHTML = '';
    if (form.type.value !== 'Video') return;
    const url = linkIn.value;
    if (!url) return;
    try {
      const res = await fetch('https://noembed.com/embed?url='+encodeURIComponent(url));
      const j   = await res.json();
      if (j.error) throw j.error;
      details.innerHTML = `
        <img src="${j.thumbnail_url}" alt="thumb"/>
        <div class="title">${j.title}</div>
      `;
    } catch {
      details.textContent = '⚠️ Could not fetch video details';
    }
  });

  // Render on load
  renderTable();

  // Form submit
  form.addEventListener('submit', e=> {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    const now  = new Date();
    const rec  = {
      id: now.getTime(),
      type: data.type,
      title: data.title,
      link: data.link,
      date: now.toLocaleString(),
      status: 'Under review',
      match: '–',
      prevent: '–'
    };
    const arr = JSON.parse(localStorage.getItem('requests')||'[]');
    arr.unshift(rec);
    localStorage.setItem('requests', JSON.stringify(arr));

    renderTable();
    modal.classList.add('hidden');
    form.reset();
    steps.slice(1).forEach(s=>s.classList.add('hidden'));
    details.innerHTML = '';

    // Auto-status timers
    setTimeout(()=> updateStatus(rec.id), 60_000);   // → Info needed
    setTimeout(()=> autoResolve(rec.id), 120_000);  // → Resolved
  });

  // Render table function
  function renderTable(){
    list.innerHTML = '';
    JSON.parse(localStorage.getItem('requests')||'[]').forEach(r => {
      const tr = document.createElement('tr');
      let dot = 'gray';
      if (r.status==='Info needed') dot='orange';
      if (r.status==='Resolved')    dot='green';

      tr.innerHTML = `
        <td>${r.type}</td>
        <td>${r.title}</td>
        <td><a href="${r.link}" target="_blank">View</a></td>
        <td>${r.date}</td>
        <td class="status-cell">
          <span class="dot ${dot}"></span>${r.status}
        </td>
        <td>${r.match}</td>
        <td>${r.prevent}</td>
      `;
      list.appendChild(tr);
    });
  }

  // Status → Info needed if no “gfx render”
  function updateStatus(id){
    const arr = JSON.parse(localStorage.getItem('requests'));
    const r   = arr.find(x=>x.id===id);
    if (r && !/gfx render/i.test(r.title)) {
      r.status = 'Info needed';
      localStorage.setItem('requests', JSON.stringify(arr));
      renderTable();
    }
  }

  // Then auto-resolve
  function autoResolve(id){
    const arr = JSON.parse(localStorage.getItem('requests'));
    const r   = arr.find(x=>x.id===id);
    if (r && r.status!=='Resolved') {
      r.status = 'Resolved';
      localStorage.setItem('requests', JSON.stringify(arr));
      renderTable();
    }
  }
});
