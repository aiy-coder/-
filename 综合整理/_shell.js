/* _shell.js — 公共外壳加载器，所有页面引用这一个文件 */
/* 职责：fetch _shell.html 模板 → 替换占位符 → 注入 DOM → 初始化共享交互 */

(function() {                                          // 用 IIFE（立即执行函数）包裹，避免变量污染全局作用域
  var activePage = document.documentElement.getAttribute('data-shell') || 'index';  // 从 <html data-shell="schedule"> 读取当前页面名，默认 index
  var breadcrumb = document.documentElement.getAttribute('data-breadcrumb') || '首页'; // 从 <html data-breadcrumb="首页 / 课表"> 读取面包屑路径

  var isIndex = (activePage === 'index');              // 判断是否为首页（首页的问候语需要特殊处理）

  fetch('_shell.html')                                 // 第一步：发起网络请求，拉取 _shell.html 模板文件
    .then(function(r) { return r.text(); })            // 第二步：将 Response 对象转为纯文本字符串
    .then(function(html) {                             // 第三步：拿到模板 HTML 字符串，开始处理占位符

      html = html.replace(                             // 第四步：正则替换 {{ACTIVE:page}} 占位符
        /\{\{ACTIVE:(\w[-\w]*)\}\}/g,                  // 匹配 {{ACTIVE:xxx}} 格式的占位符
        function(m, page) {                            // m=完整匹配, page=捕获的页面名
          return page === activePage ? ' active' : ''; // 如果当前页匹配 → 替换为 " active"（高亮）；否则 → 替换为空
        }
      );

      html = html.replace(/\{\{ACTIVE\}\}/g, '');      // 第五步：兜底清理任何未被匹配的 {{ACTIVE}}（防止残留）

      var badgeCount = localStorage.getItem('unreadCount') || '3'; // 第六步：从 localStorage 读取未读通知数，默认 3
      html = html.replace(/\{\{BADGE\}\}/g, badgeCount);           // 将模板中所有 {{BADGE}} 替换为实际数字

      html = html.replace(/\{\{BREADCRUMB\}\}/g, breadcrumb);      // 第七步：将 {{BREADCRUMB}} 替换为当前页的面包屑路径

      var shell = document.getElementById('app-shell');             // 第八步：找到页面中的外壳占位容器 <div id="app-shell">
      if (shell) {                                                 // 如果容器存在
        shell.innerHTML = html;                                    // 将处理好的外壳 HTML 注入到页面中
      }

      initShared();                                                // 第九步：初始化所有页面共享的交互功能（暗黑模式、侧边栏等）
    });

  /* ====== 初始化所有页面共享的交互功能 ====== */
  function initShared() {

    /* --- 侧边栏折叠/展开 --- */
    var sidebar = document.getElementById('sidebar');              // 获取侧边栏 DOM 元素
    var collapseBtn = document.getElementById('collapseBtn');      // 获取折叠按钮 DOM 元素
    if (collapseBtn && sidebar) {                                  // 如果两个元素都存在
      collapseBtn.addEventListener('click', function() {           // 监听折叠按钮的点击事件
        sidebar.classList.toggle('collapsed');                     // 切换 collapsed 类，触发 CSS 过渡动画（宽度 240px→64px）
      });
    }

    /* --- 移动端汉堡菜单 + 遮罩层 --- */
    var hamburger = document.getElementById('hamburgerBtn');       // 获取汉堡菜单按钮
    var overlay = document.getElementById('sidebarOverlay');       // 获取遮罩层元素
    function closeSidebar() {                                      // 定义关闭侧边栏的通用函数（多处复用）
      if (sidebar) sidebar.classList.remove('mobile-open');        // 移除侧边栏的 mobile-open 类（滑回屏幕外）
      if (overlay) overlay.classList.remove('show');               // 隐藏遮罩层
    }
    if (hamburger && overlay) {                                    // 确保两个元素都存在
      hamburger.addEventListener('click', function() {             // 监听汉堡按钮点击
        if (sidebar.classList.contains('mobile-open')) {           // 如果侧边栏当前是打开状态
          closeSidebar();                                          // → 关闭它
        } else {                                                   // 如果侧边栏当前是关闭状态
          sidebar.classList.add('mobile-open');                    // → 打开侧边栏（transform: translateX(0)）
          overlay.classList.add('show');                           // → 显示遮罩层
        }
      });
      overlay.addEventListener('click', closeSidebar);             // 点击遮罩层 → 关闭侧边栏
    }

    /* --- 暗黑模式切换 --- */
    var darkToggle = document.getElementById('darkModeToggle');    // 获取暗黑模式切换按钮
    var darkIcon = document.getElementById('darkIcon');            // 获取按钮内的 SVG 图标元素
    function setDarkMode(on) {                                     // 定义暗黑模式切换函数，参数 on=true 开启暗黑
      document.body.classList.toggle('dark', on);                  // 给 body 添加/移除 dark 类，触发 CSS Variables 全局变色
      if (darkIcon) {                                              // 如果图标元素存在
        darkIcon.innerHTML = on                                    // 根据状态切换图标：暗黑模式 → 太阳图标（提示可切回）
          ? '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>'
          : '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>'; // 亮色模式 → 月亮图标（提示可切暗黑）
      }
      localStorage.setItem('theme', on ? 'dark' : 'light');       // 将暗黑模式偏好存入 localStorage，跨页面持久化
    }
    if (darkToggle) darkToggle.addEventListener('click', function() { // 监听暗黑模式按钮的点击事件
      setDarkMode(!document.body.classList.contains('dark'));      // 切换当前状态（开→关，关→开）
    });
    if (localStorage.getItem('theme') === 'dark') setDarkMode(true); // 页面加载时检查 localStorage，如果之前选了暗黑 → 自动应用

    /* --- 右上角用户下拉菜单 --- */
    var um = document.getElementById('userMenuBtn');               // 获取用户名按钮（"李小宇"）
    var ud = document.getElementById('userDropdown');              // 获取下拉菜单面板
    if (um && ud) {                                                // 两个元素都存在才绑定
      um.addEventListener('click', function(e) {                   // 监听用户名按钮的点击事件
        e.stopPropagation();                                       // 阻止事件冒泡到 document（否则会立即触发下方的关闭逻辑）
        ud.classList.toggle('show');                               // 切换 show 类，控制下拉菜单的显隐（CSS: opacity/visibility/transform）
      });
      document.addEventListener('click', function() {              // 监听整个文档的点击事件
        ud.classList.remove('show');                               // 点击页面任何位置 → 关闭下拉菜单
      });
    }

    /* --- 用户姓名同步：从 localStorage 读取 → 更新顶栏显示 --- */
    var savedName = localStorage.getItem('userName');              // 读取在个人信息页保存的用户姓名
    if (savedName) {                                               // 如果有保存的姓名（不是 null）
      var un = document.getElementById('shellUserName');           // 获取顶栏姓名 span 元素
      var av = document.getElementById('shellAvatar');             // 获取顶栏头像 div 元素
      if (un) un.textContent = savedName;                          // 更新顶栏姓名文字
      if (av) av.textContent = savedName.charAt(0);                // 更新头像为首字（如"张"）
      if (isIndex) {                                               // 如果是首页
        var gn = document.getElementById('greetingName');          // 获取首页问候语中的姓名 span
        if (gn) gn.textContent = savedName;                        // 更新问候语（"👋 下午好，张XX"）
      }
    }

    /* --- 未读 Badge 同步：从 localStorage 读取 → 更新顶栏铃铛和侧边栏红点 --- */
    var badgeCount = localStorage.getItem('unreadCount') || '3';   // 读取未读通知数，没有则默认 3
    [document.getElementById('topNotifCount'),                     // 顶栏铃铛红点
     document.getElementById('sidebarBadge')]                      // 侧边栏"校园通知"红点
    .forEach(function(el) {                                        // 遍历两个 Badge 元素
      if (!el) return;                                             // 如果元素不存在（如登录页），跳过
      el.textContent = badgeCount;                                 // 更新 Badge 显示的数字
      el.style.display = parseInt(badgeCount) > 0 ? '' : 'none';   // 未读数为 0 时隐藏 Badge，大于 0 时显示
    });

    /* --- 页面过渡动画 --- */
    document.body.style.opacity = '1';                             // 配合 CSS 的 animation: pageIn，触发淡入上浮效果

    /* --- 移动端：点击侧边栏菜单项后自动关闭侧边栏 --- */
    document.querySelectorAll('.sidebar-nav .nav-item')            // 选中侧边栏所有菜单项
      .forEach(function(item) {                                    // 遍历每个菜单项
        item.addEventListener('click', function() {                // 监听点击事件
          if (window.innerWidth <= 768) closeSidebar();            // 仅在移动端宽度（≤768px）下关闭侧边栏
        });
      });

    /* --- 派发外壳就绪事件，通知其他脚本（如 _shared.js）可以开始工作 --- */
    window.dispatchEvent(new Event('shell-ready'));                // _shared.js 监听此事件来启动骨架屏 2 秒兜底隐藏
  }
})();
