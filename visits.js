/* === START OF FILE === */
/*
 * Name: visits.js
 * Version: v15.0.0
 * Function: Handles the core logic, CRUD operations, filtering, and UI interactions for visits.
 * Components: Supabase Integration, Data Fetching, Form Handling, Logic & Modals.
 * I/O: Input: HTML Forms / Output: Database Records, UI Updates, Analytics Logs.
 */

// Global Variables (المتغيرات العامة)

let lists = [];
let rawData = [];
let editMode = false;

// 0. Auto-Init Function to ensure Supabase readiness (وظيفة التشغيل الذاتي لضمان جاهزية قاعدة البيانات)
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
        
        // Signal the Sidebar and Clock to start (إشارة تشغيل القائمة الجانبية والساعة الرقمية)
        setTimeout(() => {
            window.dispatchEvent(new Event('msp-core-ready'));
        }, 500);
        
    } catch (e) { showFullFeedback("error", "خطأ في النظام (System Error)", e.message); }
}

// 1. Load Dropdown Lists (تحميل القوائم المنسدلة)
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

// 2. Fetch Data and Update Counters (جلب البيانات وعرضها مع تحديث العداد)
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

// 3. Filters, Global Search, and Event Listeners (الفلاتر والبحث الشامل والمستمعين)
function setupEventListeners() {
    // Global Search (البحث العالمي أقصى اليسار)
    document.getElementById('globalSearch').oninput = (e) => {
        const val = e.target.value.toLowerCase();
        const filtered = rawData.filter(row => 
            Object.values(row).some(v => String(v).toLowerCase().includes(val))
        );
        renderTable(filtered);
    };

    // Cumulative Column Filters (فلاتر الأعمدة التراكمية فوق الليبل)
    const columnFilters = document.querySelectorAll('.col-filter');
    columnFilters.forEach(input => {
        input.oninput = () => {
            let filtered = [...rawData];
            columnFilters.forEach(filter => {
                const val = filter.value.toLowerCase();
                const colKey = filter.dataset.col; 
                if (val) {
                    filtered = filtered.filter(r => 
                        String(r[colKey] || '').toLowerCase().includes(val)
                    );
                }
            });
            renderTable(filtered);
        };
    });

    // Handle Table Sorting (إدارة فرز الجدول بالضغط على العناوين)
    const headers = document.querySelectorAll('th span');
    let sortAsc = true;
    headers.forEach(header => {
        header.style.cursor = 'pointer';
        header.onclick = () => {
            const th = header.closest('th');
            const filterInput = th.querySelector('.col-filter');
            if(!filterInput) return;
            
            const colKey = filterInput.dataset.col;
            rawData.sort((a, b) => {
                let valA = a[colKey] || '';
                let valB = b[colKey] || '';
                if(valA < valB) return sortAsc ? -1 : 1;
                if(valA > valB) return sortAsc ? 1 : -1;
                return 0;
            });
            sortAsc = !sortAsc;
            
            // Reapply any active filters after sorting (إعادة تطبيق الفلاتر بعد الفرز)
            const globalVal = document.getElementById('globalSearch').value.toLowerCase();
            let displayData = [...rawData];
            if(globalVal) {
                 displayData = displayData.filter(row => Object.values(row).some(v => String(v).toLowerCase().includes(globalVal)));
            }
            columnFilters.forEach(filter => {
                const val = filter.value.toLowerCase();
                if(val) displayData = displayData.filter(r => String(r[filter.dataset.col] || '').toLowerCase().includes(val));
            });
            renderTable(displayData);
        };
    });

    // Save and Update Logic (منطق الحفظ والتحديث)
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
        const actionType = editMode ? "Update Visit" : "Create Visit";

        // Capture GPS Location (التقاط الموقع الجغرافي)
        const locationCoords = await getLocation();

        const { error } = editMode 
            ? await window.supabase.from('t01_visits').update(payload).eq('id', id)
            : await window.supabase.from('t01_visits').insert([payload]);

        if (!error) {
            // Log the Event (توثيق الحدث)
            await window.supabase.from('t98_logs').insert([{
                f01_action_type: actionType,
                f02_user: 'Current User', // TODO: Map to actual logged-in user when Standard 15 Authentication is implemented
                f03_timestamp: new Date().toISOString(),
                f04_details: `Record ID: ${id || 'New'}. GPS: ${locationCoords}`
            }]);

            closeMSPModal();
            showToast("success", "نجحت العملية (Success)", "تم تحديث سجلات MSP بنجاح. (Records updated successfully.)");
            resetForm();
            fetchVisits();
        } else {
            showFullFeedback("error", "فشل الإجراء (Action Failed)", error.message);
        }
    };
    
    document.getElementById('btnReset').onclick = () => {
        resetForm();
        showToast('info', 'زيارة جديدة (New Visit)', 'تم تهيئة النموذج لإضافة سجل جديد. (Form ready for new entry.)');
    };
}

// 4. Helper and Edit Functions (وظائف المساعدة والتحرير)
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
        showToast('info', 'وضع التعديل (Edit Mode)', 'تم جلب بيانات السجل بنجاح للتعديل. (Record data loaded for editing.)');
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

// Toast Notification Helper (نظام إشعارات التوست)
window.showToast = function(type, title, msg) {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `msp-toast ${type}`;
    
    let iconClass = 'fa-info-circle';
    if(type === 'success') iconClass = 'fa-check-circle';
    if(type === 'error') iconClass = 'fa-exclamation-triangle';

    toast.innerHTML = `
        <div class="toast-icon"><i class="fas ${iconClass}"></i></div>
        <div class="toast-content">
            <span class="toast-title">${title}</span>
            <span class="toast-msg">${msg}</span>
        </div>
    `;
    
    container.appendChild(toast);
    
    // Animate in
    setTimeout(() => toast.classList.add('show'), 10);
    
    // Auto remove
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 400); 
    }, 4500);
}

// Delete Logic (منطق الحذف)
let deleteTargetId = null;
window.confirmDelete = (id) => {
    deleteTargetId = id;
    document.getElementById('deleteModal').style.display = 'flex';
};

window.closeDeleteModal = () => {
    document.getElementById('deleteModal').style.display = 'none';
    deleteTargetId = null;
};

document.getElementById('btnConfirmDelete').onclick = async () => {
    if (!deleteTargetId) return;
    
    showFullFeedback("loading", "جاري الحذف (Deleting)", "يتم حذف السجل من قاعدة البيانات...");
    
    const { error } = await window.supabase.from('t01_visits').delete().eq('id', deleteTargetId);
    
    closeMSPModal();
    closeDeleteModal();
    
    if (!error) {
        await window.supabase.from('t98_logs').insert([{
            f01_action_type: "Delete Visit",
            f02_user: 'Current User',
            f03_timestamp: new Date().toISOString(),
            f04_details: `Deleted Record ID: ${deleteTargetId}`
        }]);
        
        showToast("success", "تم الحذف (Deleted)", "تم مسح السجل نهائياً. (Record deleted permanently.)");
        fetchVisits();
    } else {
        showFullFeedback("error", "خطأ في الحذف (Delete Error)", error.message);
    }
};

function resetForm() {
    document.getElementById('visitForm').reset();
    editMode = false;
    document.getElementById('edit_id').value = "";
    document.getElementById('btnSave').innerHTML = '<i class="fas fa-save"></i> تسجيل الزيارة';
    document.getElementById('f17_visit_date').valueAsDate = new Date();
}

// 5. GPS Location Helper (مساعد التقاط الموقع)
function getLocation() {
    return new Promise((resolve) => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => resolve(`${position.coords.latitude}, ${position.coords.longitude}`),
                (error) => resolve(`Location Error: ${error.message}`)
            );
        } else {
            resolve("Geolocation not supported");
        }
    });
}

// Table Render logic with FontAwesome buttons and count feedback (توليد الجدول مع الأزرار والعداد)
function renderTable(data) {
    const tbody = document.getElementById('visitsTableBody');
    const countDiv = document.getElementById('recordsCount');
    
    // Update counter (تحديث العداد فورياً)
    if (countDiv) countDiv.innerText = `عدد السجلات (Records): ${data.length}`;

    tbody.innerHTML = data.map(r => `
        <tr>
            <td>${r.f17_visit_date || ''}</td>
            <td><b>${r.f03_facility_name || ''}</b></td>
            <td>${r.f01_governorate || ''}</td>
            <td>${r.f16_sales_rep || ''}</td>
            <td>
                <button type="button" class="btn-edit" onclick="loadToEdit('${r.id}')" title="تعديل Edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button type="button" class="btn-danger" onclick="confirmDelete('${r.id}')" title="حذف Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

/* === END OF FILE === */