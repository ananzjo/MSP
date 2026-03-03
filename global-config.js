/* === BEGIN GLOBAL CONFIG SCRIPT [Sales Visits App] === */

const CONFIG = {
    SB_URL: "https://iowfsncjhzysomybiipk.supabase.co",
    SB_KEY: "sb_publishable_7LHRjeb5IV8XRQJcX-8Ung_lE_iIwsS",
    SYSTEM_NAME: "Sales Visits App",
    COMPANY: "MSP | Modern Style Pack | شركة الطراز للتغليف"
};

// تهيئة مكتبة Supabase (يجب استدعاء المكتبة في HTML أولاً)
const supabaseClient = supabase.createClient(CONFIG.SB_URL, CONFIG.SB_KEY);

document.addEventListener('DOMContentLoaded', () => {
    initSidebar();
    initDigitalClock();
});

function initSidebar() {
    const toggleBtn = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.querySelector('.main-content');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            sidebar.classList.toggle('closed');
            if (sidebar.classList.contains('closed')) {
                sidebar.style.right = "-260px";
                mainContent.style.marginRight = "0";
            } else {
                sidebar.style.right = "0";
                mainContent.style.marginRight = "260px";
            }
        });
    }
}

function initDigitalClock() {
    const clockElement = document.getElementById('digital-clock');
    const pulseIndicator = document.querySelector('.pulse-indicator');
    setInterval(() => {
        const now = new Date();
        if (clockElement) clockElement.textContent = now.toLocaleTimeString('en-GB');
    }, 1000);
    checkConnection(pulseIndicator);
}

async function checkConnection(indicator) {
    try {
        // اختبار الاتصال بجدول القوائم
        const { error } = await supabaseClient.from('t02_lists').select('id').limit(1);
        indicator.style.backgroundColor = error ? "#ff4d4d" : "#2fb45a";
    } catch (e) {
        indicator.style.backgroundColor = "#ff4d4d";
    }
}

function showNotification(message, type = 'info') {
    alert(`${type.toUpperCase()}: ${message}`); 
}

/* === END GLOBAL CONFIG SCRIPT === */