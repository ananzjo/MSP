/* === MSP Sales Documentation - Visits Logic [V4.0] === */

document.addEventListener('DOMContentLoaded', async () => {
    // 1. تعيين التاريخ الافتراضي (f17_visit_date) ليومنا هذا
    const dateInput = document.getElementById('f17_visit_date');
    if (dateInput) dateInput.valueAsDate = new Date();

    // 2. تحميل القوائم (المحافظات والمناطق) من t02_lists
    await loadLocationLists();

    // 3. جلب آخر الزيارات الموثقة لعرضها في الجدول السفلي
    await fetchRecentVisits();

    // 4. معالجة إرسال النموذج (Submit)
    const visitForm = document.getElementById('visitForm');
    if (visitForm) {
        visitForm.addEventListener('submit', handleSaveVisit);
    }
});

/**
 * وظيفة تحميل المحافظات والمناطق المرتبطة
 */
async function loadLocationLists() {
    const govSelect = document.getElementById('f01_governorate');
    const areaSelect = document.getElementById('f02_area');
    if (!govSelect || !areaSelect) return;

    try {
        const { data, error } = await supabaseClient
            .from('t02_lists')
            .select('*');

        if (error) throw error;

        // تصفية المحافظات
        const govs = data.filter(item => item.f01_category === 'governorate');
        govSelect.innerHTML = '<option value="">اختر المحافظة...</option>' + 
            govs.map(g => `<option value="${g.f00_record_no}" data-name="${g.f02_label_ar}">${g.f02_label_ar}</option>`).join('');

        // مستمع تغيير المحافظة لتحديث المناطق
        govSelect.addEventListener('change', () => {
            const selectedGovId = govSelect.value;
            const filteredAreas = data.filter(item => item.f01_category === 'area' && item.f05_parent_no == selectedGovId);
            
            areaSelect.innerHTML = '<option value="">اختر المنطقة...</option>' + 
                filteredAreas.map(a => `<option value="${a.f02_label_ar}">${a.f02_label_ar}</option>`).join('');
        });

    } catch (err) {
        console.error("خطأ في تحميل القوائم:", err.message);
    }
}

/**
 * وظيفة حفظ الزيارة في جدول t01_visits
 */
async function handleSaveVisit(e) {
    e.preventDefault();
    const submitBtn = e.target.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.innerHTML = 'جاري التوثيق... ⏳';

    const user = JSON.parse(localStorage.getItem('msp_user'));

    // بناء كائن البيانات لمطابقة السكيمة (20 حقلاً)
    const visitRecord = {
        f01_governorate: document.getElementById('f01_governorate').options[document.getElementById('f01_governorate').selectedIndex].text,
        f02_area: document.getElementById('f02_area').value,
        f03_facility_name: document.getElementById('f03_facility_name').value,
        f04_facility_type: document.getElementById('f04_facility_type').value,
        f05_industrial_sector: document.getElementById('f05_industrial_sector').value,
        f06_address: document.getElementById('f06_address').value,
        f07_contact_person: document.getElementById('f07_contact_person').value,
        f08_job_title: document.getElementById('f08_job_title').value,
        f09_phone: document.getElementById('f09_phone').value,
        f10_email: document.getElementById('f10_email').value,
        f11_uses_carton: document.getElementById('f11_uses_carton').value,
        f12_monthly_qty: parseFloat(document.getElementById('f12_monthly_qty').value) || 0,
        f13_interest_level: document.getElementById('f13_interest_level').value,
        f15_notes: document.getElementById('f15_notes').value,
        f16_sales_rep: user ? user.f_full_name : 'Unknown',
        f17_visit_date: document.getElementById('f17_visit_date').value,
        f18_follow_up: document.getElementById('f18_follow_up').value,
        f19_rating: parseInt(document.getElementById('f19_rating').value) || 5,
        f20_user_id: user ? user.id : null // ربط الزيارة بهوية المستخدم
    };

    try {
        const { error } = await supabaseClient
            .from('t01_visits')
            .insert([visitRecord]);

        if (error) throw error;

        // إشعار النجاح باستخدام المودال العالمي
        showNotification("نجاح التوثيق", "تم حفظ بيانات الزيارة والموقع بنجاح في السحابة.", "success");
        
        e.target.reset();
        document.getElementById('f17_visit_date').valueAsDate = new Date();
        await fetchRecentVisits(); // تحديث الجدول فوراً

    } catch (err) {
        showNotification("فشل الحفظ", err.message, "error");
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'حفظ وتوثيق الزيارة 💾';
    }
}

/**
 * وظيفة جلب البيانات للجدول السفلي
 */
async function fetchRecentVisits() {
    const tbody = document.getElementById('visitsTableBody');
    if (!tbody) return;

    try {
        const { data, error } = await supabaseClient
            .from('t01_visits')
            .select('*')
            .order('f00_created_at', { ascending: false })
            .limit(10);

        if (error) throw error;

        tbody.innerHTML = data.map(v => `
            <tr>
                <td><span style="color:var(--msp-bronze)">${v.f17_visit_date}</span></td>
                <td><strong>${v.f03_facility_name}</strong></td>
                <td>${v.f01_governorate} - ${v.f02_area}</td>
                <td>${v.f07_contact_person || '-'}</td>
                <td><span class="rating-badge">${v.f19_rating || 5}/10</span></td>
                <td>
                    <button class="btn-secondary" style="padding:5px 10px" onclick="alert('ملاحظات: ${v.f15_notes || "لا يوجد"}')">👁️</button>
                </td>
            </tr>
        `).join('');

    } catch (err) {
        console.error("خطأ في جلب البيانات:", err.message);
    }
}
