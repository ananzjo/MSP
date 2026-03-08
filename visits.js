/* === START OF FILE === */
/* * File: visits.js | Version: v14.0.0 
 * Logic: Fixed Sidebar, Dynamic Record Counter & Stacked Excel Filters
 */

let lists = [];
let rawData = [];
let editMode = false;

// وظيفة التشغيل الذاتي لضمان جاهزية Supabase
(function() {
    const checkSupabase = setInterval(() => {
        if (window.supabase) {
            clearInterval(checkSupabase);
            initMSP();
        }
    }, 300);
})();

async function initMSP() {
    try {
        await loadLists();
        await fetchVisits();
        setupEventListeners();
        
        // إشارة تشغيل القائمة الجانبية والساعة الرقمية
        setTimeout(() => {
            window.dispatchEvent(new Event('msp-core-ready'));
        }, 500);
        
    } catch (e) { showFullFeedback("error", "خطأ في النظام", e.message); }
}

// 1. تحميل القوائم المنسدلة
async function loadLists() {
    const { data } = await window.supabase.from('t02_lists').select('*');
    lists = data || [];
    
    const mapping = {
        'f04_facility_type': 'facility_type',
        'f05_industrial_sector': 'sector',
        'f11_uses_carton': 'carton_use',
        'f14_sales_opportunity': 'opportunity',
        'f16_sales_rep': 'sales_rep'
    };

    for (let [id, cat] of Object.entries(mapping)) {
        const el = document.getElementById(id);
        if (el) {
            el.innerHTML = '<option value="">-- اختر --</option>';
            lists.filter(l => l.f01_category === cat).forEach(item => {
                el.add(new Option(item.f02_label_ar, item.f04_value || item.f02_label_ar));
            });
        }
    }

    const gov = document.getElementById('f01_governorate');
    const area = document.getElementById('f02_area');
    gov.innerHTML = '<option value="">-- المحافظة --</option>';
    lists.filter(l => l.f01_category === 'governorate').forEach(g => {
        let opt = new Option(g.f02_label_ar, g.f04_value);
        opt.dataset.rid = g.f00_record_no;
        gov.add(opt);
    });

    gov.onchange = () => {
        area.innerHTML = '<option value="">-- المنطقة --</option>';
        const selRid = gov.options[gov.selectedIndex]?.dataset.rid;
        if (selRid) {
            lists.filter(l => l.f01_category === 'area' && String(l.f05_parent_no) === String(selRid))
                 .forEach(a => area.add(new Option(a.f02_label_ar, a.f04_value || a.f02_label_ar)));
        }
    };
}

// 2. جلب البيانات وعرضها مع تحديث العداد
async function fetchVisits() {
    const { data } = await window.supabase.from('t01_visits').select('*').order('f17_visit_date', { ascending: false });
    rawData = data || [];
    renderTable(rawData);
}

function renderTable(data) {
    const tbody = document.getElementById('visitsTableBody');
    const countDiv = document.getElementById('recordsCount');
    
    // تحديث عداد السجلات (Feedback للعدد الحالي)
    if (countDiv) countDiv.innerText = `عدد السجلات: ${data.length}`;

    tbody.innerHTML = data.map(r => `
        <tr>
            <td>${r.f17_visit_date || ''}</td>
            <td><b>${r.f03_facility_name || ''}</b></td>
            <td>${r.f01_governorate || ''}</td>
            <td>${r.f16_sales_rep || ''}</td>
            <td><button onclick="loadToEdit('${r.id}')" style="cursor:pointer; border:none; background:none; font-size:1.1rem;">✏️</button></td>
        </tr>
    `).join('');
}

// 3. الفلاتر والبحث الشامل
function setupEventListeners() {
    // البحث العالمي (أقصى اليسار)
    document.getElementById('globalSearch').oninput = (e) => {
        const val = e.target.value.toLowerCase();
        const filtered = rawData.filter(row => 
            Object.values(row).some(v => String(v).toLowerCase().includes(val))
        );
        renderTable(filtered);
    };

    // فلاتر الأعمدة التراكمية (فوق الليبل)
    const columnFilters = document.querySelectorAll('.col-filter');
    columnFilters.forEach(input => {
        input.oninput = () => {
            let filtered = [...rawData];
            columnFilters.forEach(filter => {
                const val = filter.value.toLowerCase();
                const colKey = filter.dataset.col; // يتوقع مفتاح مثل f17 أو f03
                if (val) {
                    filtered = filtered.filter(r => 
                        String(r[colKey] || '').toLowerCase().includes(val)
                    );
                }
            });
            renderTable(filtered);
        };
    });

    // منطق الحفظ والتحديث
    document.getElementById('visitForm').onsubmit = async (e) => {
        e.preventDefault();
        showFullFeedback("loading", "جاري المعالجة", "يتم التواصل مع قاعدة البيانات...");

        const payload = {};
        const fields = [
            'f01_governorate', 'f02_area', 'f03_facility_name', 'f04_facility_type',
            'f05_industrial_sector', 'f06_address', 'f07_contact_person', 'f08_job_title',
            'f09_phone', 'f10_email', 'f11_uses_carton', 'f12_monthly_qty',
            'f13_interest_level', 'f14_sales_opportunity', 'f15_notes', 'f16_sales_rep', 'f17_visit_date'
        ];

        fields.forEach(f => {
            const el = document.getElementById(f);
            if (el) payload[f] = (f === 'f12_monthly_qty') ? (parseFloat(el.value) || 0) : (el.value || null);
        });

        const id = document.getElementById('edit_id').value;
        const { error } = editMode 
            ? await window.supabase.from('t01_visits').update(payload).eq('id', id)
            : await window.supabase.from('t01_visits').insert([payload]);

        if (!error) {
            showFullFeedback("success", "نجحت العملية", "تم تحديث سجلات MSP بنجاح.");
            resetForm();
            fetchVisits();
        } else {
            showFullFeedback("error", "فشل الإجراء", error.message);
        }
    };
    
    document.getElementById('btnReset').onclick = resetForm;
}

// 4. وظائف المساعدة والتحرير
window.loadToEdit = async (id) => {
    const { data } = await window.supabase.from('t01_visits').select('*').eq('id', id).single();
    if (data) {
        editMode = true;
        document.getElementById('edit_id').value = data.id;
        Object.keys(data).forEach(k => {
            const el = document.getElementById(k);
            if (el) { el.value = data[k] || ""; if(k==='f01_governorate') el.dispatchEvent(new Event('change')); }
        });
        document.getElementById('btnSave').innerHTML = '<i class="fas fa-sync"></i> تحديث البيانات';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
};

function showFullFeedback(type, title, msg) {
    const m = document.getElementById('mspModal');
    const icon = document.getElementById('modalIcon');
    icon.innerHTML = type === "success" ? "✅" : (type === "error" ? "❌" : "⏳");
    document.getElementById('modalTitle').innerText = title;
    document.getElementById('modalMsg').innerText = msg;
    m.style.display = 'flex';
}

function closeMSPModal() { document.getElementById('mspModal').style.display = 'none'; }

function resetForm() {
    document.getElementById('visitForm').reset();
    editMode = false;
    document.getElementById('edit_id').value = "";
    document.getElementById('btnSave').innerHTML = '<i class="fas fa-save"></i> تسجيل الزيارة';
    document.getElementById('f17_visit_date').valueAsDate = new Date();
}

/* === START OF FILE === */
function renderTable(data) {
    const tbody = document.getElementById('visitsTableBody');
    const countDiv = document.getElementById('recordsCount');
    
    // تحديث العداد فورياً
    if (countDiv) countDiv.innerText = `عدد السجلات: ${data.length}`;

    tbody.innerHTML = data.map(r => `
        <tr>
            <td>${r.f17_visit_date || ''}</td>
            <td><b>${r.f03_facility_name || ''}</b></td>
            <td>${r.f01_governorate || ''}</td>
            <td>${r.f16_sales_rep || ''}</td>
            <td><button onclick="loadToEdit('${r.id}')" style="border:none; background:none; cursor:pointer">✏️</button></td>
        </tr>
    `).join('');
}

/* === END OF FILE === */