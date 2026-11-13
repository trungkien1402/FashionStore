(() => {
    const form = document.getElementById("styleGameForm");
    const canvas = document.getElementById("styleAvatar");
    const output = document.getElementById("styleResult");
    const cart = document.getElementById("styleCartLink");
    const scoreButton = form.querySelector('button[type="submit"]');
    const ctx = canvas.getContext("2d");
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
    const selected = name => form.querySelector(`[name="${name}"]:checked`).value;
    const product = () => Number(selected("product"));
    const marks = () => drafts[product()];
    let active;
    let cursor = { x: .5, y: .5 };

    function paint(mark) {
        ink.globalCompositeOperation = mark.tool === "eraser" ? "destination-out" : "source-over";
        ink.strokeStyle = ink.fillStyle = colors[mark.color];
        const first = mark.points[0];
        if (mark.tool === "sticker") {
            const options = document.getElementById("studioSticker").options;
            ink.font = `bold ${mark.size * 2 + 12}px system-ui`;
            ink.textAlign = "center";
            ink.textBaseline = "middle";
            ink.fillText(options[mark.sticker].text, first.x * 600, first.y * 600);
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
        ctx.drawImage(image, x, y, w, h);
        ink.globalCompositeOperation = "source-over";
        ink.clearRect(0, 0, 600, 600);
        for (const mark of marks()) paint(mark);
        ink.globalCompositeOperation = "destination-in";
        ink.drawImage(image, x, y, w, h);
        ctx.drawImage(layer, 0, 0);
        if (document.activeElement === canvas && !active) {
            ctx.strokeStyle = "#7048a0";
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
    document.getElementById("studioUndo").addEventListener("click", () => { marks().pop(); render(); });
    document.getElementById("studioClear").addEventListener("click", () => { marks().length = 0; render(); });
    form.addEventListener("submit", async event => {
        event.preventDefault();
        const body = new FormData(form);
        body.set("drawing", JSON.stringify({ product: product(), marks: marks() }));
        scoreButton.disabled = true;
        output.hidden = false;
        output.textContent = "Đang chấm điểm…";
        cart.hidden = true;
        try {
            const response = await fetch(form.action, { method: "POST", body });
            if (!response.ok) {
                output.textContent = response.status === 400 ? await response.text() : "Chưa chấm được điểm. Vui lòng thử lại.";
                return;
            }
            const data = await response.json();
            const score = document.createElement("strong");
            score.textContent = `${data.score}/100 điểm`;
            const breakdown = document.createElement("p");
            breakdown.textContent = `Độ phủ ${data.coverage}/45 · Màu sắc ${data.palette}/25 · Chi tiết ${data.detail}/30`;
            const reward = document.createElement("p");
            reward.textContent = data.code ? `Mã ${data.code} · Giảm ${data.percent}%. Mã đã được lưu vào phiên mua hàng.`
                : !data.canClaim ? "Đăng nhập tài khoản khách hàng để nhận mã."
                : data.score < 60 ? "Thử thêm nét màu và sticker trên sản phẩm để đạt 60 điểm."
                : "Chưa có mã còn hiệu lực phù hợp với điểm của bạn.";
            output.replaceChildren(score, breakdown, reward);
            cart.hidden = !data.code;
        } catch {
            output.textContent = "Không kết nối được. Vui lòng thử lại.";
        } finally {
            scoreButton.disabled = false;
        }
    });
    render();
})();
