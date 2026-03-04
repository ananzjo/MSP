/* === MSP Engine V6.0 - Neutral Slate Theme & Sidebar === */
const SB_URL = "https://iowfsncjhzysomybiipk.supabase.co";
const SB_KEY = "sb_publishable_7LHRjeb5IV8XRQJcX-8Ung_lE_iIwsS";
const supabaseClient = supabase.createClient(SB_URL, SB_KEY);

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    injectSharedUI();
    initDigitalClock();
});

function checkAuth() {
    if (!localStorage.getItem('msp_user') && !window.location.pathname.includes('login.html')) {
        window.location.replace('login.html');
    }
}

function injectSharedUI() {
    const user = JSON.parse(localStorage.getItem('msp_user')) || { f_full_name: "مستخدم" };
    const style = document.createElement('style');
    style.textContent = `
        :root { 
            --msp-green: #2fb45a; --msp-bronze: #b08d57; 
            --bg-slate: #242b33; --sidebar-dark: #1a2026;
            --card-inner: #2d353e; --text-main: #e1e8ed;
        }
        body { margin: 0; background: var(--bg-slate); color: var(--text-main); font-family: 'Segoe UI', sans-serif; direction: rtl; display: flex; }
        
        /* السايدبار (القائمة) */
        .sidebar { width: 240px; background: var(--sidebar-dark); height: 100vh; position: fixed; right: 0; top: 0; border-left: 1px solid #3d4751; padding: 20px; box-sizing: border-box; }
        .nav-link { display: block; padding: 12px; color: var(--text-main); text-decoration: none; border-radius: 8px; margin-bottom: 5px; transition: 0.3s; }
        .nav-link:hover, .nav-link.active { background: var(--msp-green); color: white; }

        /* المحتوى الرئيسي */
        .main-wrapper { margin-right: 240px; width: 100%; padding: 25px; }
        .msp-header { 
            background: var(--sidebar-dark); height: 70px; display: flex; align-items: center; 
            justify-content: space-between; padding: 0 25px; border-bottom: 2px solid var(--msp-green);
            margin: -25px -25px 25px -25px;
        }
        #digitalClock { font-family: monospace; color: var(--msp-green); font-size: 1.5rem; font-weight: bold; }
        .msp-card { background: var(--card-inner); border-radius: 12px; padding: 25px; border: 1px solid #3d4751; box-shadow: 0 10px 30px rgba(0,0,0,0.2); }
        input, select, textarea { width: 100%; background: #1c2229; color: white; border: 1px solid #45525e; padding: 10px; border-radius: 6px; box-sizing: border-box; }
        label { display: block; margin-bottom: 8px; color: var(--msp-bronze); font-weight: bold; font-size: 0.9rem; }
    `;
    document.head.appendChild(style);

    const sidebarHTML = `
        <div class="sidebar">
            <img src="MSP_Logo.jpeg" style="width:100%; border-radius:10px; margin-bottom:20px;">
            <a href="dashboard.html" class="nav-link">📊 لوحة التحكم</a>
            <a href="visits.html" class="nav-link active">📝 توثيق زيارة</a>
            <a href="#" onclick="localStorage.removeItem('msp_user'); location.reload();" class="nav-link" style="margin-top:20px; color:#ff7675;">🚪 خروج</a>
        </div>
    `;

    const headerHTML = `
        <header class="msp-header">
            <div id="digitalClock">00:00:00</div>
            <div style="text-align:left;">
                <span style="color:var(--msp-green)">● متصل</span>
                <div style="font-size:0.9rem;">${user.f_full_name}</div>
            </div>
        </header>
    `;

    document.body.insertAdjacentHTML('afterbegin', sidebarHTML);
    const wrapper = document.createElement('div');
    wrapper.className = 'main-wrapper';
    wrapper.innerHTML = headerHTML + document.body.innerHTML;
    document.body.innerHTML = '';
    document.body.appendChild(wrapper);
}

function initDigitalClock() {
    setInterval(() => {
        const el = document.getElementById('digitalClock');
        if(el) el.textContent = new Date().toLocaleTimeString('ar-EG', {hour12:false});
    }, 1000);
}
