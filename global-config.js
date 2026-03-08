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
        body { margin: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f4f7f6; }
        
        /* ضبط المساحة للمحتوى تحت الهيدر */
        .page-container { 
            width: 92% !important; 
            max-width: 1400px; 
            margin: 100px auto 20px !important; 
            direction: rtl !important; 
            position: relative;
        }
        
        /* تنسيق الهيدر الثابت */
        header { 
            display:flex; 
            justify-content:space-between; 
            align-items:center; 
            background:#1a1a1a; 
            color:white; 
            padding:0 25px; 
            position:fixed; 
            top:0; 
            width:100%; 
            z-index:11000; 
            border-bottom:2px solid #27ae60; 
            height:62px; 
            box-sizing: border-box; 
        }
        
        /* تنسيق القائمة الجانبية المنسدلة */
        #sidebar { 
            position: fixed; 
            top: 62px; 
            right: -300px; 
            width: 280px; 
            height: calc(100% - 62px); 
            background: white; 
            z-index: 10000; 
            transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1); 
            border-left: 2px solid #27ae60; 
            box-shadow: -5px 0 15px rgba(0,0,0,0.1); 
        }
        
        #sidebar.active { right: 0; }
        
        /* زر القائمة الموضع أسفل الهيدر */
        .btn-sidebar-toggle { 
            position: fixed !important; 
            top: 75px !important; 
            right: 20px !important; 
            z-index: 10001 !important; 
            background: #1a1a1a; 
            color: #27ae60; 
            border: 1px solid #27ae60; 
            padding: 10px 15px; 
            border-radius: 8px; 
            cursor: pointer; 
            font-weight: bold;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        /* إخفاء الزر عند فتح القائمة */
        .btn-sidebar-toggle.hidden { display: none !important; }
        
        /* الساعة الرقمية */
        #digital-clock { 
            font-family: 'Digital-7 Mono', sans-serif; 
            color: #27ae60; 
            font-size: 1.8rem; 
            background: #1a1a1a; 
            padding: 2px 12px; 
            border-radius: 8px; 
        }
        
        .msp-brand { font-weight: bold; letter-spacing: 1px; }
        .msp-brand span { color: #27ae60; }
    `;
    document.head.appendChild(style);
}

function injectHeader() {
    const headerHTML = `
        <header>
            <div class="msp-brand"><span>MSP</span> Smart System</div>
            <div id="digital-clock">00:00:00</div>
            <div style="font-size:0.8rem; color: #aaa;">Eng. Anan Zitawi</div>
        </header>`;
    document.body.insertAdjacentHTML('afterbegin', headerHTML);
}

function injectSidebar() {
    const sidebarHTML = `
        <nav id="sidebar">
            <div style="padding:20px; border-bottom:1px solid #eee; display:flex; justify-content:space-between; align-items:center; background:#f9f9f9;">
                <span style="font-weight:bold; color:#27ae60;">القائمة الرئيسية</span>
                <button onclick="toggleSidebar()" style="color:#e74c3c; border:none; background:none; cursor:pointer; font-size:1.8rem; line-height:1;">&times;</button>
            </div>
            <ul style="list-style:none; padding:10px; margin:0;">
                <li style="margin-bottom:10px;">
                    <a href="visits.html" style="text-decoration:none; color:#333; display:block; padding:12px; border-radius:6px; transition:0.2s;">
                        <i class="fas fa-file-signature" style="margin-left:10px; color:#27ae60;"></i> توثيق الزيارات
                    </a>
                </li>
            </ul>
        </nav>
        <button id="main-menu-btn" class="btn-sidebar-toggle" onclick="toggleSidebar()">
            <i class="fas fa-bars"></i> القائمة
        </button>`;
    document.body.insertAdjacentHTML('beforeend', sidebarHTML);
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const btn = document.getElementById('main-menu-btn');
    if (sidebar && btn) {
        sidebar.classList.toggle('active');
        btn.classList.toggle('hidden');
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