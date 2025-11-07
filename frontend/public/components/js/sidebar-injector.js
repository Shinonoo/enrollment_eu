// Sidebar injector with off-canvas behavior and active-state handling

function buildSidebarHTML() {
  return `
    <aside id="sidebar" class="sidebar collapsed" aria-hidden="true">
      <div class="sidebar-header" style="padding:16px 14px 10px;">
        <div class="sidebar-logo" style="font-size:28px; line-height:1;">📚</div>
        <h2 style="margin:6px 0 2px; font-size:18px;">MSEFC</h2>
        <p style="font-size:12px; opacity:.9; margin:0;">Enrollment System</p>
        <p style="font-size:12px; margin:.35rem 0 0; opacity:.9;">Registrar Portal</p>
      </div>

      <nav class="sidebar-menu" style="display:flex; flex-direction:column; gap:4px; padding:8px;">
        <a href="/views/registrar/dashboard.html" class="sidebar-item" data-page="dashboard">
          <span class="icon">◆</span><span class="label">Dashboard</span>
        </a>
        <a href="/views/registrar/admission-management.html" class="sidebar-item" data-page="admission-management">
          <span class="icon">▦</span><span class="label">Admissions</span>
        </a>
        <a href="/views/registrar/student-profile.html" class="sidebar-item" data-page="student-profile">
          <span class="icon">◉</span><span class="label">Students</span>
        </a>
        <a href="/views/registrar/sections-management.html" class="sidebar-item" data-page="sections-management">
          <span class="icon">▬</span><span class="label">Sections</span>
        </a>
        <a href="/views/registrar/reports.html" class="sidebar-item" data-page="reports">
          <span class="icon">▤</span><span class="label">Reports</span>
        </a>
        <a href="/views/registrar/year-end-succession.html" class="sidebar-item" data-page="year-end-succession">
          <span class="icon">◐</span><span class="label">Year-End</span>
        </a>
        <a href="/views/registrar/faculty-management.html" class="sidebar-item" data-page="faculty-management">
          <span class="icon">▲</span><span class="label">Faculty</span>
        </a>
        <a href="/views/registrar/student-status.html" class="sidebar-item" data-page="student-status">
          <span class="icon">⚙</span><span class="label">Student Status</span>
        </a>
        <a href="/views/registrar/curriculum-management.html" class="sidebar-item" data-page="curriculum-management">
          <span class="icon">✎</span><span class="label">Curriculum</span>
        </a>
      </nav>

      <div class="sidebar-user" style="margin-top:auto; padding:12px;">
        <div class="user-card" style="display:flex; gap:10px; align-items:center; background:rgba(255,255,255,.1); border-radius:10px; padding:10px 12px;">
          <div class="user-avatar" style="font-size:20px;">👤</div>
          <div class="user-info" style="line-height:1.2;">
            <strong id="userName">Loading...</strong>
            <p id="userRole" style="margin:2px 0 0; font-size:12px; opacity:.9;">REGISTRAR</p>
          </div>
        </div>
        <button id="logoutBtn" class="btn btn-danger" style="width:100%; margin-top:12px; padding:10px 12px; border:0; border-radius:8px; color:#fff; background:#b72b2b; cursor:pointer;">Logout</button>
      </div>
    </aside>
    <div id="sidebarBackdrop" class="sidebar-backdrop"></div>
  `;
}

// Inject sidebar; keep one source of truth
function injectSidebar() {
  const dashboard = document.querySelector('.dashboard');
  if (!dashboard) return;

  // If already present (navigated SPA), skip duplicate
  if (!document.getElementById('sidebar')) {
    dashboard.insertAdjacentHTML('afterbegin', buildSidebarHTML());
  }

  setActiveSidebar();
  loadUserInfo();
  wireSidebarControls();
}

// Highlight current item
function setActiveSidebar() {
  const file = window.location.pathname.split('/').pop().replace('.html', '');
  document.querySelectorAll('.sidebar-item').forEach(a => {
    a.classList.toggle('active', a.getAttribute('data-page') === file);
  });
}

// Load user; redirect if no token
function loadUserInfo() {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (!token) {
    window.location.href = '/views/public/login.html';
    return;
  }
  const userName = document.getElementById('userName');
  const userRole = document.getElementById('userRole');
  if (userName) userName.textContent = user.fullName || 'User';
  if (userRole) userRole.textContent = (user.role || 'registrar').replace('_',' ').toUpperCase();
}

// Logout
function logout() {
  localStorage.clear();
  window.location.href = '/views/public/login.html';
}

// Wire toggle/backdrop with page’s toggle button
function wireSidebarControls() {
  const body = document.body;
  const sidebar = document.getElementById('sidebar');
  const backdrop = document.getElementById('sidebarBackdrop');
  const toggleBtn = document.getElementById('sidebarToggle');
  const logoutBtn = document.getElementById('logoutBtn');

  function openSidebar(){
    body.classList.add('body--sidebar-open');
    sidebar.classList.remove('collapsed');
    if (window.matchMedia('(max-width: 991.98px)').matches){
      backdrop.classList.add('show');
    }
  }
  function closeSidebar(){
    body.classList.remove('body--sidebar-open');
    sidebar.classList.add('collapsed');
    backdrop.classList.remove('show');
  }
  function toggleSidebar(){
    if (body.classList.contains('body--sidebar-open')) closeSidebar();
    else openSidebar();
  }

  // Start collapsed/hidden every time we arrive here
  closeSidebar();

  toggleBtn && toggleBtn.addEventListener('click', toggleSidebar);
  backdrop && backdrop.addEventListener('click', closeSidebar);

  // Close drawer when navigating via sidebar links (mobile UX)
  document.querySelectorAll('.sidebar-item').forEach(a=>{
    a.addEventListener('click', ()=>{
      if (window.matchMedia('(max-width: 991.98px)').matches) closeSidebar();
    });
  });

  // Keep backdrop sane on resize
  window.addEventListener('resize', ()=>{
    if (!window.matchMedia('(max-width: 991.98px)').matches){
      backdrop.classList.remove('show');
    }
  });

  // Logout
  logoutBtn && logoutBtn.addEventListener('click', logout);
}

// Initialize
document.addEventListener('DOMContentLoaded', injectSidebar);

// Expose logout (if called from inline onclick in legacy markup)
window.logout = logout;
