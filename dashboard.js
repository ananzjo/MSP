/* MSP Dashboard Logic - Integrating Supabase with Chart.js */

document.addEventListener('DOMContentLoaded', async () => {
    const { data: visits, error } = await supabaseClient.from('t01_visits').select('*');
    if (error) return console.error(error);

    updateCounters(visits);
    renderGeoChart(visits);
    renderRepChart(visits);
    renderQtyChart(visits);
});

// 1. تحديث الأرقام العلوية
function updateCounters(data) {
    document.getElementById('totalVisits').textContent = data.length;
    document.getElementById('hotLeads').textContent = data.filter(v => v.f14_sales_opportunity === 'فورية').length;
    
    const totalQty = data.reduce((sum, v) => sum + (parseFloat(v.f12_monthly_qty) || 0), 0);
    document.getElementById('totalQty').textContent = totalQty.toLocaleString();

    const avg = data.reduce((sum, v) => sum + (v.f19_rating || 0), 0) / data.length;
    document.getElementById('avgRating').textContent = avg.toFixed(1) + "/10";
}

// 2. رسم بياني جغرافي (دائري)
function renderGeoChart(data) {
    const counts = {};
    data.forEach(v => counts[v.f01_governorate] = (counts[v.f01_governorate] || 0) + 1);

    new Chart(document.getElementById('geoChart'), {
        type: 'doughnut',
        data: {
            labels: Object.keys(counts),
            datasets: [{
                data: Object.values(counts),
                backgroundColor: ['#2fb45a', '#b08d57', '#3498db', '#e74c3c', '#f1c40f'],
                borderWidth: 0
            }]
        },
        options: { plugins: { legend: { position: 'bottom', labels: { color: '#fff' } } } }
    });
}

// 3. رسم بياني للمناديب (أعمدة)
function renderRepChart(data) {
    const counts = {};
    data.forEach(v => counts[v.f16_sales_rep] = (counts[v.f16_sales_rep] || 0) + 1);

    new Chart(document.getElementById('repChart'), {
        type: 'bar',
        data: {
            labels: Object.keys(counts),
            datasets: [{
                label: 'عدد الزيارات',
                data: Object.values(counts),
                backgroundColor: 'rgba(47, 180, 90, 0.6)',
                borderColor: '#2fb45a',
                borderWidth: 1
            }]
        },
        options: { scales: { y: { ticks: { color: '#fff' } }, x: { ticks: { color: '#fff' } } } }
    });
}

// 4. تحليل الطلب المتوقع (خطي)
function renderQtyChart(data) {
    // ترتيب البيانات حسب التاريخ
    const sorted = data.sort((a, b) => new Date(a.f17_visit_date) - new Date(b.f17_visit_date));
    
    new Chart(document.getElementById('qtyChart'), {
        type: 'line',
        data: {
            labels: sorted.map(v => v.f17_visit_date),
            datasets: [{
                label: 'الكمية المتوقعة (طن)',
                data: sorted.map(v => v.f12_monthly_qty),
                borderColor: '#b08d57',
                backgroundColor: 'rgba(176, 141, 87, 0.1)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: { y: { ticks: { color: '#fff' } }, x: { ticks: { color: '#fff' } } }
        }
    });
}