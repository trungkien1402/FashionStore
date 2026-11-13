/* ===================================================================
   HNMTSHOP ATELIER — Admin Operations JavaScript
   =================================================================== */

document.addEventListener("DOMContentLoaded", function () {
  // 1. Theme Management (Light / Dark Toggle)
  const themeToggleBtn = document.getElementById("admThemeToggle");
  const themeIcon = document.getElementById("admThemeIcon");
  const themeText = document.getElementById("admThemeText");
  const rootHtml = document.documentElement;

  function applyTheme(theme) {
    if (theme === "dark") {
      rootHtml.setAttribute("data-theme", "dark");
      if (themeIcon) themeIcon.className = "bi bi-moon-stars-fill text-info";
      if (themeText) themeText.textContent = "Chế độ Tối";
    } else {
      rootHtml.removeAttribute("data-theme");
      if (themeIcon) themeIcon.className = "bi bi-sun-fill text-warning";
      if (themeText) themeText.textContent = "Chế độ Sáng";
    }
    localStorage.setItem("hnmt_adm_theme", theme);

    // Trigger chart update if charts exist
    if (window.updateAdmChartsTheme) {
      window.updateAdmChartsTheme(theme);
    }
  }

  // Check saved theme (Default is light as requested by user)
  const savedTheme = localStorage.getItem("hnmt_adm_theme") || "light";
  applyTheme(savedTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener("click", function () {
      const currentTheme = rootHtml.getAttribute("data-theme") === "dark" ? "dark" : "light";
      const newTheme = currentTheme === "dark" ? "light" : "dark";
      applyTheme(newTheme);
    });
  }

  // Mobile sidebar
  const toggleBtn = document.getElementById("admSidebarToggle");
  const sidebar = document.querySelector(".adm-sidebar");
  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener("click", function () {
      const isOpen = sidebar.classList.toggle("open");
      toggleBtn.setAttribute("aria-expanded", String(isOpen));
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && sidebar.classList.contains("open") && toggleBtn.offsetWidth > 0) {
        sidebar.classList.remove("open");
        toggleBtn.setAttribute("aria-expanded", "false");
        toggleBtn.focus();
      }
    });
  }

  // Copy Order Code Helper
  window.copyAdmText = function (btn, text) {
    if (!navigator.clipboard) return;
    navigator.clipboard.writeText(text).then(() => {
      const origHtml = btn.innerHTML;
      btn.innerHTML = '<i class="bi bi-check2 text-success"></i>';
      setTimeout(() => {
        btn.innerHTML = origHtml;
      }, 1500);
    });
  };

  // 3D Tilt for Product Showroom Cards
  function init3DProductCards() {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion || window.innerWidth < 768) return;

    const cards = document.querySelectorAll(".adm-product-card-3d");
    cards.forEach((card) => {
      const glare = card.querySelector(".adm-card-glare");

      card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -9; // Max 9 deg
        const rotateY = ((x - centerX) / centerX) * 9;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;

        if (glare) {
          glare.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(255, 255, 255, 0.22), transparent 60%)`;
        }
      });

      card.addEventListener("mouseleave", () => {
        card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
        card.style.transition = "transform 0.5s ease";
        setTimeout(() => {
          card.style.transition = "";
        }, 500);
      });
    });
  }
  init3DProductCards();

  // 7. Grid vs Table View Mode Switcher
  const gridContainer = document.getElementById("admViewGrid");
  const tableContainer = document.getElementById("admViewTable");
  const btnGrid = document.getElementById("admBtnViewGrid");
  const btnTable = document.getElementById("admBtnViewTable");

  if (gridContainer && tableContainer && btnGrid && btnTable) {
    function setViewMode(mode) {
      if (mode === "table") {
        gridContainer.classList.add("d-none");
        tableContainer.classList.remove("d-none");
        btnTable.classList.add("active");
        btnTable.setAttribute("aria-pressed", "true");
        btnGrid.classList.remove("active");
        btnGrid.setAttribute("aria-pressed", "false");
      } else {
        gridContainer.classList.remove("d-none");
        tableContainer.classList.add("d-none");
        btnGrid.classList.add("active");
        btnGrid.setAttribute("aria-pressed", "true");
        btnTable.classList.remove("active");
        btnTable.setAttribute("aria-pressed", "false");
      }
      localStorage.setItem("hnmt_adm_view_mode", mode);
    }

    const savedMode = localStorage.getItem("hnmt_adm_view_mode") || "grid";
    setViewMode(savedMode);

    btnGrid.addEventListener("click", () => setViewMode("grid"));
    btnTable.addEventListener("click", () => setViewMode("table"));
  }

  // 8. Image Upload Preview Helper
  window.previewAdmImage = function (input, previewImgId, placeholderId) {
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = function (e) {
        const img = document.getElementById(previewImgId);
        const placeholder = document.getElementById(placeholderId);
        if (img) {
          img.src = e.target.result;
          img.classList.remove("d-none");
        }
        if (placeholder) {
          placeholder.classList.add("d-none");
        }
      };
      reader.readAsDataURL(input.files[0]);
    }
  };
});

