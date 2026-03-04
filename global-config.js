/* === MSP System Engine - Neutral Slate Theme [V5.5] === */
const SB_URL = "https://iowfsncjhzysomybiipk.supabase.co"; // الرابط الجديد المعتمد
const SB_KEY = "sb_publishable_7LHRjeb5IV8XRQJcX-8Ung_lE_iIwsS"; 
const supabaseClient = supabase.createClient(SB_URL, SB_KEY);

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    injectSharedUI();
    initDigitalClock();
});

function checkAuth() {
    const user = localStorage.getItem('msp_user');
    if (!user && !window.location.pathname.includes('login.html')) {
        window.location.replace('login.html');
    }
}

function injectSharedUI() {
    const user = JSON.parse(localStorage.getItem('msp_user')) || { f_full_name: "مستخدم" };
    const style = document.createElement('style');
    style.textContent = `
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@600&display=swap');
        :root { 
            --msp-green: #2fb45a; --msp-bronze: #b08d57; 
            --bg-neutral: #1c2229; /* رمادي وسطي مريح */
            --card-grey: #252c35; 
            --text-light: #e0e6ed;
        }
        body { 
            margin: 0; background: var(--bg-neutral); color: var(--text-light);
            font-family: 'Segoe UI', sans-serif; direction: rtl;
        }
        .msp-header {
            position: fixed; top: 0; left: 0; right: 0; height: 70px;
            background: #15191e; border-bottom: 2px solid var(--msp-green);
            display: flex; align-items: center; justify-content: space-between;
            padding: 0 25px; z-index: 1000; box-shadow: 0 4px 10px rgba(0,0,0,0.3);
        }
        #digitalClock {
            font-family: 'Orbitron', sans-serif; color: var(--msp-green);
            font-size: 1.4rem; font-weight: bold; background: #111;
            padding: 5px 12px; border-radius: 6px; border: 1px solid #333;
            text-shadow: 0 0 5px var(--msp-green);
        }
        .main-content { padding: 100px 25px 25px; }
        .msp-card { 
            background: var(--card-grey); border-radius: 12px; padding: 20px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2); border: 1px solid #323b45; margin-bottom: 20px;
        }
        /* تحسين مظهر المدخلات للثيم الوسطي */
        input, select, textarea {
            background: #1c2229 !important; color: white !important;
            border: 1px solid #3e4853 !important; padding: 8px; border-radius: 5px;
        }
    `;
    document.head.appendChild(style);

    const headerHTML = `
        <header class="msp-header">
            <div style="display:flex; align-items:center; gap:15px;">
                <img src="MSP_Logo.jpeg" style="height:48px; border-radius:5px;">
                <span style="color:var(--msp-bronze); font-weight:bold; font-size:1.1rem;">نظام MSP المطور</span>
            </div>
            <div style="display:flex; align-items:center; gap:20px;">
                <div id="digitalClock">00:00:00</div>
                <div style="border-right: 1px solid #444; padding-right:15px">
                    <small style="display:block; color:#888;">المندوب</small>
                    <strong style="color:var(--msp-green)">${user.f_full_name}</strong>
                </div>
            </div>
        </header>
    `;
    document.body.insertAdjacentHTML('afterbegin', headerHTML);
}

function initDigitalClock() {
    setInterval(() => {
        const clockEl = document.getElementById('digitalClock');
        if(clockEl) clockEl.textContent = new Date().toLocaleTimeString('ar-EG', {hour12:false});
    }, 1000);
}
