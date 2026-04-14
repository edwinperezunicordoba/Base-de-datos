// Animaciones para las tarjetas de "Barreras en la escucha activa"
document.addEventListener('DOMContentLoaded', () => {
  const cards = document.querySelectorAll('.barrier-item');

  if (!cards.length) return;

  // Animación de aparición al entrar en el viewport
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -10% 0px' }
  );

  cards.forEach((el) => io.observe(el));
});