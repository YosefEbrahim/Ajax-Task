const app = {
    apiBaseUrl: 'http://localhost:8000',  
    currentSessionId: 'session-' + Math.random().toString(36).substr(2, 9),

    checkSystemHealth: function() {
        $('#api-status').text('جاري الفحص...').removeClass('text-green-600 text-red-600');
        const refreshBtnIcon = $('button[onclick="app.checkSystemHealth()"] i');
        refreshBtnIcon.addClass('spin');

        $.ajax({
            url: `${this.apiBaseUrl}/health`, 
            method: 'GET',
            dataType: 'json',
            success: function(data) {
                $('#api-status')
                    .text(data.status === 'ok' ? 'يعمل بنجاح' : data.status)
                    .removeClass('text-red-600 text-yellow-600')
                    .addClass(data.status === 'ok' ? 'text-green-600' : 'text-yellow-600');

                $('#api-database')
                    .text(data.database === 'healthy' ? 'متصل' : data.database)
                    .removeClass('text-red-600 text-gray-400')
                    .addClass(data.database === 'healthy' ? 'text-green-600' : 'text-red-600');

                $('#api-ml')
                    .text(data.ml_models === 'healthy' ? 'جاهز' : data.ml_models)
                    .removeClass('text-red-600 text-gray-400')
                    .addClass(data.ml_models === 'healthy' ? 'text-green-600' : 'text-red-600');

                const now = new Date();
                $('#last-updated').text(now.toLocaleTimeString('ar-EG'));

                console.log("Health Check Success:", data);
            },
            error: function(xhr, status, error) {
                $('#api-status').text('خطأ في الاتصال').addClass('text-red-600');
                $('#api-database, #api-ml').text('غير معروف').addClass('text-gray-400');
                console.error("Health Check Failed:", error);
            }
        });
    },


    analyzeJD: function() {
    const jdText = $('#jd-input').val();
    if (!jdText) {
        alert("يرجى إدخال نص أولاً");
        return;
    }

    $('#analysis-results').addClass('hidden');
    
    $.ajax({
        url: `${this.apiBaseUrl}/analyze`,
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ "draft_text": jdText }),
        success: function(response) {
            $('#analysis-results').removeClass('hidden');
            $('#btn-generate-post').removeClass('hidden');

            if (response.is_ready) {
                $('#readiness-card').addClass('bg-green-50 border-green-200 text-green-700').removeClass('bg-red-50 border-red-200 text-red-700');
                $('#readiness-text').text('الإعلان جاهز للنشر');
                $('#readiness-icon').attr('data-lucide', 'check-circle');
            } else {
                $('#readiness-card').addClass('bg-red-50 border-red-200 text-red-700').removeClass('bg-green-50 border-green-200 text-green-700');
                $('#readiness-text').text('الإعلان يحتاج إلى تعديلات');
                $('#readiness-icon').attr('data-lucide', 'alert-circle');
            }

            $('#analysis-feedback').text(response.analysis_feedback);

            const list = $('#missing-fields-list');
            list.empty();
            if (response.missing_fields && response.missing_fields.length > 0) {
                $('#missing-fields-container').removeClass('hidden');
                response.missing_fields.forEach(field => {
                    list.append(`<li>${field}</li>`);
                });
            } else {
                $('#missing-fields-container').addClass('hidden');
            }

            lucide.createIcons(); 
        },
        error: function(xhr) {
            alert("حدث خطأ أثناء التحليل: " + (xhr.responseJSON?.detail?.[0]?.msg || "خطأ غير معروف"));
        }
    });
},




generateSocialPost: function() {
    const fullText = $('#jd-input').val();
    const genBtn = $('#btn-generate-post');
    const genSection = $('#generation-section');

    genBtn.prop('disabled', true).text('جاري التوليد...');

    $.ajax({
        url: `${this.apiBaseUrl}/generate`,
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ "full_text": fullText }),
        success: function(response) {
            genSection.removeClass('hidden');
            
            $('#linkedin-post').text(response.linkedin_post);

            const hashContainer = $('#hashtags-container');
            hashContainer.empty();
            response.suggested_hashtags.forEach(tag => {
                hashContainer.append(`<span class="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">#${tag}</span>`);
            });

            genSection[0].scrollIntoView({ behavior: 'smooth' });
            lucide.createIcons();
        },
        error: function(xhr) {
            alert("فشل في توليد المنشور: " + (xhr.responseJSON?.detail?.[0]?.msg || "خطأ في السيرفر"));
        },
        complete: function() {
            genBtn.prop('disabled', false).html('<i data-lucide="wand-2" class="w-5 h-5"></i> توليد منشور لينكد إن');
            lucide.createIcons();
        }
    });
},

copyToClipboard: function(elementId) {
    const text = $(elementId).text();
    navigator.clipboard.writeText(text).then(() => {
        alert("تم نسخ النص بنجاح!");
    });
}

    
};

const router = {
    navigate: (targetId) => {
        document.querySelectorAll('.nav-item').forEach(btn => {
            const icon = btn.querySelector('.lucide');
            const desc = btn.querySelector('p.text-xs');

            if (btn.dataset.target === targetId) {
                btn.classList.add('bg-blue-600', 'text-white');
                btn.classList.remove('hover:bg-gray-100');
                if (icon) icon.classList.add('text-white');
                if (desc) {
                    desc.classList.remove('text-gray-500');
                    desc.classList.add('text-blue-100');
                }
            } else {
                btn.classList.remove('bg-blue-600', 'text-white');
                btn.classList.add('hover:bg-gray-100');
                if (icon) icon.classList.remove('text-white');
                if (desc) {
                    desc.classList.add('text-gray-500');
                    desc.classList.remove('text-blue-100');
                }
            }
        });

        document.querySelectorAll('section').forEach(sec => {
            sec.classList.remove('active-section');
            sec.classList.add('hidden-section');
        });

        const targetSection = document.getElementById(targetId);
        if (targetSection) {
            targetSection.classList.remove('hidden-section');
            targetSection.classList.add('active-section');
        }

        const activeBtn = document.querySelector(`.nav-item[data-target="${targetId}"]`);
        if (activeBtn) {
            const label = activeBtn.querySelector('p.font-medium').textContent;
            const desc = activeBtn.querySelector('p.text-xs').textContent;
            const iconMap = {
                'health': 'activity',
                'cv-upload': 'file-text',
                'bulk-upload': 'files',
                'search': 'search',
                'ranking': 'trending-up',
                'job-posting': 'briefcase',
                'text-tools': 'languages',
                'salary': 'dollar-sign',
                'assistant': 'bot'
            };
            const iconName = iconMap[targetId] || 'circle';

            document.getElementById('current-section-label').textContent = label;
            document.getElementById('section-title').textContent = label;
            document.getElementById('section-desc').textContent = desc;

            const headerIcon = document.getElementById('section-icon');
            headerIcon.setAttribute('data-lucide', iconName);
            lucide.createIcons({ nameAttr: 'data-lucide', attrs: { class: "w-6 h-6 text-blue-600" } });
        }

        lucide.createIcons();

        if (window.innerWidth < 768) {
            document.getElementById('sidebar').classList.add('translate-x-full');
        }
    }
};

const menuBtn = document.getElementById('mobile-menu-btn');
if (menuBtn) {
    menuBtn.addEventListener('click', () => {
        const sidebar = document.getElementById('sidebar');
        sidebar.classList.toggle('translate-x-full');
    });
}

document.addEventListener('DOMContentLoaded', () => {
    router.navigate('health');
    app.checkSystemHealth();
    document.getElementById('session-id').textContent = app.currentSessionId.slice(-8);
});

window.router = router;
window.app = app;
