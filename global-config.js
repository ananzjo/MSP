/* === MSP System - Core Global Engine [V3.1 - Mapped Version] === */

const CONFIG = {
    SB_URL: "https://iowfsncjhzysomybiipk.supabase.co",
    SB_KEY: "sb_publishable_7LHRjeb5IV8XRQJcX-8Ung_lE_iIwsS",
    SYSTEM_NAME: "MSP - نظام إدارة المبيعات",
    COMPANY: "MSP | Modern Style Pack"
};

// 1. تهيئة Supabase
const supabaseClient = supabase.createClient(CONFIG.SB_URL, CONFIG.SB_KEY);

// 2. تشغيل المحرك عند تحميل أي صفحة
document.addEventListener('DOMContentLoaded', async () => {
    const isLoginPage = window.location.pathname.includes('login.html');
    
    // التحقق من الجلسة
    const user = checkAuth(isLoginPage);

    if (!isLoginPage && user) {
        injectSharedUI(user);   // بناء الواجهة (Sidebar & Header)
        initDigitalClock();     // تشغيل الساعة والنبضة
        logUserActivity(user);  // تسجيل النشاط في t98_logs
    }
});

/**
 * حماية الجلسة (Auth Guard)
 */
function checkAuth(isLoginPage) {
    const userData = localStorage.getItem('msp_user');
    const user = userData ? JSON.parse(userData) : null;

    if (!user && !isLoginPage) {
        window.location.replace('login.html');
        return null;
    }
    if (user && isLoginPage) {
        window.location.replace('dashboard.html');
        return null;
    }
    return user;
}

/**
 * بناء الواجهة المشتركة (Sidebar, Header, CSS)
 */
function injectSharedUI(user) {
    const style = document.createElement('style');
    style.textContent = `
        :root { --msp-green: #2fb45a; --msp-dark: #0a0a0a; --sidebar-w: 260px; --msp-bronze: #b08d57; }
        body { margin: 0; background: var(--msp-dark); font-family: 'Segoe UI', sans-serif; color: white; overflow-x: hidden; }
        
        .msp-sidebar { position: fixed; right: 0; top: 0; width: var(--sidebar-w); height: 100vh; 
                       background: rgba(15,15,15,0.95); backdrop-filter: blur(15px); border-left: 1px solid rgba(255,255,255,0.05);
                       z-index: 1001; transition: 0.3s ease; display: flex; flex-direction: column; }
        .msp-sidebar.closed { right: -260px; }
        
        .msp-header { position: fixed; top: 0; right: 0; left: 0; height: 65px; background: rgba(0,0,0,0.6);
                      backdrop-filter: blur(10px); display: flex; align-items: center; justify-content: space-between;
                      padding: 0 20px; z-index: 1000; border-bottom: 1px solid rgba(255,255,255,0.05); }
        
        .main-content { margin-right: var(--sidebar-w); padding: 85px 25px 25px; transition: 0.3s; min-height: 100vh; box-sizing: border-box; }
        body.sidebar-closed .main-content { margin-right: 0; }

        .clock-box { display: flex; align-items: center; gap: 12px; font-family: 'Consolas', monospace; color: var(--msp-green); }
        .pulse-led { width: 10px; height: 10px; border-radius: 50%; background: var(--msp-green); box-shadow: 0 0 10px var(--msp-green); animation: pulse-anim 1.5s infinite; }
        @keyframes pulse-anim { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.3; transform: scale(0.8); } }

        .nav-link { padding: 15px 25px; cursor: pointer; display: flex; align-items: center; gap: 12px; transition: 0.2s; color: #aaa; text-decoration: none; }
        .nav-link:hover { background: rgba(47, 180, 90, 0.1); color: white; }
        .nav-link.active { color: var(--msp-green); background: rgba(47, 180, 90, 0.05); border-right: 4px solid var(--msp-green); }
        .menu-toggle { background: none; border: none; color: white; font-size: 24px; cursor: pointer; padding: 5px; }
    `;
    document.head.appendChild(style);

    const sidebar = document.createElement('aside');
    sidebar.id = 'sidebar';
    sidebar.className = 'msp-sidebar';
    sidebar.innerHTML = `
        <div style="padding: 30px 20px; text-align: center;">
            <img src="MSP_Logo.jpeg" style="width: 80px; border-radius: 15px; margin-bottom: 10px; box-shadow: 0 10px 20px rgba(0,0,0,0.3);">
            <div style="color: var(--msp-bronze); font-weight: bold; letter-spacing: 1px;">MSP SYSTEM</div>
        </div>
        <nav style="flex-grow: 1;">
            <a href="dashboard.html" class="nav-link ${window.location.pathname.includes('dashboard')?'active':''}"><span>📊</span> لوحة التحكم</a>
            <a href="visits.html" class="nav-link ${window.location.pathname.includes('visits')?'active':''}"><span>📝</span> إدارة الزيارات</a>
            <a href="#" class="nav-link"><span>📁</span> التقارير الذكية</a>
            <a href="#" class="nav-link"><span>⚙️</span> الإعدادات</a>
        </nav>
        <div class="nav-link" style="color: #ff4d4d; border-top: 1px solid rgba(255,255,255,0.05); margin-bottom: 10px;" onclick="logout()">
            <span>🚪</span> تسجيل الخروج
        </div>
    `;
    document.body.appendChild(sidebar);

    const header = document.createElement('header');
    header.className = 'msp-header';
    header.innerHTML = `
        <div style="display: flex; align-items: center; gap: 15px;">
            <button class="menu-toggle" onclick="toggleSidebar()">☰</button>
            <span style="font-weight: bold; color: var(--msp-bronze); display: none; @media(min-width:768px){display:block;}">${CONFIG.SYSTEM_NAME}</span>
        </div>
        <div class="clock-box">
            <div id="connPulse" class="pulse-led"></div>
            <span id="digitalClock" style="font-size: 1.3rem;">00:00:00</span>
        </div>
        <div style="display: flex; align-items: center; gap: 10px;">
            <div style="text-align: left;">
                <div style="font-size: 0.85rem; font-weight: bold;">${user.f_full_name}</div>
                <div style="font-size: 0.7rem; color: #888; text-align: right;">متصل الآن</div>
            </div>
            <div style="width: 35px; height: 35px; background: var(--msp-green); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold;">
                ${user.f_username.charAt(0).toUpperCase()}
            </div>
        </div>
    `;
    document.body.prepend(header);
}

/**
 * تشغيل الساعة الرقمية ومراقبة الاتصال
 */
function initDigitalClock() {
    setInterval(() => {
        const el = document.getElementById('digitalClock');
        if (el) el.textContent = new Date().toLocaleTimeString('en-GB');
    }, 1000);
    
    // فحص الاتصال: تم تعديل الاستعلام ليناسب حقل f00_record_no لجدول t02_lists
    setInterval(async () => {
        const pulse = document.getElementById('connPulse');
        if (!pulse) return;
        try {
            const { error } = await supabaseClient.from('t02_lists').select('f00_record_no').limit(1);
            pulse.style.background = error ? "#ff4d4d" : "#2fb45a";
            pulse.style.boxShadow = error ? "0 0 10px #ff4d4d" : "0 0 10px #2fb45a";
        } catch (e) { 
            pulse.style.background = "#ff4d4d"; 
        }
    }, 30000);
}

/**
 * تسجيل نشاط المستخدم في جدول t98_logs
 */
async function logUserActivity(user) {
    if (sessionStorage.getItem('msp_session_logged')) return;

    const logData = {
        f_user_id: user.id || user.f_record_no,
        f_username: user.f_username,
        f_full_name: user.f_full_name,
        f_action: "دخول للنظام",
        f_page_url: window.location.pathname,
        f_user_agent: navigator.userAgent
    };

    try {
        await supabaseClient.from('t98_logs').insert([logData]);
        sessionStorage.setItem('msp_session_logged', 'true');
    } catch (err) { console.error("Session Log Error:", err); }
}

/**
 * وظائف التحكم العامة
 */
window.toggleSidebar = () => {
    const sb = document.getElementById('sidebar');
    document.body.classList.toggle('sidebar-closed');
    sb.classList.toggle('closed');
};

function logout() {
    localStorage.removeItem('msp_user');
    sessionStorage.clear();
    window.location.replace('login.html');
}

function showNotification(msg, type = 'success') {
    if (typeof showMspModal === 'function') {
        showMspModal(type === 'success'?'تمت العملية':'خطأ', msg, type);
    } else {
        alert(msg);
    }
}
