/* MSP System - Login Logic with Custom Modal */

// 1. وظيفة المودال (بديلة الـ Alert)
function showMspModal(title, message, type = 'success') {
    const modal = document.getElementById('mspModal');
    const icon = document.getElementById('modalIcon');
    const titleEl = document.getElementById('modalTitle');
    const textEl = document.getElementById('modalText');

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
    document.getElementById('mspModal').style.display = 'none';
}

// 2. تبديل رؤية كلمة المرور
document.getElementById('eyeIcon').addEventListener('click', function() {
    const passInput = document.getElementById('password');
    if (passInput.type === 'password') {
        passInput.type = 'text';
        this.textContent = '🔒';
    } else {
        passInput.type = 'password';
        this.textContent = '👁️';
    }
});

// 3. معالجة الدخول عبر Supabase
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const user = document.getElementById('username').value.trim();
    const pass = document.getElementById('password').value.trim();
    const btn = document.getElementById('submitBtn');

    btn.disabled = true;
    btn.textContent = "جاري التحقق...";

    try {
        // البحث في جدول t99_users بناءً على القواعد التي وضعتها
        const { data, error } = await supabaseClient
            .from('t99_users')
            .select('*')
            .eq('f_username', user)
            .eq('f_password', pass)
            .single();

        if (error || !data) {
            throw new Error("بيانات الدخول غير صحيحة، حاول مجدداً");
        }

        // حفظ الجلسة والانتقال
        localStorage.setItem('msp_session', JSON.stringify(data));
        
        showMspModal("مرحباً بك", `تم تسجيل دخول ${data.f_full_name} بنجاح`, "success");

        setTimeout(() => {
            window.location.href = 'visits.html';
        }, 2000);

    } catch (err) {
        showMspModal("خطأ", err.message, "error");
        btn.disabled = false;
        btn.textContent = "دخول للنظام 🚀";
    }
});