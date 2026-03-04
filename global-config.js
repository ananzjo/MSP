/* === MSP System Engine V5.0 - Elegant Light Theme === */
const SB_URL = "https://iowfsncjhzysomybiipk.supabase.co"; // الرابط الجديد
const SB_KEY = "sb_publishable_BJgdmxyFsCgzFDXh1Qn1CQ_cFRMsy2P"; // تأكد من مطابقة هذا المفتاح للمشروع الجديد
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
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@600&family=Noto+Kufi+Arabic:wght@400;700&display=swap');
        :root { 
            --msp-green: #2fb45a; --msp-bronze: #b08d57; 
            --bg-light: #f8f9fa; --card-white: #ffffff; --text-main: #2d3436;
        }
        body { 
            margin: 0; background: var(--bg-light); color: var(--text-main);
            font-family: 'Noto Kufi Arabic', sans-serif; direction: rtl;
        }
        .msp-header {
            position: fixed; top: 0; left: 0; right: 0; height: 75px;
            background: var(--card-white); border-bottom: 3px solid var(--msp-green);
            display: flex; align-items: center; justify-content: space-between;
            padding: 0 30px; z-index: 1000; box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }
        #digitalClock {
            font-family: 'Orbitron', sans-serif; color: var(--msp-green);
            font-size: 1.4rem; font-weight: bold; background: #eef9f1;
            padding: 5px 15px; border-radius: 8px; border: 1px solid #d1e7dd;
        }
        .main-content { padding: 110px 40px 40px; }
        .msp-card { 
            background: var(--card-white); border-radius: 15px; padding: 25px;
            box-shadow: 0 8px 30px rgba(0,0,0,0.04); border: 1px solid #eee; margin-bottom: 25px;
        }
        .btn-primary { 
            background: var(--msp-green); color: white; border: none;
            padding: 12px 25px; border-radius: 8px; cursor: pointer; font-weight: bold;
        }
    `;
    document.head.appendChild(style);

    const headerHTML = `
        <header class="msp-header">
            <div style="display:flex; align-items:center; gap:15px;">
                <img src="MSP_Logo.jpeg" style="height:50px; border-radius:5px;">
                <span style="color:var(--msp-bronze); font-weight:bold; font-size:1.2rem;">نظام MSP لتوثيق الزيارات</span>
            </div>
            <div style="display:flex; align-items:center; gap:25px;">
                <div id="digitalClock">00:00:00</div>
                <div style="text-align:left; border-right:2px solid #eee; padding-right:15px;">
                    <small style="display:block; color:#999;">المندوب النشط</small>
                    <strong style="color:var(--msp-green);">${user.f_full_name}</strong>
                </div>
            </div>
        </header>
    `;
    document.body.insertAdjacentHTML('afterbegin', headerHTML);
}

function initDigitalClock() {
    setInterval(() => {
        document.getElementById('digitalClock').textContent = new Date().toLocaleTimeString('ar-EG', {hour12:false});
    }, 1000);
}

function showNotification(title, msg, type = 'success') {
    alert(`${title}\n${msg}`); // يمكن تطويره لمودال أنيق لاحقاً
}

