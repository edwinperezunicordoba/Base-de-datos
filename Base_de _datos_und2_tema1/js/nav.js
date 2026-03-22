document.addEventListener("DOMContentLoaded", () => {
    
  const contentArea = document.getElementById("content-area");
  const mobileNav = document.getElementById('mobile-nav');

  // --- Función para cargar contenido usando rutas relativas ---
  async function loadContent(page) {
    try {
      // Usar rutas relativas para mejor compatibilidad con GitHub Pages
      const url = `./contenido/${page}/index.html`;
      console.log(url);
      const response = await fetch(url);
      
      if (!response.ok) throw new Error("Error al cargar " + page);
      const html = await response.text();
      contentArea.innerHTML = html;
    } catch (error) {
      contentArea.innerHTML = `<p class="text-red-500">${error.message}</p>`;
    }
  }

  // --- Cargar inicio por defecto ---
  loadContent("introduccion");

  // --- Manejo de navegación ---
  document.querySelectorAll(".sidebar-link").forEach(link => {
    link.addEventListener("click", e => {
      e.preventDefault();
      const page = link.dataset.target;

      // Marcar como activo
      document.querySelectorAll(".sidebar-link").forEach(l => l.classList.remove("active"));
      link.classList.add("active");

      // Sincronizar mobile nav
      if (mobileNav.value !== page) {
        mobileNav.value = page;
      }

      // Cargar contenido
      loadContent(page);
    });
  });

  // --- Manejo de mobile nav ---
  mobileNav.addEventListener('change', (e) => {
    const page = e.target.value;

    // Marcar activo en sidebar
    document.querySelectorAll(".sidebar-link").forEach(l => l.classList.remove("active"));
    const link = document.querySelector(`.sidebar-link[data-target="${page}"]`);
    if (link) link.classList.add("active");

    // Cargar contenido
    loadContent(page);
  });
});
