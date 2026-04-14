// JS para acordeón con desplazamiento automático
document.querySelectorAll('.accordion-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const panel = document.querySelector(this.getAttribute('data-target'));
        const isOpen = panel.classList.contains('block');
        document.querySelectorAll('.accordion-panel').forEach(p => p.classList.add('hidden'));
        document.querySelectorAll('.accordion-panel').forEach(p => p.classList.remove('block'));
        
        if (!isOpen) {
            panel.classList.remove('hidden');
            panel.classList.add('block');
            // Cambiar el símbolo del botón
            this.querySelector('span').textContent = '➖';
            
            // Desplazamiento suave hacia el botón del acordeón desplegado con compensación para menú fijo
            setTimeout(() => {
                // Detectar si estamos en móvil (ancho < 768px)
                const isMobile = window.innerWidth < 768;
                
                if (isMobile) {
                    // En móviles, calcular la altura del menú fijo y compensar
                    const mobileHeader = document.querySelector('.md\\:hidden.mb-6');
                    const headerHeight = mobileHeader ? mobileHeader.offsetHeight : 0;
                    
                    // Scroll con offset para compensar el menú fijo
                    const yOffset = -headerHeight - 20; // 20px extra de margen
                    const y = this.getBoundingClientRect().top + window.pageYOffset + yOffset;
                    window.scrollTo({top: y, behavior: 'smooth'});
                } else {
                    // En desktop, comportamiento normal
                    this.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }, 100); // Pequeño retraso para asegurar que el panel esté visible
        } else {
            // Cambiar el símbolo del botón
            this.querySelector('span').textContent = '➕';
        }
        
        // Actualizar todos los demás botones
        document.querySelectorAll('.accordion-btn').forEach(otherBtn => {
            if (otherBtn !== this) {
                otherBtn.querySelector('span').textContent = '➕';
            }
        });
    });
});