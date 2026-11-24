(() => {
    const form = document.getElementById("styleGameForm");
    const canvas = document.getElementById("styleAvatar");
    const output = document.getElementById("styleResult");
    const cart = document.getElementById("styleCartLink");
    const scoreButton = document.getElementById("btnSubmitScore") || form.querySelector('button[type="submit"]');
    const ctx = canvas.getContext("2d");
    
    // Virtual drawing layer for user ink
    const layer = document.createElement("canvas");
    layer.width = layer.height = 600;
    const ink = layer.getContext("2d");

    const colors = [...form.querySelectorAll('[name="inkColor"]')].map(input => input.dataset.color);
    const drafts = [[], [], []];
    const images = [...form.querySelectorAll('[name="product"]')].map(input => {
        const img = new Image();
        img.addEventListener("load", render);
        img.src = input.dataset.image;
        return img;
    });

    const productNames = ["Áo thun", "Quần jeans", "Giày sneaker"];
    const selected = name => form.querySelector(`[name="${name}"]:checked`)?.value;
    const product = () => Number(selected("product") || 0);
    const marks = () => drafts[product()];
    let active;
    let cursor = { x: .5, y: .5 };

    function paint(mark) {
        ink.globalCompositeOperation = mark.tool === "eraser" ? "destination-out" : "source-over";
        ink.strokeStyle = ink.fillStyle = colors[mark.color];
        const first = mark.points[0];
        if (mark.tool === "sticker") {
            const selectEl = document.getElementById("studioSticker");
            const rawVal = selectEl.options[mark.sticker]?.value || "★";
            const symbol = rawVal.charAt(0);
            
            ink.font = `bold ${mark.size * 2 + 14}px system-ui, sans-serif`;
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
        const image = images[product()];
        ctx.clearRect(0, 0, 600, 600);
        if (!image.naturalWidth) return;
        const scale = 540 / Math.max(image.naturalWidth, image.naturalHeight);
        const w = image.naturalWidth * scale;
        const h = image.naturalHeight * scale;
        const x = (600 - w) / 2;
        const y = (600 - h) / 2;

        // Draw product base
        ctx.drawImage(image, x, y, w, h);

        // Draw user drawing on layer
        ink.globalCompositeOperation = "source-over";
        ink.clearRect(0, 0, 600, 600);
        for (const mark of marks()) paint(mark);

        // Mask artwork inside product shape
        ink.globalCompositeOperation = "destination-in";
        ink.drawImage(image, x, y, w, h);

        // Blit artwork onto main canvas
        ctx.drawImage(layer, 0, 0);

        // Cursor indicator
        if (document.activeElement === canvas && !active) {
            ctx.strokeStyle = "#0f172a";
            ctx.lineWidth = 1.5;
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
    document.getElementById("studioUndo")?.addEventListener("click", () => { marks().pop(); render(); });
    document.getElementById("studioClear")?.addEventListener("click", () => { marks().length = 0; render(); });

    // DOWNLOAD IMAGE FEATURE
    const btnDownload = document.getElementById("btnDownloadMockup");
    if (btnDownload) {
        btnDownload.addEventListener("click", () => {
            const exportCanvas = document.createElement("canvas");
            exportCanvas.width = 800;
            exportCanvas.height = 800;
            const eCtx = exportCanvas.getContext("2d");

            // Clean white background
            eCtx.fillStyle = "#ffffff";
            eCtx.fillRect(0, 0, 800, 800);

            // Draw product from canvas
            eCtx.drawImage(canvas, 50, 50, 700, 700);

            // Subtle brand footer
            eCtx.fillStyle = "#0f172a";
            eCtx.font = "bold 16px system-ui, sans-serif";
            eCtx.fillText("HNMTSHOP · STUDIO THIẾT KẾ", 50, 765);

            const a = document.createElement("a");
            const prodName = productNames[product()] || "Design";
            a.download = `HNMTSHOP-${prodName}-${Date.now()}.png`;
            a.href = exportCanvas.toDataURL("image/png");
            a.click();
        });
    }

    // FORM SUBMISSION & SCORING
    form.addEventListener("submit", async event => {
        event.preventDefault();
        const body = new FormData(form);
        body.set("drawing", JSON.stringify({ product: product(), marks: marks() }));
        scoreButton.disabled = true;
        output.hidden = false;
        output.textContent = "Đang thẩm định và chấm điểm…";
        if (cart) cart.hidden = true;

        try {
            const response = await fetch(form.action, { method: "POST", body });
            if (!response.ok) {
                output.textContent = response.status === 400 ? await response.text() : "Chưa chấm được điểm. Vui lòng thử lại.";
                return;
            }
            const data = await response.json();
            const scoreEl = document.createElement("strong");
            scoreEl.style.fontSize = "1.05rem";
            scoreEl.textContent = `Kết quả: ${data.score}/100 điểm`;

            const breakdown = document.createElement("p");
            breakdown.textContent = `Độ phủ nét: ${data.coverage}/45 · Màu sắc: ${data.palette}/25 · Điểm nhấn: ${data.detail}/30`;

            const reward = document.createElement("p");
            if (data.code) {
                reward.innerHTML = `<strong>Chúc mừng!</strong> Bạn nhận được mã giảm giá: <code style="background:#f1f5f9; padding:2px 8px; border-radius:4px; font-weight:700; font-size:1rem; color:#0f172a;">${data.code}</code> (Giảm ${data.percent}%).`;
            } else if (!data.canClaim) {
                reward.textContent = "Đăng nhập tài khoản khách hàng để nhận mã giảm giá.";
            } else if (data.score < 60) {
                reward.textContent = "Hãy thử vẽ thêm nét màu và dán sticker để đạt từ 60 điểm trở lên nhé!";
            } else {
                reward.textContent = "Chưa có mã giảm giá còn hiệu lực phù hợp với điểm của bạn.";
            }

            output.replaceChildren(scoreEl, breakdown, reward);
            if (cart) cart.hidden = !data.code;
        } catch {
            output.textContent = "Không kết nối được máy chủ. Vui lòng thử lại.";
        } finally {
            scoreButton.disabled = false;
        }
    });

    render();
})();
