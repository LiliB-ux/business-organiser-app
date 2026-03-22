const clientForm = document.getElementById("clientForm");
const jobForm = document.getElementById("jobForm");

const clientName = document.getElementById("clientName");
const clientPhone = document.getElementById("clientPhone");
const clientAddress = document.getElementById("clientAddress");
const clientNotes = document.getElementById("clientNotes");

const jobClient = document.getElementById("jobClient");
const jobService = document.getElementById("jobService");
const jobDate = document.getElementById("jobDate");
const jobPrice = document.getElementById("jobPrice");

const clientList = document.getElementById("clientList");
const jobList = document.getElementById("jobList");

const totalClients = document.getElementById("totalClients");
const totalJobs = document.getElementById("totalJobs");
const completedJobs = document.getElementById("completedJobs");

let clients = JSON.parse(localStorage.getItem("clients")) || [];
let jobs = JSON.parse(localStorage.getItem("jobs")) || [];

function saveData() {
  localStorage.setItem("clients", JSON.stringify(clients));
  localStorage.setItem("jobs", JSON.stringify(jobs));
}

function renderDashboard() {
  totalClients.textContent = clients.length;
  totalJobs.textContent = jobs.length;
  completedJobs.textContent = jobs.filter(job => job.completed).length;
}

function renderClientOptions() {
  jobClient.innerHTML = '<option value="">Select client</option>';

  clients.forEach(client => {
    const option = document.createElement("option");
    option.value = client.id;
    option.textContent = client.name;
    jobClient.appendChild(option);
  });
}

function renderClients() {
  clientList.innerHTML = "";

  if (clients.length === 0) {
    clientList.innerHTML = "<p>No clients added yet.</p>";
    return;
  }

  clients.forEach(client => {
    const div = document.createElement("div");
    div.className = "item";

    div.innerHTML = `
      <h3>${client.name}</h3>
      <p><strong>Phone:</strong> ${client.phone || "—"}</p>
      <p><strong>Address:</strong> ${client.address || "—"}</p>
      <p><strong>Notes:</strong> ${client.notes || "—"}</p>
      <div class="actions">
        <button class="delete-btn" onclick="deleteClient(${client.id})">Delete</button>
      </div>
    `;

    clientList.appendChild(div);
  });
}

function renderJobs() {
  jobList.innerHTML = "";

  if (jobs.length === 0) {
    jobList.innerHTML = "<p>No jobs added yet.</p>";
    return;
  }

  jobs.forEach(job => {
    const client = clients.find(c => c.id === job.clientId);

    const div = document.createElement("div");
    div.className = "item";

    div.innerHTML = `
      <h3>${job.service}</h3>
      <p><strong>Client:</strong> ${client ? client.name : "Unknown client"}</p>
      <p><strong>Date:</strong> ${job.date}</p>
      <p><strong>Price:</strong> $${job.price}</p>
      <p><strong>Status:</strong> ${job.completed ? "Completed" : "Upcoming"}</p>
      <div class="actions">
        <button class="complete-btn" onclick="toggleJobComplete(${job.id})">
          ${job.completed ? "Mark as Upcoming" : "Mark as Complete"}
        </button>
        <button class="delete-btn" onclick="deleteJob(${job.id})">Delete</button>
      </div>
    `;

    jobList.appendChild(div);
  });
}

clientForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const newClient = {
    id: Date.now(),
    name: clientName.value.trim(),
    phone: clientPhone.value.trim(),
    address: clientAddress.value.trim(),
    notes: clientNotes.value.trim()
  };

  clients.push(newClient);
  saveData();
  renderAll();

  clientForm.reset();
});

jobForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const newJob = {
    id: Date.now(),
    clientId: Number(jobClient.value),
    service: jobService.value.trim(),
    date: jobDate.value,
    price: jobPrice.value,
    completed: false
  };

  jobs.push(newJob);
  saveData();
  renderAll();

  jobForm.reset();
});

function deleteClient(id) {
  clients = clients.filter(client => client.id !== id);
  jobs = jobs.filter(job => job.clientId !== id);
  saveData();
  renderAll();
}

function deleteJob(id) {
  jobs = jobs.filter(job => job.id !== id);
  saveData();
  renderAll();
}

function toggleJobComplete(id) {
  jobs = jobs.map(job => {
    if (job.id === id) {
      return { ...job, completed: !job.completed };
    }
    return job;
  });

  saveData();
  renderAll();
}

function renderAll() {
  renderDashboard();
  renderClientOptions();
  renderClients();
  renderJobs();
}

renderAll();
