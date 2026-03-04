/* ===========================================================
   نظام MSP لتوثيق زيارات فريق المبيعات - المحرك العالمي V4.0
   ===========================================================
   المسؤوليات: الثيم الفخم، الساعة الرقمية (Taxi Meter)، الأمان، والواجهات.
*/

// 1. إعدادات الاتصال بـ Supabase
const SB_URL = "https://tjntctaapsdynbywdfns.supabase.co";
const SB_KEY = "sb_publishable_BJgdmxyFsCgzFDXh1Qn1CQ_cFRMsy2P";
const supabaseClient = supabase.createClient(SB_URL, SB_KEY);

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();       // التحقق من الدخول
    injectSharedUI();  // حقن الثيم والواجهات (التدرج الدائري + السايدبار)
    initDigitalClock(); // تشغيل ساعة العداد
});

// --- [ وظيفة 1: التحقق من الأمان ] ---
function checkAuth() {
    const user = localStorage.getItem('msp_user');
    const isLoginPage = window.location.pathname.includes('login.html');

    if (!user && !isLoginPage) {
        window.location.replace('login.html');
    } else if (user && isLoginPage) {
        window.location.replace('dashboard.html');
    }
}

// --- [ وظيفة 2: حقن الثيم والواجهات الموحدة ] ---
function injectSharedUI() {
    const user = JSON.parse(localStorage.getItem('msp_user')) || { f_full_name: "مستخدم" };
    
    // أ: حقن التنسيق الموحد (ثيم الأمس الفخم + خط عداد التاكسي)
    const style = document.createElement('style');
    style.textContent = `
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@500;700&display=swap');

        :root { 
            --msp-green: #2fb45a; 
            --msp-bronze: #b08d57;
            --glass-bg: rgba(255, 255, 255, 0.05);
            --glass-border: rgba(255, 255, 255, 0.1);
        }

        body { 
            margin: 0; 
            /* التدرج الدائري الفخم */
            background: radial-gradient(circle at center, #1e272e 0%, #050505 100%) !important;
            background-attachment: fixed;
            color: white; font-family: 'Segoe UI', sans-serif; direction: rtl;
            min-height: 100vh; overflow-x: hidden;
        }

        /* الهيدر العلوي بنظام الزجاج */
        .msp-header {
            position: fixed; top: 0; left: 0; right: 0; height: 80px;
            background: rgba(0, 0, 0, 0.5); backdrop-filter: blur(20px);
            border-bottom: 1px solid var(--glass-border);
            display: flex; align-items: center; justify-content: space-between;
            padding: 0 25px; z-index: 1000;
        }

        .header-logo { display: flex; align-items: center; gap: 15px; }
        .header-logo img { width: 50px; border-radius: 10px; border: 1px solid var(--glass-border); }

        /* ساعة عداد التاكسي (Taxi Meter Clock) */
        .pulse-box { 
            display: flex; align-items: center; gap: 20px; 
            background: rgba(0,0,0,0.4); padding: 8px 20px; border-radius: 15px;
            border: 1px solid rgba(47, 180, 90, 0.15);
        }

        #digitalClock {
            font-family: 'Orbitron', monospace;
            color: var(--msp-green);
            font-size: 1.5rem;
            font-weight: 700;
            letter-spacing: 2px;
            text-shadow: 0 0 12px rgba(47, 180, 90, 0.6);
        }

        .pulse-dot { 
            width: 12px; height: 12px; background: var(--msp-green); 
            border-radius: 50%; animation: pulse 1.5s infinite;
            box-shadow: 0 0 10px var(--msp-green);
        }
        @keyframes pulse { 0% { transform: scale(0.8); opacity: 0.5; } 50% { transform: scale(1.2); opacity: 1; } 100% { transform: scale(0.8); opacity: 0.5; } }

        /* السايدبار المنزلق */
        .msp-sidebar {
            position: fixed; top: 80px; right: -280px; width: 260px; height: calc(100vh - 80px);
            background: rgba(10, 10, 10, 0.98); backdrop-filter: blur(25px);
            border-left: 1px solid var(--glass-border); transition: 0.4s ease-in-out;
            padding: 40px 20px; z-index: 999;
        }

        .msp-sidebar.active { right: 0; box-shadow: -15px 0 40px rgba(0,0,0,0.8); }
        .sidebar-item {
            display: flex; align-items: center; padding: 15px; color: #bbb; text-decoration: none;
            border-radius: 12px; margin-bottom: 12px; transition: 0.3s; font-weight: 500;
        }
        .sidebar-item:hover { background: var(--glass-bg); color: var(--msp-green); transform: translateX(-8px); }
        .sidebar-item.active { background: linear-gradient(45deg, var(--msp-green), #27ae60); color: white; }

        /* زر القائمة */
        .menu-toggle { cursor: pointer; font-size: 1.8rem; color: var(--msp-green); transition: 0.3s; }
        .menu-toggle:hover { transform: rotate(90deg); color: var(--msp-bronze); }

        .main-content { padding-top: 110px; padding-right: 30px; padding-left: 30px; transition: 0.4s; }
    `;
    document.head.appendChild(style);

    // ب: حقن كود HTML (Header & Sidebar)
    const headerHTML = `
        <header class="msp-header">
            <div class="header-logo">
                <div class="menu-toggle" onclick="toggleSidebar()">☰</div>
                <img src="MSP_Logo.jpeg" alt="Logo">
                <span style="font-weight:bold; color:var(--msp-bronze); font-size:1.1rem;">MSP Sales Documentation</span>
            </div>
            <div class="pulse-box">
                <div id="digitalClock">00:00:00</div>
                <div class="pulse-dot"></div>
                <div style="text-align:left; border-right: 1px solid #333; padding-right:15px">
                    <span style="font-size:0.75rem; color:var(--msp-green); display:block">ACTIVE REP:</span>
                    <span style="font-size:0.85rem; font-weight:bold; color:#fff">${user.f_full_name}</span>
                </div>
            </div>
        </header>

        <aside class="msp-sidebar" id="sidebar">
            <a href="dashboard.html" class="sidebar-item ${window.location.pathname.includes('dashboard') ? 'active' : ''}">📊 لوحة الإنجاز</a>
            <a href="visits.html" class="sidebar-item ${window.location.pathname.includes('visits') ? 'active' : ''}">📝 توثيق زيارة</a>
            <a href="#" onclick="logout()" class="sidebar-item" style="color:#e74c3c; margin-top:60px; border: 1px solid rgba(231, 76, 60, 0.2)">🚪 خروج آمن</a>
        </aside>
    `;
    document.body.insertAdjacentHTML('afterbegin', headerHTML);
}

// --- [ وظائف التحكم بالواجهة ] ---
function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('active');
}

function initDigitalClock() {
    const clockEl = document.getElementById('digitalClock');
    if (!clockEl) return;
    const updateTime = () => {
        const now = new Date();
        const h = String(now.getHours()).padStart(2, '0');
        const m = String(now.getMinutes()).padStart(2, '0');
        const s = String(now.getSeconds()).padStart(2, '0');
        clockEl.textContent = `${h}:${m}:${s}`;
    };
    updateTime();
    setInterval(updateTime, 1000);
}

function logout() {
    if(confirm("هل تريد تسجيل الخروج من نظام MSP؟")) {
        localStorage.removeItem('msp_user');
        window.location.replace('login.html');
    }
}

// --- [ نظام التنبيهات الموحد ] ---
function showNotification(title, msg, type = 'success') {
    const modal = document.getElementById('mspModal');
    if (modal) {
        document.getElementById('modalTitle').textContent = title;
        document.getElementById('modalText').textContent = msg;
        const icon = document.getElementById('modalIcon');
        icon.textContent = type === 'success' ? '✅' : '⚠️';
        icon.style.color = type === 'success' ? 'var(--msp-green)' : '#e74c3c';
        modal.style.display = 'flex';
    } else {
        alert(`${title}: ${msg}`);
    }
}

function closeMspModal() {
    document.getElementById('mspModal').style.display = 'none';
}
