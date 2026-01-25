// Sidebar injector with role-based menus and off-canvas behavior

function buildSidebarHTML() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const role = user.role || 'registrar';

  // Role-based configurations
  const roleConfig = {
    admin: {
      title: 'Admin Portal',
      icon: '👑',
      menu: [
        { href: '/pages/registrar/dashboard.html', icon: '◆', label: 'Dashboard', page: 'dashboard' },
        { href: '/pages/registrar/admission-management.html', icon: '▦', label: 'Admissions', page: 'admission-management' },
        { href: '/pages/registrar/student-profile.html', icon: '◉', label: 'Students', page: 'student-profile' },
        { href: '/pages/registrar/sections-management.html', icon: '▬', label: 'Sections', page: 'sections-management' },
        { href: '/pages/registrar/reports.html', icon: '▤', label: 'Reports', page: 'reports' },
        { href: '/pages/registrar/year-end-succession.html', icon: '◐', label: 'Year-End', page: 'year-end-succession' },
        { href: '/pages/registrar/faculty-management.html', icon: '▲', label: 'Faculty', page: 'faculty-management' },
        { href: '/pages/registrar/student-status.html', icon: '⚙', label: 'Student Status', page: 'student-status' },
        { href: '/pages/registrar/curriculum-management.html', icon: '✎', label: 'Curriculum', page: 'curriculum-management' }
      ]
    },
    registrar: {
      title: 'Registrar Portal',
      icon: '📚',
      menu: [
        { href: '/pages/registrar/dashboard.html', icon: '◆', label: 'Dashboard', page: 'dashboard' },
        { href: '/pages/registrar/admission-management.html', icon: '▦', label: 'Admissions', page: 'admission-management' },
        { href: '/pages/registrar/student-profile.html', icon: '◉', label: 'Students', page: 'student-profile' },
        { href: '/pages/registrar/sections-management.html', icon: '▬', label: 'Sections', page: 'sections-management' },
        { href: '/pages/registrar/reports.html', icon: '▤', label: 'Reports', page: 'reports' },
        { href: '/pages/registrar/year-end-succession.html', icon: '◐', label: 'Year-End', page: 'year-end-succession' },
        { href: '/pages/registrar/faculty-management.html', icon: '▲', label: 'Faculty', page: 'faculty-management' },
        { href: '/pages/registrar/student-status.html', icon: '⚙', label: 'Student Status', page: 'student-status' },
        { href: '/pages/registrar/curriculum-management.html', icon: '✎', label: 'Curriculum', page: 'curriculum-management' }
      ]
    },
    accounting_clerk: {
      title: 'Accounting Portal',
      icon: '💰',
      menu: [
        { href: '/pages/accounting/dashboard.html', icon: '◆', label: 'Dashboard', page: 'dashboard' },
        { href: '/pages/accounting/pending-admissions.html', icon: '⏳', label: 'Pending Admissions', page: 'pending-admissions' },
        { href: '/pages/accounting/payment-schemes.html', icon: '📋', label: 'Payment Schemes', page: 'payment-schemes' },
        { href: '/pages/accounting/processing-students.html', icon: '🔄', label: 'Processing Students', page: 'processing-students' },
        { href: '/pages/accounting/reports.html', icon: '▤', label: 'Reports', page: 'reports' }
      ]
    },
    cashier: {
      title: 'Cashier Portal',
      icon: '💵',
      menu: [
        { href: '/pages/cashier/dashboard.html', icon: '◆', label: 'Dashboard', page: 'dashboard' },
        { href: '/pages/cashier/pending-payments.html', icon: '⏳', label: 'Pending Payments', page: 'pending-payments' },
        { href: '/pages/cashier/payment-history.html', icon: '📜', label: 'Payment History', page: 'payment-history' },
        { href: '/pages/cashier/reports.html', icon: '▤', label: 'Reports', page: 'reports' }
      ]
    }
  };

  const config = roleConfig[role] || roleConfig.registrar;

  // Build menu items
  const menuItems = config.menu.map(item => `
    <a href="${item.href}" class="sidebar-item" data-page="${item.page}">
      <span class="icon">${item.icon}</span><span class="label">${item.label}</span>
    </a>
  `).join('');

  return `
    <aside id="sidebar" class="sidebar collapsed" aria-hidden="true">
      <div class="sidebar-header" style="padding:16px 14px 10px;">
        <div class="sidebar-logo" style="font-size:28px; line-height:1;">${config.icon}</div>
        <h2 style="margin:6px 0 2px; font-size:18px;">MSEUFCI</h2>
        <p style="font-size:12px; opacity:.9; margin:0;">Enrollment System</p>
        <p style="font-size:12px; margin:.35rem 0 0; opacity:.9;">${config.title}</p>
      </div>

      <nav class="sidebar-menu" style="display:flex; flex-direction:column; gap:4px; padding:8px;">
        ${menuItems}
      </nav>

      <div class="sidebar-user" style="margin-top:auto; padding:12px;">
        <div class="user-card" style="display:flex; gap:10px; align-items:center; background:rgba(255,255,255,.1); border-radius:10px; padding:10px 12px;">
          <div class="user-avatar" style="font-size:20px;">👤</div>
          <div class="user-info" style="line-height:1.2;">
            <strong id="userName">Loading...</strong>
            <p id="userRole" style="margin:2px 0 0; font-size:12px; opacity:.9;">ROLE</p>
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
    window.location.href = '/pages/public/login.html';
    return;
  }
  const userName = document.getElementById('userName');
  const userRole = document.getElementById('userRole');
  if (userName) userName.textContent = user.fullName || 'User';
  if (userRole) userRole.textContent = (user.role || 'registrar').replace(/_/g,' ').toUpperCase();
}

// Logout
function logout() {
  localStorage.clear();
  window.location.href = '/pages/public/login.html';
}

// Wire toggle/backdrop with page's toggle button
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