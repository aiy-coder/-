/* _shared.js — 底部导航栏 + 全局搜索 + 公用功能 */

(function() {
  // Determine active page from URL
  var page = location.pathname.split('/').pop().replace('.html','') || 'index';
  var isIndex = (page === 'index');

  // ===== 1. MOBILE BOTTOM TAB BAR =====
  var tabs = [
    { key:'index',     label:'首页', icon:'<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>' },
    { key:'schedule',  label:'课表', icon:'<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>' },
    { key:'grades',    label:'成绩', icon:'<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>' },
    { key:'course-selection', label:'选课', icon:'<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>' },
    { key:'personal',  label:'我的', icon:'<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>' }
  ];

  var tabHTML = '<nav class="mobile-tabs" id="mobileTabs">';
  tabs.forEach(function(t) {
    tabHTML += '<a href="' + t.key + '.html" class="mobile-tab' + (page === t.key ? ' active' : '') + '">';
    tabHTML += '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="' + (page === t.key ? 'currentColor' : 'none') + '" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">' + t.icon + '</svg>';
    tabHTML += '<span>' + t.label + '</span></a>';
  });
  tabHTML += '</nav>';
  document.body.insertAdjacentHTML('beforeend', tabHTML);

  // ===== 2. GLOBAL SEARCH =====
  var SEARCH_DATA = [
    { type:'page', title:'首页仪表盘', sub:'查看今日课表与学业概览', url:'index.html' },
    { type:'page', title:'课表', sub:'查看每周课程安排', url:'schedule.html' },
    { type:'page', title:'选课中心', sub:'浏览并选择课程', url:'course-selection.html' },
    { type:'page', title:'成绩查询', sub:'查看学期成绩与GPA', url:'grades.html' },
    { type:'page', title:'校园通知', sub:'查看教务通知', url:'notifications.html' },
    { type:'page', title:'考试安排', sub:'查看考试时间与地点', url:'exams.html' },
    { type:'page', title:'培养方案', sub:'查看专业培养计划', url:'training.html' },
    { type:'page', title:'缴费查询', sub:'查看学费缴纳记录', url:'payment.html' },
    { type:'page', title:'教学资源', sub:'下载课件与资料', url:'resources.html' },
    { type:'page', title:'教学评价', sub:'完成课程评教', url:'evaluation.html' },
    { type:'page', title:'设置', sub:'管理账户偏好', url:'settings.html' },
    { type:'page', title:'个人信息', sub:'查看与编辑个人资料', url:'personal.html' },
    { type:'course', title:'数据结构', sub:'李建国 教授 · 4学分', url:'schedule.html' },
    { type:'course', title:'高等数学', sub:'陈明 副教授 · 5学分', url:'schedule.html' },
    { type:'course', title:'Python编程', sub:'赵强 讲师 · 3学分', url:'schedule.html' },
    { type:'course', title:'大学英语', sub:'王芳 副教授 · 3学分', url:'schedule.html' },
    { type:'course', title:'算法设计与分析', sub:'李建国 教授 · 4学分', url:'course-selection.html' },
    { type:'course', title:'机器学习导论', sub:'赵强 讲师 · 3学分', url:'course-selection.html' },
    { type:'notif', title:'端午节放假及调课通知', sub:'教务 · 2小时前', url:'notifications.html' },
    { type:'notif', title:'期末考试安排通知', sub:'考试 · 5小时前', url:'notifications.html' },
    { type:'notif', title:'期末课程评教已开放', sub:'评教 · 昨天', url:'notifications.html' },
  ];

  var overlayHTML = '<div class="search-overlay" id="searchOverlay"><div class="search-dropdown"><input type="text" id="searchOverlayInput" placeholder="搜索功能、课程、通知…"><div class="search-results" id="searchResults"><div class="search-empty">输入关键词开始搜索</div></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', overlayHTML);

  var overlay = document.getElementById('searchOverlay');
  var searchInput = document.getElementById('searchOverlayInput');
  var resultsDiv = document.getElementById('searchResults');

  function doSearch(q) {
    q = q.toLowerCase().trim();
    if (!q) { resultsDiv.innerHTML = '<div class="search-empty">输入关键词开始搜索</div>'; return; }
    var matches = SEARCH_DATA.filter(function(item) {
      return item.title.toLowerCase().indexOf(q) !== -1 || item.sub.toLowerCase().indexOf(q) !== -1;
    });
    if (matches.length === 0) {
      resultsDiv.innerHTML = '<div class="search-empty">未找到匹配结果</div>';
    } else {
      resultsDiv.innerHTML = matches.map(function(m) {
        var iconEmoji = m.type === 'page' ? '📄' : m.type === 'course' ? '📖' : '🔔';
        var iconClass = 'sr-icon--' + m.type;
        return '<a href="' + m.url + '" class="search-result-item"><div class="sr-icon ' + iconClass + '">' + iconEmoji + '</div><div><div class="sr-title">' + m.title + '</div><div class="sr-sub">' + m.sub + '</div></div></a>';
      }).join('');
    }
  }

  // Open search on Ctrl+K or clicking topbar search
  document.addEventListener('keydown', function(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); overlay.classList.add('show'); setTimeout(function(){ searchInput.focus(); }, 100); }
    if (e.key === 'Escape') { overlay.classList.remove('show'); }
  });
  overlay.addEventListener('click', function(e) { if (e.target === overlay) overlay.classList.remove('show'); });
  searchInput.addEventListener('input', function() { doSearch(this.value); });

  // Hook into topbar search box if it exists
  var topSearch = document.querySelector('.topbar-search input, #globalSearch');
  if (topSearch) {
    topSearch.addEventListener('focus', function() { overlay.classList.add('show'); searchInput.focus(); });
    topSearch.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') overlay.classList.remove('show');
    });
    topSearch.addEventListener('input', function() { searchInput.value = this.value; doSearch(this.value); });
  }

  // ===== 3. SKELETON AUTO-REMOVAL =====
  // Any .skeleton elements are automatically hidden once charts render
  window.addEventListener('shell-ready', function() {
    setTimeout(function() {
      document.querySelectorAll('.skeleton').forEach(function(el) { el.style.display = 'none'; });
    }, 2000);
  });

})();
