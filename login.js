/* MSP System - Login Logic - COMPATIBLE VERSION */

// دالة المودال (نفسها التي تستخدمها ولكن مع إضافة تأمين)
function showMspModal(title, message, type = 'success') {
    const modal = document.getElementById('mspModal');
    if (!modal) {
        // إذا لم يكن المودال موجوداً في الصفحة، نستخدم alert العادي كبديل آمن
        alert(`${title}: ${message}`);
        return;
    }
    
    document.getElementById('modalIcon').textContent = (type === 'success' ? '✅' : '⚠️');
    document.getElementById('modalIcon').style.color = (type === 'success' ? '#2fb45a' : '#e74c3c');
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalText').textContent = message;
    modal.style.display = 'flex';
}

function closeMspModal() {
    const modal = document.getElementById('mspModal');
    if (modal) modal.style.display = 'none';
}

// معالجة الدخول
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
            // الاستعلام من Supabase باستخدام الاسم الموحد للجداول t99_users
            const { data, error } = await supabaseClient
                .from('t99_users')
                .select('*')
                .eq('f_username', user)
                .eq('f_password', pass)
                .single();

            if (error || !data) throw new Error("بيانات الدخول غير صحيحة");

            // 1. تخزين الجلسة (نفس المفتاح المستخدم في global-config)
            localStorage.setItem('msp_user', JSON.stringify(data));
            
            // 2. إظهار رسالة النجاح
            showMspModal("مرحباً بك", `تم تسجيل دخول ${data.f_full_name} بنجاح`, "success");

            // 3. الانتقال (نستخدم replace لمنع العودة للخلف)
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
