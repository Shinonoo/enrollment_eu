// ----- Sidebar Menus for Each Role -----
const SIDEBAR_MENUS = {
  registrar: [
    { href: "/pages/registrar/dashboard.html", icon: "◆", label: "Dashboard", page: "dashboard" },
    { href: "/pages/registrar/admission-management.html", icon: "▦", label: "Admissions", page: "admission-management" },
    { href: "/pages/registrar/student-profile.html", icon: "◉", label: "Students", page: "student-profile" },
    { href: "/pages/registrar/sections-management.html", icon: "▬", label: "Sections", page: "sections-management" },
    { href: "/pages/registrar/reports.html", icon: "▤", label: "Reports", page: "reports" },
    { href: "/pages/registrar/year-end-succession.html", icon: "◐", label: "Year-End", page: "year-end-succession" },
    { href: "/pages/registrar/faculty-management.html", icon: "▲", label: "Faculty", page: "faculty-management" },
    { href: "/pages/registrar/student-status.html", icon: "⚙", label: "Student Status", page: "student-status" },
    { href: "/pages/registrar/curriculum-management.html", icon: "✎", label: "Curriculum", page: "curriculum-management" },
    { href: "/pages/registrar/subject-management.html", icon: "📚", label: "Subjects", page: "subject-management" }
  ],
  accountant: [
    { href: "/pages/accounting/dashboard.html", icon: "◆", label: "Dashboard", page: "dashboard" },
    { href: "/pages/accounting/payment-schemes.html", icon: "₱", label: "Payment Schemes", page: "payment-schemes" },
    { href: "/pages/accounting/pending-admissions.html", icon: "▦", label: "Pending Admissions", page: "pending-admissions" },
    { href: "/pages/accounting/processing-students.html", icon: "◉", label: "Processing Students", page: "processing-students" },
  ],
  cashier: [
    { href: "/pages/cashier/dashboard.html", icon: "◆", label: "Dashboard", page: "dashboard" },
    { href: "/pages/cashier/pending-payments.html", icon: "₱", label: "Pending Payments", page: "pending-payments" }
  ]
};

// ----- Sidebar HTML Generator -----
function buildSidebarHTML(role = "registrar") {
  const menu = SIDEBAR_MENUS[role] || SIDEBAR_MENUS.registrar;
  return `
<aside id="sidebar" class="sidebar collapsed" aria-hidden="true">
  <div class="sidebar-header" style="padding:16px 14px 10px;">
    <div class="sidebar-logo" style="font-size:28px; line-height:1;">📚</div>
    <h2 style="margin:6px 0 2px; font-size:18px;">MSEFC</h2>
    <p style="font-size:12px; opacity:.9; margin:0;">Enrollment System</p>
    <p style="font-size:12px; margin:.35rem 0 0; opacity:.9;">${role.charAt(0).toUpperCase() + role.slice(1)} Portal</p>
  </div>
  <nav class="sidebar-menu" style="display:flex; flex-direction:column; gap:4px; padding:8px;">
    ${menu.map(item =>
    `<a href="${item.href}" class="sidebar-item" data-page="${item.page}">
        <span class="icon">${item.icon}</span><span class="label">${item.label}</span>
      </a>`
  ).join('')}
  </nav>
  <div class="sidebar-user" style="margin-top:auto; padding:12px; position:relative;">
    <div id="userCard" class="user-card" style="display:flex; gap:10px; align-items:center; background:rgba(255,255,255,.1); border-radius:10px; padding:10px 12px; cursor:pointer; transition: background .2s;">
      <div class="user-avatar" style="font-size:20px;">👤</div>
      <div class="user-info" style="line-height:1.2; flex:1;">
        <strong id="userName">Loading...</strong>
        <p id="userRole" style="margin:2px 0 0; font-size:12px; opacity:.9;">${role.toUpperCase()}</p>
      </div>
      <span style="font-size:14px; opacity:.7;">▼</span>
    </div>
    <div id="userMenu" class="user-menu" style="display:none; position:absolute; bottom:100%; left:12px; right:12px; margin-bottom:8px; background:rgba(255,255,255,.95); border-radius:8px; box-shadow:0 4px 12px rgba(0,0,0,.15); overflow:hidden;">
      <button id="logoutMenuBtn" class="user-menu-item" style="width:100%; padding:12px 14px; border:0; background:transparent; color:#b72b2b; font-weight:600; text-align:left; cursor:pointer; transition:background .2s; display:flex; align-items:center; gap:8px;">
        <span style="font-size:16px;">🚪</span>
        <span>Logout</span>
      </button>
    </div>
  </div>
</aside>
<div id="sidebarBackdrop" class="sidebar-backdrop"></div>
<div id="logoutModal" class="modal-overlay" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,.5); z-index:9999; align-items:center; justify-content:center;">
  <div class="modal-content" style="background:#fff; border-radius:12px; padding:24px; max-width:400px; margin:20px; box-shadow:0 8px 32px rgba(0,0,0,.2);">
    <h3 style="margin:0 0 12px; color:#333; font-size:20px;">Confirm Logout</h3>
    <p style="margin:0 0 24px; color:#666; font-size:14px;">Are you sure you want to log out of the ${role.charAt(0).toUpperCase() + role.slice(1)} Portal?</p>
    <div style="display:flex; gap:12px; justify-content:flex-end;">
      <button id="cancelLogout" class="btn" style="padding:10px 20px; border:1px solid #ddd; border-radius:8px; background:#fff; color:#333; cursor:pointer; font-weight:600;">Cancel</button>
      <button id="confirmLogout" class="btn btn-danger" style="padding:10px 20px; border:0; border-radius:8px; background:#b72b2b; color:#fff; cursor:pointer; font-weight:600;">Logout</button>
    </div>
  </div>
</div>
`;
}

// ----- Inject Sidebar -----
function injectSidebar() {
  const dashboard = document.querySelector('.dashboard') || document.body;
  if (!dashboard) return;

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const role = (user.role || 'registrar').toLowerCase();

  if (!document.getElementById('sidebar')) {
    dashboard.insertAdjacentHTML('afterbegin', buildSidebarHTML(role));
  }

  setActiveSidebar();
  loadUserInfo();
  wireSidebarControls();
}

// ----- Active State Highlight -----
function setActiveSidebar() {
  const file = window.location.pathname.split('/').pop().replace('.html', '');
  document.querySelectorAll('.sidebar-item').forEach(a => {
    a.classList.toggle('active', a.getAttribute('data-page') === file);
  });
}

// ----- User Info Loader -----
function loadUserInfo() {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (!token) {
    window.location.href = '/pages/public/login.html';
    return;
  }
  const userName = document.getElementById('userName');
  const userRole = document.getElementById('userRole');
  if (userName) userName.textContent = user.fullName || 'User';
  if (userRole) userRole.textContent = (user.role || 'REGISTRAR').replace('_', ' ').toUpperCase();
}

// ----- Logout Logic -----
function logout() {
  localStorage.clear();
  window.location.href = '/pages/public/login.html';
}
window.logout = logout;

// ----- Sidebar Controls -----
function wireSidebarControls() {
  const body = document.body;
  const sidebar = document.getElementById('sidebar');
  const backdrop = document.getElementById('sidebarBackdrop');
  const toggleBtn = document.getElementById('sidebarToggle');
  const userCard = document.getElementById('userCard');
  const userMenu = document.getElementById('userMenu');
  const logoutMenuBtn = document.getElementById('logoutMenuBtn');
  const logoutModal = document.getElementById('logoutModal');
  const confirmLogout = document.getElementById('confirmLogout');
  const cancelLogout = document.getElementById('cancelLogout');

  function openSidebar() {
    body.classList.add('body--sidebar-open');
    sidebar.classList.remove('collapsed');
    if (window.matchMedia('(max-width: 991.98px)').matches) {
      backdrop.classList.add('show');
    }
  }

  function closeSidebar() {
    body.classList.remove('body--sidebar-open');
    sidebar.classList.add('collapsed');
    backdrop.classList.remove('show');
  }

  function toggleSidebar() {
    if (body.classList.contains('body--sidebar-open')) closeSidebar();
    else openSidebar();
  }

  function toggleUserMenu(e) {
    e.stopPropagation();
    const isVisible = userMenu.style.display === 'block';
    userMenu.style.display = isVisible ? 'none' : 'block';
  }

  function closeUserMenu() {
    if (userMenu) userMenu.style.display = 'none';
  }

  function showLogoutModal(e) {
    if (e) e.stopPropagation();
    closeUserMenu();
    if (logoutModal) {
      logoutModal.style.display = 'flex';
    }
  }


  function hideLogoutModal() {
    if (logoutModal) logoutModal.style.display = 'none';
  }

  closeSidebar();
  toggleBtn && toggleBtn.addEventListener('click', toggleSidebar);
  backdrop && backdrop.addEventListener('click', closeSidebar);
  userCard && userCard.addEventListener('click', toggleUserMenu);
  logoutMenuBtn && logoutMenuBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    showLogoutModal(e);
  });
  confirmLogout && confirmLogout.addEventListener('click', (e) => {
    e.stopPropagation();
    logout();
  });
  cancelLogout && cancelLogout.addEventListener('click', (e) => {
    e.stopPropagation();
    hideLogoutModal();
  });
  logoutModal && logoutModal.addEventListener('click', (e) => {
    e.stopPropagation();
    if (e.target === logoutModal) {
      hideLogoutModal();
    }
  });
  const modalContent = logoutModal?.querySelector('.modal-content');
  modalContent && modalContent.addEventListener('click', (e) => {
    e.stopPropagation();
  });
  document.addEventListener('click', (e) => {
    // If modal is open, don't auto-close user menu
    if (logoutModal && logoutModal.style.display === 'flex') return;
    if (userMenu && !userCard.contains(e.target) && !userMenu.contains(e.target)) {
      closeUserMenu();
    }
  });
  document.querySelectorAll('.sidebar-item').forEach(a => {
    a.addEventListener('click', () => {
      if (window.matchMedia('(max-width: 991.98px)').matches) closeSidebar();
    });
  });
  window.addEventListener('resize', () => {
    if (!window.matchMedia('(max-width: 991.98px)').matches) {
      backdrop.classList.remove('show');
    }
  });
  userCard && userCard.addEventListener('mouseenter', () => {
    userCard.style.background = 'rgba(255,255,255,.15)';
  });
  userCard && userCard.addEventListener('mouseleave', () => {
    userCard.style.background = 'rgba(255,255,255,.1)';
  });
  logoutMenuBtn && logoutMenuBtn.addEventListener('mouseenter', () => {
    logoutMenuBtn.style.background = 'rgba(183,43,43,.1)';
  });
  logoutMenuBtn && logoutMenuBtn.addEventListener('mouseleave', () => {
    logoutMenuBtn.style.background = 'transparent';
  });
}

// ----- Init Sidebar on DOM loaded -----
document.addEventListener('DOMContentLoaded', injectSidebar);
