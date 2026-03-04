/* === MSP System - Core Global Engine === */

const CONFIG = {
    SB_URL: "https://iowfsncjhzysomybiipk.supabase.co",
    SB_KEY: "sb_publishable_7LHRjeb5IV8XRQJcX-8Ung_lE_iIwsS",
    SYSTEM_NAME: "MSP - نظام إدارة المبيعات",
    VERSION: "2.0.1"
};

const supabaseClient = supabase.createClient(CONFIG.SB_URL, CONFIG.SB_KEY);

// 1. تشغيل المحرك عند تحميل أي صفحة
document.addEventListener('DOMContentLoaded', async () => {
    checkAuth();           // التأكد من الهوية
    injectSharedUI();      // بناء المنيو والهيدر تلقائياً
    initClock();           // تشغيل الساعة والنبض
    logUserActivity();     // تسجيل الدخول في قاعدة البيانات
});

/**
 * 2. حماية الجلسة والتحقق من المستخدم
 */
function checkAuth() {
    const user = JSON.parse(localStorage.getItem('msp_user'));
    const isLoginPage = window.location.pathname.includes('login.html');

    if (!user && !isLoginPage) {
        window.location.replace('login.html');
    } else if (user && isLoginPage) {
        window.location.replace('dashboard.html');
    }
}

/**
 * 3. بناء واجهة المستخدم المشتركة (Sidebar & Header)
 */
function injectSharedUI() {
    if (window.location.pathname.includes('login.html')) return;

    // حقن كود CSS الموحد
    const style = document.createElement('style');
    style.textContent = `
        :root { --msp-green: #2fb45a; --msp-dark: #121212; --sidebar-w: 260px; }
        body { margin: 0; background: #0a0a0a; color: white; transition: 0.3s; }
        .main-content { margin-right: var(--sidebar-w); padding: 80px 20px 20px; transition: 0.3s; }
        .sidebar.closed ~ .main-content { margin-right: 0; }
        
        /* Sidebar Styling */
        .msp-sidebar { position: fixed; right: 0; top: 0; width: var(--sidebar-w); height: 100vh; 
                       background: rgba(15,15,15,0.9); backdrop-filter: blur(15px); border-left: 1px solid rgba(255,255,255,0.05);
                       z-index: 1000; transition: 0.3s ease; display: flex; flex-direction: column; }
        .msp-sidebar.closed { right: calc(-1 * var(--sidebar-w)); }
        
        /* Header & Digital Clock */
        .msp-header { position: fixed; top: 0; right: 0; left: 0; height: 60px; background: rgba(0,0,0,0.5);
                      backdrop-filter: blur(10px); display: flex; align-items: center; justify-content: space-between;
                      padding: 0 20px; z-index: 999; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .digital-box { display: flex; align-items: center; gap: 10px; font-family: 'Courier New', monospace; color: var(--msp-green); }
        .pulse { width: 10px; height: 10px; border-radius: 50%; background: var(--msp-green); box-shadow: 0 0 10px var(--msp-green); animation: pulse 1.5s infinite; }
        @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.3; } 100% { opacity: 1; } }
        
        .nav-link { padding: 15px 25px; cursor: pointer; display: flex; align-items: center; gap: 12px; transition: 0.3s; color: #ccc; }
        .nav-link:hover { background: rgba(47, 180, 90, 0.1); color: white; }
        .nav-link.active { color: var(--msp-green); border-right: 4px solid var(--msp-green); background: rgba(47, 180, 90, 0.05); }
    `;
    document.head.appendChild(style);

    // بناء الـ Sidebar
    const sidebar = document.createElement('aside');
    sidebar.id = 'sidebar';
    sidebar.className = 'msp-sidebar';
    sidebar.innerHTML = `
        <div style="padding: 20px; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.05);">
            <img src="MSP_Logo.jpeg" style="width: 60px; border-radius: 10px;">
            <h4 style="margin: 10px 0 0; color: #b08d57;">MSP System</h4>
        </div>
        <nav style="margin-top: 20px; flex-grow: 1;">
            <div class="nav-link" onclick="location.href='dashboard.html'"><span>📊</span> الإحصائيات</div>
            <div class="nav-link" onclick="location.href='visits.html'"><span>📝</span> الزيارات</div>
            <div class="nav-link"><span>📁</span> التقارير</div>
        </nav>
        <div class="nav-link" style="color: #ff4d4d; border-top: 1px solid rgba(255,255,255,0.05);" onclick="logout()"><span>🚪</span> خروج</div>
    `;
    document.body.appendChild(sidebar);

    // بناء الـ Header
    const header = document.createElement('header');
    header.className = 'msp-header';
    header.innerHTML = `
        <button onclick="toggleSidebar()" style="background: none; border: none; color: white; font-size: 24px; cursor: pointer;">☰</button>
        <div class="digital-box">
            <div id="connectionStatus" class="pulse"></div>
            <span id="mspClock" style="font-size: 1.2rem; font-weight: bold;">00:00:00</span>
        </div>
        <div style="font-size: 0.85rem; color: #888;">${JSON.parse(localStorage.getItem('msp_user')).f_full_name}</div>
    `;
    document.body.prepend(header);
}

/**
 * 4. تشغيل الساعة ومراقبة الاتصال
 */
function initClock() {
    setInterval(() => {
        const clock = document.getElementById('mspClock');
        if (clock) clock.textContent = new Date().toLocaleTimeString('en-GB');
    }, 1000);
}

window.toggleSidebar = () => {
    const sb = document.getElementById('sidebar');
    sb.classList.toggle('closed');
};

/**
 * 5. تسجيل نشاط المستخدم في قاعدة البيانات (Session Log)
 * سأقوم بحفظ الدخول في جدول t98_logs
 */
async function logUserActivity() {
    const user = JSON.parse(localStorage.getItem('msp_user'));
    if (!user) return;

    // تسجيل الدخول مرة واحدة فقط لكل جلسة
    if (sessionStorage.getItem('logged_this_session')) return;

    await supabaseClient.from('t98_logs').insert([{
        f_user_id: user.id,
        f_username: user.f_username,
        f_action: 'Page View: ' + window.location.pathname,
        f_timestamp: new Date().toISOString()
    }]);
    
    sessionStorage.setItem('logged_this_session', 'true');
}

function logout() {
    localStorage.removeItem('msp_user');
    window.location.replace('login.html');
}
