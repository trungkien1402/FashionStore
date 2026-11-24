/**
 * HNMTSHOP — FUTURIST SNEAKER VAULT (1:1 FIDELITY REPLICA OF FIGMA SNEAKER SLIDER)
 * Standardized 2D lateral profile view with smooth slide-in, giant typography, and color morphing.
 */

(function () {
    'use strict';
    const openedFromHomeCard = new URLSearchParams(location.search).get('from') === 'home';

    // --- CÁC BỘ SƯU TẬP GIÀY (SNEAKER COLLECTIONS) CÓ THỂ ĐỔI QUA LẠI BẰNG NÚT BẤM ---
    const ITEMS_PER_GRID = 6;
    const catalogEl = document.getElementById("showroomCatalog");
    let rawCatalog = null;
    try { rawCatalog = catalogEl ? JSON.parse(catalogEl.textContent) : null; } catch (e) {}
    const audienceCollections = rawCatalog?.shoes || { men: [], women: [], girls: [], boy: [] };
    const audiencePages = Object.fromEntries(Object.entries(audienceCollections).map(([audience, collections]) => [
        audience,
        (collections || []).flatMap(collection => {
            const pageCount = Math.ceil((collection.items || []).length / ITEMS_PER_GRID);
            return Array.from({ length: pageCount }, (_, page) => ({
                ...collection,
                collectionTitle: collection.title,
                title: pageCount > 1 ? `${collection.title} ${page + 1}/${pageCount}` : collection.title,
                items: (collection.items || []).slice(page * ITEMS_PER_GRID, (page + 1) * ITEMS_PER_GRID)
            }));
        })
    ]));
    const SNEAKER_COLLECTIONS = audiencePages.men;
    const getAudienceCollections = audience => Object.hasOwn(audiencePages, audience) ? audiencePages[audience] : SNEAKER_COLLECTIONS;
    let activeCollections = SNEAKER_COLLECTIONS;
    const vaultOriginalTitle = document.title;
    function syncSneakerUrl(shoe) {
        const audience = Object.keys(audiencePages).find(key =>
            audiencePages[key].some(collection => collection.items.some(item =>
                shoe ? String(item.productId) === String(shoe.productId) : activeCollections.includes(collection))))
            || new URLSearchParams(location.search).get('audience') || 'men';
        const url = new URL('/Products/Sneakers', location.origin);
        url.searchParams.set('audience', audience);
        if (shoe?.productId) url.searchParams.set('productId', shoe.productId);
        if (openedFromHomeCard) url.searchParams.set('from', 'home');
        history.replaceState(history.state, '', url.pathname + url.search);
        document.title = shoe ? `${shoe.name} · HNMTSHOP` : vaultOriginalTitle;
    }
    let currentCollectionIndex = 0;
    let filteredSneakers = null;
    let filteredPageIdx = 0;
    let activeFilterLabel = '';

    const getAllSneakers = () => activeCollections.flatMap(c => c.items.map(it => ({ ...it, collectionId: c.id, collectionTitle: c.collectionTitle })));
    const getFilteredTotalPages = () => (!filteredSneakers ? 1 : Math.max(1, Math.ceil(filteredSneakers.length / ITEMS_PER_GRID)));
    const getSneakers = () => {
        if (filteredSneakers !== null) {
            const start = filteredPageIdx * ITEMS_PER_GRID;
            return filteredSneakers.slice(start, start + ITEMS_PER_GRID);
        }
        return getActiveCollection()?.items || [];
    };
    const getGridSneakers = () => getSneakers();
    const getActiveCollection = () => activeCollections[currentCollectionIndex];

    let currentIndex = 0;
    let isSliderView = false;
    let pendingSlide = null;
    let isTransitioning = false;

    const $ = s => document.querySelector(s);
    const $$ = s => document.querySelectorAll(s);

    function applyShoeTheme(app, sneaker) {
        if (!app) return;
        const color = sneaker.themeColor || '';
        app.style.backgroundColor = color;
        const rgb = /^#([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(color);
        const light = rgb && (0.2126 * parseInt(rgb[1], 16) +
            0.7152 * parseInt(rgb[2], 16) + 0.0722 * parseInt(rgb[3], 16)) > 185;
        app.classList.toggle('is-light-shoe-theme', Boolean(light));
    }

    function formatPrice(num) {
        return num.toLocaleString('vi-VN') + ' ₫';
    }

    // --- Cập nhật thanh chuyển đổi bộ sưu tập (Vault Switcher) ---
    function updateVaultSwitcherUI() {
        const isFiltered = filteredSneakers !== null;
        let currentTitle = '';
        let showArrows = true;

        if (isFiltered) {
            const totalPages = getFilteredTotalPages();
            const currentCount = getSneakers().length;
            currentTitle = totalPages > 1
                ? `KẾT QUẢ LỌC ${filteredPageIdx + 1}/${totalPages} [${currentCount} ĐÔI]`
                : `KẾT QUẢ LỌC [${currentCount} ĐÔI]`;
            showArrows = totalPages > 1;
        } else {
            currentTitle = getActiveCollection()?.title || 'TỦ GIÀY';
            showArrows = activeCollections.length > 1;
        }

        document.querySelectorAll('#svCollectionTitle, .sv-header-title').forEach(el => {
            el.textContent = currentTitle;
        });

        document.querySelectorAll('#svPrevCollectionBtn, .sv-vault-arrow:first-child').forEach(btn => {
            btn.style.display = showArrows ? 'inline-flex' : 'none';
        });

        document.querySelectorAll('#svNextCollectionBtn, .sv-vault-arrow:last-child').forEach(btn => {
            btn.style.display = showArrows ? 'inline-flex' : 'none';
        });

        document.querySelectorAll('#svCollectionBadge, .sv-vault-badge').forEach(b => b.remove());
    }

    // --- Áp dụng bộ lọc cho Tủ Giày ---
    function applyFilter(filteredList, label) {
        const allowed = new Set(getAllSneakers().map(item => item.id));
        filteredSneakers = Array.isArray(filteredList) ? filteredList.filter(item => allowed.has(item.id)) : [];
        activeFilterLabel = label || '';
        filteredPageIdx = 0;
        currentIndex = 0;
        updateVaultSwitcherUI();
        renderGrid();

        if (isSliderView) {
            if (filteredSneakers.length > 0) {
                updateSliderDisplay(0);
            } else {
                closeSliderView(true);
            }
        }
    }

    // --- Đặt lại bộ lọc Tủ Giày ---
    function resetFilter() {
        filteredSneakers = null;
        activeFilterLabel = '';
        filteredPageIdx = 0;
        currentIndex = 0;
        updateVaultSwitcherUI();
        renderGrid();

        if (isSliderView) {
            updateSliderDisplay(0);
        }
    }

    // --- Đảm bảo thanh chuyển đổi bộ sưu tập (Vault Switcher) luôn hiện diện 100% trên DOM ---
    function ensureVaultSwitcherInDOM() {
        const headerLefts = document.querySelectorAll('.sv-header-left');
        const isFiltered = filteredSneakers !== null;
        const totalPages = isFiltered ? getFilteredTotalPages() : 1;
        const showArrows = isFiltered ? totalPages > 1 : activeCollections.length > 1;
        const currentCount = isFiltered ? getSneakers().length : 6;
        const currentTitle = isFiltered
            ? (totalPages > 1 ? `KẾT QUẢ LỌC ${filteredPageIdx + 1}/${totalPages} [${currentCount} ĐÔI]` : `KẾT QUẢ LỌC [${currentCount} ĐÔI]`)
            : getActiveCollection()?.title || 'TỦ GIÀY';

        headerLefts.forEach(headerLeft => {
            let switcher = headerLeft.querySelector('.sv-vault-switcher');
            const titleEl = headerLeft.querySelector('.sv-header-title');

            if (!switcher) {
                switcher = document.createElement('div');
                switcher.className = 'sv-vault-switcher';
                switcher.id = 'svVaultSwitcher';

                const prevBtn = document.createElement('button');
                prevBtn.type = 'button';
                prevBtn.className = 'sv-vault-arrow';
                prevBtn.id = 'svPrevCollectionBtn';
                prevBtn.setAttribute('aria-label', isFiltered ? 'Trang trước' : 'Bộ giày trước');
                prevBtn.setAttribute('title', isFiltered ? '6 đôi trước' : 'Bộ sưu tập trước');
                prevBtn.style.display = showArrows ? 'inline-flex' : 'none';
                prevBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>';

                const colTitle = document.createElement('span');
                colTitle.className = 'sv-header-title';
                colTitle.id = 'svCollectionTitle';
                colTitle.textContent = currentTitle;

                const nextBtn = document.createElement('button');
                nextBtn.type = 'button';
                nextBtn.className = 'sv-vault-arrow';
                nextBtn.id = 'svNextCollectionBtn';
                nextBtn.setAttribute('aria-label', isFiltered ? 'Trang tiếp theo' : 'Bộ giày kế tiếp');
                nextBtn.setAttribute('title', isFiltered ? '6 đôi tiếp theo' : 'Bộ sưu tập kế tiếp');
                nextBtn.style.display = showArrows ? 'inline-flex' : 'none';
                nextBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>';

                switcher.appendChild(prevBtn);
                switcher.appendChild(colTitle);
                switcher.appendChild(nextBtn);

                if (titleEl) {
                    titleEl.replaceWith(switcher);
                } else {
                    headerLeft.appendChild(switcher);
                }

                prevBtn.onclick = (e) => {
                    e.stopPropagation();
                    changeCollection(-1);
                };
                nextBtn.onclick = (e) => {
                    e.stopPropagation();
                    changeCollection(1);
                };
            } else {
                const prevBtn = switcher.querySelector('.sv-vault-arrow:first-child, #svPrevCollectionBtn');
                const nextBtn = switcher.querySelector('.sv-vault-arrow:last-child, #svNextCollectionBtn');
                const colTitle = switcher.querySelector('#svCollectionTitle, .sv-header-title');
                switcher.querySelectorAll('.sv-vault-badge, #svCollectionBadge').forEach(el => el.remove());

                if (colTitle) colTitle.textContent = currentTitle;

                if (prevBtn) {
                    prevBtn.style.display = showArrows ? 'inline-flex' : 'none';
                    prevBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>';
                    prevBtn.onclick = (e) => {
                        e.stopPropagation();
                        changeCollection(-1);
                    };
                }
                if (nextBtn) {
                    nextBtn.style.display = showArrows ? 'inline-flex' : 'none';
                    nextBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>';
                    nextBtn.onclick = (e) => {
                        e.stopPropagation();
                        changeCollection(1);
                    };
                }
            }
        });
    }

    // --- Đổi bộ sưu tập giày hoặc chuyển trang kết quả lọc (6 đôi / trang) ---
    function changeCollection(direction = 1) {
        if (isTransitioning || activeCollections.length === 0) return;

        if (filteredSneakers !== null) {
            const totalPages = getFilteredTotalPages();
            if (totalPages <= 1) return;

            filteredPageIdx = (filteredPageIdx + direction + totalPages) % totalPages;
            currentIndex = 0; // Đặt về đôi đầu tiên của trang 6 đôi mới

            const currentCount = getSneakers().length;
            const currentTitle = `KẾT QUẢ LỌC ${filteredPageIdx + 1}/${totalPages} [${currentCount} ĐÔI]`;
            const titleEls = document.querySelectorAll('#svCollectionTitle, .sv-header-title');
            titleEls.forEach(el => {
                el.style.opacity = '0';
                el.style.transform = direction > 0 ? 'translateX(12px)' : 'translateX(-12px)';
                setTimeout(() => {
                    el.textContent = currentTitle;
                    el.style.opacity = '1';
                    el.style.transform = 'translateX(0)';
                }, 160);
            });

            if (!isSliderView) {
                // Chế độ Grid: Mờ nhẹ các đôi cũ, lướt ngang và stagger 6 đôi của trang mới
                const items = $$('.sv-grid-item');
                items.forEach(it => {
                    it.style.transition = 'opacity 0.22s ease, transform 0.22s ease';
                    it.style.opacity = '0';
                    it.style.transform = direction > 0 ? 'translateX(-24px) scale(0.92)' : 'translateX(24px) scale(0.92)';
                });

                setTimeout(() => {
                    renderGrid();
                    const newItems = $$('.sv-grid-item');
                    newItems.forEach((it, i) => {
                        it.style.opacity = '0';
                        it.style.transform = direction > 0 ? 'translateX(24px) scale(0.92)' : 'translateX(-24px) scale(0.92)';
                        setTimeout(() => {
                            it.style.transition = 'opacity 0.35s ease, transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)';
                            it.style.opacity = '1';
                            it.style.transform = 'translateX(0) scale(1)';
                        }, i * 40);
                    });
                }, 220);
            } else {
                renderGrid();
                updateSliderDisplay(direction);
            }
            return;
        }

        currentCollectionIndex = (currentCollectionIndex + direction + activeCollections.length) % activeCollections.length;
        const col = getActiveCollection();

        // Cập nhật tiêu đề bộ sưu tập với hiệu ứng chuyển động mượt mà
        const titleEls = document.querySelectorAll('#svCollectionTitle, .sv-header-title');
        titleEls.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = direction > 0 ? 'translateX(12px)' : 'translateX(-12px)';
            setTimeout(() => {
                el.textContent = col.title;
                el.style.opacity = '1';
                el.style.transform = 'translateX(0)';
            }, 180);
        });

        // Bỏ hiển thị số thứ tự bộ sưu tập theo yêu cầu của user
        document.querySelectorAll('#svCollectionBadge, .sv-vault-badge').forEach(b => b.remove());

        currentIndex = 0;

        if (!isSliderView) {
            // Chế độ Grid: Mờ nhẹ các đôi cũ, đổi dữ liệu và stagger xuất hiện các đôi mới
            const items = $$('.sv-grid-item');
            items.forEach(it => {
                it.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
                it.style.opacity = '0';
                it.style.transform = 'scale(0.88)';
            });

            setTimeout(() => {
                renderGrid();
                const newItems = $$('.sv-grid-item');
                newItems.forEach((it, i) => {
                    it.style.opacity = '0';
                    it.style.transform = 'scale(0.88)';
                    setTimeout(() => {
                        it.style.transition = 'opacity 0.4s ease, transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
                        it.style.opacity = '1';
                        it.style.transform = 'scale(1)';
                    }, i * 45);
                });
            }, 260);
        } else {
            // Chế độ Slider 3D: Cập nhật sang đôi giày tương ứng trong bộ sưu tập mới VÀ đồng thời cập nhật Grid bên dưới
            renderGrid();
            updateSliderDisplay(direction);
        }
    }

    // --- Khởi tạo lưới 6 đôi ban đầu (Grid Overview) ---
        function ensureSneakerSearchButton() {
        const bagBtns = document.querySelectorAll('.sv-bag-btn');
        bagBtns.forEach(svBagBtn => {
            if (svBagBtn.parentNode && !svBagBtn.parentNode.querySelector('.sv-search-btn')) {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'sv-search-btn';
                btn.id = 'svSearchBtn';
                btn.setAttribute('aria-label', 'Tìm kiếm giày');
                btn.title = 'Tìm đồ nhanh (Phím tắt /)';
                btn.innerHTML = `
                    <svg fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                        <circle cx="11" cy="11" r="7"/>
                        <path d="m20 20-4.35-4.35"/>
                    </svg>
                `;
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (window.HNMTSneakerFilter) {
                        window.HNMTSneakerFilter.open();
                    } else if (window.HNMTSpotlightSearch) {
                        window.HNMTSpotlightSearch.open('giay');
                    }
                });
                svBagBtn.parentNode.insertBefore(btn, svBagBtn);
            }
        });

        if (!window.HNMTSneakerFilter && !document.querySelector('script[src*="sneaker-filter.js"]')) {
            const s = document.createElement('script');
            s.src = '/js/sneaker-filter.js?v=inject_v1';
            document.head.appendChild(s);
        }

        if (!window.HNMTSpotlightSearch && !document.querySelector('script[src*="spotlight-search.js"]')) {
            const s = document.createElement('script');
            s.src = '/js/spotlight-search.js?v=inject_v2';
            document.head.appendChild(s);
        }

        if (!window.HNMTCart && !document.querySelector('script[src*="hnmt-cart-drawer.js"]')) {
            const s = document.createElement('script');
            s.src = '/js/hnmt-cart-drawer.js?v=cart_v1';
            document.head.appendChild(s);
        }
    }

    function renderGrid() {
        ensureSneakerSearchButton();
        const grid = $('#svGrid');
        if (!grid) return;
        grid.innerHTML = '';
        grid.setAttribute('data-collection', String(currentCollectionIndex));

        getSneakers().forEach((snk, idx) => {
            const item = document.createElement('div');
            item.className = 'sv-grid-item';
            item.setAttribute('data-idx', String(idx));
            item.setAttribute('role', 'button');
            item.setAttribute('tabindex', '0');
            item.setAttribute('aria-label', `Xem chi tiết ${snk.model} - ${snk.colorway}`);
            item.innerHTML = `
                <div class="sv-item-image-wrap">
                    <img class="sv-item-img" />
                    <div class="sv-item-shadow"></div>
                </div>
            `;
            const image = item.querySelector('.sv-item-img');
            image.src = snk.image;
            image.alt = snk.model;
            // Click trực tiếp vào đôi giày để kích hoạt hiệu ứng FLIP mở chi tiết
            item.onclick = function (e) {
                e.stopPropagation();
                openSliderView(idx);
            };
            grid.appendChild(item);
        });
    }

    // --- Chuyển cảnh Shared-Element FLIP: Mở chi tiết Slider từ một đôi giày bất kỳ ---
    function openSliderView(idx) {
        if (isTransitioning) return;

        // Nếu đã ở trong Slider View rồi thì chỉ trượt slide sang đôi giày tương ứng
        if (isSliderView && currentIndex === idx) return;
        if (isSliderView) {
            const dir = idx > currentIndex ? 1 : -1;
            currentIndex = idx;
            updateSliderDisplay(dir);
            return;
        }

        isTransitioning = true;
        currentIndex = idx;
        isSliderView = true;

        const gridContainer = $('#svGridContainer');
        const sliderContainer = $('#svSliderContainer');
        const toggleBtn = $('#svToggleViewBtn');
        const app = $('#svApp');
        const heroImg = $('#svHeroImg');
        const heroShadow = $('#svHeroShadow');
        const giantTitle = $('#svGiantTitle');
        const specsPanel = $('.sv-specs-panel');
        const controlsPanel = $('.sv-controls-panel');

        const snk = getSneakers()[currentIndex];
        if (!snk) {
            isTransitioning = false;
            return;
        }

        // 1. Tìm phần tử đôi giày vừa được bấm trong Grid
        const gridItems = $$('.sv-grid-item');
        const clickedItem = gridItems[idx];
        const clickedImg = clickedItem ? clickedItem.querySelector('.sv-item-img') : null;
        const clickedShadow = clickedItem ? clickedItem.querySelector('.sv-item-shadow') : null;

        // 2. Đo vị trí FIRST (Bounding Rect trong Grid)
        let startRect = null;
        if (clickedImg) {
            startRect = clickedImg.getBoundingClientRect();
        }

        // 3. Hiệu ứng các đôi giày còn lại: mờ dần và thu nhỏ nhẹ
        gridItems.forEach((item, i) => {
            if (i !== idx) {
                item.classList.add('is-fading-out');
            }
        });

        // 4. Mở Slider View (LAST state)
        if (sliderContainer) {
            sliderContainer.classList.add('is-active');
            sliderContainer.style.opacity = '1';
        }

        // Cập nhật thông số kỹ thuật, màu nền, các chấm màu
        updateSliderDataOnly(snk);

        // Ẩn tạm thời typography, specs, controls và hero shadow để chuẩn bị hiệu ứng bay vào
        if (giantTitle) {
            setGiantTitleText(snk);
            giantTitle.style.transition = 'none';
            giantTitle.style.opacity = '0';
            giantTitle.style.transform = 'scale(0.82)';
        }
        if (specsPanel) {
            specsPanel.style.transition = 'none';
            specsPanel.style.opacity = '0';
            specsPanel.style.transform = 'translateY(28px)';
        }
        if (controlsPanel) {
            controlsPanel.style.transition = 'none';
            controlsPanel.style.opacity = '0';
            controlsPanel.style.transform = 'translateY(28px)';
        }
        if (heroShadow) {
            heroShadow.style.transition = 'none';
            heroShadow.style.opacity = '0';
            heroShadow.style.transform = 'translateX(-50%) rotate(-10deg) scale(0.35)';
        }

        if (toggleBtn) {
            toggleBtn.innerHTML = '<i class="bi bi-grid-3x3-gap"></i> <span>TẤT CẢ GIÀY</span>';
        }

        // 5. Tính toán FLIP cho Hero Image với chuyển động bay chậm rãi, điện ảnh
        if (heroImg && startRect) {
            heroImg.classList.remove('is-floating');
            heroImg.classList.remove('is-pair-view');
            heroImg.src = snk.image;
            heroImg.alt = snk.model;
            heroImg.style.transition = 'none';
            heroImg.style.opacity = '1';
            heroImg.style.transformOrigin = 'center center';
            heroImg.style.transform = 'translate(0px, 0px) scale(1) rotate(-15deg)';

            // Đo vị trí LAST của heroImg khi nằm ở trung tâm
            const destRect = heroImg.getBoundingClientRect();

            const startCenterX = startRect.left + startRect.width / 2;
            const startCenterY = startRect.top + startRect.height / 2;
            const destCenterX = destRect.left + destRect.width / 2;
            const destCenterY = destRect.top + destRect.height / 2;

            const deltaX = startCenterX - destCenterX;
            const deltaY = startCenterY - destCenterY;
            const scale = startRect.width / destRect.width;

            // INVERT: Đưa heroImg đến đúng tọa độ, kích thước và góc nghiêng của đôi giày trong Grid
            heroImg.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(${scale}) rotate(-15deg)`;

            // Ẩn ảnh trong grid để không bị chồng bóng ma
            if (clickedImg) clickedImg.style.visibility = 'hidden';
            if (clickedShadow) clickedShadow.style.opacity = '0';

            // Ép browser reflow để ghi nhận trạng thái Invert
            void heroImg.offsetWidth;

            // PLAY: Kích hoạt transition đưa giày từ vị trí Grid bay vào trung tâm chậm rãi (0.92s) cực mượt mà
            heroImg.style.transition = 'transform 0.92s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.45s ease';
            heroImg.style.transform = 'translate(0px, 0px) scale(1) rotate(-15deg)';

            // Cross-fade nền từ texture tối sang theme color của giày chậm rãi hòa quyện (0.92s)
            if (app) {
                app.classList.remove('is-grid-mode');
                applyShoeTheme(app, snk);
            }

            // Stagger các thành phần chữ, specs và controls hiện dần ra sau 320ms
            setTimeout(() => {
                if (giantTitle) {
                    giantTitle.style.transition = 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.65s ease';
                    giantTitle.style.opacity = '0.94';
                    giantTitle.style.transform = 'scale(1)';
                }
                if (specsPanel) {
                    specsPanel.style.transition = 'transform 0.75s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.6s ease';
                    specsPanel.style.opacity = '1';
                    specsPanel.style.transform = 'translate(0, 0)';
                }
                if (controlsPanel) {
                    controlsPanel.style.transition = 'transform 0.75s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.6s ease';
                    controlsPanel.style.opacity = '1';
                    controlsPanel.style.transform = 'translate(0, 0)';
                }
                if (heroShadow) {
                    heroShadow.style.transition = 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.65s ease';
                    heroShadow.style.opacity = '1';
                    heroShadow.style.transform = 'translateX(-50%) rotate(-10deg) scale(1)';
                }
            }, 320);

            // Khi hoàn thành chuyến bay (930ms)
            setTimeout(() => {
                if (gridContainer) gridContainer.classList.add('is-hidden');
                gridItems.forEach(it => it.classList.remove('is-fading-out'));
                if (clickedImg) clickedImg.style.visibility = '';
                if (clickedShadow) clickedShadow.style.opacity = '';

                heroImg.classList.add('is-floating');
                isTransitioning = false;
            }, 930);
        } else {
            // Fallback an toàn nếu trình duyệt chưa kịp render startRect
            if (gridContainer) gridContainer.classList.add('is-hidden');
            if (app) {
                app.classList.remove('is-grid-mode');
                applyShoeTheme(app, snk);
            }
            updateSliderDisplay(0, true);
            isTransitioning = false;
        }
    }

    // --- Chuyển cảnh Reverse FLIP: Thu nhỏ và bay chiếc giày trở về ô trong Grid (chậm rãi, êm ái) ---
    function closeSliderView(immediate = false) {
        if (isTransitioning) return;
        if (openedFromHomeCard && isSliderView && !immediate) {
            location.assign("/#mainContent");
            return;
        }
        if (isSliderView) syncSneakerUrl(null);
        clearTimeout(pendingSlide);
        pendingSlide = null;
        isSliderView = false;

        const gridContainer = $('#svGridContainer');
        const sliderContainer = $('#svSliderContainer');
        const app = $('#svApp');
        const toggleBtn = $('#svToggleViewBtn');
        const heroImg = $('#svHeroImg');
        const heroShadow = $('#svHeroShadow');
        const giantTitle = $('#svGiantTitle');
        const specsPanel = $('.sv-specs-panel');
        const controlsPanel = $('.sv-controls-panel');
        const gridItems = $$('.sv-grid-item');

        // 1. Dừng ambient floating
        if (heroImg) {
            heroImg.classList.remove('is-floating');
        }

        // Nếu chuyển đổi ngay lập tức (ví dụ khi mở lần đầu)
        if (immediate) {
            if (sliderContainer) sliderContainer.classList.remove('is-active');
            if (gridContainer) gridContainer.classList.remove('is-hidden');
            if (app) {
                app.classList.add('is-grid-mode');
                applyShoeTheme(app, { themeColor: '#0D0E12' });
            }
            gridItems.forEach(it => {
                it.classList.remove('is-fading-out');
                const img = it.querySelector('.sv-item-img');
                const shadow = it.querySelector('.sv-item-shadow');
                if (img) img.style.visibility = '';
                if (shadow) shadow.style.opacity = '';
            });
            if (toggleBtn) {
                toggleBtn.innerHTML = '<i class="bi bi-view-stacked"></i> <span>SLIDER 3D</span>';
            }
            isTransitioning = false;
            return;
        }

        isTransitioning = true;

        // 2. Mở lại grid container bên dưới và ĐỒNG BỘ lưới với bộ sưu tập hiện tại
        if (gridContainer) {
            gridContainer.classList.remove('is-hidden');
        }

        const grid = $('#svGrid');
        if (grid && grid.getAttribute('data-collection') !== String(currentCollectionIndex)) {
            renderGrid();
        }

        const activeGridItems = $$('.sv-grid-item');
        const targetItem = activeGridItems[currentIndex] || activeGridItems[0];
        const targetImg = targetItem ? targetItem.querySelector('.sv-item-img') : null;
        const targetShadow = targetItem ? targetItem.querySelector('.sv-item-shadow') : null;

        // Giữ các đôi giày khác mờ nhẹ trong lúc chiếc hero chuẩn bị đáp xuống
        activeGridItems.forEach((it, i) => {
            if (i !== currentIndex) {
                it.classList.add('is-fading-out');
            }
        });

        if (targetImg) targetImg.style.visibility = 'hidden';
        if (targetShadow) targetShadow.style.opacity = '0';

        // 3. Fade out typography, specs, controls
        if (giantTitle) {
            giantTitle.style.transition = 'transform 0.45s ease, opacity 0.38s ease';
            giantTitle.style.opacity = '0';
            giantTitle.style.transform = 'scale(0.86)';
        }
        if (specsPanel) {
            specsPanel.style.transition = 'transform 0.42s ease, opacity 0.35s ease';
            specsPanel.style.opacity = '0';
            specsPanel.style.transform = 'translateY(20px)';
        }
        if (controlsPanel) {
            controlsPanel.style.transition = 'transform 0.42s ease, opacity 0.35s ease';
            controlsPanel.style.opacity = '0';
            controlsPanel.style.transform = 'translateY(20px)';
        }
        if (heroShadow) {
            heroShadow.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
            heroShadow.style.opacity = '0';
            heroShadow.style.transform = 'translateX(-50%) rotate(-10deg) scale(0.35)';
        }

        // 4. Crossfade background về hình nền vân bê tông tối cao cấp
        if (app) {
            app.classList.add('is-grid-mode');
            applyShoeTheme(app, { themeColor: '#0D0E12' });
        }

        // 5. Tính toán FLIP từ heroImg về vị trí của targetImg trong grid (chậm rãi 0.85s)
        if (heroImg && targetImg) {
            const heroRect = heroImg.getBoundingClientRect();
            const targetRect = targetImg.getBoundingClientRect();

            const heroCenterX = heroRect.left + heroRect.width / 2;
            const heroCenterY = heroRect.top + heroRect.height / 2;
            const targetCenterX = targetRect.left + targetRect.width / 2;
            const targetCenterY = targetRect.top + targetRect.height / 2;

            const deltaX = targetCenterX - heroCenterX;
            const deltaY = targetCenterY - heroCenterY;
            const scale = targetRect.width / heroRect.width;

            heroImg.style.transition = 'transform 0.85s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.5s ease';
            heroImg.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(${scale}) rotate(-15deg)`;

            // Fade in lại 5 đôi giày còn lại sau 280ms
            setTimeout(() => {
                activeGridItems.forEach(it => it.classList.remove('is-fading-out'));
            }, 280);

            // Khi đôi giày đã đáp gọn vào ô grid (860ms)
            setTimeout(() => {
                if (targetImg) targetImg.style.visibility = '';
                if (targetShadow) targetShadow.style.opacity = '';

                if (sliderContainer) {
                    sliderContainer.classList.remove('is-active');
                }

                heroImg.style.transition = 'none';
                heroImg.style.transform = 'translate(0px, 0px) scale(1) rotate(-15deg)';

                if (toggleBtn) {
                    toggleBtn.innerHTML = '<i class="bi bi-view-stacked"></i> <span>SLIDER 3D</span>';
                }

                isTransitioning = false;
            }, 860);
        } else {
            if (sliderContainer) sliderContainer.classList.remove('is-active');
            gridItems.forEach(it => it.classList.remove('is-fading-out'));
            if (targetImg) targetImg.style.visibility = '';
            if (toggleBtn) toggleBtn.innerHTML = '<i class="bi bi-view-stacked"></i> <span>SLIDER 3D</span>';
            isTransitioning = false;
        }
    }

    // --- Cập nhật tiêu đề khổng lồ phía sau (kích thước đồng nhất cho tất cả các bộ) ---
    function setGiantTitleText(sneaker) {
        const giantEl = $('#svGiantTitle');
        if (!giantEl || !sneaker) return;

        const title = sneaker.backdropTitle || sneaker.model;
        const words = title.split(' ');
        const first = words[0];
        const last = words[words.length - 1];
        const options = [title, `${first} ${last}`, first, last];
        const availableWidth = giantEl.parentElement.clientWidth;
        for (const text of new Set(options)) {
            giantEl.textContent = text;
            if (!availableWidth || giantEl.offsetWidth <= availableWidth) return;
        }
    }

    // --- Cập nhật dữ liệu thông số Tech Specs & Swatches (không làm gián đoạn FLIP) ---
    function renderGallery(snk) {
        const slider = $('#svStage')?.closest('.sv-slider-container');
        const hero = $('#svHeroImg');
        if (!slider || !hero) return;
        slider.querySelector('.sv-gallery')?.remove();
        if (!snk.pairImage) return;

        const gallery = document.createElement('div');
        gallery.className = 'sv-gallery';
        gallery.setAttribute('role', 'group');
        gallery.setAttribute('aria-label', 'Góc xem giày');
        const views = [
            { src: snk.image, label: 'Một chiếc' },
            { src: snk.pairImage, label: 'Cả đôi' }
        ];
        const buttons = views.map((view, index) => {
            const button = document.createElement('button');
            button.type = 'button';
            button.setAttribute('aria-label', view.label);
            button.setAttribute('aria-pressed', String(index === 0));
            const image = document.createElement('img');
            image.src = view.src;
            image.alt = '';
            button.append(image);
            button.addEventListener('click', () => {
                if (pendingSlide !== null || isTransitioning) return;
                hero.src = view.src;
                hero.alt = snk.model + ' — ' + view.label;
                hero.classList.toggle('is-pair-view', index === 1);
                buttons.forEach(other => other.setAttribute('aria-pressed', String(other === button)));
            });
            gallery.append(button);
            return button;
        });
        slider.append(gallery);
    }

    function updateSliderDataOnly(snk) {
        if (snk) syncSneakerUrl(snk);
        renderGallery(snk);
        const colorwayName = $('#svColorwayName');
        const styleCode = $('#svStyleCode');
        const price = $('#svPrice');
        const colorName = $('#svColorName');
        const designer = $('#svDesigner');
        const release = $('#svRelease');
        const swatchesContainer = $('#svSwatches');

        if (colorwayName) colorwayName.textContent = snk.colorway;
        if (styleCode) styleCode.textContent = snk.styleCode;
        if (price) price.textContent = formatPrice(snk.price);
        if (colorName) colorName.textContent = snk.colorName;
        if (designer) designer.textContent = snk.designer;
        if (release) release.textContent = snk.release || '—';

        localizeAllLabels();

        if (swatchesContainer) {
            swatchesContainer.innerHTML = '';
            getSneakers().forEach((snkItem, i) => {
                const dot = document.createElement('span');
                dot.className = `sv-color-dot ${i === currentIndex ? 'is-active' : ''}`;
                dot.style.backgroundColor = snkItem.themeColor;
                dot.title = `${snkItem.model} — ${snkItem.colorway}`;
                dot.onclick = (e) => {
                    e.stopPropagation();
                    if (i !== currentIndex) {
                        const dir = i > currentIndex ? 1 : -1;
                        currentIndex = i;
                        updateSliderDisplay(dir);
                    }
                };
                swatchesContainer.appendChild(dot);
            });
        }
    }

    // --- Cập nhật giao diện Slider với hiệu ứng Slide-In mượt mà (direction: +1 next, -1 prev) ---
    function updateSliderDisplay(direction = 1, immediate = false) {
        const snk = getSneakers()[currentIndex];
        if (!snk) return;

        const app = $('#svApp');
        const giantTitle = $('#svGiantTitle');
        const heroImg = $('#svHeroImg');
        const heroShadow = $('#svHeroShadow');
        const specsPanel = $('.sv-specs-panel');

        clearTimeout(pendingSlide);
        pendingSlide = null;

        const applySneakerDetails = () => {
            applyShoeTheme(app, snk);
            updateSliderDataOnly(snk);
        };

        if (immediate) {
            applySneakerDetails();
            if (giantTitle) {
                setGiantTitleText(snk);
                giantTitle.style.opacity = '0.94';
                giantTitle.style.transform = 'scale(1)';
            }
            if (heroImg) {
                heroImg.classList.remove('is-floating');
                heroImg.classList.remove('is-pair-view');
                heroImg.src = snk.image;
                heroImg.alt = snk.model;
                heroImg.style.opacity = '1';
                heroImg.style.transform = 'translate(0, 0) scale(1) rotate(-15deg)';
                setTimeout(() => heroImg.classList.add('is-floating'), 300);
            }
            if (heroShadow) {
                heroShadow.style.opacity = '1';
                heroShadow.style.transform = 'translateX(-50%) rotate(-10deg) scale(1)';
            }
            if (specsPanel) {
                specsPanel.style.opacity = '1';
                specsPanel.style.transform = 'translate(0, 0)';
            }
        } else {
            // Hiệu ứng Slide-In 2D mượt mà chuẩn Smart Animate
            const slideOffset = direction > 0 ? 80 : -80;

            if (giantTitle) {
                giantTitle.style.opacity = '0';
                giantTitle.style.transform = 'scale(0.9)';
            }
            if (heroImg) {
                heroImg.classList.remove('is-floating');
                heroImg.style.opacity = '0';
                heroImg.style.transform = `translateX(${slideOffset}px) scale(0.92) rotate(-15deg)`;
            }
            if (heroShadow) {
                heroShadow.style.opacity = '0';
                heroShadow.style.transform = 'translateX(-50%) rotate(-10deg) scale(0.8)';
            }
            if (specsPanel) {
                specsPanel.style.opacity = '0';
                specsPanel.style.transform = 'translateY(15px)';
            }

            pendingSlide = setTimeout(() => {
                pendingSlide = null;
                applySneakerDetails();
                if (giantTitle) {
                    setGiantTitleText(snk);
                    giantTitle.style.opacity = '0.94';
                    giantTitle.style.transform = 'scale(1)';
                }
                if (heroImg) {
                    heroImg.classList.remove('is-pair-view');
                    heroImg.src = snk.image;
                    heroImg.alt = snk.model;
                    heroImg.style.opacity = '1';
                    heroImg.style.transform = 'translate(0, 0) scale(1) rotate(-15deg)';
                    setTimeout(() => heroImg.classList.add('is-floating'), 400);
                }
                if (heroShadow) {
                    heroShadow.style.opacity = '1';
                    heroShadow.style.transform = 'translateX(-50%) rotate(-10deg) scale(1)';
                }
                if (specsPanel) {
                    specsPanel.style.opacity = '1';
                    specsPanel.style.transform = 'translate(0, 0)';
                }
            }, 180);
        }

        // Cập nhật vạch Dash Indicators
        renderDashes();
    }

    // --- Render các vạch Dash chuyển trang ở đáy ---
    function renderDashes() {
        const container = $('#svDashes');
        if (!container) return;
        container.innerHTML = '';

        getSneakers().forEach((_, idx) => {
            const dash = document.createElement('div');
            dash.className = `sv-dash ${idx === currentIndex ? 'is-active' : ''}`;
            dash.onclick = () => {
                if (idx !== currentIndex) {
                    const dir = idx > currentIndex ? 1 : -1;
                    currentIndex = idx;
                    updateSliderDisplay(dir);
                }
            };
            container.appendChild(dash);
        });
    }

    // --- Chuyển chiếc giày kế tiếp / trước đó ---
    function nextSneaker() {
        currentIndex = (currentIndex + 1) % getSneakers().length;
        updateSliderDisplay(1);
    }

    function prevSneaker() {
        currentIndex = (currentIndex - 1 + getSneakers().length) % getSneakers().length;
        updateSliderDisplay(-1);
    }

    const SIZES = ['39', '40', '41', '42', '43', '44'];
    let selectedSize = '42'; // Mặc định size 42

    // --- Đảm bảo Glassmorphism Size Drawer luôn tồn tại trên DOM ---
    function ensureSizeDrawerInDOM() {
        let backdrop = $('#svSizeBackdrop');
        if (!backdrop) {
            backdrop = document.createElement('div');
            backdrop.className = 'sv-size-backdrop';
            backdrop.id = 'svSizeBackdrop';
            document.body.appendChild(backdrop);
            backdrop.onclick = closeSizeDrawer;
        }

        const controlsPanels = document.querySelectorAll('.sv-controls-panel');
        controlsPanels.forEach(panel => {
            let drawer = panel.querySelector('.sv-size-drawer');
            if (!drawer) {
                drawer = document.createElement('div');
                drawer.className = 'sv-size-drawer';
                drawer.id = 'svSizeDrawer';
                drawer.innerHTML = `
                    <div class="sv-size-header">
                        <h4 class="sv-size-title">CHỌN SIZE GIÀY (EU)</h4>
                        <button type="button" class="sv-size-close-btn" id="svCloseSizeDrawerBtn" title="Đóng">✕</button>
                    </div>
                    <div class="sv-size-product-info">
                        <span class="sv-size-model-name" id="svSizeModelName">AIR FUTURE</span>
                        <span class="sv-size-price" id="svSizePrice">0 ₫</span>
                    </div>
                    <div class="sv-size-grid" id="svSizeGrid">
                        <!-- Render danh sách size -->
                    </div>
                    <div class="sv-size-hint">
                        <span>Chuẩn size EU • Hỗ trợ đổi size tận nơi trong 7 ngày</span>
                    </div>
                    <button type="button" class="sv-size-confirm-btn" id="svConfirmSizeBtn">
                        <span id="svConfirmSizeText">XÁC NHẬN</span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                    </button>
                `;
                panel.appendChild(drawer);

                const closeBtn = drawer.querySelector('#svCloseSizeDrawerBtn');
                if (closeBtn) closeBtn.onclick = (e) => { e.stopPropagation(); closeSizeDrawer(); };

                const confirmBtn = drawer.querySelector('#svConfirmSizeBtn');
                if (confirmBtn) confirmBtn.onclick = (e) => { e.stopPropagation(); confirmAddToCart(); };
            }
        });
    }

    function openSizeDrawer() {
        closeReviewsDrawer();
        ensureSizeDrawerInDOM();
        const snk = getSneakers()[currentIndex];
        if (!snk) return;

        const backdrop = $('#svSizeBackdrop');
        const drawer = $('#svSizeDrawer');
        if (backdrop) backdrop.classList.add('is-open');
        if (drawer) drawer.classList.add('is-open');

        // Cập nhật thông tin giày vào popup
        const nameEl = $('#svSizeModelName');
        const priceEl = $('#svSizePrice');
        if (nameEl) nameEl.textContent = `${snk.model} — ${snk.colorway}`;
        if (priceEl) priceEl.textContent = formatPrice(snk.price);

        // Render các ô size
        const grid = $('#svSizeGrid');
        const confirm = $('#svConfirmSizeBtn');
        const sizes = snk.sizes || SIZES;
        const stockAt = index => snk.variants[0]?.[index]?.stock || 0;
        if (!stockAt(sizes.indexOf(selectedSize))) selectedSize = sizes.find((_, index) => stockAt(index)) || '';
        if (confirm) confirm.disabled = !selectedSize;
        if (grid) {
            grid.innerHTML = '';
            sizes.forEach((sz, index) => {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = `sv-size-item ${sz === selectedSize ? 'is-selected' : ''}`;
                btn.textContent = sz;
                btn.disabled = !stockAt(index);
                btn.onclick = (e) => {
                    e.stopPropagation();
                    selectedSize = sz;
                    grid.querySelectorAll('.sv-size-item').forEach(b => b.classList.remove('is-selected'));
                    btn.classList.add('is-selected');
                    const confirmText = $('#svConfirmSizeText');
                    if (confirmText) confirmText.textContent = 'XÁC NHẬN';
                    if (priceEl) priceEl.textContent = formatPrice(snk.variants[0][index].price);
                };
                grid.appendChild(btn);
            });
        }
        if (priceEl && selectedSize) priceEl.textContent = formatPrice(snk.variants[0][sizes.indexOf(selectedSize)].price);

        const confirmText = $('#svConfirmSizeText');
        if (confirmText) confirmText.textContent = 'XÁC NHẬN';
    }

    function closeSizeDrawer() {
        const backdrop = $('#svSizeBackdrop');
        const drawer = $('#svSizeDrawer');
        if (backdrop) backdrop.classList.remove('is-open');
        if (drawer) drawer.classList.remove('is-open');
    }

    // Xác nhận thêm vào giỏ hàng kèm size đã chọn
    async function confirmAddToCart() {
        const shoe = getSneakers()[currentIndex];
        if (!shoe || !window.HNMTCart) return;
        const size = selectedSize;
        const variant = shoe.variants[0]?.[shoe.sizes.indexOf(size)];
        const confirm = $('#svConfirmSizeBtn');
        if (!variant?.stock || confirm?.disabled) return;

        if (confirm) confirm.disabled = true;
        closeSizeDrawer();
        const added = await window.HNMTCart.addItem({
            name: shoe.name, productId: shoe.productId, variantId: variant.id, quantity: 1
        });
        if (confirm) confirm.disabled = false;
        if (!added || getSneakers()[currentIndex] !== shoe) return;

        const label = $('#svAddBagBtn span');
        if (label) {
            label.textContent = `ĐÃ THÊM VÀO GIỎ (SIZE ${size})`;
            setTimeout(() => { label.textContent = 'THÊM VÀO GIỎ'; }, 2400);
        }
    }

    function addToBag() {
        openSizeDrawer();
    }

    function showToast(msg) {
        // Tắt toàn bộ thông báo nổi theo yêu cầu
        const toast = $('#svToast');
        if (toast) toast.remove();
    }

    // ==========================================================================
    // PHẦN ĐÁNH GIÁ GIÀY (SNEAKER VAULT REVIEWS - ĐỒNG BỘ 100% GIAO DIỆN)
    // ==========================================================================
    let currentSneakerReviewStar = 5;
    const SNEAKER_MOOD_TEXTS = {
        1: 'Rất tệ (1 sao)',
        2: 'Chưa hài lòng (2 sao)',
        3: 'Bình thường (3 sao)',
        4: 'Hài lòng (4 sao)',
        5: 'Tuyệt vời (5 sao)'
    };

    function ensureReviewsDrawerInDOM() {
        let backdrop = document.getElementById('svReviewsBackdrop');
        if (!backdrop) {
            backdrop = document.createElement('div');
            backdrop.className = 'sv-reviews-backdrop';
            backdrop.id = 'svReviewsBackdrop';
            document.body.appendChild(backdrop);
            backdrop.onclick = closeReviewsDrawer;
        }

        const controlsPanels = document.querySelectorAll('.sv-controls-panel');
        controlsPanels.forEach(panel => {
            let drawer = panel.querySelector('.sv-reviews-drawer');
            if (!drawer) {
                drawer = document.createElement('div');
                drawer.className = 'sv-reviews-drawer';
                drawer.id = 'svReviewsDrawer';
                drawer.innerHTML = `
                    <div class="sv-reviews-header">
                        <div>
                            <h4 class="sv-reviews-title">ĐÁNH GIÁ SẢN PHẨM</h4>
                            <div class="sv-reviews-rating-badge">
                                <span class="sv-reviews-stars" id="svReviewsStarsText">★★★★★</span>
                                <span class="sv-reviews-score" id="svReviewsScoreText">5.0</span>
                                <span class="sv-reviews-count" id="svReviewsCountText">(0)</span>
                            </div>
                        </div>
                        <button type="button" class="sv-reviews-close-btn" id="svCloseReviewsDrawerBtn" title="Đóng">✕</button>
                    </div>

                    <div class="sv-reviews-product-info">
                        <span class="sv-reviews-product-model" id="svReviewsModelName">SNEAKER VAULT</span>
                        <span class="sv-reviews-product-price" id="svReviewsPrice">0 ₫</span>
                    </div>

                    <div class="sv-reviews-body">
                        <!-- FORM GỬI ĐÁNH GIÁ (Chỉ cho tài khoản đã nhận hàng thành công) -->
                        <div class="sv-reviews-write-card" id="svWriteReviewCard" style="display: none;">
                            <div class="sv-write-header">
                                <span class="sv-write-title">GỬI ĐÁNH GIÁ CỦA BẠN</span>
                                <span class="sv-verified-badge"><i class="bi bi-shield-check"></i> Đã mua hàng</span>
                            </div>
                            <p class="sv-write-sub">Chia sẻ cảm nhận thực tế về form giày, độ êm và chất liệu</p>

                            <div class="sv-star-selector">
                                <span class="sv-star-label">Đánh giá:</span>
                                <div class="sv-star-btns" id="svStarSelector">
                                    <button type="button" class="sv-star-btn is-active" data-val="1">★</button>
                                    <button type="button" class="sv-star-btn is-active" data-val="2">★</button>
                                    <button type="button" class="sv-star-btn is-active" data-val="3">★</button>
                                    <button type="button" class="sv-star-btn is-active" data-val="4">★</button>
                                    <button type="button" class="sv-star-btn is-active" data-val="5">★</button>
                                </div>
                                <span class="sv-star-mood" id="svStarMood">Tuyệt vời (5 sao)</span>
                            </div>

                            <textarea id="svReviewComment" class="sv-review-textarea" rows="3" placeholder="Chia sẻ cảm nhận thực tế của bạn về đôi giày này..."></textarea>

                            <button type="button" class="sv-review-submit-btn" id="svSubmitReviewBtn">
                                <i class="bi bi-send-fill"></i>
                                <span>GỬI ĐÁNH GIÁ</span>
                            </button>
                            <div id="svReviewMsg" class="sv-review-msg" style="display: none;"></div>
                        </div>

                        <!-- THÔNG BÁO CHO TÀI KHOẢN CHƯA MUA / ĐÃ ĐÁNH GIÁ -->
                        <div class="sv-review-notice-box" id="svReviewNoticeBox" style="display: none;">
                            <i class="bi bi-shield-lock"></i>
                            <span id="svReviewNoticeText">Đánh giá chỉ dành cho tài khoản đã mua và nhận sản phẩm thành công.</span>
                        </div>

                        <!-- DANH SÁCH TẤT CẢ ĐÁNH GIÁ -->
                        <div class="sv-reviews-list-wrap">
                            <div class="sv-reviews-list-title">
                                <span>TẤT CẢ ĐÁNH GIÁ</span>
                                <span id="svReviewsTotalCount" class="sv-reviews-total-count">0 nhận xét</span>
                            </div>
                            <div class="sv-reviews-items" id="svReviewsItems">
                                <div class="sv-reviews-loading">Đang tải đánh giá...</div>
                            </div>
                        </div>
                    </div>
                `;
                panel.appendChild(drawer);

                const closeBtn = drawer.querySelector('#svCloseReviewsDrawerBtn');
                if (closeBtn) closeBtn.onclick = (e) => { e.stopPropagation(); closeReviewsDrawer(); };

                initSneakerReviewStarEvents(drawer);
                initSneakerSubmitReviewEvent(drawer);
            }
        });
    }

    function openReviewsDrawer() {
        closeSizeDrawer();
        ensureReviewsDrawerInDOM();
        const snk = getSneakers()[currentIndex];
        if (!snk) return;

        const backdrop = $('#svReviewsBackdrop');
        const drawer = $('#svReviewsDrawer');
        if (backdrop) backdrop.classList.add('is-open');
        if (drawer) drawer.classList.add('is-open');

        const nameEl = $('#svReviewsModelName');
        const priceEl = $('#svReviewsPrice');
        if (nameEl) nameEl.textContent = `${snk.model} — ${snk.colorway}`;
        if (priceEl) priceEl.textContent = formatPrice(snk.price);

        loadSneakerReviews(snk.productId);
    }

    function closeReviewsDrawer() {
        const backdrop = $('#svReviewsBackdrop');
        const drawer = $('#svReviewsDrawer');
        if (backdrop) backdrop.classList.remove('is-open');
        if (drawer) drawer.classList.remove('is-open');
    }

    async function loadSneakerReviews(productId) {
        if (!productId) return;
        ensureReviewsDrawerInDOM();

        const starsPreview = $('#svStarsPreview');
        const ratingNum = $('#svRatingNum');
        const countNum = $('#svCountNum');

        const drawerStars = $('#svReviewsStarsText');
        const drawerScore = $('#svReviewsScoreText');
        const drawerCount = $('#svReviewsCountText');
        const totalCount = $('#svReviewsTotalCount');
        const writeCard = $('#svWriteReviewCard');
        const noticeBox = $('#svReviewNoticeBox');
        const noticeText = $('#svReviewNoticeText');
        const reviewItems = $('#svReviewsItems');
        const msgEl = $('#svReviewMsg');

        if (reviewItems) {
            reviewItems.innerHTML = '<div class="sv-reviews-loading">Đang tải đánh giá...</div>';
        }
        if (msgEl) {
            msgEl.style.display = 'none';
            msgEl.textContent = '';
        }

        try {
            const res = await fetch(`/Products/GetProductReviews?productId=${productId}`, { cache: 'no-store' });
            const data = await res.json();

            if (!data.success) {
                if (reviewItems) reviewItems.innerHTML = '<div class="sv-reviews-empty">Không thể tải đánh giá.</div>';
                return;
            }

            const scoreFormatted = data.count > 0 ? Number(data.average).toFixed(1) : '5.0';
            const rounded = Math.round(data.average || 5);
            const starsStr = '★'.repeat(rounded) + '☆'.repeat(Math.max(0, 5 - rounded));

            if (starsPreview) starsPreview.textContent = starsStr;
            if (ratingNum) ratingNum.textContent = scoreFormatted;
            if (countNum) countNum.textContent = `(${data.count})`;

            if (drawerStars) drawerStars.textContent = starsStr;
            if (drawerScore) drawerScore.textContent = scoreFormatted;
            if (drawerCount) drawerCount.textContent = `(${data.count})`;
            if (totalCount) totalCount.textContent = `${data.count} nhận xét`;

            // Kiểm tra phân quyền đánh giá: Chỉ khách đã mua và nhận hàng thành công
            if (!data.isAuthenticated) {
                if (writeCard) writeCard.style.display = 'none';
                if (noticeBox) {
                    noticeBox.style.display = 'flex';
                    if (noticeText) noticeText.innerHTML = 'Vui lòng <a href="/Account/Login" style="color:#ffffff;font-weight:700;text-decoration:underline;">đăng nhập</a> để đánh giá sau khi nhận hàng.';
                }
            } else if (data.hasReviewed) {
                if (writeCard) writeCard.style.display = 'none';
                if (noticeBox) {
                    noticeBox.style.display = 'flex';
                    if (noticeText) noticeText.textContent = '✓ Bạn đã đánh giá sản phẩm này. Cảm ơn bạn!';
                }
            } else if (data.hasDeliveredPurchase) {
                if (noticeBox) noticeBox.style.display = 'none';
                if (writeCard) writeCard.style.display = 'block';
            } else {
                if (writeCard) writeCard.style.display = 'none';
                if (noticeBox) {
                    noticeBox.style.display = 'flex';
                    if (noticeText) noticeText.textContent = '🔒 Đánh giá chỉ dành cho tài khoản đã mua và nhận giày thành công.';
                }
            }

            if (reviewItems) {
                if (!data.reviews || data.reviews.length === 0) {
                    reviewItems.innerHTML = '<div class="sv-reviews-empty">Chưa có đánh giá nào. Hãy là người đầu tiên trải nghiệm đôi giày này!</div>';
                } else {
                    reviewItems.innerHTML = data.reviews.map(r => {
                        const rStar = Math.round(r.rating || 5);
                        const starHtml = '★'.repeat(rStar) + '☆'.repeat(Math.max(0, 5 - rStar));
                        const initial = (r.reviewerName || 'K').trim().charAt(0).toUpperCase();
                        return `
                            <div class="sv-review-item">
                                <div class="sv-review-item-top">
                                    <div class="sv-item-user-info">
                                        <div class="sv-item-avatar">${initial}</div>
                                        <div class="sv-item-user-meta">
                                            <span class="sv-item-user-name">
                                                ${r.reviewerName}
                                                <i class="bi bi-patch-check-fill sv-verified-badge-icon" style="color:#10b981;font-size:12px;" title="Đã mua hàng"></i>
                                            </span>
                                            ${r.spec ? `<span class="sv-item-spec">${r.spec}</span>` : ''}
                                        </div>
                                    </div>
                                    <span class="sv-item-stars">${starHtml}</span>
                                </div>
                                <p class="sv-item-comment">${r.comment}</p>
                                <div style="display:flex;justify-content:flex-end;margin-top:4px;">
                                    <span class="sv-item-date">${r.createdAtFormatted}</span>
                                </div>
                            </div>
                        `;
                    }).join('');
                }
            }
        } catch (err) {
            console.error('[SneakerReviews] Lỗi tải đánh giá:', err);
            if (reviewItems) reviewItems.innerHTML = '<div class="sv-reviews-empty">Không thể kết nối máy chủ để tải đánh giá.</div>';
        }
    }

    function initSneakerReviewStarEvents(drawer) {
        const starBtns = drawer.querySelectorAll('#svStarSelector .sv-star-btn');
        const moodEl = drawer.querySelector('#svStarMood');
        starBtns.forEach(btn => {
            btn.onclick = (e) => {
                e.stopPropagation();
                const val = parseInt(btn.dataset.val || '5', 10);
                currentSneakerReviewStar = val;
                starBtns.forEach(b => {
                    const bVal = parseInt(b.dataset.val || '5', 10);
                    b.classList.toggle('is-active', bVal <= val);
                });
                if (moodEl) moodEl.textContent = SNEAKER_MOOD_TEXTS[val] || `${val} sao`;
            };
        });
    }

    function initSneakerSubmitReviewEvent(drawer) {
        const submitBtn = drawer.querySelector('#svSubmitReviewBtn');
        if (!submitBtn) return;
        submitBtn.onclick = async (e) => {
            e.stopPropagation();
            const snk = getSneakers()[currentIndex];
            if (!snk) return;

            const commentInput = drawer.querySelector('#svReviewComment');
            const comment = commentInput ? commentInput.value.trim() : '';
            const msgEl = drawer.querySelector('#svReviewMsg');

            if (!comment) {
                if (msgEl) {
                    msgEl.className = 'sv-review-msg error';
                    msgEl.textContent = 'Vui lòng nhập nội dung đánh giá thực tế của bạn.';
                    msgEl.style.display = 'block';
                }
                if (commentInput) commentInput.focus();
                return;
            }

            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Đang gửi...';

            try {
                const res = await fetch('/Products/SubmitReviewAjax', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        productId: snk.productId,
                        rating: currentSneakerReviewStar,
                        comment: comment
                    })
                });
                const resData = await res.json();
                if (msgEl) {
                    msgEl.className = resData.success ? 'sv-review-msg success' : 'sv-review-msg error';
                    msgEl.textContent = resData.message;
                    msgEl.style.display = 'block';
                }
                if (resData.success) {
                    if (commentInput) commentInput.value = '';
                    setTimeout(() => {
                        loadSneakerReviews(snk.productId);
                    }, 800);
                }
            } catch (err) {
                if (msgEl) {
                    msgEl.className = 'sv-review-msg error';
                    msgEl.textContent = 'Có lỗi xảy ra khi gửi đánh giá.';
                    msgEl.style.display = 'block';
                }
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="bi bi-send-fill"></i> <span>GỬI ĐÁNH GIÁ</span>';
            }
        };
    }

    // --- Bind sự kiện nút bấm & Bàn phím ---
    function bindEvents() {
        const refreshBackdropTitle = () => {
            if (isSliderView) setGiantTitleText(getSneakers()[currentIndex]);
        };
        window.addEventListener('resize', refreshBackdropTitle);
        document.fonts?.ready.then(refreshBackdropTitle);

        const toggleBtn = $('#svToggleViewBtn');
        if (toggleBtn) {
            toggleBtn.onclick = () => {
                const drawer = $('#svSizeDrawer');
            if (drawer && drawer.classList.contains('is-open')) {
                closeSizeDrawer();
                return;
            }
            if (isSliderView) closeSliderView();
                else openSliderView(currentIndex);
            };
        }

        const prevBtn = $('#svPrevBtn');
        const nextBtn = $('#svNextBtn');
        if (prevBtn) prevBtn.onclick = prevSneaker;
        if (nextBtn) nextBtn.onclick = nextSneaker;

        const addBagBtn = $('#svAddBagBtn');
        if (addBagBtn) addBagBtn.onclick = addToBag;

        const reviewsBtn = $('#svReviewsBtn');
        if (reviewsBtn) reviewsBtn.onclick = openReviewsDrawer;

        const reviewsMeta = $('#svReviewsMetaRow');
        if (reviewsMeta) reviewsMeta.onclick = openReviewsDrawer;

        // Bàn phím: Mũi tên trái / phải để lướt slider, Esc để về grid/showroom
        window.addEventListener('keydown', (e) => {
            const overlay = $('#hnmtSneakerOverlay');
            const isStandalone = document.body.classList.contains('is-sneaker-standalone');
            const isActive = isStandalone || (overlay && overlay.classList.contains('is-active'));
            if (!isActive) return;

            if (e.key === 'ArrowRight') nextSneaker();
            else if (e.key === 'ArrowLeft') prevSneaker();
            else if (e.key === 'Escape') {
                if (window.HNMTSneakerFilter && document.getElementById('hnmtSneakerFilterModal')?.classList.contains('is-open')) {
                    window.HNMTSneakerFilter.close();
                    return;
                }
                const rDrawer = $('#svReviewsDrawer');
                if (rDrawer && rDrawer.classList.contains('is-open')) {
                    closeReviewsDrawer();
                    return;
                }
                const drawer = $('#svSizeDrawer');
                if (drawer && drawer.classList.contains('is-open')) {
                    closeSizeDrawer();
                    return;
                }
                if (isSliderView) closeSliderView();
                else if (typeof window.closeSneakerShowcase === 'function') window.closeSneakerShowcase();
            } else if ((e.key === '/' || (e.ctrlKey && e.key.toLowerCase() === 'k')) && !document.getElementById('hnmtSneakerFilterModal')?.classList.contains('is-open')) {
                const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
                if (activeTag !== 'input' && activeTag !== 'textarea') {
                    if (window.HNMTSneakerFilter) {
                        e.preventDefault();
                        window.HNMTSneakerFilter.open();
                    }
                }
            }
        });
    }

    // --- Xuất các hàm điều khiển toàn cục cho Showroom 3D ---
    window.openSneakerShowcase = function (audience = window.HNMTChilePortal?.getAudience?.() || 'men') {
        const overlay = $('#hnmtSneakerOverlay');
        if (overlay) {
            const collections = getAudienceCollections(audience);
            if (activeCollections !== collections) {
                activeCollections = collections;
                currentCollectionIndex = 0;
                currentIndex = 0;
                filteredSneakers = null;
                filteredPageIdx = 0;
                activeFilterLabel = '';
                closeSizeDrawer();
            }
            overlay.classList.add('is-active');
            ensureVaultSwitcherInDOM();
            localizeAllLabels();
            renderGrid();
            updateVaultSwitcherUI();
            closeSliderView(true); // Luôn luôn mở ở trang lưới TẤT CẢ GIÀY theo đúng yêu cầu!
        }
    };

    window.closeSneakerShowcase = function () {
        if (openedFromHomeCard) { location.assign("/#mainContent"); return; }
        const overlay = $('#hnmtSneakerOverlay');
        if (overlay) {
            overlay.classList.remove('is-active');
            closeSizeDrawer();
            closeSliderView(true);
        }
        const promptEl = document.querySelector('.hnmt-portal-footer');
        const portalHeaderEl = document.querySelector('.hnmt-portal-header');
        if (promptEl) promptEl.style.display = '';
        if (portalHeaderEl) portalHeaderEl.style.display = '';
    };

    window.SneakerVault = {
        openProduct: function (productSlug) {
            if (!productSlug || isTransitioning) return;
            const filteredIndex = filteredSneakers?.findIndex(item => item.id === productSlug) ?? -1;
            if (filteredIndex >= 0) {
                filteredPageIdx = Math.floor(filteredIndex / ITEMS_PER_GRID);
            } else {
                const page = activeCollections.findIndex(collection => collection.items.some(item => item.id === productSlug));
                if (page < 0) return;
                filteredSneakers = null;
                activeFilterLabel = '';
                filteredPageIdx = 0;
                currentCollectionIndex = page;
            }

            const index = getSneakers().findIndex(item => item.id === productSlug);
            updateVaultSwitcherUI();
            renderGrid();
            if (isSliderView) {
                currentIndex = index;
                updateSliderDisplay(0, true);
            } else {
                openSliderView(index);
            }
        },
        openSliderView: function (idx, collectionIdx = 0) {
            if (typeof collectionIdx === 'number' && activeCollections[collectionIdx]) {
                currentCollectionIndex = collectionIdx;
            }
            openSliderView(idx);
        },
        getSneakers: () => getSneakers(),
        getAllSneakers: () => getAllSneakers(),
        getCollections: () => getAudienceCollections(window.HNMTChilePortal?.getAudience?.() || 'men'),
        applyFilter: applyFilter,
        resetFilter: resetFilter,
        isFiltered: () => filteredSneakers !== null,
        openFilter: () => window.HNMTSneakerFilter?.open?.()
    };

    function localizeAllLabels() {
        const exitBtns = document.querySelectorAll('.sv-exit-btn');
        exitBtns.forEach(btn => {
            const span = btn.querySelector('span');
            if (span) span.textContent = 'Quay lại';
        });

        // Việt hóa nhãn thông số kỹ thuật
        const specGrids = document.querySelectorAll('.sv-spec-grid');
        specGrids.forEach(grid => {
            const dts = grid.querySelectorAll('dt');
            if (dts.length >= 4) {
                dts[0].textContent = 'MÃ GIÀY:';
                dts[1].textContent = 'PHỐI MÀU:';
                dts[2].textContent = 'THIẾT KẾ:';
                dts[3].textContent = 'GIÁ BÁN:';
            }
        });

        // Việt hóa nhãn chọn màu
        const swatchesLabels = document.querySelectorAll('.sv-swatches-label');
        swatchesLabels.forEach(lbl => {
            lbl.textContent = 'CHỌN MÀU';
        });

        // Việt hóa nút thêm giỏ
        const addBagBtns = document.querySelectorAll('.sv-add-bag-btn span');
        addBagBtns.forEach(span => {
            span.textContent = 'THÊM VÀO GIỎ';
        });
    }

    // Tự khởi chạy an toàn
    function init() {
        const standalone = document.body.classList.contains('is-sneaker-standalone');
        const audience = standalone ? new URLSearchParams(window.location.search).get('audience') || 'men' : 'men';
        if (standalone) activeCollections = getAudienceCollections(audience);

        ensureSneakerSearchButton();
        setInterval(ensureSneakerSearchButton, 600);
        ensureVaultSwitcherInDOM();
        ensureSizeDrawerInDOM();
        localizeAllLabels();
        renderGrid();
        bindEvents();
        renderDashes();

        // Mặc định luôn là trang lưới TẤT CẢ GIÀY (Grid Overview)
        if (!isSliderView) {
            closeSliderView(true);
        } else {
            const heroImg = $('#svHeroImg');
            if (heroImg) {
                heroImg.classList.add('is-floating');
                updateSliderDataOnly(getSneakers()[currentIndex]);
            }
        }

        // Tự động nhận diện và áp dụng bộ lọc chuyển tiếp từ Trang Chủ
        try {
            const pendingJson = standalone && sessionStorage.getItem('hnmt_pending_sneaker_filter');
            if (pendingJson) {
                sessionStorage.removeItem('hnmt_pending_sneaker_filter');
                const pending = JSON.parse(pendingJson);
                if (pending?.audience === audience && pending.category === 'giay' && Array.isArray(pending.filteredProducts)) {
                    applyFilter(pending.filteredProducts, pending.label || 'BỘ LỌC TỪ TRANG CHỦ');
                }
            }
        } catch (e) {}

        // Deep links from homepage cards and legacy detail URLs open the exact catalog shoe.
        if (standalone) {
            const productId = new URLSearchParams(window.location.search).get('productId');
            if (productId && /^[1-9][0-9]*$/.test(productId)) {
                const collectionIndex = activeCollections.findIndex(collection =>
                    collection.items.some(shoe => String(shoe.productId) === productId));
                if (collectionIndex >= 0) {
                    filteredSneakers = null;
                    filteredPageIdx = 0;
                    currentCollectionIndex = collectionIndex;
                    const shoeIndex = getSneakers().findIndex(shoe => String(shoe.productId) === productId);
                    renderGrid();
                    renderDashes();
                    openSliderView(shoeIndex);
                }
            }
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
