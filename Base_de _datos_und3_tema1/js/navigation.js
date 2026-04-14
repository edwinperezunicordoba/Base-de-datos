document.addEventListener('DOMContentLoaded', () => {
    const sidebarLinks = document.querySelectorAll('.sidebar-link');
    const contentPanes = document.querySelectorAll('.content-pane');
    const mobileNav = document.getElementById('mobile-nav');

    function switchPane(targetId) {
        contentPanes.forEach(pane => {
            pane.classList.remove('active');
        });
        const targetPane = document.getElementById(targetId);
        if (targetPane) {
            targetPane.classList.add('active');
        }

        sidebarLinks.forEach(link => {
            link.classList.remove('active');
            if (link.dataset.target === targetId) {
                link.classList.add('active');
            }
        });
        
        if (mobileNav.value !== targetId) {
            mobileNav.value = targetId;
        }
    }

    sidebarLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = e.currentTarget.dataset.target;
            switchPane(targetId);
        });
    });

    mobileNav.addEventListener('change', (e) => {
        switchPane(e.target.value);
    });
});