/* _shell.js — 公共外壳加载器，所有页面引用这一个文件 */
(function() {
  var activePage = document.documentElement.getAttribute('data-shell') || 'index';
  var breadcrumb = document.documentElement.getAttribute('data-breadcrumb') || '首页';

  // Determine if we're on index page for greeting purposes
  var isIndex = (activePage === 'index');

  fetch('_shell.html')
    .then(function(r) { return r.text(); })
    .then(function(html) {
      // Replace placeholders
      html = html.replace(/\{\{ACTIVE:(\w[-\w]*)\}\}/g, function(m, page) {
        return page === activePage ? ' active' : '';
      });
      // Handle any unmatched {{ACTIVE}}
      html = html.replace(/\{\{ACTIVE\}\}/g, '');
      // Badge
      var badgeCount = localStorage.getItem('unreadCount') || '3';
      html = html.replace(/\{\{BADGE\}\}/g, badgeCount);
      // Breadcrumb
      html = html.replace(/\{\{BREADCRUMB\}\}/g, breadcrumb);

      // Inject into page
      var shell = document.getElementById('app-shell');
      if (shell) {
        shell.innerHTML = html;
      }

      // Initialize shared functionality
      initShared();
    });

  function initShared() {
    // Sidebar collapse
    var sidebar = document.getElementById('sidebar');
    var collapseBtn = document.getElementById('collapseBtn');
    if (collapseBtn && sidebar) {
      collapseBtn.addEventListener('click', function() { sidebar.classList.toggle('collapsed'); });
    }

    // Mobile hamburger
    var hamburger = document.getElementById('hamburgerBtn');
    var overlay = document.getElementById('sidebarOverlay');
    function closeSidebar() { if (sidebar) sidebar.classList.remove('mobile-open'); if (overlay) overlay.classList.remove('show'); }
    if (hamburger && overlay) {
      hamburger.addEventListener('click', function() {
        if (sidebar.classList.contains('mobile-open')) { closeSidebar(); }
        else { sidebar.classList.add('mobile-open'); overlay.classList.add('show'); }
      });
      overlay.addEventListener('click', closeSidebar);
    }

    // Dark mode
    var darkToggle = document.getElementById('darkModeToggle');
    var darkIcon = document.getElementById('darkIcon');
    function setDarkMode(on) {
      document.body.classList.toggle('dark', on);
      if (darkIcon) {
        darkIcon.innerHTML = on
          ? '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>'
          : '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>';
      }
      localStorage.setItem('theme', on ? 'dark' : 'light');
    }
    if (darkToggle) darkToggle.addEventListener('click', function() { setDarkMode(!document.body.classList.contains('dark')); });
    if (localStorage.getItem('theme') === 'dark') setDarkMode(true);

    // User dropdown
    var um = document.getElementById('userMenuBtn');
    var ud = document.getElementById('userDropdown');
    if (um && ud) {
      um.addEventListener('click', function(e) { e.stopPropagation(); ud.classList.toggle('show'); });
      document.addEventListener('click', function() { ud.classList.remove('show'); });
    }

    // Name sync from localStorage
    var savedName = localStorage.getItem('userName');
    if (savedName) {
      var un = document.getElementById('shellUserName');
      var av = document.getElementById('shellAvatar');
      if (un) un.textContent = savedName;
      if (av) av.textContent = savedName.charAt(0);
      // Also update greeting on index page
      if (isIndex) {
        var gn = document.getElementById('greetingName');
        if (gn) gn.textContent = savedName;
      }
    }

    // Badge sync
    var badgeCount = localStorage.getItem('unreadCount') || '3';
    [document.getElementById('topNotifCount'), document.getElementById('sidebarBadge')].forEach(function(el) {
      if (!el) return;
      el.textContent = badgeCount;
      el.style.display = parseInt(badgeCount) > 0 ? '' : 'none';
    });

    // Page transition animation
    document.body.style.opacity = '1';

    // Sidebar nav click → close mobile sidebar
    document.querySelectorAll('.sidebar-nav .nav-item').forEach(function(item) {
      item.addEventListener('click', function() { if (window.innerWidth <= 768) closeSidebar(); });
    });

    // Dispatch event so page-specific JS knows shell is ready
    window.dispatchEvent(new Event('shell-ready'));
  }
})();
