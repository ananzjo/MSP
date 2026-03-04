/* === MSP Sales - Visits Logic === */

document.addEventListener('DOMContentLoaded', async () => {
    // 1. تحميل المحافظات من جدول t02_lists
    await loadGovernorates();

    // 2. مستمع تغيير المحافظة لتحميل المناطق
    document.getElementById('f_gov_id').addEventListener('change', (e) => {
        loadAreas(e.target.value);
    });

    // 3. معالجة حفظ النموذج
    document.getElementById('visitForm').addEventListener('submit', handleSaveVisit);
});

async function loadGovernorates() {
    const govSelect = document.getElementById('f_gov_id');
    try {
        const { data, error } = await supabaseClient
            .from('t02_lists')
            .select('*')
            .eq('f01_category', 'governorate');

        if (error) throw error;

        govSelect.innerHTML = '<option value="">اختر المحافظة...</option>';
        data.forEach(gov => {
            govSelect.innerHTML += `<option value="${gov.f00_record_no}">${gov.f02_label_ar}</option>`;
        });
    } catch (err) {
        console.error("Gov Load Error:", err);
    }
}

async function loadAreas(govId) {
    const areaSelect = document.getElementById('f_area_id');
    if (!govId) {
        areaSelect.innerHTML = '<option value="">اختر المحافظة أولاً...</option>';
        return;
    }

    try {
        const { data, error } = await supabaseClient
            .from('t02_lists')
            .select('*')
            .eq('f01_category', 'area')
            .eq('f05_parent_no', govId);

        if (error) throw error;

        areaSelect.innerHTML = '<option value="">اختر المنطقة...</option>';
        data.forEach(area => {
            areaSelect.innerHTML += `<option value="${area.f00_record_no}">${area.f02_label_ar}</option>`;
        });
    } catch (err) {
        console.error("Area Load Error:", err);
    }
}

async function handleSaveVisit(e) {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem('msp_user'));

    const visitData = {
        f_gov_id: document.getElementById('f_gov_id').value,
        f_area_id: document.getElementById('f_area_id').value,
        f_client_name: document.getElementById('f_client_name').value,
        f_visit_status: document.getElementById('f_visit_status').value,
        f_notes: document.getElementById('f_notes').value,
        f_created_by: user.f_username,
        f_date: new Date().toISOString()
    };

    try {
        // افترضنا اسم الجدول t03_visits حسب النمط المتبع
        const { error } = await supabaseClient.from('t03_visits').insert([visitData]);
        if (error) throw error;

        showNotification("تم حفظ الزيارة بنجاح", "success");
        e.target.reset();
    } catch (err) {
        showNotification("خطأ أثناء الحفظ: " + err.message, "error");
    }
}
