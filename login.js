/* login.js - MSP System Authentication */

// تأكد من أن supabaseClient متاح من global-config.js
const loginForm = document.getElementById('loginForm');
const submitBtn = document.getElementById('submitBtn');
const togglePass = document.getElementById('togglePass');

// 1. إظهار/إخفاء كلمة المرور
togglePass.addEventListener('click', () => {
    const passInput = document.getElementById('password');
    if (passInput.type === 'password') {
        passInput.type = 'text';
        togglePass.textContent = '🔒';
    } else {
        passInput.type = 'password';
        togglePass.textContent = '👁️';
    }
});

// 2. معالجة الدخول
async function handleLogin(event) {
    event.preventDefault();
    
    const user = document.getElementById('username').value.trim();
    const pass = document.getElementById('password').value.trim();

    // تغيير حالة الزر
    submitBtn.disabled = true;
    submitBtn.textContent = "جاري التحقق...";

    try {
        // البحث عن المستخدم في جدول المستخدمين (t99_users)
        // ملاحظة: تم إضافة t و f بناءً على القواعد الذهبية
        const { data, error } = await supabaseClient
            .from('t99_users') 
            .select('*')
            .eq('f_username', user)
            .eq('f_password', pass)
            .single();

        if (error || !data) {
            throw new Error("خطأ في اسم المستخدم أو كلمة المرور");
        }

        // نجاح الدخول - حفظ الجلسة محلياً (اختياري)
        localStorage.setItem('msp_user', JSON.stringify(data));
        
        showNotification(`مرحباً بك ${data.f_full_name || user}`, 'success');

        // الانتقال لصفحة الزيارات بعد ثانية
        setTimeout(() => {
            window.location.href = 'visits.html';
        }, 1500);

    } catch (err) {
        showNotification(err.message, 'error');
        submitBtn.disabled = false;
        submitBtn.textContent = "دخول للنظام 🚀";
    }
}

loginForm.addEventListener('submit', handleLogin);
