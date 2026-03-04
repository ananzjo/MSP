/* MSP System - Login Logic - FIXED VERSION */

// 1. وظيفة المودال
function showMspModal(title, message, type = 'success') {
    const modal = document.getElementById('mspModal');
    const icon = document.getElementById('modalIcon');
    const titleEl = document.getElementById('modalTitle');
    const textEl = document.getElementById('modalText');

    if (!modal) return; // تأمين في حال عدم وجود المودال في HTML

    titleEl.textContent = title;
    textEl.textContent = message;
    
    if (type === 'success') {
        icon.textContent = '✅';
        icon.style.color = '#2fb45a';
    } else {
        icon.textContent = '⚠️';
        icon.style.color = '#e74c3c';
    }

    modal.style.display = 'flex';
}

function closeMspModal() {
    const modal = document.getElementById('mspModal');
    if (modal) modal.style.display = 'none';
}

// 2. تبديل رؤية كلمة المرور
const eyeIcon = document.getElementById('eyeIcon');
if (eyeIcon) {
    eyeIcon.addEventListener('click', function() {
        const passInput = document.getElementById('password');
        if (passInput.type === 'password') {
            passInput.type = 'text';
            this.textContent = '🔒';
        } else {
            passInput.type = 'password';
            this.textContent = '👁️';
        }
    });
}

// 3. معالجة الدخول
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const user = document.getElementById('username').value.trim();
        const pass = document.getElementById('password').value.trim();
        const btn = document.getElementById('submitBtn');

        btn.disabled = true;
        btn.textContent = "جاري التحقق...";

        try {
            const { data, error } = await supabaseClient
                .from('t99_users')
                .select('*')
                .eq('f_username', user)
                .eq('f_password', pass)
                .single();

            if (error || !data) {
                throw new Error("بيانات الدخول غير صحيحة");
            }

            // حفظ الجلسة
            localStorage.setItem('msp_user', JSON.stringify(data));
            
            showMspModal("مرحباً بك", `تم تسجيل دخول ${data.f_full_name} بنجاح`, "success");

            // الانتقال المضمون
            setTimeout(() => {
                window.location.replace('dashboard.html');
            }, 2000);

        } catch (err) {
            showMspModal("خطأ", err.message, "error");
            btn.disabled = false;
            btn.textContent = "دخول للنظام 🚀";
        }
    });
}
