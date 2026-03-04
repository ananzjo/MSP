/* === MSP Visits Logic V5.0 === */
document.addEventListener('DOMContentLoaded', async () => {
    await loadLists();
    await fetchVisits();
    document.getElementById('visitForm').addEventListener('submit', handleSave);
});

async function loadLists() {
    const { data } = await supabaseClient.from('t02_lists').select('*');
    const govSel = document.getElementById('f01_governorate');
    const areaSel = document.getElementById('f02_area');

    const govs = data.filter(i => i.f01_category === 'governorate');
    govSel.innerHTML = '<option value="">اختر..</option>' + govs.map(g => `<option value="${g.f00_record_no}">${g.f02_label_ar}</option>`).join('');

    govSel.onchange = () => {
        const areas = data.filter(i => i.f05_parent_no == govSel.value);
        areaSel.innerHTML = areas.map(a => `<option value="${a.f02_label_ar}">${a.f02_label_ar}</option>`).join('');
    };
}

async function handleSave(e) {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem('msp_user'));
    
    const visitData = {
        f01_governorate: document.getElementById('f01_governorate').options[document.getElementById('f01_governorate').selectedIndex].text,
        f02_area: document.getElementById('f02_area').value,
        f03_facility_name: document.getElementById('f03_facility_name').value,
        f07_contact_person: document.getElementById('f07_contact_person').value,
        f09_phone: document.getElementById('f09_phone').value,
        f11_uses_carton: document.getElementById('f11_uses_carton').value,
        f12_monthly_qty: parseFloat(document.getElementById('f12_monthly_qty').value) || 0,
        f14_sales_opportunity: document.getElementById('f14_sales_opportunity').value,
        f19_rating: parseInt(document.getElementById('f19_rating').value),
        f16_sales_rep: user.f_full_name,
        f17_visit_date: new Date().toISOString().split('T')[0],
        f20_user_id: user.id
    };

    const { error } = await supabaseClient.from('t01_visits').insert([visitData]);
    if (!error) {
        showNotification("تم الحفظ", "تم توثيق الزيارة بنجاح ✅");
        e.target.reset();
        fetchVisits();
    }
}

async function fetchVisits() {
    const { data } = await supabaseClient.from('t01_visits').select('*').order('f00_created_at', {ascending: false}).limit(10);
    const tbody = document.getElementById('visitsTableBody');
    tbody.innerHTML = data.map(v => `
        <tr>
            <td>${v.f17_visit_date}</td>
            <td><b>${v.f03_facility_name}</b></td>
            <td>${v.f01_governorate}</td>
            <td>${v.f16_sales_rep}</td>
            <td><span style="color:${v.f14_sales_opportunity==='فورية'?'red':'inherit'}">${v.f14_sales_opportunity}</span></td>
        </tr>
    `).join('');
}
