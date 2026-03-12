/* === START OF FILE === */
/**
 * File: global-config.js | Version: v2.3.5
 * Function: Central Engine with Correct Supabase Credentials
 * Project: MSP Smart System
 */

// المسارات الصحيحة التي تم التحقق منها
const SUPABASE_URL = "https://iowfsncjhzysomybiipk.supabase.co";
const SUPABASE_KEY = "sb_publishable_7LHRjeb5IV8XRQJcX-8Ung_lE_iIwsS";

// تهيئة الاتصال الموحد
// @ts-ignore
window.supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

function initGlobalEngine() {
    console.log("MSP: Initializing Central Engine...");
    injectGlobalStyles(); 
    injectHeader();
    injectSidebar();
    startDigitalClock();

    // إرسال إشارة الجاهزية لملف visits.js لتبدأ القوائم بالتحميل
    setTimeout(() => {
        window.dispatchEvent(new Event('msp-core-ready'));
        console.log("MSP: Core Signal Sent.");
    }, 200);
}

function injectGlobalStyles() {
    const style = document.createElement('style');
    style.innerHTML = `
        @import url('https://fonts.cdnfonts.com/css/digital-7-mono');
        
        /* ضبط المساحة للمحتوى تحت الهيدر */
        .page-container { 
            width: 75% !important; 
            margin: 100px auto 20px !important; 
            direction: rtl !important; 
            position: relative;
        }
        
        /* تنسيق الهيدر الثابت العائم (Floating Global Header) */
        #global-header { 
            display: flex; justify-content: space-between; align-items: center; 
            background: rgba(26, 26, 26, 0.85); 
            backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
            color: white; 
            padding: 0 35px; 
            position: fixed; top: 15px; left: 0; right: 0; margin: 0 auto;
            width: 75%; 
            z-index: 11000; 
            border-bottom: 3px solid #10b981; 
            border-radius: 20px;
            height: 65px; 
            box-sizing: border-box; 
            box-shadow: 0 10px 30px rgba(0,0,0,0.15);
            transition: width 0.3s ease;
        }
        
        /* تنسيق القائمة الجانبية (Premium Sidebar) */
        #sidebar { 
            position: fixed; top: 0; right: -320px; 
            width: 300px; height: 100%; 
            background: rgba(255, 255, 255, 0.95); 
            backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
            z-index: 12000; 
            transition: 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); 
            border-left: 4px solid #10b981; 
            box-shadow: -10px 0 40px rgba(0,0,0,0.1); 
            display: flex; flex-direction: column;
        }
        #sidebar.active { right: 0; }
        
        .sidebar-overlay {
            position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 11500;
            opacity: 0; pointer-events: none; transition: 0.3s; backdrop-filter: blur(3px);
        }
        .sidebar-overlay.active { opacity: 1; pointer-events: auto; }

        /* زر القائمة داخل الهيدر */
        .btn-sidebar-toggle { 
            background: rgba(16, 185, 129, 0.15); color: #10b981; 
            border: 1px solid rgba(16, 185, 129, 0.3); 
            padding: 8px 16px; border-radius: 12px; cursor: pointer; font-weight: bold;
            display: flex; align-items: center; gap: 8px; transition: 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .btn-sidebar-toggle:hover { background: #10b981; color: white; transform: scale(1.05); }
        
        /* الساعة الرقمية */
        #digital-clock { 
            font-family: 'Digital-7 Mono', monospace; color: #10b981; font-size: 2rem; 
            background: rgba(0, 0, 0, 0.3); padding: 4px 16px; border-radius: 12px; 
            text-shadow: 0 0 10px rgba(16, 185, 129, 0.5); letter-spacing: 2px;
        }
        
        .msp-brand { font-weight: 800; letter-spacing: 1px; font-size: 1.2rem; display: flex; align-items: center; gap: 15px; }
        .msp-brand span { color: #10b981; }
        .global-logo { height: 42px; object-fit: contain; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1)); }
        
        .header-actions { display: flex; align-items: center; gap: 20px; }

        @media (max-width: 1200px) {
            #global-header, .page-container { width: 90%; }
        }
        @media (max-width: 768px) {
            #global-header { width: 100%; top: 0; border-radius: 0; flex-wrap: wrap; height: auto; padding: 10px 15px; gap: 10px; justify-content: center; }
            .page-container { width: 100%; margin-top: 120px !important; }
            .header-actions { justify-content: center; width: 100%; gap: 10px; flex-wrap: wrap; }
            #digital-clock { font-size: 1.5rem; }
        }
    `;
    document.head.appendChild(style);
}

function injectHeader() {
    const headerHTML = `
        <header id="global-header">
            <div style="display: flex; align-items: center; gap: 25px;">
                <button id="main-menu-btn" class="btn-sidebar-toggle" onclick="toggleSidebar()">
                    <i class="fas fa-bars"></i> القائمة
                </button>
                
                <div class="msp-brand">
                    <img src="MSP_Logo.jpeg" alt="MSP Logo" class="global-logo">
                    <div><span>MSP</span> Smart System</div>
                </div>
            </div>
            
            <div class="header-actions">
                <div id="digital-clock">00:00:00</div>
                <div style="font-size:0.85rem; color: #cbd5e1; font-weight: 500; display:flex; align-items:center; gap:5px; border-right:1px solid #333; padding-right:15px; margin-right:5px;">
                    <i class="fas fa-user-circle" style="color:#10b981; font-size:1.1rem;"></i> Eng. Anan
                </div>
            </div>
        </header>`;
    document.body.insertAdjacentHTML('afterbegin', headerHTML);
}

function injectSidebar() {
    const sidebarHTML = `
        <div id="sidebarOverlay" class="sidebar-overlay" onclick="toggleSidebar()"></div>
        <nav id="sidebar">
            <div style="padding:25px; border-bottom:1px solid #eee; display:flex; justify-content:space-between; align-items:center; background:#f8fafc;">
                <span style="font-weight:800; color:#10b981; font-size:1.2rem;">القائمة الرئيسية</span>
                <button onclick="toggleSidebar()" style="color:#ef4444; border:none; background:rgba(239, 68, 68, 0.1); border-radius:8px; cursor:pointer; font-size:1.5rem; width:36px; height:36px; display:flex; align-items:center; justify-content:center; transition:0.2s;">&times;</button>
            </div>
            <ul style="list-style:none; padding:15px; margin:0; flex-grow:1;">
                <li style="margin-bottom:12px;">
                    <a href="visits.html" style="text-decoration:none; color:#1f2937; display:flex; align-items:center; padding:14px; border-radius:12px; transition:0.3s; background:#f1f5f9; font-weight:600;">
                        <i class="fas fa-file-signature" style="margin-left:12px; color:#10b981; font-size:1.2rem;"></i> توثيق الزيارات (Visits)
                    </a>
                </li>
                <li style="margin-bottom:12px;">
                    <a href="reports.html" style="text-decoration:none; color:#1f2937; display:flex; align-items:center; padding:14px; border-radius:12px; transition:0.3s; background:#f1f5f9; font-weight:600;">
                        <i class="fas fa-chart-pie" style="margin-left:12px; color:#10b981; font-size:1.2rem;"></i> تقارير الزيارات (Reports)
                    </a>
                </li>
            </ul>
            <div style="padding: 20px; text-align: center; color: #94a3b8; font-size: 0.8rem; border-top: 1px solid #eee;">
                MSP v2.3.5 &copy; 2026
            </div>
        </nav>`;
    document.body.insertAdjacentHTML('beforeend', sidebarHTML);
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    if (sidebar && overlay) {
        sidebar.classList.toggle('active');
        overlay.classList.toggle('active');
    }
}

function startDigitalClock() {
    const updateClock = () => {
        const clock = document.getElementById('digital-clock');
        if (clock) {
            const now = new Date();
            clock.innerText = now.toLocaleTimeString('en-GB');
        }
    };
    updateClock();
    setInterval(updateClock, 1000);
}

/* === END OF FILE === */