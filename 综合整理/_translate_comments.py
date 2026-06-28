import re, os

tr = [
    # HTML structure
    (r'<!-- ====== TOP NAVIGATION BAR ====== -->', '<!-- ====== 顶部导航栏 ====== -->'),
    (r'<!-- ====== SIDEBAR NAVIGATION ====== -->', '<!-- ====== 侧边栏导航 ====== -->'),
    (r'<!-- Sidebar overlay for mobile -->', '<!-- 移动端侧边栏遮罩 -->'),
    (r'<!-- ====== MAIN CONTENT AREA ====== -->', '<!-- ====== 主内容区域 ====== -->'),
    (r'<!-- ====== RIGHT PANEL ====== -->', '<!-- ====== 右侧面板 ====== -->'),
    # HTML inline
    (r'<!-- Payment history table:.*?-->', '<!-- 缴费记录表：学期、项目、金额、日期、状态、发票下载 -->'),
    (r'<!-- Payment summary:.*?-->', '<!-- 缴费汇总：待缴、已缴、预估、状态 -->'),
    (r'<!-- Fee charts:.*?-->', '<!-- 费用图表：饼图(构成)+柱状图(趋势) -->'),
    (r'<!-- File cards:.*?-->', '<!-- 文件卡片：图标+名称+元数据+下载按钮 -->'),
    (r'<!-- Settings:.*?-->', '<!-- 设置分区：外观、通知、账户、关于 -->'),
    (r'<!-- Profile header:.*?-->', '<!-- 个人信息头部：头像+姓名+学号+编辑按钮 -->'),
    (r'<!-- Info sections:.*?-->', '<!-- 信息分区：基本信息、学籍信息、联系方式 -->'),
    (r'<!-- Course tables:.*?-->', '<!-- 课程表格：通识必修+专业必修，含状态标识 -->'),
    (r'<!-- Progress sidebar:.*?-->', '<!-- 进度侧栏：学分达成+毕业审核 -->'),
    (r'<!-- Exam cards:.*?-->', '<!-- 考试卡片：日期块+内容+状态徽章+倒计时 -->'),
    # JS general
    (r'// ==== BADGE PERSISTENCE.*?====', '// ==== 未读徽章持久化：从localStorage同步未读数 ===='),
    (r'// ==== USER DROPDOWN:.*?====', '// ==== 用户下拉菜单：点击切换，外部点击关闭 ===='),
    (r'// ==== SIDEBAR INIT:.*?====', '// ==== 侧边栏初始化：折叠切换+移动端汉堡菜单+暗黑模式 ===='),
    (r'// ==== DARK MODE: CSS Variables.*?====', '// ==== 暗黑模式：CSS变量切换+localStorage持久化 ===='),
    (r'// ==== RESIZE:.*?====', '// ==== 窗口缩放：防抖处理ECharts图表自适应 ===='),
    (r'// ==== PAGE INIT:.*?====', '// ==== 页面初始化：恢复状态+渲染所有组件 ===='),
    (r'// ==== DYNAMIC GREETING:.*?====', '// ==== 时段问候：根据时间自动切换emoji和文字(6个时段) ===='),
    (r'// ==== DYNAMIC DATE \+ WEEK.*?====', '// ==== 动态日期+周次+问候：全部由new Date()实时计算 ===='),
    (r'// ==== NOTIF SYNC:.*?====', '// ==== 通知红点同步：读取localStorage的已读ID，控制红点显隐 ===='),
    # index specific
    (r'// ==== ECHART: Credit.*?====', '// ==== ECharts学分环形图：中心文字显示达成百分比 ===='),
    (r'// ==== ECHART: GPA.*?====', '// ==== ECharts GPA趋势图：折线面积图+班级均值对比 ===='),
    (r'// ==== ECHART: Academic.*?====', '// ==== ECharts学业健康仪表盘：红黄绿三色分区 ===='),
    (r'// ==== HOME SCHEDULE:.*?====', '// ==== 首页今日课表：根据真实日期和周次动态渲染当天课程 ===='),
    (r'// ==== HOME EXAM:.*?====', '// ==== 首页考试卡片：查找最近一场未考考试并渲染倒计时 ===='),
    (r'// ==== MINI CALENDAR: renders.*?====', '// ==== 迷你月历：渲染当前月份网格，标记今天和考试日期 ===='),
    (r'// ==== EXAM CARD: reads.*?====', '// ==== 考试卡片：从localStorage读取examData，显示下一场考试 ===='),
    # schedule
    (r'// ==== WEEK GRID:.*?====', '// ==== 周视图网格：渲染7列课程网格，含今日高亮和状态色标 ===='),
    (r'// ==== DAY VIEW:.*?====', '// ==== 日视图：渲染单日或三日课程列表，适配移动端 ===='),
    (r'// ==== COURSE DETAIL:.*?====', '// ==== 课程详情：点击课程块后在右侧面板展示详细信息 ===='),
    (r'// ==== UPDATE VIEW:.*?====', '// ==== 更新视图：根据当前周次和视图模式重新渲染 ===='),
    (r'// ==== MINI CALENDAR: dynamic.*?====', '// ==== 迷你月历：动态当前月份，标记今天 ===='),
    # course-selection
    (r'// ==== PERSIST: saves.*?====', '// ==== 持久化：保存购物车+已提交ID+余量+已选课程到localStorage ===='),
    (r'// ==== RESTORE: reads.*?====', '// ==== 状态恢复：页面加载时从localStorage恢复所有选课状态 ===='),
    (r'// ==== ADD TO CART:.*?====', '// ==== 加入购物车：验证(最多4门+冲突检查)，推入数组，持久化 ===='),
    (r'// ==== REMOVE FROM CART:.*?====', '// ==== 移出购物车：从数组中过滤掉该课程，持久化 ===='),
    (r'// ==== SUBMIT CART:.*?====', '// ==== 提交购物车：模拟80%成功率，扣减余量，保存已选课程 ===='),
    (r'// ==== UNDO SUBMIT:.*?====', '// ==== 撤销提交：恢复余量，将已提交课程退回购物车 ===='),
    (r'// ==== RENDER COURSES:.*?====', '// ==== 渲染课程卡片：筛选+排序+渲染，含购物车/已选/冲突状态 ===='),
    (r'// ==== RENDER CART:.*?====', '// ==== 渲染购物车面板：更新列表+冲突提示+撤销按钮 ===='),
    (r'// ==== CONFLICT CHECK:.*?====', '// ==== 冲突检测：检查课程与购物车中已有课程的时间重叠 ===='),
    (r'// ==== COUNTDOWN:.*?====', '// ==== 选课倒计时：更新截止时间，不足1小时红色脉冲 ===='),
    # notifications
    (r'// ==== RENDER NOTIFS:.*?====', '// ==== 渲染通知列表：分类+搜索过滤，置顶排序，含已读/置顶状态 ===='),
    (r'// ==== TOGGLE PIN:.*?====', '// ==== 切换置顶：置顶/取消置顶(稍后再读)，已读则恢复未读 ===='),
    (r'// ==== SORT: pinned.*?====', '// ==== 排序：置顶项排最前，其余按原始ID顺序 ===='),
    (r'// ==== RELATIVE TIME:.*?====', '// ==== 相对时间：将offsetH转为可读的中文时间字符串 ===='),
    (r'// ==== LOAD PINNED:.*?====', '// ==== 加载置顶：从localStorage恢复置顶通知ID ===='),
    (r'// ==== SAVE PINNED:.*?====', '// ==== 保存置顶：持久化置顶通知ID到localStorage ===='),
    # other pages
    (r'// ==== RENDER SEMESTER:.*?====', '// ==== 渲染学期数据：填充统计卡片+考试列表+即将到来列表 ===='),
    (r'// ==== RENDER CHARTS: initializes.*?====', '// ==== 渲染图表(GPA)：初始化GPA趋势+学科雷达+学分进度环 ===='),
    (r'// ==== RENDER CHARTS: ECharts credit.*?====', '// ==== 渲染图表(学分)：学分饼图+学期柱状图 ===='),
    (r'// ==== FEE CHARTS:.*?====', '// ==== 费用图表：饼图(学费/住宿/教材)+柱状图(5学期趋势) ===='),
    (r'// ==== RENDER RESOURCES:.*?====', '// ==== 渲染资源列表：课程+类型筛选，渲染文件卡片含下载按钮 ===='),
    (r'// ==== RENDER EVALUATIONS:.*?====', '// ==== 渲染评价卡片：待评/已评卡片，含星级评分交互 ===='),
    (r'// ==== SAVE EVAL:.*?====', '// ==== 保存评价状态：持久化已评和待评ID ===='),
    (r'// ==== RESTORE EVAL:.*?====', '// ==== 恢复评价状态：页面加载时读取已评/待评状态 ===='),
    (r'// ==== SET DARK MODE:.*?====', '// ==== 暗黑模式设置：切换body.dark类+更新图标+持久化 ===='),
    (r'// ==== EDIT MODE:.*?====', '// ==== 编辑模式：切换展示/输入字段，同步姓名到头像+顶栏+localStorage ===='),
    (r'// ==== NAME RESTORE:.*?====', '// ==== 姓名恢复：从localStorage读取userName，更新所有姓名显示 ===='),
    (r'// ==== GET STATUS:.*?====', '// ==== 状态判断：比较考试日期和当前时间，返回已结束/进行中/待考试 ===='),
    (r'// ==== RENDER CALENDAR:.*?====', '// ==== 渲染月历：动态当前月份，标记考试日期 ===='),
    (r'// ==== ICON MAP:.*?====', '// ==== 图标映射：将文件类型映射到CSS类名实现颜色编码 ===='),
    (r'// ==== AUTO COLLAPSE:.*?====', '// ==== 自动折叠：从localStorage读取偏好，页面加载时应用 ===='),
    # inline
    (r'// Homepage course data:.*', '// 首页课程数据：名称、教师、教室、星期(周一=1..周日=7)、起止时间、周次范围'),
    (r'// Compute current teaching week.*', '// 基于基准日(6月22日=第17周周一)计算当前教学周'),
    (r'// Merge courses submitted from.*', '// 合并选课页提交的课程(通过localStorage的submittedCourseData)'),
    (r'// Convert current time to decimal.*', '// 将当前时间转为小数小时，用于课程状态判断'),
    (r'// Convert JS getDay.*', '// 将JS的getDay()(周日=0)转换为周一=1..周日=7'),
    (r'// ===== STATE =====', '// ===== 状态变量 ====='),
    (r'// Courses in shopping cart', '// 购物车中的课程'),
    (r'// Successfully submitted course IDs.*', '// 已成功提交的课程ID(用于撤销+已选显示)'),
    (r'// Available courses:.*', '// 可选课程：12门课，含星期、节次、余量、周次范围(16-20周)'),
    (r'// Update filter tab counts.*', '// 更新分类标签计数(全部12、教务3等)'),
    (r'// Sync unread count.*', '// 同步未读数+每条已读状态到localStorage'),
    (r'// 12 notifications with.*', '// 12条通知：含分类、offsetH(距现在小时数)、发布机构、已读状态'),
    (r'// Set of pinned.*', '// 置顶(稍后再读)通知ID集合，持久化到localStorage'),
    (r'// On page load, restore.*', '// 页面加载时从localStorage的readNotifIds恢复每条已读状态'),
    (r'// ===== DYNAMIC WEEK.*', '// ===== 动态周次/日历计算 ====='),
    (r'// ===== MERGE: add courses.*', '// ===== 合并选课数据：从localStorage读取已选课程加入课表 ====='),
    (r'// ===== HINT: notify user.*', '// ===== 提示用户：检测到选课页提交的课程 ====='),
    (r'// Current semester exams:.*', '// 本学期考试：CET-6(6月14日已结束)+5场周末考试'),
]

for fname in os.listdir('.'):
    if not fname.endswith('.html'): continue
    with open(fname, 'r', encoding='utf-8') as f:
        content = f.read()
    changed = False
    for old, new in tr:
        result = re.sub(old, new, content)
        if result != content:
            content = result
            changed = True
    if changed:
        with open(fname, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f'{fname}: OK')
    else:
        print(f'{fname}: (no change)')
print('All done')
