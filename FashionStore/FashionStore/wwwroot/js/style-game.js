(() => {
    const form = document.getElementById("styleGameForm");
    const canvas = document.getElementById("styleAvatar");
    const output = document.getElementById("styleResult");
    const scoreButton = document.getElementById("btnSubmitScore") || form.querySelector('button[type="submit"]');
    const ctx = canvas.getContext("2d");
    
    // Virtual drawing layer for user inks
    const layer = document.createElement("canvas");
    layer.width = layer.height = 600;
    const ink = layer.getContext("2d");

    // Virtual fabric tint canvas
    const tintCanvas = document.createElement("canvas");
    tintCanvas.width = tintCanvas.height = 600;
    const tintCtx = tintCanvas.getContext("2d");

    const colors = [...form.querySelectorAll('[name="inkColor"]')].map(input => input.dataset.color);
    const drafts = [[], [], []];
    const images = [...form.querySelectorAll('[name="product"]')].map(input => {
        const img = new Image();
        img.addEventListener("load", render);
        img.src = input.dataset.image;
        return img;
    });

    const specLabels = [
        "Áo thun Heavyweight Boxy 300GSM",
        "Quần jeans Relaxed Fit 13.5oz",
        "Giày sneaker Low-Top Leather"
    ];

    const selected = name => form.querySelector(`[name="${name}"]:checked`)?.value;
    const product = () => Number(selected("product") || 0);
    const fabricColor = () => selected("fabricColor") || "#ffffff";
    const marks = () => drafts[product()];
    let active;
    let cursor = { x: .5, y: .5 };

    function updateSpecLabel() {
        const lbl = document.getElementById("lblProductSpec");
        if (lbl) {
            lbl.textContent = specLabels[product()] || "Sản phẩm Atelier";
        }
    }

    function updateBrushPreview() {
        const sizeInput = document.getElementById("studioSize");
        const brushDot = document.getElementById("brushPreviewDot");
        if (!brushDot || !sizeInput) return;
        const val = Number(sizeInput.value);
        brushDot.style.width = Math.max(6, Math.min(26, val)) + "px";
        brushDot.style.height = Math.max(6, Math.min(26, val)) + "px";
        const colorIdx = Number(selected("inkColor") || 0);
        brushDot.style.background = colors[colorIdx] || "#0f172a";
    }

    function paint(mark) {
        ink.globalCompositeOperation = mark.tool === "eraser" ? "destination-out" : "source-over";
        ink.strokeStyle = ink.fillStyle = colors[mark.color];
        const first = mark.points[0];
        if (mark.tool === "sticker") {
            const selectEl = document.getElementById("studioSticker");
            const rawVal = selectEl.options[mark.sticker]?.value || "★";
            const symbol = rawVal.charAt(0);
            
            ink.font = `bold ${mark.size * 2 + 14}px 'Jost', system-ui, sans-serif`;
            ink.textAlign = "center";
            ink.textBaseline = "middle";
            ink.fillText(symbol, first.x * 600, first.y * 600);
            return;
        }
        ink.lineWidth = mark.size;
        ink.lineCap = ink.lineJoin = "round";
        ink.beginPath();
        if (mark.points.length === 1) {
            ink.arc(first.x * 600, first.y * 600, mark.size / 2, 0, Math.PI * 2);
            ink.fill();
        } else {
            ink.moveTo(first.x * 600, first.y * 600);
            for (const point of mark.points.slice(1)) ink.lineTo(point.x * 600, point.y * 600);
            ink.stroke();
        }
    }

    function render() {
        updateSpecLabel();
        updateBrushPreview();
        const image = images[product()];
        ctx.clearRect(0, 0, 600, 600);
        if (!image.naturalWidth) return;
        const scale = 540 / Math.max(image.naturalWidth, image.naturalHeight);
        const w = image.naturalWidth * scale;
        const h = image.naturalHeight * scale;
        const x = (600 - w) / 2;
        const y = (600 - h) / 2;

        // 1. Draw base product with optional fabric tint
        const currentTint = fabricColor();
        if (currentTint && currentTint !== '#ffffff') {
            tintCtx.clearRect(0, 0, 600, 600);
            tintCtx.drawImage(image, x, y, w, h);
            tintCtx.globalCompositeOperation = "source-in";
            tintCtx.fillStyle = currentTint;
            tintCtx.fillRect(0, 0, 600, 600);
            tintCtx.globalCompositeOperation = "source-over";

            // Draw tinted silhouette
            ctx.drawImage(tintCanvas, 0, 0);

            // Multiply original shadows & folds over tint
            ctx.globalCompositeOperation = "multiply";
            ctx.drawImage(image, x, y, w, h);
            ctx.globalCompositeOperation = "source-over";
        } else {
            ctx.drawImage(image, x, y, w, h);
        }

        // 2. Draw user artwork
        ink.globalCompositeOperation = "source-over";
        ink.clearRect(0, 0, 600, 600);
        for (const mark of marks()) paint(mark);

        // Mask artwork inside the product boundary
        ink.globalCompositeOperation = "destination-in";
        ink.drawImage(image, x, y, w, h);

        // Render artwork onto stage
        ctx.drawImage(layer, 0, 0);

        // 3. Draw cursor box if focused
        if (document.activeElement === canvas && !active) {
            ctx.strokeStyle = "#d4af37";
            ctx.lineWidth = 2;
            ctx.strokeRect(cursor.x * 600 - 5, cursor.y * 600 - 5, 10, 10);
        }
    }

    function start(point) {
        if (marks().length >= 100 || !images[product()].naturalWidth) return null;
        const mark = {
            tool: selected("tool"),
            color: Number(selected("inkColor")),
            sticker: document.getElementById("studioSticker").selectedIndex,
            size: Number(document.getElementById("studioSize").value),
            points: [point]
        };
        marks().push(mark);
        return mark;
    }

    const clamp = number => Math.max(0, Math.min(1, number));
    function position(event) {
        const rect = canvas.getBoundingClientRect();
        return { x: clamp((event.clientX - rect.left) / rect.width), y: clamp((event.clientY - rect.top) / rect.height) };
    }

    canvas.addEventListener("pointerdown", event => {
        if (event.button !== 0 || active) return;
        cursor = position(event);
        const mark = start(cursor);
        if (mark && mark.tool !== "sticker") {
            active = { id: event.pointerId, mark };
            canvas.setPointerCapture(event.pointerId);
        }
        render();
    });

    canvas.addEventListener("pointermove", event => {
        if (!active || active.id !== event.pointerId || active.mark.points.length >= 400) return;
        cursor = position(event);
        active.mark.points.push(cursor);
        render();
    });

    canvas.addEventListener("lostpointercapture", () => { active = null; render(); });
    canvas.addEventListener("blur", render);
    canvas.addEventListener("focus", render);
    canvas.addEventListener("keydown", event => {
        const movement = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[event.key];
        if (movement) {
            cursor = { x: clamp(cursor.x + movement[0] / 40), y: clamp(cursor.y + movement[1] / 40) };
        } else if (event.key === "Enter" || event.key === " ") {
            start(cursor);
        } else return;
        event.preventDefault();
        render();
    });

    form.addEventListener("change", render);
    document.getElementById("studioSize")?.addEventListener("input", updateBrushPreview);
    document.getElementById("studioUndo").addEventListener("click", () => { marks().pop(); render(); });
    document.getElementById("studioClear").addEventListener("click", () => { marks().length = 0; render(); });

    // HIGH-RES MOCKUP DOWNLOAD
    const btnDownload = document.getElementById("btnDownloadMockup");
    if (btnDownload) {
        btnDownload.addEventListener("click", () => {
            const exportCanvas = document.createElement("canvas");
            exportCanvas.width = 1200;
            exportCanvas.height = 1200;
            const eCtx = exportCanvas.getContext("2d");

            // Luxury Studio ivory background
            eCtx.fillStyle = "#FAF8F5";
            eCtx.fillRect(0, 0, 1200, 1200);

            // Subtle measuring grid
            eCtx.strokeStyle = "rgba(226, 232, 240, 0.7)";
            eCtx.lineWidth = 1;
            for (let i = 0; i < 1200; i += 40) {
                eCtx.beginPath();
                eCtx.moveTo(i, 0); eCtx.lineTo(i, 1200);
                eCtx.stroke();
                eCtx.beginPath();
                eCtx.moveTo(0, i); eCtx.lineTo(1200, i);
                eCtx.stroke();
            }

            // Top header branding
            eCtx.fillStyle = "#0F172A";
            eCtx.font = "bold 32px 'Jost', system-ui, sans-serif";
            eCtx.fillText("HNMT ATELIER · CUSTOM DESIGN TECHPACK", 60, 80);

            eCtx.fillStyle = "#64748B";
            eCtx.font = "600 18px monospace";
            const dateStr = new Date().toLocaleDateString("vi-VN");
            eCtx.fillText(`SPEC #HNMT-${Math.floor(1000 + Math.random() * 9000)} · ${specLabels[product()]} · ${dateStr}`, 60, 116);

            // Draw product from canvas at 2x scale
            eCtx.drawImage(canvas, 100, 160, 1000, 1000);

            // Footer branding
            eCtx.fillStyle = "#B8860B";
            eCtx.font = "bold 18px 'Jost', sans-serif";
            eCtx.fillText("OFFICIAL HNMT ATELIER BOUTIQUE · HNMTSHOP.VN", 60, 1150);

            // Trigger download
            const a = document.createElement("a");
            const prodName = product() === 0 ? "Tee" : product() === 1 ? "Jeans" : "Sneaker";
            a.download = `HNMT-Atelier-${prodName}-Custom-${Date.now()}.png`;
            a.href = exportCanvas.toDataURL("image/png");
            a.click();
        });
    }

    // FORM SUBMIT & AI SCORING
    form.addEventListener("submit", async event => {
        event.preventDefault();
        const body = new FormData(form);
        body.set("drawing", JSON.stringify({ product: product(), marks: marks() }));
        scoreButton.disabled = true;
        output.hidden = false;
        output.innerHTML = '<div class="p-3 text-center text-muted"><i class="bi bi-arrow-repeat spinner-border spinner-border-sm me-2"></i>Đang thẩm định &amp; chấm điểm bản vẽ...</div>';

        try {
            const response = await fetch(form.action, { method: "POST", body });
            if (!response.ok) {
                const errText = response.status === 400 ? await response.text() : "Chưa chấm được điểm. Vui lòng thử lại.";
                output.innerHTML = `<div class="p-3 text-danger"><i class="bi bi-exclamation-triangle me-1"></i>${errText}</div>`;
                return;
            }
            const data = await response.json();
            output.innerHTML = `
                <div class="result-score-banner">
                    <div>
                        <div class="text-muted small fw-bold text-uppercase">Điểm thẩm định Atelier</div>
                        <div class="score-number">${data.score}<span style="font-size: 1rem; color: #64748b; font-weight: normal;"> / 100</span></div>
                    </div>
                    <span class="score-badge ${data.score >= 80 ? 'bg-success text-white' : data.score >= 60 ? 'bg-primary text-white' : 'bg-warning text-dark'}">
                        ${data.score >= 80 ? 'Xuất sắc' : data.score >= 60 ? 'Đạt chuẩn Atelier' : 'Cần sáng tạo thêm'}
                    </span>
                </div>
                <div class="d-flex justify-content-between small text-muted mb-2 px-1">
                    <span>Độ phủ nét: <strong>${data.coverage}/45</strong></span>
                    <span>Phối màu: <strong>${data.palette}/25</strong></span>
                    <span>Điểm nhấn: <strong>${data.detail}/30</strong></span>
                </div>
                ${data.code ? `
                    <div class="reward-voucher-box">
                        <div class="small fw-bold text-warning text-uppercase"><i class="bi bi-gift-fill me-1"></i> Mở khóa mã giảm giá độc quyền</div>
                        <div class="voucher-code-pill" id="voucherCodePill" title="Bấm để sao chép" onclick="navigator.clipboard.writeText('${data.code}'); alert('Đã sao chép mã: ${data.code}');">
                            ${data.code} <i class="bi bi-copy" style="font-size: 0.85rem;"></i>
                        </div>
                        <div class="small text-light opacity-75">Ưu đãi giảm <strong>${data.percent}%</strong> cho đơn hàng tiếp theo.</div>
                        <a href="/Products" class="btn-apply-voucher">
                            <i class="bi bi-bag-check me-1"></i> Khám phá sản phẩm ngay
                        </a>
                    </div>
                ` : `
                    <div class="p-2 rounded-2 mt-2 text-center small ${data.score >= 60 ? 'text-primary' : 'text-muted'}" style="background: #ffffff; border: 1px solid #e2e8f0;">
                        ${!data.canClaim ? 'Đăng nhập tài khoản khách hàng để nhận mã giảm giá.'
                         : data.score < 60 ? 'Hãy vẽ thêm nét phối màu và đặt tem decal để đạt trên 60 điểm nhé!'
                         : 'Chưa có voucher còn hiệu lực cho mức điểm này.'}
                    </div>
                `}
            `;
        } catch {
            output.innerHTML = '<div class="p-3 text-danger"><i class="bi bi-wifi-off me-1"></i> Không kết nối được máy chủ. Vui lòng thử lại.</div>';
        } finally {
            scoreButton.disabled = false;
        }
    });

    render();
})();
