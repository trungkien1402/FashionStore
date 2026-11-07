/* ===================================================================
   HNMTSHOP STORE 3D EXPERIENCES INTERACTION LOGIC
   1. Clothing Rack Interactive 3D (Fraxbit 1:1)
   2. Sneaker Showroom Pedestal & Glass Shelves (Last Dept 1:1)
   =================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  initModeSwitcher();
  initAtelierFilterDrawer();
  initClothingRack();
  initSneakerShowroom();
});

/* -------------------------------------------------------------------
   1. MODE SWITCHER & AUTO-DETECTION
   ------------------------------------------------------------------- */
function initModeSwitcher() {
  const rackModeBtn = document.getElementById("btnModeRack");
  const shoeModeBtn = document.getElementById("btnModeShoe");
  const gridModeBtn = document.getElementById("btnModeGrid");

  const rackSection = document.getElementById("hnmtClothingRack");
  const shoeSection = document.getElementById("hnmtSneakerShowroom");
  const gridSection = document.getElementById("hnmtClassicGrid");

  const urlParams = new URLSearchParams(window.location.search);
  const keyword = (urlParams.get("keyword") || "").toLowerCase();
  const categoryId = urlParams.get("categoryId");
  const viewParam = urlParams.get("view");

  // Auto-detect based on view param, search query or category
  const isShoeQuery = viewParam === "shoe" ||
                      keyword.includes("giày") || keyword.includes("giay") || 
                      keyword.includes("sneaker") || keyword.includes("runner") || 
                      keyword.includes("shoe");

  if (isShoeQuery) {
    switchMode("shoe");
  } else if (urlParams.has("grid") || viewParam === "grid") {
    switchMode("grid");
  } else {
    switchMode("rack");
  }

  if (rackModeBtn) rackModeBtn.addEventListener("click", () => switchMode("rack"));
  if (shoeModeBtn) shoeModeBtn.addEventListener("click", () => switchMode("shoe"));
  if (gridModeBtn) gridModeBtn.addEventListener("click", () => switchMode("grid"));

  function switchMode(mode) {
    [rackModeBtn, shoeModeBtn, gridModeBtn].forEach(b => b && b.classList.remove("active"));
    [rackSection, shoeSection, gridSection].forEach(s => s && (s.style.display = "none"));

    if (mode === "shoe") {
      if (shoeModeBtn) shoeModeBtn.classList.add("active");
      if (shoeSection) shoeSection.style.display = "block";
    } else if (mode === "grid") {
      if (gridModeBtn) gridModeBtn.classList.add("active");
      if (gridSection) gridSection.style.display = "block";
    } else {
      if (rackModeBtn) rackModeBtn.classList.add("active");
      if (rackSection) rackSection.style.display = "block";
    }
  }
}

/* -------------------------------------------------------------------
   1B. ATELIER LUXURY FILTER DRAWER & PRESETS
   ------------------------------------------------------------------- */
function initAtelierFilterDrawer() {
  const toggleBtn = document.getElementById("btnToggleFilterDrawer");
  const drawer = document.getElementById("hnmtFilterDrawer");
  const chevron = document.getElementById("filterChevron");

  if (toggleBtn && drawer) {
    toggleBtn.addEventListener("click", () => {
      drawer.classList.toggle("open");
      toggleBtn.classList.toggle("active");
      if (chevron) {
        chevron.style.transform = drawer.classList.contains("open") ? "rotate(180deg)" : "rotate(0deg)";
        chevron.style.transition = "transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)";
      }
    });
  }

  // Price Presets (< 500k, 500k-1Tr, 1Tr-5Tr, > 5Tr)
  const priceBtns = Array.from(document.querySelectorAll(".hnmt-price-btn"));
  const inputMin = document.getElementById("inputMinPrice");
  const inputMax = document.getElementById("inputMaxPrice");

  priceBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const wasActive = btn.classList.contains("active");
      priceBtns.forEach(b => b.classList.remove("active"));

      if (wasActive) {
        if (inputMin) inputMin.value = "";
        if (inputMax) inputMax.value = "";
      } else {
        btn.classList.add("active");
        if (inputMin) inputMin.value = btn.dataset.min || "";
        if (inputMax) inputMax.value = btn.dataset.max || "";
      }
    });
  });

  // Size Chips
  const sizeChips = Array.from(document.querySelectorAll(".hnmt-size-chip"));
  sizeChips.forEach(chip => {
    chip.addEventListener("click", () => {
      chip.classList.toggle("active");
    });
  });
}

/* -------------------------------------------------------------------
   2. INTERACTIVE CLOTHING RACK (FRAXBIT 1:1)
   ------------------------------------------------------------------- */
function initClothingRack() {
  const track = document.getElementById("clothesTrack");
  const items = Array.from(document.querySelectorAll(".hnmt-garment-item"));
  if (!track || items.length === 0) return;

  const prevBtn = document.getElementById("rackPrevBtn");
  const nextBtn = document.getElementById("rackNextBtn");

  const titleEl = document.getElementById("rackActiveTitle");
  const priceEl = document.getElementById("rackActivePrice");
  const catEl = document.getElementById("rackActiveCat");
  const btnCart = document.getElementById("rackBtnCart");
  const btnDetail = document.getElementById("rackBtnDetail");
  const sizeBtns = Array.from(document.querySelectorAll(".hnmt-rack-size-btn"));

  let currentIndex = Math.floor(items.length / 2);
  const ITEM_SPACING = 150; // Spacing in px along the rail

  let isDragging = false;
  let startX = 0;
  let currentTranslateX = 0;
  let selectedSize = "L";

  // Size Picker
  sizeBtns.forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      sizeBtns.forEach(b => b.classList.remove("is-selected"));
      btn.classList.add("is-selected");
      selectedSize = btn.dataset.size || "L";
    });
  });

  // Position all items initially
  function updateRack(animate = true) {
    const centerOffset = -currentIndex * ITEM_SPACING;

    items.forEach((item, index) => {
      const offset = index - currentIndex;
      const xPos = offset * ITEM_SPACING;

      let rotateY = 0;
      let translateZ = 0;
      let opacity = 1;
      let scale = 1;

      if (offset === 0) {
        // Active item: flat front view, prominent scale
        rotateY = 0;
        translateZ = 60;
        scale = 1.1;
        item.classList.add("is-active");
      } else if (offset > 0) {
        // Right items: angled towards right
        rotateY = -72;
        translateZ = -Math.abs(offset) * 20;
        scale = Math.max(0.75, 1 - Math.abs(offset) * 0.08);
        opacity = Math.max(0.35, 1 - Math.abs(offset) * 0.15);
        item.classList.remove("is-active");
      } else {
        // Left items: angled towards left
        rotateY = 72;
        translateZ = -Math.abs(offset) * 20;
        scale = Math.max(0.75, 1 - Math.abs(offset) * 0.08);
        opacity = Math.max(0.35, 1 - Math.abs(offset) * 0.15);
        item.classList.remove("is-active");
      }

      item.style.transition = animate ? "transform 0.45s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s" : "none";
      item.style.transform = `translateX(${xPos}px) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`;
      item.style.zIndex = 100 - Math.abs(offset) * 5;
      item.style.opacity = opacity;
    });

    // Update bottom details dock
    const activeItem = items[currentIndex];
    if (activeItem) {
      const name = activeItem.dataset.name || "Áo Thun Streetwear";
      const price = activeItem.dataset.price || "350.000 ₫";
      const cat = activeItem.dataset.category || "Streetwear";
      const id = activeItem.dataset.id || "1";
      const slug = activeItem.dataset.slug || "";

      if (titleEl) titleEl.textContent = name;
      if (priceEl) priceEl.textContent = formatVND(price);
      if (catEl) catEl.textContent = cat;
      if (btnDetail) btnDetail.href = `/Products/Details/${id}`;

      if (btnCart) {
        btnCart.onclick = () => {
          addStoreItemToCart(id, selectedSize, "Đen");
        };
      }
    }
  }

  // Click on garment to center
  items.forEach((item, index) => {
    item.addEventListener("click", () => {
      currentIndex = index;
      updateRack(true);
    });
  });

  // Controls
  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      if (currentIndex > 0) {
        currentIndex--;
        updateRack(true);
      }
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      if (currentIndex < items.length - 1) {
        currentIndex++;
        updateRack(true);
      }
    });
  }

  // Mouse drag & Wheel scrubber
  const railContainer = document.querySelector(".hnmt-rail-structure");
  if (railContainer) {
    railContainer.addEventListener("wheel", (e) => {
      e.preventDefault();
      if (e.deltaY > 0 || e.deltaX > 0) {
        if (currentIndex < items.length - 1) { currentIndex++; updateRack(true); }
      } else {
        if (currentIndex > 0) { currentIndex--; updateRack(true); }
      }
    }, { passive: false });

    // Touch Support
    let touchStartX = 0;
    railContainer.addEventListener("touchstart", (e) => {
      touchStartX = e.touches[0].clientX;
    }, { passive: true });

    railContainer.addEventListener("touchend", (e) => {
      const diff = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(diff) > 40) {
        if (diff > 0 && currentIndex > 0) currentIndex--;
        else if (diff < 0 && currentIndex < items.length - 1) currentIndex++;
        updateRack(true);
      }
    });
  }

  // Initial render
  updateRack(false);
}

/* -------------------------------------------------------------------
   3. 3D SNEAKER SHOWROOM (LAST DEPT / MOVENTO 1:1)
   ------------------------------------------------------------------- */
function initSneakerShowroom() {
  const wallView = document.getElementById("sneakerWallView");
  const stageView = document.getElementById("sneakerStageView");
  const shelfCards = Array.from(document.querySelectorAll(".hnmt-shelf-card"));
  const backBtn = document.getElementById("stageBackToWallBtn");
  const btnWallMode = document.getElementById("btnWallMode");
  const btnStageMode = document.getElementById("btnStageMode");

  const stageImg = document.getElementById("stageShoeImg");
  const stageTitle = document.getElementById("stageShoeTitle");
  const stageDesc = document.getElementById("stageShoeDesc");
  const stagePrice = document.getElementById("stageShoePrice");
  const stageAddBtn = document.getElementById("stageAddToCartBtn");
  const sizeBtns = Array.from(document.querySelectorAll(".hnmt-stage-size-btn"));
  const colorPills = Array.from(document.querySelectorAll(".hnmt-stage-color-pill"));

  let currentShoeId = null;
  let selectedShoeSize = "41";
  let selectedShoeColor = "Đen";

  // Size Selector
  sizeBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      sizeBtns.forEach(b => b.classList.remove("is-selected"));
      btn.classList.add("is-selected");
      selectedShoeSize = btn.dataset.size || "41";
    });
  });

  // Color Selector
  colorPills.forEach(pill => {
    pill.addEventListener("click", () => {
      colorPills.forEach(p => p.classList.remove("is-active"));
      pill.classList.add("is-active");
      selectedShoeColor = pill.dataset.color || "Đen";
    });
  });

  // Click Shelf Card -> Open Pedestal Stage Focus (Glide zoom)
  shelfCards.forEach(card => {
    card.addEventListener("click", () => {
      const id = card.dataset.id;
      const name = card.dataset.name;
      const desc = card.dataset.desc;
      const price = card.dataset.price;
      const img = card.dataset.img;

      openStage(id, name, desc, price, img);
    });
  });

  function openStage(id, name, desc, price, img) {
    currentShoeId = id;
    if (stageImg) stageImg.src = img;
    if (stageTitle) stageTitle.textContent = name;
    if (stageDesc) stageDesc.textContent = desc;
    if (stagePrice) stagePrice.textContent = formatVND(price);

    if (wallView) wallView.style.display = "none";
    if (stageView) stageView.classList.add("active");

    if (btnWallMode) btnWallMode.classList.remove("active");
    if (btnStageMode) btnStageMode.classList.add("active");

    // Scroll showroom into view if needed
    const showroom = document.getElementById("hnmtSneakerShowroom");
    if (showroom) {
      showroom.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function closeStage() {
    if (stageView) stageView.classList.remove("active");
    if (wallView) wallView.style.display = "grid";

    if (btnWallMode) btnWallMode.classList.add("active");
    if (btnStageMode) btnStageMode.classList.remove("active");
  }

  if (backBtn) backBtn.addEventListener("click", closeStage);
  if (btnWallMode) btnWallMode.addEventListener("click", closeStage);
  if (btnStageMode) {
    btnStageMode.addEventListener("click", () => {
      if (shelfCards.length > 0 && !currentShoeId) {
        shelfCards[0].click();
      } else {
        if (wallView) wallView.style.display = "none";
        if (stageView) stageView.classList.add("active");
        btnStageMode.classList.add("active");
        if (btnWallMode) btnWallMode.classList.remove("active");
      }
    });
  }

  // Add to Bag Button
  if (stageAddBtn) {
    stageAddBtn.addEventListener("click", () => {
      if (currentShoeId) {
        addStoreItemToCart(currentShoeId, selectedShoeSize, selectedShoeColor);
      }
    });
  }

  // 3D Perspective Mouse Tilt on Pedestal Shoe (Ascenta Studio 1:1)
  const shoeCenter = document.querySelector(".hnmt-stage-shoe-center");
  if (shoeCenter && stageImg) {
    shoeCenter.addEventListener("mousemove", (e) => {
      const rect = shoeCenter.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      const rotY = (x / (rect.width / 2)) * 16; // -16 to +16 deg
      const rotX = (-y / (rect.height / 2)) * 10; // -10 to +10 deg
      stageImg.style.transform = `perspective(700px) rotateX(${rotX.toFixed(1)}deg) rotateY(${rotY.toFixed(1)}deg) scale(1.05)`;
    });

    shoeCenter.addEventListener("mouseleave", () => {
      stageImg.style.transform = "perspective(700px) rotateX(0deg) rotateY(0deg) scale(1)";
    });
  }
}

/* -------------------------------------------------------------------
   AJAX CART INTEGRATION & TOAST
   ------------------------------------------------------------------- */
async function addStoreItemToCart(productId, size, color) {
  try {
    const payload = {
      productId: parseInt(productId, 10),
      size: size || "L",
      quantity: 1
    };

    const response = await fetch("/Cart/AddAjax", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success) {
        // Update header cart badges
        document.querySelectorAll(".fs-cart-count").forEach(badge => {
          badge.textContent = data.totalQuantity;
        });

        // Trigger cart drawer open (refreshes mini cart)
        const drawerTrigger = document.getElementById("fsCartDrawerTrigger");
        if (drawerTrigger) {
          drawerTrigger.click();
        }

        if (typeof showFsToast === "function") {
          showFsToast(`Đã thêm vào giỏ hàng (Size: ${size})!`, "success");
        }
      } else {
        alert(data.message || "Không thể thêm sản phẩm.");
      }
    } else {
      console.warn("AddAjax failed, status:", response.status);
    }
  } catch (err) {
    console.error("Cart error:", err);
  }
}

function formatVND(value) {
  const num = typeof value === "number" ? value : parseFloat(String(value).replace(/[^0-9.-]+/g,""));
  if (isNaN(num)) return value;
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(num);
}
