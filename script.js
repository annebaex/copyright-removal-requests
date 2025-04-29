// ELEMENTS
const modal      = document.getElementById('modal');
const btnOpen    = document.getElementById('btn-open-modal');
const btnClose   = modal.querySelector('.close');
const form       = document.getElementById('request-form');
const list       = document.getElementById('request-list');
const steps      = Array.from(form.querySelectorAll('.form-step'));

// OPEN & CLOSE MODAL
btnOpen.onclick  = () => modal.classList.remove('hidden');
btnClose.onclick = () => {
  modal.classList.add('hidden');
  form.reset();
  steps.forEach((s,i) => i>0 && s.classList.add('hidden'));
};

// DYNAMIC FORM PROGRESSION
form.addEventListener('change', e => {
  const filledSteps = steps.filter(s => {
    if (s.dataset.step == 1) {
      return form.type.value !== '';
    }
    // check any input inside for value/checked
    return Array.from(s.querySelectorAll('input, select, textarea'))
      .some(el => el.value || el.checked);
  }).length;

  // reveal next step
  if (filledSteps < steps.length) {
    steps[filledSteps].classList.remove('hidden');
  }
});

// SUBMIT & STORAGE
form.addEventListener('submit', e => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(form).entries());
  const now  = new Date();
  const id   = now.getTime();
  const record = {
    id,
    type: data.type,
    title: data.title,
    date: now.toLocaleString(),
    status: 'Under review',
    match: '–',
    prevent: '–'
  };

  // save & render
  const arr = JSON.parse(localStorage.getItem('requests')||'[]');
  arr.unshift(record);
  localStorage.setItem('requests', JSON.stringify(arr));
  renderTable();

  // auto-status updates
  setTimeout(() => updateStatus(id), 60_000);   // 1m → Info needed?
  setTimeout(() => autoResolve(id), 120_000);  // 2m → Resolved
  modal.classList.add('hidden');
  form.reset();
  steps.forEach((s,i) => i>0 && s.classList.add('hidden'));
});

// LOAD & RENDER
function renderTable(){
  list.innerHTML = '';
  JSON.parse(localStorage.getItem('requests')||'[]').forEach(r => {
    const tr = document.createElement('tr');
    // dot color
    let dot = 'gray';
    if (r.status === 'Info needed') dot = 'orange';
    if (r.status === 'Resolved')   dot = 'green';

    tr.innerHTML = `
      <td>${r.type}</td>
      <td>${r.title}</td>
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

// STATUS LOGIC
function updateStatus(id) {
  const arr = JSON.parse(localStorage.getItem('requests'));
  const req = arr.find(r => r.id === id);
  if (req && !/gfx render/i.test(req.title)) {
    req.status = 'Info needed';
    localStorage.setItem('requests', JSON.stringify(arr));
    renderTable();
  }
}

function autoResolve(id) {
  const arr = JSON.parse(localStorage.getItem('requests'));
  const req = arr.find(r => r.id === id);
  if (req && req.status !== 'Resolved') {
    req.status = 'Resolved';
    localStorage.setItem('requests', JSON.stringify(arr));
    renderTable();
  }
}

// INITIAL RENDER
renderTable();
