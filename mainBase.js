
// Router / Navigation
const router = {
    navigate: (targetId) => {
        // Update Sidebar
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

        // Hide all sections
        document.querySelectorAll('section').forEach(sec => {
            sec.classList.remove('active-section');
            sec.classList.add('hidden-section');
        });

        // Show target
        const targetSection = document.getElementById(targetId);
        if (targetSection) {
            targetSection.classList.remove('hidden-section');
            targetSection.classList.add('active-section');
        }

        // Update Header
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

        // Auto-refresh icons in newly visible section
        lucide.createIcons();

        // Mobile menu close
        if (window.innerWidth < 768) {
            document.getElementById('sidebar').classList.add('translate-x-full');
        }
    }
};

// Toggle Sidebar on mobile
const menuBtn = document.getElementById('mobile-menu-btn');
if (menuBtn) {
    menuBtn.addEventListener('click', () => {
        const sidebar = document.getElementById('sidebar');
        sidebar.classList.toggle('translate-x-full');
    });
}

// Initial Load
document.addEventListener('DOMContentLoaded', () => {
    router.navigate('health');
    app.checkSystemHealth();
    document.getElementById('session-id').textContent = app.currentSessionId.slice(-8);
});

// Update the global window object for onclick handlers in HTML
window.router = router;
window.app = app;
