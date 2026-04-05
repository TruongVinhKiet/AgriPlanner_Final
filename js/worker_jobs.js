/**
 * Worker Jobs Page - JavaScript Logic
 * Handles: job listing, CV management, applications, PDF upload
 */

const API_BASE = window.API_BASE_URL || 'http://localhost:8080/api';
let currentJobTab = 'jobs';
let selectedCvTemplate = 'classic';
let uploadedPdfFile = null;

// ============ HELPERS ============
function getToken() {
    return localStorage.getItem('token') || sessionStorage.getItem('token') || '';
}

function getCurrentUserId() {
    return localStorage.getItem('userId') || sessionStorage.getItem('userId');
}

async function fetchAPI(url, method = 'GET', body = null) {
    const opts = {
        method,
        headers: {
            'Authorization': 'Bearer ' + getToken(),
            'Content-Type': 'application/json'
        }
    };
    if (body && method !== 'GET') opts.body = JSON.stringify(body);
    const res = await fetch(url, opts);
    if (!res.ok) {
        let errorMsg = 'Lỗi server';
        try {
            const errData = await res.json();
            errorMsg = errData.error || errData.message || errorMsg;
        } catch (e) { /* ignore */ }
        throw new Error(errorMsg);
    }
    const text = await res.text();
    return text ? JSON.parse(text) : null;
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function agriAlert(message, type = 'info') {
    const colors = {
        success: { bg: '#10b981', icon: 'check_circle' },
        error: { bg: '#ef4444', icon: 'error' },
        warning: { bg: '#f59e0b', icon: 'warning' },
        info: { bg: '#3b82f6', icon: 'info' }
    };
    const c = colors[type] || colors.info;
    const toast = document.createElement('div');
    toast.style.cssText = `position:fixed; top:24px; right:24px; z-index:99999; background:${c.bg}; color:white; padding:14px 20px; border-radius:12px; font-size:14px; font-weight:600; display:flex; align-items:center; gap:8px; box-shadow:0 8px 24px rgba(0,0,0,0.2); animation:slideUp 0.3s ease; max-width:400px;`;
    toast.innerHTML = `<span class="material-symbols-outlined" style="font-size:20px;">${c.icon}</span>${escapeHtml(message)}`;
    document.body.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0'; toast.style.transition = 'opacity 0.3s'; setTimeout(() => toast.remove(), 300); }, 3500);
}

// ============ TAB SWITCHING ============
function switchJobTab(tab) {
    currentJobTab = tab;
    document.getElementById('view-jobs').style.display = tab === 'jobs' ? 'block' : 'none';
    document.getElementById('view-myapps').style.display = tab === 'myapps' ? 'block' : 'none';

    const tabJobs = document.getElementById('tab-jobs');
    const tabMyapps = document.getElementById('tab-myapps');

    if (tab === 'jobs') {
        tabJobs.className = 'px-5 py-2 rounded-xl text-sm font-semibold transition-all bg-primary text-white shadow-md';
        tabMyapps.className = 'px-5 py-2 rounded-xl text-sm font-semibold transition-all bg-white text-gray-600 border border-gray-200 hover:bg-gray-50';
    } else {
        tabMyapps.className = 'px-5 py-2 rounded-xl text-sm font-semibold transition-all bg-primary text-white shadow-md';
        tabJobs.className = 'px-5 py-2 rounded-xl text-sm font-semibold transition-all bg-white text-gray-600 border border-gray-200 hover:bg-gray-50';
        loadMyApplications();
    }
}

// ============ LOAD OPEN JOBS ============
async function loadOpenJobs() {
    const container = document.getElementById('jobs-container');

    try {
        let posts = [];
        try {
            posts = await fetchAPI(`${API_BASE}/recruitment/posts/open`) || [];
        } catch (e) {
            // Try alternate endpoint
            try {
                posts = await fetchAPI(`${API_BASE}/recruitment-posts/open`) || [];
            } catch (e2) {
                console.warn('No recruitment posts endpoint found, showing empty state');
            }
        }

        // Filter open posts
        const openPosts = posts.filter(p => !p.status || p.status === 'OPEN');

        if (openPosts.length === 0) {
            container.innerHTML = `
                <div class="text-center py-20 col-span-full">
                    <div style="width:80px; height:80px; margin:0 auto 16px; background:linear-gradient(135deg, #f0fdf4, #dcfce7); border-radius:50%; display:flex; align-items:center; justify-content:center;">
                        <span class="material-symbols-outlined" style="font-size:40px; color:#10b981;">search_off</span>
                    </div>
                    <h3 style="font-size:18px; font-weight:700; color:#111827; margin:0 0 8px;">Chưa có việc làm mới</h3>
                    <p style="font-size:14px; color:#6b7280; max-width:360px; margin:0 auto;">Các nông trại chưa đăng tin tuyển dụng. Hãy quay lại sau hoặc chuẩn bị hồ sơ CV sẵn sàng!</p>
                </div>`;
            return;
        }

        container.innerHTML = openPosts.map((post, index) => {
            const farmName = post.farm ? (post.farm.name || 'Nông trại') : 'Nông trại';
            const title = escapeHtml(post.title || 'Tuyển nhân công');
            const desc = escapeHtml(post.description || '');
            const qty = post.quantityNeeded || '?';
            const salary = post.salaryOffer ? Number(post.salaryOffer).toLocaleString('vi-VN') + ' VNĐ' : 'Thỏa thuận';
            const createdAt = post.createdAt ? new Date(post.createdAt).toLocaleDateString('vi-VN') : '';

            return `
            <div class="job-card bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden fade-in-up" style="animation-delay:${index * 0.08}s;">
                <div style="height:6px; background:linear-gradient(90deg, #10b981, #059669);"></div>
                <div style="padding:22px;">
                    <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:14px;">
                        <div>
                            <h3 style="margin:0 0 4px; font-size:17px; font-weight:700; color:#111827;">${title}</h3>
                            <div style="display:flex; align-items:center; gap:6px; font-size:13px; color:#6b7280;">
                                <span class="material-symbols-outlined" style="font-size:16px;">agriculture</span>
                                ${escapeHtml(farmName)}
                            </div>
                        </div>
                        <span style="background:#ecfdf5; color:#059669; padding:4px 10px; border-radius:8px; font-size:12px; font-weight:600;">Đang tuyển</span>
                    </div>
                    ${desc ? `<p style="font-size:13px; color:#6b7280; line-height:1.6; margin-bottom:14px; display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical; overflow:hidden;">${desc}</p>` : ''}
                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:16px;">
                        <div style="display:flex; align-items:center; gap:6px; font-size:13px; color:#374151;">
                            <span class="material-symbols-outlined" style="font-size:16px; color:#10b981;">groups</span>
                            <span>Cần: <strong>${qty}</strong> người</span>
                        </div>
                        <div style="display:flex; align-items:center; gap:6px; font-size:13px; color:#374151;">
                            <span class="material-symbols-outlined" style="font-size:16px; color:#f59e0b;">payments</span>
                            <span>${salary}</span>
                        </div>
                    </div>
                    ${createdAt ? `<div style="font-size:11px; color:#9ca3af; margin-bottom:14px;">Đăng ngày: ${createdAt}</div>` : ''}
                    <button onclick="openApplyModal(${post.id}, '${title.replace(/'/g, "\\'")}')"
                        style="width:100%; padding:11px; border:none; background:linear-gradient(135deg, #10b981, #059669); color:white; border-radius:12px; font-weight:700; font-size:14px; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px; transition:all 0.2s; box-shadow:0 4px 12px rgba(16,185,129,0.25);"
                        onmouseenter="this.style.transform='scale(1.02)'" onmouseleave="this.style.transform='scale(1)'">
                        <span class="material-symbols-outlined" style="font-size:18px;">send</span>
                        Ứng tuyển ngay
                    </button>
                </div>
            </div>`;
        }).join('');

    } catch (err) {
        console.error('Load jobs error:', err);
        container.innerHTML = `<div class="text-center py-16 col-span-full text-red-500">
            <span class="material-symbols-outlined" style="font-size:48px;">error</span>
            <p class="mt-3">Lỗi tải danh sách việc làm: ${escapeHtml(err.message)}</p>
        </div>`;
    }
}

// ============ APPLY FOR JOB ============
async function openApplyModal(postId, postTitle) {
    const userId = getCurrentUserId();
    if (userId) {
        try {
            const user = await fetchAPI(`${API_BASE}/user/profile`);
            if (!user.cvProfile && !user.cvPdfUrl) {
                agriAlert('Bạn cần tạo Hồ sơ CV trước khi ứng tuyển!', 'warning');
                openCvBuilderModal();
                return;
            }
        } catch (e) {
            console.warn('Could not check user CV profile:', e);
            agriAlert('Không thể kiểm tra thông tin hồ sơ. Vui lòng thử lại.', 'error');
            return;
        }
    }

    const modal = document.getElementById('apply-modal');
    modal.style.display = 'flex';
    modal.innerHTML = `
        <div style="background:white; width:90%; max-width:500px; border-radius:20px; box-shadow:0 25px 60px rgba(0,0,0,0.3); animation:slideUp 0.3s ease; overflow:hidden;">
            <div style="padding:24px; border-bottom:1px solid #e5e7eb; background:linear-gradient(135deg, #ecfdf5, #d1fae5);">
                <h2 style="margin:0; font-size:20px; font-weight:700; color:#065f46;">Ứng tuyển vị trí</h2>
                <p style="margin:4px 0 0; font-size:14px; color:#047857;">${escapeHtml(postTitle)}</p>
            </div>
            <div style="padding:24px;">
                <label style="font-size:13px; font-weight:600; color:#374151; display:block; margin-bottom:6px;">Lời nhắn cho nhà tuyển dụng</label>
                <textarea id="apply-message" rows="4" placeholder="Giới thiệu ngắn về bản thân và lý do muốn ứng tuyển..."
                    style="width:100%; padding:12px; border:2px solid #e5e7eb; border-radius:10px; font-size:14px; resize:vertical; outline:none;"
                    onfocus="this.style.borderColor='#10b981'" onblur="this.style.borderColor='#e5e7eb'"></textarea>
                <p style="margin:12px 0; font-size:12px; color:#9ca3af; display:flex; align-items:center; gap:4px;">
                    <span class="material-symbols-outlined" style="font-size:14px;">info</span>
                    CV đã lưu sẽ tự động đính kèm vào đơn ứng tuyển.
                </p>
                <div style="display:flex; gap:10px; justify-content:flex-end; margin-top:20px;">
                    <button onclick="document.getElementById('apply-modal').style.display='none'"
                        style="padding:10px 24px; border-radius:10px; border:1px solid #d1d5db; background:white; color:#374151; font-weight:600; font-size:14px; cursor:pointer;">Hủy</button>
                    <button id="apply-submit-btn" onclick="submitApplication(${postId})"
                        style="padding:10px 24px; border-radius:10px; border:none; background:linear-gradient(135deg, #10b981, #059669); color:white; font-weight:600; font-size:14px; cursor:pointer; display:flex; align-items:center; gap:6px; box-shadow:0 4px 12px rgba(16,185,129,0.3);">
                        <span class="material-symbols-outlined" style="font-size:18px;">send</span> Gửi hồ sơ
                    </button>
                </div>
            </div>
        </div>`;
}

async function submitApplication(postId) {
    const btn = document.getElementById('apply-submit-btn');
    const message = document.getElementById('apply-message')?.value || '';
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<span class="material-symbols-outlined" style="font-size:18px; animation:spin 1s linear infinite;">sync</span> Đang gửi...';
    }

    try {
        const workerId = getCurrentUserId();
        await fetchAPI(`${API_BASE}/recruitment/posts/${postId}/apply?workerId=${workerId}`, 'POST', {
            message: message
        });
        document.getElementById('apply-modal').style.display = 'none';
        agriAlert('Đã gửi hồ sơ ứng tuyển thành công!', 'success');
        loadOpenJobs(); // Refresh
    } catch (err) {
        agriAlert('Lỗi gửi hồ sơ: ' + err.message, 'error');
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = '<span class="material-symbols-outlined" style="font-size:18px;">send</span> Gửi hồ sơ';
        }
    }
}

// ============ MY APPLICATIONS ============
async function loadMyApplications() {
    const container = document.getElementById('myapps-container');
    const workerId = getCurrentUserId();
    if (!workerId) {
        container.innerHTML = '<p class="text-center py-16 text-gray-400">Không xác định được người dùng</p>';
        return;
    }

    try {
        let apps = [];
        try {
            apps = await fetchAPI(`${API_BASE}/recruitment/applications/worker/${workerId}`) || [];
        } catch (e) {
            try {
                apps = await fetchAPI(`${API_BASE}/job-applications/worker/${workerId}`) || [];
            } catch (e2) {
                console.warn('No applications endpoint found');
            }
        }

        if (apps.length === 0) {
            container.innerHTML = `
                <div class="text-center py-20 col-span-full">
                    <div style="width:80px; height:80px; margin:0 auto 16px; background:#f1f5f9; border-radius:50%; display:flex; align-items:center; justify-content:center;">
                        <span class="material-symbols-outlined" style="font-size:40px; color:#94a3b8;">folder_open</span>
                    </div>
                    <h3 style="font-size:18px; font-weight:700; color:#111827;">Chưa có đơn ứng tuyển</h3>
                    <p style="font-size:14px; color:#6b7280;">Hãy duyệt danh sách việc làm và gửi hồ sơ!</p>
                </div>`;
            return;
        }

        const statusMap = {
            'PENDING': { label: 'Chờ duyệt', bg: '#fef3c7', color: '#92400e', icon: 'schedule' },
            'ACCEPTED': { label: 'Đã được nhận', bg: '#dcfce7', color: '#166534', icon: 'check_circle' },
            'REJECTED': { label: 'Đã bị từ chối', bg: '#fecaca', color: '#991b1b', icon: 'cancel' }
        };

        container.innerHTML = apps.map(app => {
            const s = statusMap[app.status] || statusMap.PENDING;
            const postTitle = app.post ? (app.post.title || 'Vị trí') : 'Ứng tuyển';
            const farmName = app.post && app.post.farm ? app.post.farm.name : '';
            const appliedAt = app.appliedAt ? new Date(app.appliedAt).toLocaleDateString('vi-VN') : '';

            return `
            <div style="background:white; border-radius:16px; border:1px solid #e5e7eb; padding:20px; transition:all 0.2s;" onmouseenter="this.style.boxShadow='0 8px 24px rgba(0,0,0,0.08)'" onmouseleave="this.style.boxShadow='none'">
                <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px;">
                    <div>
                        <h3 style="margin:0; font-size:16px; font-weight:700; color:#111827;">${escapeHtml(postTitle)}</h3>
                        ${farmName ? `<p style="margin:4px 0 0; font-size:13px; color:#6b7280;">${escapeHtml(farmName)}</p>` : ''}
                    </div>
                    <span style="background:${s.bg}; color:${s.color}; padding:4px 10px; border-radius:8px; font-size:12px; font-weight:600; display:flex; align-items:center; gap:4px;">
                        <span class="material-symbols-outlined" style="font-size:14px;">${s.icon}</span>
                        ${s.label}
                    </span>
                </div>
                ${app.message ? `<p style="font-size:13px; color:#6b7280; margin-bottom:10px; line-height:1.5;">${escapeHtml(app.message)}</p>` : ''}
                ${appliedAt ? `<div style="font-size:12px; color:#9ca3af;">Ngày ứng tuyển: ${appliedAt}</div>` : ''}
            </div>`;
        }).join('');

    } catch (err) {
        console.error('Load applications error:', err);
        container.innerHTML = `<p class="text-center py-16 text-red-500">Lỗi tải danh sách: ${escapeHtml(err.message)}</p>`;
    }
}

// ============ CV BUILDER ============
function openCvBuilderModal() {
    document.getElementById('cv-builder-modal').style.display = 'flex';
    loadSavedCvData();

    // Animate in
    if (typeof gsap !== 'undefined') {
        gsap.fromTo('#cv-builder-modal > div', { opacity: 0, y: 30, scale: 0.95 }, { opacity: 1, y: 0, scale: 1, duration: 0.3, ease: 'power2.out' });
    }
}

function closeCvBuilderModal() {
    document.getElementById('cv-builder-modal').style.display = 'none';
}

function selectCvTemplate(template) {
    selectedCvTemplate = template;
    document.querySelectorAll('.cv-template').forEach(el => {
        el.classList.toggle('selected', el.dataset.template === template);
    });

    const fonts = {
        'classic': '"Times New Roman", Times, serif',
        'modern': 'Inter, system-ui, sans-serif',
        'creative': '"Comic Sans MS", "Chalkboard SE", cursive, "Segoe Print"'
    };
    
    let styleEl = document.getElementById('cv-dynamic-font');
    if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = 'cv-dynamic-font';
        document.head.appendChild(styleEl);
    }
    
    styleEl.innerHTML = `
        #cv-fullname, #cv-phone, #cv-education, #cv-skill, #cv-experience, #cv-objective, #cv-work-history {
            font-family: ${fonts[template] || fonts['modern']} !important;
        }
    `;
}

async function loadSavedCvData() {
    const userId = getCurrentUserId();
    if (!userId) return;

    try {
        const user = await fetchAPI(`${API_BASE}/user/profile`);
        if (!user) return;

        document.getElementById('cv-fullname').value = user.fullName || '';
        document.getElementById('cv-phone').value = user.phone || '';

        // Parse structured CV from cvProfile (JSON or text)
        if (user.cvProfile) {
            try {
                const cv = JSON.parse(user.cvProfile);
                document.getElementById('cv-education').value = cv.education || '';
                document.getElementById('cv-skill').value = cv.skill || '';
                document.getElementById('cv-experience').value = cv.experience || '';
                document.getElementById('cv-objective').value = cv.objective || '';
                document.getElementById('cv-work-history').value = cv.workHistory || '';
                if (cv.template) selectCvTemplate(cv.template);
            } catch (e) {
                // Plain text CV — put in objective
                document.getElementById('cv-objective').value = user.cvProfile;
            }
        }

        if (user.cvPdfUrl) {
            document.getElementById('cv-pdf-filename').innerHTML = `<a href="${escapeHtml(user.cvPdfUrl)}" target="_blank" style="color:#2563eb; text-decoration:underline;">📄 Đã tải CV PDF</a>`;
        }
    } catch (err) {
        console.warn('Could not load saved CV:', err);
    }
}

async function saveCvProfile() {
    const userId = getCurrentUserId();
    if (!userId) { agriAlert('Không xác định được người dùng', 'error'); return; }

    const cvData = {
        template: selectedCvTemplate,
        education: document.getElementById('cv-education')?.value || '',
        skill: document.getElementById('cv-skill')?.value || '',
        experience: document.getElementById('cv-experience')?.value || '',
        objective: document.getElementById('cv-objective')?.value || '',
        workHistory: document.getElementById('cv-work-history')?.value || ''
    };

    try {
        let userEmail = localStorage.getItem('userEmail') || sessionStorage.getItem('userEmail') || localStorage.getItem('email');
        if (!userEmail) {
            const tempUser = await fetchAPI(`${API_BASE}/user/profile`);
            userEmail = tempUser.email;
        }

        await fetchAPI(`${API_BASE}/user/profile`, 'PUT', {
            email: userEmail,
            fullName: document.getElementById('cv-fullname')?.value || '',
            phone: document.getElementById('cv-phone')?.value || '',
            cvProfile: JSON.stringify(cvData)
        });

        // Upload PDF if selected
        if (uploadedPdfFile) {
            await uploadCvPdf(userId);
        }

        agriAlert('Đã lưu hồ sơ thành công!', 'success');
        closeCvBuilderModal();
    } catch (err) {
        agriAlert('Lỗi lưu hồ sơ: ' + err.message, 'error');
    }
}

function handleCvPdfUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
        agriAlert('Vui lòng chọn file PDF', 'warning');
        return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB max
        agriAlert('File quá lớn (tối đa 10MB)', 'warning');
        return;
    }

    uploadedPdfFile = file;
    document.getElementById('cv-pdf-filename').textContent = `📄 ${file.name}`;
}

async function uploadCvPdf(userId) {
    if (!uploadedPdfFile) return;

    const formData = new FormData();
    formData.append('file', uploadedPdfFile);

    try {
        const res = await fetch(`${API_BASE}/user/upload-cv/${userId}`, {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + getToken() },
            body: formData
        });
        if (!res.ok) throw new Error('Upload failed');
        uploadedPdfFile = null;
    } catch (err) {
        console.warn('CV PDF upload failed:', err);
        // Non-blocking — the text CV is still saved
    }
}

// Make functions globally accessible
window.switchJobTab = switchJobTab;
window.loadOpenJobs = loadOpenJobs;
window.openApplyModal = openApplyModal;
window.submitApplication = submitApplication;
window.openCvBuilderModal = openCvBuilderModal;
window.closeCvBuilderModal = closeCvBuilderModal;
window.selectCvTemplate = selectCvTemplate;
window.saveCvProfile = saveCvProfile;
window.handleCvPdfUpload = handleCvPdfUpload;
