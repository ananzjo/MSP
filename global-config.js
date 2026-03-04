/* ===========================================================
   نظام MSP لتوثيق زيارات فريق المبيعات - المحرك العالمي V3.5
   ===========================================================
   المسؤوليات: الربط بـ Supabase، توحيد الثيم، حقن الواجهات، الأمان.
*/

// 1. إعدادات الاتصال بـ Supabase (تأكد من مطابقة الروابط)
const SB_URL = "https://tjntctaapsdynbywdfns.supabase.co";
const SB_KEY = "sb_publishable_BJgdmxyFsCgzFDXh1Qn1CQ_cFRMsy2P";
const supabaseClient = supabase.createClient(SB_URL, SB_KEY);

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();       // التحقق من الدخول
    injectSharedUI();  // حقن الثيم والواجهات
    initDigitalClock(); // تشغيل الساعة
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
    
    // أ: حقن التنسيق الموحد (الثيم الفخم - Radial Gradient)
    const style = document.createElement('style');
    style.textContent = `
        :root { 
            --msp-green: #2fb45a; 
            --msp-bronze: #b08d57;
            --glass-bg: rgba(255, 255, 255, 0.05);
            --glass-border: rgba(255, 255, 255, 0.1);
        }

        body { 
            margin: 0; 
            background: radial-gradient(circle at center, #1e272e 0%, #050505 100%) !important;
            background-attachment: fixed;
            color: white; font-family: 'Segoe UI', sans-serif; direction: rtl;
            min-height: 100vh; overflow-x: hidden;
        }

        /* الهيدر العلوي */
        .msp-header {
            position: fixed; top: 0; left: 0; right: 0; height: 70px;
            background: rgba(0, 0, 0, 0.4); backdrop-filter: blur(15px);
            border-bottom: 1px solid var(--glass-border);
            display: flex; align-items: center; justify-content: space-between;
            padding: 0 25px; z-index: 1000;
        }

        .header-logo { display: flex; align-items: center; gap: 15px; }
        .header-logo img { width: 45px; border-radius: 8px; }

        /* الساعة الرقمية والنبضة */
        .pulse-box { display: flex; align-items: center; gap: 10px; font-size: 0.9rem; }
        .pulse-dot { width: 10px; height: 10px; background: var(--msp-green); border-radius: 50%; animation: pulse 1.5s infinite; }
        @keyframes pulse { 0% { opacity: 0.4; } 50% { opacity: 1; } 100% { opacity: 0.4; } }

        /* السايدبار المنزلق (Sliding Sidebar) */
        .msp-sidebar {
            position: fixed; top: 70px; right: -280px; width: 260px; height: calc(100vh - 70px);
            background: rgba(15, 15, 15, 0.98); backdrop-filter: blur(20px);
            border-left: 1px solid var(--glass-border); transition: 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            padding: 30px 20px; z-index: 999;
        }

        .msp-sidebar.active { right: 0; }
        .sidebar-item {
            display: block; padding: 15px; color: #ccc; text-decoration: none;
            border-radius: 12px; margin-bottom: 10px; transition: 0.3s;
        }
        .sidebar-item:hover { background: var(--glass-bg); color: var(--msp-green); transform: translateX(-5px); }
        .sidebar-item.active { background: var(--msp-green); color: white; }

        /* زر القائمة */
        .menu-toggle { cursor: pointer; font-size: 1.5rem; color: var(--msp-green); }

        .main-content { padding-top: 100px; padding-right: 30px; padding-left: 30px; transition: 0.4s; }
    `;
    document.head.appendChild(style);

    // ب: حقن كود HTML (Header & Sidebar)
    const headerHTML = `
        <header class="msp-header">
            <div class="header-logo">
                <div class="menu-toggle" onclick="toggleSidebar()">☰</div>
                <img src="MSP_Logo.jpeg" alt="Logo">
                <span style="font-weight:bold; color:var(--msp-bronze)">MSP Sales</span>
            </div>
            <div class="pulse-box">
                <div id="digitalClock">00:00:00</div>
                <div class="pulse-dot"></div>
                <span style="font-size:0.8rem; opacity:0.7">${user.f_full_name}</span>
            </div>
        </header>

        <aside class="msp-sidebar" id="sidebar">
            <a href="dashboard.html" class="sidebar-item ${window.location.pathname.includes('dashboard') ? 'active' : ''}">📊 لوحة التحكم</a>
            <a href="visits.html" class="sidebar-item ${window.location.pathname.includes('visits') ? 'active' : ''}">📝 توثيق الزيارات</a>
            <a href="#" onclick="logout()" class="sidebar-item" style="color:#e74c3c; margin-top:50px">🚪 تسجيل الخروج</a>
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
    setInterval(() => {
        const now = new Date();
        clockEl.textContent = now.toLocaleTimeString('ar-EG', { hour12: false });
    }, 1000);
}

function logout() {
    localStorage.removeItem('msp_user');
    window.location.replace('login.html');
}

// --- [ وظيفة المودال الموحد ] ---
function showNotification(title, msg, type = 'success') {
    const modal = document.getElementById('mspModal');
    if (modal) {
        document.getElementById('modalTitle').textContent = title;
        document.getElementById('modalText').textContent = msg;
        document.getElementById('modalIcon').textContent = type === 'success' ? '✅' : '⚠️';
        modal.style.display = 'flex';
    } else {
        alert(msg);
    }
}

function closeMspModal() {
    document.getElementById('mspModal').style.display = 'none';
}
