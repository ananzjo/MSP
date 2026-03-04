/* === MSP System Engine V8.0 - Stability Update === */
const SB_URL = "https://iowfsncjhzysomybiipk.supabase.co";
const SB_KEY = "sb_publishable_7LHRjeb5IV8XRQJcX-8Ung_lE_iIwsS";
const supabaseClient = supabase.createClient(SB_URL, SB_KEY);

// 1. تعريف نظام الإشعارات أولاً ليكون متاحاً للكل
window.showNotification = function(title, msg, type = 'success') {
    const existing = document.getElementById('mspModal');
    if (existing) existing.remove();
    const modalHTML = `
        <div id="mspModal" style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.85); z-index:10000; display:flex; align-items:center; justify-content:center; backdrop-filter: blur(8px); direction:rtl;">
            <div style="background:#353f48; border:1px solid rgba(255,255,255,0.1); border-radius:20px; padding:30px; width:400px; text-align:center; box-shadow:0 20px 50px rgba(0,0,0,0.5);">
                <div style="font-size:3.5rem; margin-bottom:15px;">${type === 'success' ? '✅' : '⚠️'}</div>
                <h3 style="color:white; margin:0 0 10px 0;">${title}</h3>
                <p style="color:#ccc; margin-bottom:25px;">${msg}</p>
                <button onclick="document.getElementById('mspModal').remove()" style="background:#2fb45a; color:white; border:none; padding:12px 30px; border-radius:10px; cursor:pointer; font-weight:bold;">إغلاق | Close</button>
            </div>
        </div>`;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
};

// 2. تعريف دوال النظام
window.logout = function() {
    localStorage.removeItem('msp_user');
    window.location.replace('login.html');
};

function checkAuth() {
    const user = localStorage.getItem('msp_user');
    if (!user && !window.location.pathname.includes('login.html')) {
        window.location.replace('login.html');
    }
}

function injectSharedUI() {
    if (window.location.pathname.includes('login.html')) return;
    const user = JSON.parse(localStorage.getItem('msp_user')) || { f_full_name: "مستخدم" };
    const style = document.createElement('style');
    style.textContent = `
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700&display=swap');
        :root { --msp-green: #2fb45a; --msp-bronze: #b08d57; --bg-neutral: #2c343c; }
        body { background: var(--bg-neutral); color: #e1e8ed; margin: 0; font-family: 'Segoe UI', sans-serif; display: flex; direction: rtl; min-height: 100vh; }
        .sidebar { width: 260px; background: #1e252b; height: 100vh; position: fixed; right: 0; border-left: 1px solid rgba(255,255,255,0.08); padding: 30px 20px; box-sizing: border-box; z-index: 1000; }
        .nav-link { display: flex; align-items: center; padding: 12px 15px; color: #b0bec5; text-decoration: none; border-radius: 8px; margin-bottom: 8px; transition: 0.3s; }
        .nav-link:hover, .nav-link.active { background: var(--msp-green); color: white; }
        .main-wrapper { margin-right: 260px; width: calc(100% - 260px); padding: 40px; box-sizing: border-box; }
        .msp-card { background: #353f48; border: 1px solid rgba(255,255,255,0.08); border-radius: 15px; padding: 25px; box-shadow: 0 10px 30px rgba(0,0,0,0.2); }
        #digitalClock { font-family: 'Orbitron', sans-serif; color: var(--msp-green); font-size: 1.6rem; background: #1a1a1a; padding: 5px 15px; border-radius: 8px; border: 1px solid #444; display: inline-block; }
    `;
    document.head.appendChild(style);

    const sidebarHTML = `
        <div class="sidebar">
            <img src="MSP_Logo.jpeg" style="width:130px; border-radius:10px; margin: 0 auto 30px; display:block;">
            <a href="dashboard.html" class="nav-link ${window.location.pathname.includes('dashboard')?'active':''}">📊 لوحة التحكم | Dashboard</a>
            <a href="visits.html" class="nav-link ${window.location.pathname.includes('visits')?'active':''}">📝 توثيق زيارة | New Visit</a>
            <a href="#" onclick="logout()" class="nav-link" style="margin-top:50px; color:#ff7675;">🚪 خروج | Logout</a>
        </div>`;
    document.body.insertAdjacentHTML('afterbegin', sidebarHTML);
}

function initDigitalClock() {
    setInterval(() => {
        const el = document.getElementById('digitalClock');
        if(el) el.textContent = new Date().toLocaleTimeString('ar-EG', {hour12:false});
    }, 1000);
}

// 3. التنفيذ عند الجاهزية
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    injectSharedUI();
    initDigitalClock();
});
