/* === START OF FILE === */
/**
 * Name: reports.js
 * Version: v1.0.0
 * Function: Fetches visit data and renders statistical charts using Chart.js.
 * Components: Data Aggregation, KPI Calculations, Chart Initialization.
 * I/O: Input from Supabase (t01_visits) / Output to HTML Canvas.
 */

// Global state for raw data and chart instances
let rawVisitsData = [];
let charts = {};

// When core engine is ready, fetch data
window.addEventListener('msp-core-ready', () => {
    fetchAndRenderReports();
});

// Generic Chart.js Theme Configuration (MSP Colors)
Chart.defaults.font.family = "'Inter', sans-serif";
Chart.defaults.color = '#64748b';
const MSP_COLORS = {
    green: '#10b981',
    blue: '#3b82f6',
    purple: '#8b5cf6',
    orange: '#f59e0b',
    red: '#ef4444',
    teal: '#14b8a6',
    pink: '#ec4899',
    indigo: '#6366f1'
};
const MSP_PALETTE = Object.values(MSP_COLORS);

async function fetchAndRenderReports() {
    try {
        console.log("Reporting: Fetching visits data...");
        // Fetch all visits
        const { data, error } = await window.supabase
            .from('t01_visits')
            .select('*')
            .order('f17_visit_date', { ascending: true }); // Chronological order

        if (error) throw error;
        
        rawVisitsData = data || [];
        console.log(`Reporting: Fetched ${rawVisitsData.length} records.`);

        // Process data and update UI
        updateKPIs();
        renderGovernorateChart();
        renderInterestChart();
        renderOpportunityChart();
        renderTimelineChart();

        // Hide loading overlay
        document.getElementById('loadingOverlay').classList.add('hidden');

    } catch (err) {
        console.error("Reporting Error:", err);
        alert("حدث خطأ أثناء تحميل الإحصائيات: " + err.message);
        document.getElementById('loadingOverlay').classList.add('hidden');
    }
}

// ----------------------------------------------------
// KPI Aggregations (حساب مؤشرات الأداء)
// ----------------------------------------------------
function updateKPIs() {
    // 1. Total Visits
    document.getElementById('kpi-total-visits').innerText = rawVisitsData.length;

    // 2. High Interest Leads
    const highInterestCount = rawVisitsData.filter(v => v.f13_interest_level === 'High').length;
    document.getElementById('kpi-high-interest').innerText = highInterestCount;

    // 3. Top Sales Rep
    const repCounts = countByProperty('f16_sales_rep');
    let topRep = "--";
    let maxRepVisits = 0;
    for (const [rep, count] of Object.entries(repCounts)) {
        if (count > maxRepVisits && rep !== 'undefined' && rep !== '') {
            maxRepVisits = count;
            topRep = rep;
        }
    }
    // Extract name from Ar|En format if needed
    if (topRep.includes('|')) topRep = topRep.split('|')[0].trim();
    document.getElementById('kpi-top-rep').innerText = topRep || '--';

    // 4. Top Governorate
    const govCounts = countByProperty('f01_governorate');
    let topGov = "--";
    let maxGovVisits = 0;
    for (const [gov, count] of Object.entries(govCounts)) {
        if (count > maxGovVisits && gov !== 'undefined' && gov !== '') {
            maxGovVisits = count;
            topGov = gov;
        }
    }
    if (topGov.includes('|')) topGov = topGov.split('|')[0].trim();
    document.getElementById('kpi-top-gov').innerText = topGov || '--';
}

// ----------------------------------------------------
// Chart Renderers (رسم المخططات البيانية)
// ----------------------------------------------------

// 1. Governorate Distribution (Doughnut)
function renderGovernorateChart() {
    const govCounts = countByProperty('f01_governorate', true);
    
    // Destroy previous instance to prevent ghosting
    if (charts.gov) charts.gov.destroy();

    const ctx = document.getElementById('govChart').getContext('2d');
    charts.gov = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(govCounts),
            datasets: [{
                data: Object.values(govCounts),
                backgroundColor: MSP_PALETTE,
                borderWidth: 2,
                borderColor: '#ffffff',
                hoverOffset: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'right', rtl: true, labels: { font: { family: 'Inter' } } }
            },
            cutout: '65%'
        }
    });
}

// 2. Interest Levels (Bar)
function renderInterestChart() {
    const interestCounts = countByProperty('f13_interest_level');
    // Map internal values to readable labels
    const dataMap = {
        'مرتفع High': interestCounts['High'] || 0,
        'متوسط Medium': interestCounts['Medium'] || 0,
        'منخفض Low': interestCounts['Low'] || 0
    };

    if (charts.interest) charts.interest.destroy();
    
    const ctx = document.getElementById('interestChart').getContext('2d');
    charts.interest = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(dataMap),
            datasets: [{
                label: 'عدد الزيارات',
                data: Object.values(dataMap),
                backgroundColor: [MSP_COLORS.red, MSP_COLORS.orange, MSP_COLORS.blue],
                borderRadius: 8,
                barThickness: 40
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, grid: { color: '#f1f5f9' }, ticks: { precision: 0 } },
                x: { grid: { display: false } }
            }
        }
    });
}

// 3. Sales Opportunities (Polar Area)
function renderOpportunityChart() {
    const oppCounts = countByProperty('f14_sales_opportunity', true);

    if (charts.opp) charts.opp.destroy();
    
    const ctx = document.getElementById('opportunityChart').getContext('2d');
    charts.opp = new Chart(ctx, {
        type: 'polarArea',
        data: {
            labels: Object.keys(oppCounts),
            datasets: [{
                data: Object.values(oppCounts),
                backgroundColor: [
                    'rgba(16, 185, 129, 0.7)', // Green
                    'rgba(59, 130, 246, 0.7)', // Blue
                    'rgba(245, 158, 11, 0.7)', // Orange
                    'rgba(139, 92, 246, 0.7)'  // Purple
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'right', rtl: true } }
        }
    });
}

// 4. Timeline (Line)
function renderTimelineChart() {
    // Group records by Month (YYYY-MM)
    const timelineData = {};
    
    rawVisitsData.forEach(v => {
        if (!v.f17_visit_date) return;
        const dateObj = new Date(v.f17_visit_date);
        // Format: YYYY-MM
        const monthKey = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}`;
        
        timelineData[monthKey] = (timelineData[monthKey] || 0) + 1;
    });

    // Sort chronologically
    const sortedMonths = Object.keys(timelineData).sort();
    const sortedCounts = sortedMonths.map(m => timelineData[m]);

    if (charts.timeline) charts.timeline.destroy();

    const ctx = document.getElementById('timelineChart').getContext('2d');
    
    // Create gradient fill
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(16, 185, 129, 0.4)');
    gradient.addColorStop(1, 'rgba(16, 185, 129, 0.05)');

    charts.timeline = new Chart(ctx, {
        type: 'line',
        data: {
            labels: sortedMonths,
            datasets: [{
                label: 'عدد الزيارات الشهري',
                data: sortedCounts,
                borderColor: MSP_COLORS.green,
                backgroundColor: gradient,
                borderWidth: 3,
                pointBackgroundColor: '#fff',
                pointBorderColor: MSP_COLORS.green,
                pointBorderWidth: 2,
                pointRadius: 5,
                pointHoverRadius: 7,
                fill: true,
                tension: 0.4 // Smooth curves
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                }
            },
            scales: {
                y: { beginAtZero: true, grid: { color: '#f1f5f9' }, ticks: { precision: 0 } },
                x: { grid: { display: false } }
            },
            interaction: {
                mode: 'nearest',
                axis: 'x',
                intersect: false
            }
        }
    });
}

// ----------------------------------------------------
// Utility Helpers (وظائف مساعدة)
// ----------------------------------------------------

/**
 * Counts occurrences of a specific property in the raw dataset.
 * @param {string} propName - The column internal name (e.g., 'f01_governorate')
 * @param {boolean} extractArabicOnly - If true, extracts only the Arabic part before '|'
 */
function countByProperty(propName, extractArabicOnly = false) {
    return rawVisitsData.reduce((acc, obj) => {
        let val = obj[propName] || 'غير محدد';
        if (extractArabicOnly && val.includes('|')) {
            val = val.split('|')[0].trim();
        }
        acc[val] = (acc[val] || 0) + 1;
        return acc;
    }, {});
}

/* === END OF FILE === */
