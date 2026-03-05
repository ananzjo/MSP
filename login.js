/* === MSP System - Login Logic [V3.1 Clean] === */

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const eyeIcon = document.getElementById('eyeIcon');
    const passInput = document.getElementById('f02_password'); // تم توحيد الـ ID

    // 1. تبديل رؤية كلمة المرور
    if (eyeIcon && passInput) {
        eyeIcon.addEventListener('click', () => {
            const isPass = passInput.type === 'password';
            passInput.type = isPass ? 'text' : 'password';
            eyeIcon.textContent = isPass ? '🔒' : '👁️';
        });
    }

    // 2. معالجة الدخول
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const userVal = document.getElementById('f01_username').value.trim();
            const passVal = document.getElementById('f02_password').value.trim();

            try {
                const { data, error, status } = await supabaseClient
                    .from('t99_users')
                    .select('*')
                    .eq('f01_username', userVal)
                    .eq('f02_password', passVal);

                if (error) {
                    console.error("Supabase Error:", error);
                    // استخدمنا الدالة الموحدة showNotification
                    showNotification("خطأ في الخادم", `رمز الخطأ: ${status}`, "error");
                    return;
                }

                if (data && data.length > 0) {
                    localStorage.setItem('msp_user', JSON.stringify(data[0]));
                    showNotification("نجاح", `أهلاً بك يا سيد ${data[0].f03_full_name}`, "success");
                    setTimeout(() => window.location.replace('dashboard.html'), 1000);
                } else {
                    showNotification("دخول غير مصرح", "تأكد من اسم المستخدم وكلمة المرور.", "error");
                }
            } catch (err) {
                showNotification("عطل فني", "فشل الاتصال بقاعدة البيانات.", "error");
            }
        });
    }
});
