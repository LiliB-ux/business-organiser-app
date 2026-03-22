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

const clientSearch = document.getElementById("clientSearch");
const jobFilter = document.getElementById("jobFilter");

const clientFormTitle = document.getElementById("clientFormTitle");
const jobFormTitle = document.getElementById("jobFormTitle");
const clientSubmitBtn = document.getElementById("clientSubmitBtn");
const jobSubmitBtn = document.getElementById("jobSubmitBtn");
const cancelClientEditBtn = document.getElementById("cancelClientEditBtn");
const cancelJobEditBtn = document.getElementById("cancelJobEditBtn");

let clients = JSON.parse(localStorage.getItem("clients")) || [];
let jobs = JSON.parse(localStorage.getItem("jobs")) || [];

let editingClientId = null;
let editingJobId = null;

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
  const currentValue = jobClient.value;
  jobClient.innerHTML = '<option value="">Select client</option>';

  clients.forEach(client => {
    const option = document.createElement("option");
    option.value = client.id;
    option.textContent = client.name;
    jobClient.appendChild(option);
  });

  if (currentValue) {
    jobClient.value = currentValue;
  }
}

function getFilteredClients() {
  const searchText = clientSearch.value.trim().toLowerCase();

  return clients.filter(client => {
    const combinedText = `
      ${client.name}
      ${client.phone}
      ${client.address}
      ${client.notes}
    `.toLowerCase();

    return combinedText.includes(searchText);
  });
}

function renderClients() {
  clientList.innerHTML = "";

  const filteredClients = getFilteredClients();

  if (filteredClients.length === 0) {
    clientList.innerHTML = `<div class="empty-state">No clients found.</div>`;
    return;
  }

  filteredClients.forEach(client => {
    const div = document.createElement("div");
    div.className = "item";

    div.innerHTML = `
      <h3>${client.name}</h3>
      <p><strong>Phone:</strong> ${client.phone || "—"}</p>
      <p><strong>Address:</strong> ${client.address || "—"}</p>
      <p><strong>Notes:</strong> ${client.notes || "—"}</p>
      <div class="actions">
        <button class="edit-btn" onclick="editClient(${client.id})">Edit</button>
        <button class="delete-btn" onclick="deleteClient(${client.id})">Delete</button>
      </div>
    `;

    clientList.appendChild(div);
  });
}

function getFilteredJobs() {
  const filterValue = jobFilter.value;

  if (filterValue === "completed") {
    return jobs.filter(job => job.completed);
  }

  if (filterValue === "upcoming") {
    return jobs.filter(job => !job.completed);
  }

  return jobs;
}

function renderJobs() {
  jobList.innerHTML = "";

  const filteredJobs = getFilteredJobs();

  if (filteredJobs.length === 0) {
    jobList.innerHTML = `<div class="empty-state">No jobs found.</div>`;
    return;
  }

  filteredJobs.forEach(job => {
    const client = clients.find(c => c.id === job.clientId);

    const div = document.createElement("div");
    div.className = "item";

    div.innerHTML = `
      <h3>${job.service}</h3>
      <p><strong>Client:</strong> ${client ? client.name : "Unknown client"}</p>
      <p><strong>Date:</strong> ${job.date}</p>
      <p><strong>Price:</strong> $${Number(job.price).toFixed(2)}</p>
      <span class="badge ${job.completed ? "badge-completed" : "badge-upcoming"}">
        ${job.completed ? "Completed" : "Upcoming"}
      </span>
      <div class="actions">
        <button class="edit-btn" onclick="editJob(${job.id})">Edit</button>
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

  const name = clientName.value.trim();

  if (!name) {
    alert("Client name is required.");
    return;
  }

  if (editingClientId) {
    clients = clients.map(client =>
      client.id === editingClientId
        ? {
            ...client,
            name,
            phone: clientPhone.value.trim(),
            address: clientAddress.value.trim(),
            notes: clientNotes.value.trim()
          }
        : client
    );
  } else {
    const newClient = {
      id: Date.now(),
      name,
      phone: clientPhone.value.trim(),
      address: clientAddress.value.trim(),
      notes: clientNotes.value.trim()
    };

    clients.push(newClient);
  }

  saveData();
  resetClientForm();
  renderAll();
});

jobForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const selectedClientId = Number(jobClient.value);
  const service = jobService.value.trim();
  const date = jobDate.value;
  const price = jobPrice.value;

  if (!selectedClientId || !service || !date || !price) {
    alert("Please fill in all job fields.");
    return;
  }

  if (editingJobId) {
    jobs = jobs.map(job =>
      job.id === editingJobId
        ? {
            ...job,
            clientId: selectedClientId,
            service,
            date,
            price
          }
        : job
    );
  } else {
    const newJob = {
      id: Date.now(),
      clientId: selectedClientId,
      service,
      date,
      price,
      completed: false
    };

    jobs.push(newJob);
  }

  saveData();
  resetJobForm();
  renderAll();
});

function editClient(id) {
  const client = clients.find(client => client.id === id);
  if (!client) return;

  editingClientId = id;

  clientName.value = client.name;
  clientPhone.value = client.phone;
  clientAddress.value = client.address;
  clientNotes.value = client.notes;

  clientFormTitle.textContent = "Edit Client";
  clientSubmitBtn.textContent = "Update Client";
  cancelClientEditBtn.classList.remove("hidden");

  window.location.hash = "#clients";
}

function editJob(id) {
  const job = jobs.find(job => job.id === id);
  if (!job) return;

  editingJobId = id;

  jobClient.value = job.clientId;
  jobService.value = job.service;
  jobDate.value = job.date;
  jobPrice.value = job.price;

  jobFormTitle.textContent = "Edit Job";
  jobSubmitBtn.textContent = "Update Job";
  cancelJobEditBtn.classList.remove("hidden");

  window.location.hash = "#jobs";
}

function resetClientForm() {
  clientForm.reset();
  editingClientId = null;
  clientFormTitle.textContent = "Add Client";
  clientSubmitBtn.textContent = "Add Client";
  cancelClientEditBtn.classList.add("hidden");
}

function resetJobForm() {
  jobForm.reset();
  editingJobId = null;
  jobFormTitle.textContent = "Add Job";
  jobSubmitBtn.textContent = "Add Job";
  cancelJobEditBtn.classList.add("hidden");
}

cancelClientEditBtn.addEventListener("click", resetClientForm);
cancelJobEditBtn.addEventListener("click", resetJobForm);

function deleteClient(id) {
  const confirmed = confirm("Delete this client? This will also delete their jobs.");
  if (!confirmed) return;

  clients = clients.filter(client => client.id !== id);
  jobs = jobs.filter(job => job.clientId !== id);

  if (editingClientId === id) {
    resetClientForm();
  }

  saveData();
  renderAll();
}

function deleteJob(id) {
  const confirmed = confirm("Delete this job?");
  if (!confirmed) return;

  jobs = jobs.filter(job => job.id !== id);

  if (editingJobId === id) {
    resetJobForm();
  }

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

clientSearch.addEventListener("input", renderClients);
jobFilter.addEventListener("change", renderJobs);

function renderAll() {
  renderDashboard();
  renderClientOptions();
  renderClients();
  renderJobs();
}

renderAll();
