/* _shared.js — 底部导航栏 + 全局搜索 + 骨架屏兜底，所有页面引用这一个文件 */
/* 职责：注入移动端 TabBar → 全局搜索浮层 → 骨架屏自动隐藏 */

(function() {
  // 从当前 URL 中提取页面名，用于判断哪个 Tab 高亮
  var page = location.pathname.split('/').pop().replace('.html','') || 'index'; // 例如 schedule.html → "schedule"
  var isIndex = (page === 'index');  // 是否首页

  /* ====== 一、移动端底部导航栏（仅在 ≤768px 显示） ====== */
  // 定义 5 个 Tab：key 对应文件名，label 是显示文字，icon 是 SVG 路径
  var tabs = [
    { key:'index',     label:'首页', icon:'<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>' },
    { key:'schedule',  label:'课表', icon:'<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>' },
    { key:'grades',    label:'成绩', icon:'<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>' },
    { key:'course-selection', label:'选课', icon:'<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>' },
    { key:'personal',  label:'我的', icon:'<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>' }
  ];

  // 拼接底部导航栏的 HTML 字符串
  var tabHTML = '<nav class="mobile-tabs" id="mobileTabs">'; // 外层容器
  tabs.forEach(function(t) {                                  // 遍历 5 个 Tab
    tabHTML += '<a href="' + t.key + '.html" class="mobile-tab' + (page === t.key ? ' active' : '') + '">'; // 当前页加 active 类
    tabHTML += '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="' + (page === t.key ? 'currentColor' : 'none') + '" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">' + t.icon + '</svg>'; // SVG 图标，当前页实心填充
    tabHTML += '<span>' + t.label + '</span></a>';             // 标签文字
  });
  tabHTML += '</nav>';
  // 将 TabBar HTML 追加到 body 末尾（不影响原有结构）
  document.body.insertAdjacentHTML('beforeend', tabHTML);

  /* ====== 二、全局搜索浮层（Ctrl+K 唤起） ====== */
  // 搜索索引：22 条数据，分为三类——页面、课程、通知
  var SEARCH_DATA = [
    // 12 个功能页面
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
    // 6 门热门课程
    { type:'course', title:'数据结构', sub:'李建国 教授 · 4学分', url:'schedule.html' },
    { type:'course', title:'高等数学', sub:'陈明 副教授 · 5学分', url:'schedule.html' },
    { type:'course', title:'Python编程', sub:'赵强 讲师 · 3学分', url:'schedule.html' },
    { type:'course', title:'大学英语', sub:'王芳 副教授 · 3学分', url:'schedule.html' },
    { type:'course', title:'算法设计与分析', sub:'李建国 教授 · 4学分', url:'course-selection.html' },
    { type:'course', title:'机器学习导论', sub:'赵强 讲师 · 3学分', url:'course-selection.html' },
    // 4 条最新通知
    { type:'notif', title:'端午节放假及调课通知', sub:'教务 · 2小时前', url:'notifications.html' },
    { type:'notif', title:'期末考试安排通知', sub:'考试 · 5小时前', url:'notifications.html' },
    { type:'notif', title:'期末课程评教已开放', sub:'评教 · 昨天', url:'notifications.html' },
  ];

  // 构建搜索浮层的 HTML 结构并注入 body
  var overlayHTML = '<div class="search-overlay" id="searchOverlay"><div class="search-dropdown"><input type="text" id="searchOverlayInput" placeholder="搜索功能、课程、通知…"><div class="search-results" id="searchResults"><div class="search-empty">输入关键词开始搜索</div></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', overlayHTML);   // 追加到 body 末尾

  // 获取搜索浮层中的关键 DOM 元素
  var overlay = document.getElementById('searchOverlay');       // 浮层容器（含半透明遮罩）
  var searchInput = document.getElementById('searchOverlayInput'); // 搜索输入框
  var resultsDiv = document.getElementById('searchResults');    // 搜索结果列表容器

  // 核心搜索函数：根据关键词过滤 SEARCH_DATA 并渲染结果
  function doSearch(q) {
    q = q.toLowerCase().trim();                                 // 转小写 + 去首尾空格
    if (!q) {                                                   // 空输入 → 显示初始提示
      resultsDiv.innerHTML = '<div class="search-empty">输入关键词开始搜索</div>';
      return;
    }
    // 过滤：标题或副标题包含关键词
    var matches = SEARCH_DATA.filter(function(item) {
      return item.title.toLowerCase().indexOf(q) !== -1 || item.sub.toLowerCase().indexOf(q) !== -1;
    });
    if (matches.length === 0) {                                 // 无匹配 → 显示空结果提示
      resultsDiv.innerHTML = '<div class="search-empty">未找到匹配结果</div>';
    } else {
      // 有匹配 → 渲染结果列表，每条是一个可点击的链接
      resultsDiv.innerHTML = matches.map(function(m) {
        var iconEmoji = m.type === 'page' ? '📄' : m.type === 'course' ? '📖' : '🔔'; // 按类型分配 emoji 图标
        var iconClass = 'sr-icon--' + m.type;                   // 按类型分配 CSS 类（控制背景色）
        return '<a href="' + m.url + '" class="search-result-item"><div class="sr-icon ' + iconClass + '">' + iconEmoji + '</div><div><div class="sr-title">' + m.title + '</div><div class="sr-sub">' + m.sub + '</div></div></a>';
      }).join('');                                              // 数组拼接为 HTML 字符串
    }
  }

  // 键盘快捷键：Ctrl+K 打开搜索，Esc 关闭搜索
  document.addEventListener('keydown', function(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {           // Ctrl+K（Mac: Cmd+K）
      e.preventDefault();                                        // 阻止浏览器默认行为
      overlay.classList.add('show');                            // 显示搜索浮层
      setTimeout(function(){ searchInput.focus(); }, 100);      // 延迟聚焦（等浮层渲染完成）
    }
    if (e.key === 'Escape') { overlay.classList.remove('show'); } // Esc → 关闭浮层
  });
  // 点击遮罩层（输入框以外区域）关闭浮层
  overlay.addEventListener('click', function(e) { if (e.target === overlay) overlay.classList.remove('show'); });
  // 输入时实时搜索
  searchInput.addEventListener('input', function() { doSearch(this.value); });

  // 关联顶栏搜索框：如果页面有顶栏搜索框，点它也会打开浮层
  var topSearch = document.querySelector('.topbar-search input, #globalSearch'); // 查找顶栏搜索输入框
  if (topSearch) {
    topSearch.addEventListener('focus', function() {            // 顶栏搜索框获得焦点
      overlay.classList.add('show');                            // 打开浮层
      searchInput.focus();                                      // 聚焦浮层输入框
    });
    topSearch.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') overlay.classList.remove('show'); // Esc 关闭浮层
    });
    topSearch.addEventListener('input', function() {            // 顶栏输入时
      searchInput.value = this.value;                           // 同步到浮层输入框
      doSearch(this.value);                                     // 执行搜索
    });
  }

  /* ====== 三、骨架屏兜底隐藏（防止 ECharts 渲染失败导致骨架屏一直显示） ====== */
  // 监听 shell-ready 事件（由 _shell.js 派发，表示外壳加载完成）
  window.addEventListener('shell-ready', function() {
    setTimeout(function() {
      // 2 秒后强制隐藏所有骨架屏元素（此时 ECharts 应该已渲染完成）
      document.querySelectorAll('.skeleton').forEach(function(el) { el.style.display = 'none'; });
    }, 2000);
  });

})();
