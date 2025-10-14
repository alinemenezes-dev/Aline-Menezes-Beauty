/*****************************************
 * Catalogo Interativo - script.js
 *  - carrega imagens do GitHub (pasta imagens/)
 *  - painel admin com preview, upload (via PAT) e delete
 *  - lightbox, search, atualizar
 *****************************************/

/* ========== CONFIG ========== */
const GH_OWNER = "alinemenezes-dev";
const GH_REPO = "Catalogo-de-Beleza-interativo-";
const GH_PATH = "imagens"; // pasta no repo onde ficam as imagens
const ADMIN_USER = "Aline Menezes";
const ADMIN_PASS = "aline2024";

/* ========== DOM ========== */
const accessClientBtn = document.getElementById("accessClientBtn");
const accessAdminBtn = document.getElementById("accessAdminBtn");
const accessModal = document.getElementById("accessModal");
const modalTitle = document.getElementById("modalTitle");
const closeModal = document.getElementById("closeModal");
const entrarBtn = document.getElementById("entrarBtn");
const cancelBtn = document.getElementById("cancelBtn");

const publicCatalog = document.getElementById("publicCatalog");
const catalogGrid = document.getElementById("catalogGrid");
const noResults = document.getElementById("noResults");
const refreshBtn = document.getElementById("refreshBtn");
const searchInput = document.getElementById("searchInput");

const adminPanel = document.getElementById("adminPanel");
const uploadArea = document.getElementById("uploadArea");
const fileInput = document.getElementById("fileInput");
const repoFilesList = document.getElementById("repoFilesList");
const githubTokenInput = document.getElementById("githubToken");
const enableTokenBtn = document.getElementById("enableTokenBtn");
const sendToRepoBtn = document.getElementById("sendToRepoBtn");
const repoPathSpan = document.getElementById("repoPath");

const lightbox = document.getElementById("lightbox");
const lbImage = document.getElementById("lbImage");
const lbCaption = document.getElementById("lbCaption");
const lbClose = document.getElementById("lbClose");
const lbOpenTab = document.getElementById("lbOpenTab");
const lbCopyUrl = document.getElementById("lbCopyUrl");

const toggleThemeBtn = document.getElementById("toggleThemeBtn");

/* ========== STATE ========== */
let isAdminMode = false;
let githubToken = ""; // em memória só
let selectedFilesForUpload = []; // File objects (preview)
let repoImageListCache = []; // último fetch da API

repoPathSpan.textContent = `${GH_OWNER}/${GH_REPO} → ${GH_PATH}/`;

/* ========== UI EVENTS ========== */
accessClientBtn.addEventListener("click", () => openAccessModal("cliente"));
accessAdminBtn.addEventListener("click", () => openAccessModal("admin"));
closeModal.addEventListener("click", closeAccessModal);
cancelBtn.addEventListener("click", closeAccessModal);
window.addEventListener("click", (e) => { if (e.target === accessModal) closeAccessModal(); });

function openAccessModal(tipo){
  accessModal.style.display = "flex";
  modalTitle.textContent = tipo === "admin" ? "Acesso Admin" : "Acesso Cliente";
  isAdminMode = tipo === "admin";
}
function closeAccessModal(){
  accessModal.style.display = "none";
  document.getElementById("login").value = "";
  document.getElementById("senha").value = "";
}

/* Login */
entrarBtn.addEventListener("click", () => {
  const login = document.getElementById("login").value.trim();
  const senha = document.getElementById("senha").value.trim();
  if (!login || !senha) { alert("Preencha login e senha."); return; }
  if (isAdminMode) {
    if (login === ADMIN_USER && senha === ADMIN_PASS) {
      closeAccessModal();
      showAdminPanel();
    } else {
      alert("Credenciais de admin incorretas.");
    }
  } else {
    closeAccessModal();
    showPublicCatalog();
  }
});

/* Search & Refresh */
searchInput.addEventListener("input", () => filterGallery(searchInput.value));
refreshBtn.addEventListener("click", async () => {
  await loadImagesFromGitHubAndRender();
  if (adminPanel.style.display === "block") await listRepoImages();
});

/* Theme toggle (simples) */
toggleThemeBtn.addEventListener("click", () => {
  document.documentElement.classList.toggle("darkmode");
  toggleThemeBtn.textContent = document.documentElement.classList.contains("darkmode") ? "☀️" : "🌙";
});

/* Lightbox */
lbClose.addEventListener("click", () => { lightbox.style.display = "none"; lbImage.src = ""; });
lbCopyUrl.addEventListener("click", () => {
  const url = lbImage.src;
  if (!url) return;
  navigator.clipboard.writeText(url).then(()=> alert("URL copiada."));
});
/* open in new tab button handled by <a> tag in render */

/* Admin inputs */
uploadArea.addEventListener("click", () => fileInput.click());
uploadArea.addEventListener("dragover", (e)=>{ e.preventDefault(); uploadArea.classList.add("drag"); });
uploadArea.addEventListener("dragleave", ()=>{ uploadArea.classList.remove("drag"); });
uploadArea.addEventListener("drop", (e)=>{ e.preventDefault(); uploadArea.classList.remove("drag"); fileInput.files = e.dataTransfer.files; handleFileInputChange(); });

fileInput.addEventListener("change", handleFileInputChange);
enableTokenBtn.addEventListener("click", ()=>{
  const t = githubTokenInput.value.trim();
  if (!t) { githubToken = ""; alert("Token desativado."); enableTokenBtn.textContent = "Ativar token"; return; }
  githubToken = t;
  enableTokenBtn.textContent = "Token ativo";
  alert("Token ativo na sessão do navegador. Use com cuidado.");
});
sendToRepoBtn.addEventListener("click", async ()=>{
  if (!selectedFilesForUpload.length) { alert("Selecione arquivos primeiro (preview)."); return; }
  if (!githubToken) { if (!confirm("Sem token não é possível enviar ao GitHub. Deseja apenas manter preview local?")) return; }
  if (!githubToken) { return; }
  // Confirm and upload
  if (!confirm(`Enviar ${selectedFilesForUpload.length} arquivo(s) para ${GH_PATH}/ no repositório?`)) return;
  await uploadSelectedFilesToGitHub();
  // refresh lists
  await listRepoImages();
  await loadImagesFromGitHubAndRender();
});

/* ========== CORE: carregar imagens do Github ========== */
async function loadImagesFromGitHubAndRender(){
  catalogGrid.innerHTML = `<div class="empty">Carregando galeria...</div>`;
  try {
    const files = await fetchRepoContents(GH_OWNER, GH_REPO, GH_PATH);
    const images = (Array.isArray(files) ? files : []).filter(f => f.type === "file" && /\.(jpe?g|png|webp|gif|svg)$/i.test(f.name));
    repoImageListCache = images.slice(); // cache
    renderGallery(images);
  } catch (err) {
    console.error("Erro carregando imagens:", err);
    catalogGrid.innerHTML = `<div class="empty" style="color:red;">Erro ao carregar galeria. Verifique se o repositório é público e se existe a pasta <code>${GH_PATH}/</code>.</div>`;
  }
}

function renderGallery(images){
  catalogGrid.innerHTML = "";
  const q = (searchInput.value || "").toLowerCase().trim();
  const filtered = images.filter(img => img.name.toLowerCase().includes(q));
  if (!filtered.length) {
    noResults.style.display = "block";
    catalogGrid.innerHTML = "";
    return;
  } else noResults.style.display = "none";

  filtered.forEach(file => {
    const card = document.createElement("div");
    card.className = "catalog-item";
    card.innerHTML = `
      <img src="${file.download_url}" alt="${file.name}" loading="lazy" />
      <h3>${file.name.replace(/\.[^/.]+$/, "")}</h3>
      <div class="card-actions">
        <button class="viewBtn" data-url="${file.download_url}" data-name="${file.name}">Visualizar</button>
        <button class="copyBtn" data-url="${file.download_url}">Copiar URL</button>
      </div>
    `;
    catalogGrid.appendChild(card);
  });

  // attach events
  document.querySelectorAll(".viewBtn").forEach(btn=>{
    btn.addEventListener("click", (e)=>{
      const url = e.currentTarget.dataset.url;
      const name = e.currentTarget.dataset.name;
      openLightbox(url, name);
    });
  });
  document.querySelectorAll(".copyBtn").forEach(btn=>{
    btn.addEventListener("click", (e)=>{
      navigator.clipboard.writeText(e.currentTarget.dataset.url).then(()=> alert("URL copiada."));
    });
  });
}

/* Lightbox open */
function openLightbox(url, name){
  lbImage.src = url;
  lbCaption.textContent = name;
  lbOpenTab.href = url;
  lightbox.style.display = "flex";
}

/* ========== Admin: listar imagens do repo ========== */
async function listRepoImages(){
  repoFilesList.innerHTML = `<div class="empty">Carregando arquivos no repositório...</div>`;
  try {
    const files = await fetchRepoContents(GH_OWNER, GH_REPO, GH_PATH);
    const images = (Array.isArray(files) ? files : []).filter(f => f.type === "file" && /\.(jpe?g|png|webp|gif|svg)$/i.test(f.name));
    repoFilesList.innerHTML = "";
    if (!images.length) {
      repoFilesList.innerHTML = `<div class="empty">Nenhuma imagem encontrada em <code>${GH_PATH}/</code>.</div>`;
      return;
    }
    images.forEach(file=>{
      const card = document.createElement("div");
      card.className = "catalog-item";
      card.innerHTML = `
        <img src="${file.download_url}" alt="${file.name}" />
        <h3 style="font-size:0.95rem">${file.name}</h3>
        <div class="card-actions">
          <button class="copyRepoUrl" data-url="${file.download_url}">Copiar URL</button>
          <button class="deleteRepoFile" data-path="${file.path}" data-sha="${file.sha}">Deletar</button>
          <a href="${file.html_url}" target="_blank"><button>Ver no GitHub</button></a>
        </div>
      `;
      repoFilesList.appendChild(card);
    });

    // events
    document.querySelectorAll(".copyRepoUrl").forEach(b=>{
      b.addEventListener("click", e=>{
        navigator.clipboard.writeText(e.currentTarget.dataset.url).then(()=> alert("URL copiada."));
      });
    });

    document.querySelectorAll(".deleteRepoFile").forEach(b=>{
      b.addEventListener("click", async (e)=>{
        if (!githubToken) { alert("Exclusão requer token GitHub ativo."); return; }
        const path = e.currentTarget.dataset.path;
        const sha = e.currentTarget.dataset.sha;
        if (!confirm(`Deseja excluir ${path} do repositório?`)) return;
        try {
          await deleteFileFromRepo(path, sha, `Removendo ${path} via painel`);
          alert("Arquivo removido com sucesso.");
          await listRepoImages();
          await loadImagesFromGitHubAndRender();
        } catch (err) {
          console.error(err);
          alert("Erro ao remover arquivo: " + (err.message||err));
        }
      });
    });

  } catch (err) {
    console.error(err);
    repoFilesList.innerHTML = `<div class="empty" style="color:red;">Erro ao listar arquivos do repositório.</div>`;
  }
}

/* ========== Upload preview e envio ========== */
function handleFileInputChange(){
  const files = Array.from(fileInput.files || []);
  if (!files.length) return;
  selectedFilesForUpload = files;
  // show previews in repoFilesList top (local preview)
  files.forEach(file=>{
    const reader = new FileReader();
    reader.onload = (ev)=>{
      const div = document.createElement("div");
      div.className = "catalog-item";
      div.innerHTML = `<img src="${ev.target.result}" alt="${file.name}" /><h3>${file.name}</h3><div class="card-actions"><button class="removePreview">Remover</button></div>`;
      repoFilesList.prepend(div);
      div.querySelector(".removePreview").addEventListener("click", ()=>{
        div.remove();
        selectedFilesForUpload = selectedFilesForUpload.filter(f=>f.name !== file.name);
      });
    };
    reader.readAsDataURL(file);
  });
}

/* upload Selected files to GitHub via PUT /contents/{path}/{filename} */
async function uploadSelectedFilesToGitHub(){
  if (!githubToken) { alert("Coloque um token GitHub válido para enviar."); return; }
  for (const file of selectedFilesForUpload){
    try {
      const base64 = await fileToBase64(file);
      const parts = base64.split(",");
      const b64 = parts.length>1 ? parts[1] : parts[0];
      await uploadFileToGithub(`${GH_PATH}/${file.name}`, b64, `Upload via painel: ${file.name}`);
      console.log(`Enviado: ${file.name}`);
    } catch (err) {
      console.error("Erro upload:", err);
      alert("Erro ao enviar " + file.name + ": " + (err.message||err));
    }
  }
  alert("Upload finalizado.");
  selectedFilesForUpload = [];
  fileInput.value = "";
}

/* ========== GitHub API helpers ========== */
async function fetchRepoContents(owner, repo, path){
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
  const res = await fetch(apiUrl, { headers: githubToken ? { Authorization: `token ${githubToken}` } : {} });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub API error: ${res.status} ${res.statusText} - ${text}`);
  }
  return await res.json();
}

/* upload file to path (fullPath e.g. "imagens/meu.jpg") */
async function uploadFileToGithub(fullPath, base64Content, commitMessage){
  const apiUrl = `https://api.github.com/repos/${GH_OWNER}/${GH_REPO}/contents/${fullPath}`;
  // check if exists for sha
  let sha = null;
  try {
    const getRes = await fetch(apiUrl, { method: "GET", headers: { Authorization: `token ${githubToken}` }});
    if (getRes.ok) {
      const j = await getRes.json();
      sha = j.sha;
    }
  } catch(e){ /* ignore */ }

  const body = { message: commitMessage || `Adicionando ${fullPath}`, content: base64Content };
  if (sha) body.sha = sha;

  const res = await fetch(apiUrl, {
    method: "PUT",
    headers: { Authorization: `token ${githubToken}`, "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Upload falhou: ${res.status} ${res.statusText} - ${t}`);
  }
  return res.json();
}

/* delete file: requires path and current sha */
async function deleteFileFromRepo(path, sha, message){
  const apiUrl = `https://api.github.com/repos/${GH_OWNER}/${GH_REPO}/contents/${path}`;
  const body = { message: message || `Removendo ${path}`, sha };
  const res = await fetch(apiUrl, {
    method: "DELETE",
    headers: { Authorization: `token ${githubToken}`, "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Delete falhou: ${res.status} ${res.statusText} - ${t}`);
  }
  return res.json();
}

/* helpers */
function fileToBase64(file){
  return new Promise((res, rej)=>{
    const reader = new FileReader();
    reader.onload = ()=> res(reader.result);
    reader.onerror = rej;
    reader.readAsDataURL(file);
  });
}

/* ========== Views ========== */
function showPublicCatalog(){
  adminPanel.style.display = "none";
  publicCatalog.style.display = "block";
  loadImagesFromGitHubAndRender();
}
function showAdminPanel(){
  publicCatalog.style.display = "none";
  adminPanel.style.display = "block";
  listRepoImages();
}

/* Inicializar: tenta carregar galeria (se repo público deve funcionar) */
(async ()=>{
  await loadImagesFromGitHubAndRender();
})();
