// JS para modal de imagen
document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImage');
    const closeBtn = document.getElementById('closeModal');
    const expandBtns = document.querySelectorAll('.expand-btn');
    
    // Abrir modal al hacer clic en el botón de expandir
    expandBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault(); // Prevenir comportamiento por defecto
            e.stopPropagation(); // Evitar propagación del evento
            
            const imgSrc = this.getAttribute('data-img');
            modalImg.src = imgSrc;
            modal.classList.add('active');
            document.body.style.overflow = 'hidden'; // Evitar scroll en el fondo
            
            // Agregar feedback táctil en dispositivos móviles si está disponible
            if (window.navigator && window.navigator.vibrate) {
                window.navigator.vibrate(50); // Vibración sutil de 50ms
            }
        });
    });
    
    // Cerrar modal al hacer clic en el botón de cerrar
    closeBtn.addEventListener('click', function() {
        modal.classList.remove('active');
        document.body.style.overflow = ''; // Restaurar scroll
    });
    
    // Cerrar modal al hacer clic fuera de la imagen
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.classList.remove('active');
            document.body.style.overflow = ''; // Restaurar scroll
        }
    });
    
    // Cerrar modal con la tecla ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            modal.classList.remove('active');
            document.body.style.overflow = ''; // Restaurar scroll
        }
    });
});