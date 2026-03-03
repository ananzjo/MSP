/* === Sales Visits App - Logic Script (Supabase Simplified Version) === */

let masterLists = []; // لتخزين كافة القوائم المرجعية
let currentVisits = []; // لتخزين بيانات الجدول المعروضة

document.addEventListener('DOMContentLoaded', () => {
    loadInitialData();
    setupFormEventListeners();
});

/**
 * 1. تحميل البيانات الأولية عند فتح الصفحة
 */
async function loadInitialData() {
    try {
        // جلب القوائم من الجدول المبسط t02_lists
        const { data: lists, error: listError } = await supabaseClient
            .from('t02_lists')
            .select('*');

        if (listError) throw listError;
        masterLists = lists;

        // تعبئة القوائم المنسدلة بناءً على التصنيف (f01_category)
        populateDropdown('f_governorate', filterList('governorate'));
        populateDropdown('f_facility_type', filterList('facility_type'));
        populateDropdown('f_industrial_sector', filterList('sector'));
        populateDropdown('f_uses_carton', filterList('carton_use'));
        populateDropdown('f_interest_level', filterList('interest_level'));
        populateDropdown('f_sales_opportunity', filterList('opportunity'));
        populateDropdown('f_sales_rep', filterList('sales_rep'));
        populateDropdown('f_follow_up', filterList('visit_type'));

        // تحميل بيانات الزيارات في الجدول
        await fetchVisitsTable();

    } catch (error) {
        console.error("Error loading data:", error);
        showNotification("حدث خطأ أثناء تحميل البيانات المرجعية", "error");
    }
}

/**
 * 2. منطق القوائم المعتمدة (المحافظة والمنطقة)
 * يعتمد على ربط f05_parent_no بـ f00_record_no
 */
document.getElementById('f_governorate').onchange = function() {
    const selectedGovName = this.value;
    const areaDropdown = document.getElementById('f_area');
    
    // العثور على سجل المحافظة المختار للحصول على رقم السجل الخاص به
    const selectedGovRecord = masterLists.find(item => 
        item.f01_category === 'governorate' && item.f02_label_ar === selectedGovName
    );

    if (selectedGovRecord) {
        // جلب المناطق التي تملك parent_no يساوي record_no للمحافظة
        const relatedAreas = masterLists.filter(item => 
            item.f01_category === 'area' && item.f05_parent_no === selectedGovRecord.f00_record_no
        );
        populateDropdown('f_area', relatedAreas);
    } else {
        areaDropdown.innerHTML = '<option value="">اختر المحافظة أولاً...</option>';
    }
};

/**
 * 3. جلب وعرض بيانات الزيارات (t01_visits)
 */
async function fetchVisitsTable() {
    const { data, error } = await supabaseClient
        .from('t01_visits')
        .select('*')
        .order('f17_visit_date', { ascending: false });

    if (error) return;
    currentVisits = data;
    renderTable(data);
}

function renderTable(data) {
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = data.map((v, index) => {
        const rating = parseInt(v.f19_rating) || 0;
        const ratingClass = rating >= 8 ? 'badge-rating-high' : (rating >= 5 ? 'badge-rating-mid' : 'badge-rating-low');
        
        return `
            <tr>
                <td>${v.f17_visit_date}</td>
                <td><strong>${v.f03_facility_name}</strong></td>
                <td>${v.f01_governorate}</td>
                <td>${v.f16_sales_rep}</td>
                <td><span class="badge badge-opportunity">${v.f14_sales_opportunity}</span></td>
                <td><span class="badge ${ratingClass}">${rating}/10</span></td>
                <td>
                    <button class="edit-btn" onclick="prepareEdit(${index})">تعديل</button>
                    <button class="delete-btn" onclick="deleteVisit(${v.id})">حذف</button>
                </td>
            </tr>
        `;
    }).join('');
}

/**
 * 4. معالجة إرسال النموذج (إضافة أو تحديث)
 */
function setupFormEventListeners() {
    const form = document.getElementById('visitForm');
    form.onsubmit = async (e) => {
        e.preventDefault();
        const saveBtn = document.getElementById('saveBtn');
        saveBtn.disabled = true;
        saveBtn.textContent = "جاري الحفظ...";

        const editingId = form.dataset.editingId;
        const formData = {
            f01_governorate: document.getElementById('f_governorate').value,
            f02_area: document.getElementById('f_area').value,
            f03_facility_name: document.getElementById('f_facility_name').value,
            f04_facility_type: document.getElementById('f_facility_type').value,
            f05_industrial_sector: document.getElementById('f_industrial_sector').value,
            f06_address: document.getElementById('f_address').value,
            f07_contact_person: document.getElementById('f_contact_person').value,
            f08_job_title: document.getElementById('f_job_title').value,
            f09_phone: document.getElementById('f_phone').value,
            f10_email: document.getElementById('f_email').value,
            f11_uses_carton: document.getElementById('f_uses_carton').value,
            f12_monthly_qty: parseFloat(document.getElementById('f_monthly_qty').value) || 0,
            f13_interest_level: document.getElementById('f_interest_level').value,
            f14_sales_opportunity: document.getElementById('f_sales_opportunity').value,
            f15_notes: document.getElementById('f_notes').value,
            f16_sales_rep: document.getElementById('f_sales_rep').value,
            f17_visit_date: document.getElementById('f_visit_date').value,
            f18_follow_up: document.getElementById('f_follow_up').value,
            f19_rating: parseInt(document.getElementById('f_rating').value)
        };

        let result;
        if (editingId) {
            result = await supabaseClient.from('t01_visits').update(formData).eq('id', editingId);
        } else {
            result = await supabaseClient.from('t01_visits').insert([formData]);
        }

        if (!result.error) {
            showNotification("تم حفظ الزيارة بنجاح", "success");
            form.reset();
            delete form.dataset.editingId;
            saveBtn.textContent = "حفظ الزيارة";
            fetchVisitsTable();
        } else {
            showNotification("خطأ في الحفظ: " + result.error.message, "error");
        }
        saveBtn.disabled = false;
    };
}

/**
 * وظائف مساعدة (Helpers)
 */
function filterList(category) {
    return masterLists.filter(item => item.f01_category === category);
}

function populateDropdown(id, list) {
    const el = document.getElementById(id);
    if (!el) return;
    el.innerHTML = '<option value="">اختر...</option>';
    list.forEach(item => {
        el.innerHTML += `<option value="${item.f02_label_ar}">${item.f02_label_ar}</option>`;
    });
}

function prepareEdit(index) {
    const v = currentVisits[index];
    const form = document.getElementById('visitForm');
    
    // تعبئة الحقول الأساسية
    document.getElementById('f_governorate').value = v.f01_governorate;
    // إطلاق حدث التغيير لتعبئة قائمة المناطق
    document.getElementById('f_governorate').dispatchEvent(new Event('change'));
    
    // تأخير بسيط لضمان تحميل قائمة المناطق قبل اختيار القيمة
    setTimeout(() => {
        document.getElementById('f_area').value = v.f02_area;
        document.getElementById('f_facility_name').value = v.f03_facility_name;
        document.getElementById('f_facility_type').value = v.f04_facility_type;
        document.getElementById('f_industrial_sector').value = v.f05_industrial_sector;
        document.getElementById('f_address').value = v.f06_address;
        document.getElementById('f_contact_person').value = v.f07_contact_person;
        document.getElementById('f_job_title').value = v.f08_job_title;
        document.getElementById('f_phone').value = v.f09_phone;
        document.getElementById('f_email').value = v.f10_email;
        document.getElementById('f_uses_carton').value = v.f11_uses_carton;
        document.getElementById('f_monthly_qty').value = v.f12_monthly_qty;
        document.getElementById('f_interest_level').value = v.f13_interest_level;
        document.getElementById('f_sales_opportunity').value = v.f14_sales_opportunity;
        document.getElementById('f_notes').value = v.f15_notes;
        document.getElementById('f_sales_rep').value = v.f16_sales_rep;
        document.getElementById('f_visit_date').value = v.f17_visit_date;
        document.getElementById('f_follow_up').value = v.f18_follow_up;
        document.getElementById('f_rating').value = v.f19_rating;
        document.getElementById('rating-val').textContent = v.f19_rating;

        form.dataset.editingId = v.id;
        document.getElementById('saveBtn').textContent = "تحديث البيانات";
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
}

async function deleteVisit(id) {
    if (!confirm("هل أنت متأكد من حذف هذه الزيارة نهائياً؟")) return;
    const { error } = await supabaseClient.from('t01_visits').delete().eq('id', id);
    if (!error) {
        showNotification("تم حذف السجل بنجاح", "success");
        fetchVisitsTable();
    }
}