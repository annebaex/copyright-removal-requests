const form = document.getElementById("request-form");
const list = document.getElementById("request-list");
const newBtn = document.getElementById("new-request-btn");
const formSection = document.getElementById("form-section");

newBtn.onclick = () => formSection.classList.toggle("hidden");

form.onsubmit = (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(form));
  const timestamp = new Date().toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' });

  const id = Date.now();
  const status = "Under review";

  const request = {
    id,
    type: data.type,
    title: data.title,
    date: timestamp,
    status,
    match: "-",
    prevent: "-"
  };

  saveRequest(request);
  addRequestToTable(request);
  form.reset();
  formSection.classList.add("hidden");

  // After 1 minute, auto-check if "gfx render" is in title
  setTimeout(() => {
    const saved = getRequests();
    const req = saved.find(r => r.id === id);
    if (!req.title.toLowerCase().includes("gfx render")) {
      req.status = "Info needed";
      updateRequests(saved);
      renderRequests();
    }
  }, 60000);
};

function saveRequest(req) {
  const requests = getRequests();
  requests.unshift(req);
  updateRequests(requests);
}

function getRequests() {
  return JSON.parse(localStorage.getItem("requests") || "[]");
}

function updateRequests(requests) {
  localStorage.setItem("requests", JSON.stringify(requests));
}

function renderRequests() {
  list.innerHTML = "";
  getRequests().forEach(addRequestToTable);
}

function addRequestToTable(req) {
  const tr = document.createElement("tr");

  const dotClass = req.status === "Under review" ? "gray" :
                   req.status === "Info needed" ? "orange" : "green";

  tr.innerHTML = `
    <td>${req.type}</td>
    <td>${req.title}</td>
    <td>${req.date}</td>
    <td><div class="status"><span class="dot ${dotClass}"></span>${req.status}</div></td>
    <td>${req.match}</td>
    <td>${req.prevent}</td>
  `;
  list.appendChild(tr);
}

renderRequests();
