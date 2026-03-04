/* === MSP Sales - Visits Logic [Fixed V3.2] === */

document.addEventListener('DOMContentLoaded', async () => {
    // 1. تعيين تاريخ اليوم تلقائياً في حقل f17
    const dateField = document.getElementById('f17_visit_date');
    if (dateField) dateField.valueAsDate = new Date();

    // 2. تحميل المحافظات من جدول t02_lists
    await loadGovernorates();

    // 3. مستمع تغيير المحافظة لتحميل المناطق
    const govSelect = document.getElementById('f01_governorate');
    if (govSelect) {
        govSelect.addEventListener('change', (e) => {
            loadAreas(e.target.value);
        });
    }

    // 4. معالجة حفظ النموذج
    const visitForm = document.getElementById('visitForm');
    if (visitForm) {
        visitForm.addEventListener('submit', handleSaveVisit);
    }

    // 5. جلب وعرض البيانات في الجدول السفلي
    fetchRecentVisits();
});

async function loadGovernorates() {
    const govSelect = document.getElementById('f01_governorate');
    if (!govSelect) return; // حماية من خطأ Null

    try {
        const { data, error } = await supabaseClient
            .from('t02_lists')
            .select('*')
            .eq('f01_category', 'governorate');

        if (error) throw error;

        govSelect.innerHTML = '<option value="">اختر المحافظة...</option>';
        data.forEach(gov => {
            // نستخدم f02_label_ar كقيمة ونص بناءً على السكيمة الخاصة بك
            govSelect.innerHTML += `<option value="${gov.f00_record_no}">${gov.f02_label_ar}</option>`;
        });
    } catch (err) {
        console.error("Gov Load Error:", err.message);
    }
}

async function loadAreas(parentNo) {
    const areaSelect = document.getElementById('f02_area');
    if (!areaSelect) return;

    if (!parentNo) {
        areaSelect.innerHTML = '<option value="">اختر المحافظة أولاً...</option>';
        return;
    }

    try {
        const { data, error } = await supabaseClient
            .from('t02_lists')
            .select('*')
            .eq('f01_category', 'area')
            .eq('f05_parent_no', parentNo);

        if (error) throw error;

        areaSelect.innerHTML = '<option value="">اختر المنطقة...</option>';
        data.forEach(area => {
            areaSelect.innerHTML += `<option value="${area.f02_label_ar}">${area.f02_label_ar}</option>`;
        });
    } catch (err) {
        console.error("Area Load Error:", err.message);
    }
}

async function handleSaveVisit(e) {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    btn.disabled = true;

    const user = JSON.parse(localStorage.getItem('msp_user'));
    
    // بناء كائن البيانات بناءً على SQL Schema (t01_visits)
    const visitData = {
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
        f19_rating: parseInt(document.getElementById('f19_rating').value) || 5
    };

    try {
        const { error } = await supabaseClient.from('t01_visits').insert([visitData]);
        if (error) throw error;

        showNotification("تم توثيق الزيارة بنجاح ✅", "success");
        e.target.reset();
        fetchRecentVisits();
    } catch (err) {
        showNotification("خطأ أثناء الحفظ: " + err.message, "error");
    } finally {
        btn.disabled = false;
    }
}

async function fetchRecentVisits() {
    const tableBody = document.getElementById('visitsTableBody');
    if (!tableBody) return;

    try {
        const { data, error } = await supabaseClient
            .from('t01_visits')
            .select('*')
            .order('f00_created_at', { ascending: false })
            .limit(10);

        if (error) throw error;

        tableBody.innerHTML = data.map(v => `
            <tr>
                <td>${v.f17_visit_date}</td>
                <td><b>${v.f03_facility_name}</b></td>
                <td>${v.f01_governorate}</td>
                <td>${v.f07_contact_person || '-'}</td>
                <td><span class="rating-badge">${v.f19_rating || 0}</span></td>
                <td><button class="btn-secondary" style="padding:4px 8px" onclick="showMspModal('ملاحظات الزيارة','${v.f15_notes || 'لا يوجد'}','info')">👁️</button></td>
            </tr>
        `).join('');
    } catch (err) {
        console.error("Fetch Error:", err.message);
    }
}
