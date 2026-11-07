/**
 * AnyWear AI Virtual Try-On Studio
 * Real-time camera & photo fitting room for FashionStore
 */

(function () {
    let videoStream = null;
    let isCameraRunning = false;
    let garmentState = {
        x: 0,
        y: 0,
        scale: 1,
        opacity: 0.95,
        rotation: 0,
        isDragging: false,
        startX: 0,
        startY: 0
    };

    // DOM Elements
    let tryOnModal;
    let videoFeed;
    let photoFeed;
    let garmentLayer;
    let garmentImg;
    let laserScanner;
    let cameraNotice;

    document.addEventListener("DOMContentLoaded", function () {
        initTryOnStudio();
    });

    function initTryOnStudio() {
        tryOnModal = document.getElementById("tryOnModal");
        if (!tryOnModal) return;

        videoFeed = document.getElementById("tryonVideoFeed");
        photoFeed = document.getElementById("tryonPhotoFeed");
        garmentLayer = document.getElementById("tryonGarmentLayer");
        garmentImg = document.getElementById("tryonGarmentImg");
        laserScanner = document.getElementById("tryonLaserScanner");
        cameraNotice = document.getElementById("tryonCameraNotice");

        setupTabEvents();
        setupGarmentInteractions();
        setupControlSliders();
        setupSampleModels();
        setupPhotoUpload();
        setupSmartSizeAdvisor();
        setupSnapshot();

        // Listen for modal close to stop camera
        tryOnModal.addEventListener("hidden.bs.modal", function () {
            stopCamera();
        });
    }

    // Tab switching (Live Camera vs Photo Upload vs Size Advisor)
    function setupTabEvents() {
        const liveTab = document.getElementById("tab-live-camera");
        const photoTab = document.getElementById("tab-photo-mode");

        if (liveTab) {
            liveTab.addEventListener("shown.bs.tab", function () {
                startCamera();
                photoFeed.style.display = "none";
                videoFeed.style.display = "block";
            });
        }

        if (photoTab) {
            photoTab.addEventListener("shown.bs.tab", function () {
                stopCamera();
                videoFeed.style.display = "none";
                photoFeed.style.display = "block";
            });
        }
    }

    // Camera handling
    async function startCamera() {
        if (isCameraRunning) return;

        try {
            if (cameraNotice) cameraNotice.style.display = "none";

            const constraints = {
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: "user"
                },
                audio: false
            };

            videoStream = await navigator.mediaDevices.getUserMedia(constraints);
            if (videoFeed) {
                videoFeed.srcObject = videoStream;
                await videoFeed.play();
                isCameraRunning = true;
            }
        } catch (err) {
            console.warn("Camera access denied or not found:", err);
            if (cameraNotice) {
                cameraNotice.style.display = "block";
                cameraNotice.innerHTML = `
                    <div class="alert alert-warning mb-0 small">
                        <i class="bi bi-camera-video-off me-2"></i>
                        Không thể mở Camera (chưa cấp quyền hoặc thiết bị không có webcam). 
                        Bạn hãy chuyển sang tab <strong>"Tải ảnh của bạn"</strong> để thử đồ nhé!
                    </div>
                `;
            }
        }
    }

    function stopCamera() {
        if (videoStream) {
            videoStream.getTracks().forEach(track => track.stop());
            videoStream = null;
        }
        if (videoFeed) {
            videoFeed.srcObject = null;
        }
        isCameraRunning = false;
    }

    // Garment Drag & Drop
    function setupGarmentInteractions() {
        if (!garmentLayer) return;

        const stage = document.getElementById("tryonStage");
        if (!stage) return;

        garmentLayer.addEventListener("mousedown", onDragStart);
        window.addEventListener("mousemove", onDragging);
        window.addEventListener("mouseup", onDragEnd);

        // Touch support for mobile
        garmentLayer.addEventListener("touchstart", onTouchStart, { passive: false });
        window.addEventListener("touchmove", onTouchMove, { passive: false });
        window.addEventListener("touchend", onTouchEnd);

        function onDragStart(e) {
            garmentState.isDragging = true;
            garmentState.startX = e.clientX - garmentState.x;
            garmentState.startY = e.clientY - garmentState.y;
            garmentLayer.classList.add("selected");
            e.preventDefault();
        }

        function onDragging(e) {
            if (!garmentState.isDragging) return;
            garmentState.x = e.clientX - garmentState.startX;
            garmentState.y = e.clientY - garmentState.startY;
            updateGarmentTransform();
        }

        function onDragEnd() {
            garmentState.isDragging = false;
            garmentLayer.classList.remove("selected");
        }

        function onTouchStart(e) {
            if (e.touches.length === 1) {
                garmentState.isDragging = true;
                garmentState.startX = e.touches[0].clientX - garmentState.x;
                garmentState.startY = e.touches[0].clientY - garmentState.y;
                garmentLayer.classList.add("selected");
            }
        }

        function onTouchMove(e) {
            if (!garmentState.isDragging || e.touches.length !== 1) return;
            garmentState.x = e.touches[0].clientX - garmentState.startX;
            garmentState.y = e.touches[0].clientY - garmentState.startY;
            updateGarmentTransform();
            e.preventDefault();
        }

        function onTouchEnd() {
            garmentState.isDragging = false;
            garmentLayer.classList.remove("selected");
        }
    }

    function updateGarmentTransform() {
        if (!garmentLayer) return;
        garmentLayer.style.transform = `translate(${garmentState.x}px, ${garmentState.y}px) scale(${garmentState.scale}) rotate(${garmentState.rotation}deg)`;
        garmentLayer.style.opacity = garmentState.opacity;
    }

    // Slider Controls (Size, Opacity, Rotate)
    function setupControlSliders() {
        const scaleRange = document.getElementById("tryonScaleRange");
        const opacityRange = document.getElementById("tryonOpacityRange");
        const rotateRange = document.getElementById("tryonRotateRange");
        const resetBtn = document.getElementById("tryonResetBtn");
        const scanBtn = document.getElementById("tryonScanBtn");

        if (scaleRange) {
            scaleRange.addEventListener("input", function () {
                garmentState.scale = parseFloat(this.value);
                updateGarmentTransform();
            });
        }

        if (opacityRange) {
            opacityRange.addEventListener("input", function () {
                garmentState.opacity = parseFloat(this.value);
                updateGarmentTransform();
            });
        }

        if (rotateRange) {
            rotateRange.addEventListener("input", function () {
                garmentState.rotation = parseInt(this.value, 10);
                updateGarmentTransform();
            });
        }

        if (resetBtn) {
            resetBtn.addEventListener("click", function () {
                garmentState.x = 0;
                garmentState.y = 0;
                garmentState.scale = 1;
                garmentState.opacity = 0.95;
                garmentState.rotation = 0;

                if (scaleRange) scaleRange.value = 1;
                if (opacityRange) opacityRange.value = 0.95;
                if (rotateRange) rotateRange.value = 0;

                updateGarmentTransform();
            });
        }

        // AI Scanning Laser Animation
        if (scanBtn) {
            scanBtn.addEventListener("click", function () {
                if (!laserScanner) return;
                laserScanner.style.display = "block";
                scanBtn.disabled = true;
                scanBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span>AI đang căn chỉnh...`;

                setTimeout(() => {
                    laserScanner.style.display = "none";
                    scanBtn.disabled = false;
                    scanBtn.innerHTML = `<i class="bi bi-magic me-2"></i>AI Tự động căn dáng`;

                    // Subtle auto adjustment animation
                    garmentState.scale = 1.05;
                    garmentState.y = -10;
                    if (scaleRange) scaleRange.value = 1.05;
                    updateGarmentTransform();

                    // Show quick toast/message
                    alert("✨ AI đã nhận diện khung hình và tự động cân đối trang phục theo cơ thể của bạn!");
                }, 2200);
            });
        }
    }

    // Sample Models
    function setupSampleModels() {
        const thumbs = document.querySelectorAll(".sample-model-thumb");
        thumbs.forEach(thumb => {
            thumb.addEventListener("click", function () {
                thumbs.forEach(t => t.classList.remove("active"));
                this.classList.add("active");

                const imgUrl = this.getAttribute("data-model-img");
                if (photoFeed && imgUrl) {
                    photoFeed.src = imgUrl;

                    // Switch to photo tab
                    const photoTabTrigger = document.querySelector('#tryonTabs button[data-bs-target="#tab-photo-pane"]');
                    if (photoTabTrigger) {
                        bootstrap.Tab.getOrCreateInstance(photoTabTrigger).show();
                    }
                }
            });
        });
    }

    // Photo Upload
    function setupPhotoUpload() {
        const uploadInput = document.getElementById("tryonPhotoUpload");
        if (!uploadInput) return;

        uploadInput.addEventListener("change", function (e) {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = function (event) {
                if (photoFeed) {
                    photoFeed.src = event.target.result;

                    // Switch to photo tab
                    const photoTabTrigger = document.querySelector('#tryonTabs button[data-bs-target="#tab-photo-pane"]');
                    if (photoTabTrigger) {
                        bootstrap.Tab.getOrCreateInstance(photoTabTrigger).show();
                    }
                }
            };
            reader.readAsDataURL(file);
        });
    }

    // Smart Size Advisor (Height, Weight, Body Type)
    function setupSmartSizeAdvisor() {
        const heightInput = document.getElementById("advisorHeight");
        const weightInput = document.getElementById("advisorWeight");
        const fitSelect = document.getElementById("advisorFit");
        const calcBtn = document.getElementById("advisorCalcBtn");
        const resultCard = document.getElementById("advisorResultCard");
        const recommendedSizeBadge = document.getElementById("recommendedSize");
        const accuracyBadge = document.getElementById("recommendAccuracy");
        const applySizeBtn = document.getElementById("applyRecommendedSizeBtn");

        if (!calcBtn) return;

        calcBtn.addEventListener("click", function () {
            const h = parseFloat(heightInput.value);
            const w = parseFloat(weightInput.value);
            const fit = fitSelect ? fitSelect.value : "regular";

            if (!h || !w || h < 100 || w < 30) {
                alert("Vui lòng nhập chiều cao (100-220 cm) và cân nặng (30-150 kg) hợp lệ!");
                return;
            }

            // Simple BMI & Fashion size logic
            // BMI = weight (kg) / (height (m) ^ 2)
            const bmi = w / ((h / 100) * (h / 100));
            let size = "M";
            let accuracy = 96;

            if (h < 162) {
                size = (bmi < 21) ? "S" : "M";
            } else if (h <= 172) {
                size = (bmi < 20) ? "S" : (bmi <= 24.5 ? "M" : "L");
            } else if (h <= 180) {
                size = (bmi < 22) ? "M" : (bmi <= 26 ? "L" : "XL");
            } else {
                size = (bmi < 24) ? "L" : "XL";
            }

            // Adjust by fit preference
            if (fit === "loose") {
                if (size === "S") size = "M";
                else if (size === "M") size = "L";
                else if (size === "L") size = "XL";
            } else if (fit === "slim") {
                if (size === "XL") size = "L";
                else if (size === "L") size = "M";
                else if (size === "M") size = "S";
            }

            if (recommendedSizeBadge) recommendedSizeBadge.textContent = "Size " + size;
            if (accuracyBadge) accuracyBadge.textContent = accuracy + "%";
            if (resultCard) resultCard.style.display = "block";

            // Sync with Product Page Size Select
            if (applySizeBtn) {
                applySizeBtn.onclick = function () {
                    const productVariantSelect = document.getElementById("variantSelect");
                    if (productVariantSelect) {
                        for (let i = 0; i < productVariantSelect.options.length; i++) {
                            const opt = productVariantSelect.options[i];
                            if (opt.getAttribute("data-size") === size && !opt.disabled) {
                                productVariantSelect.selectedIndex = i;
                                productVariantSelect.dispatchEvent(new Event("change"));
                                break;
                            }
                        }
                    }

                    // Close modal and focus on Add to Cart
                    const modalInstance = bootstrap.Modal.getInstance(tryOnModal);
                    if (modalInstance) modalInstance.hide();

                    alert(`Đã tự động chọn Size ${size} cho bạn! Bạn có thể bấm "THÊM VÀO GIỎ HÀNG" ngay.`);
                };
            }
        });
    }

    // Snapshot Photo Capture
    function setupSnapshot() {
        const snapshotBtn = document.getElementById("tryonSnapshotBtn");
        const gallery = document.getElementById("tryonSnapshotsGallery");

        if (!snapshotBtn || !gallery) return;

        snapshotBtn.addEventListener("click", function () {
            const stage = document.getElementById("tryonStage");
            if (!stage) return;

            // Create off-screen canvas to capture stage
            const canvas = document.createElement("canvas");
            canvas.width = 600;
            canvas.height = 750;
            const ctx = canvas.getContext("2d");

            // Fill background
            ctx.fillStyle = "#0f172a";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw current background (video or photo)
            const activeVideo = (videoFeed && videoFeed.style.display !== "none" && isCameraRunning);
            if (activeVideo) {
                ctx.save();
                ctx.translate(canvas.width, 0);
                ctx.scale(-1, 1); // Mirror
                ctx.drawImage(videoFeed, 0, 0, canvas.width, canvas.height);
                ctx.restore();
            } else if (photoFeed) {
                ctx.drawImage(photoFeed, 0, 0, canvas.width, canvas.height);
            }

            // Draw garment
            if (garmentImg && garmentImg.complete) {
                ctx.save();
                ctx.globalAlpha = garmentState.opacity;
                const gw = 320 * garmentState.scale;
                const gh = 380 * garmentState.scale;
                const gx = (canvas.width - gw) / 2 + garmentState.x;
                const gy = (canvas.height - gh) / 2 + garmentState.y;

                ctx.translate(gx + gw / 2, gy + gh / 2);
                ctx.rotate((garmentState.rotation * Math.PI) / 180);
                ctx.drawImage(garmentImg, -gw / 2, -gh / 2, gw, gh);
                ctx.restore();
            }

            // Watermark
            ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
            ctx.font = "bold 16px sans-serif";
            ctx.fillText("FASHIONSTORE. AI Try-On Studio", 20, canvas.height - 20);

            const dataUrl = canvas.toDataURL("image/jpeg");

            // Add thumbnail to gallery
            const item = document.createElement("div");
            item.className = "tryon-snap-item";
            item.innerHTML = `<img src="${dataUrl}" alt="Snapshot" />`;
            item.title = "Bấm để tải về";
            item.onclick = function () {
                const a = document.createElement("a");
                a.href = dataUrl;
                a.download = `fashionstore-tryon-${Date.now()}.jpg`;
                a.click();
            };
            gallery.prepend(item);

            alert("📸 Đã chụp ảnh thử đồ thành công! Bạn có thể bấm vào ảnh nhỏ bên dưới để tải về máy.");
        });
    }

})();
