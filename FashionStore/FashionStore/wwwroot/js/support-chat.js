document.querySelectorAll("[data-support-chat]").forEach(root => {
    const toggle = root.querySelector("[data-chat-toggle]");
    const panel = root.querySelector(".support-panel");
    const queue = root.querySelector("[data-chat-queue]");
    const stream = root.querySelector("[data-chat-stream]");
    const messages = root.querySelector("[data-chat-messages]");
    const older = root.querySelector("[data-chat-older]");
    const status = root.querySelector("[data-chat-status]");
    const close = root.querySelector("[data-chat-close-thread]");
    const form = root.querySelector(".support-compose");
    const input = form?.elements.message;
    let threadId;
    let rows = [];
    let busy = false;
    let refreshing = false;

    function show(open) {
        if (!panel) return;
        panel.hidden = !open;
        toggle.setAttribute("aria-expanded", String(open));
        if (open) {
            (input ?? panel.querySelector("[data-chat-hide]")).focus();
            if (form) refresh();
        } else toggle.focus();
    }

    toggle?.addEventListener("click", () => show(panel.hidden));
    root.querySelector("[data-chat-hide]")?.addEventListener("click", () => show(false));
    root.addEventListener("keydown", event => {
        if (event.key === "Escape" && panel && !panel.hidden) show(false);
    });
    root.querySelectorAll("[data-chat-topic]").forEach(button => {
        button.addEventListener("click", () => {
            if (!input) return;
            input.value = button.dataset.chatTopic;
            input.focus();
        });
    });
    if (!form) return;

    const time = new Intl.DateTimeFormat("vi-VN", {
        dateStyle: "short", timeStyle: "short", timeZone: "Asia/Ho_Chi_Minh"
    });

    async function request(url, body) {
        const response = await fetch(url, { method: body ? "POST" : "GET", body, cache: "no-store" });
        if (response.redirected || response.status === 401 || response.status === 403)
            throw new Error("Phiên đăng nhập đã hết hạn hoặc bạn không có quyền.");
        if (!response.ok)
            throw new Error([400, 409, 429, 503].includes(response.status)
                ? await response.text() : "Không kết nối được hộp thư. Vui lòng thử lại.");
        return response;
    }

    function render(data, prepend = false) {
        const nearBottom = stream.scrollHeight - stream.scrollTop - stream.clientHeight < 80;
        const initialHeight = stream.scrollHeight;
        const merged = new Map(rows.map(row => [row.id, row]));
        data.messages.forEach(message => merged.set(message.id, message));
        const next = [...merged.values()].sort((a, b) => a.id - b.id);
        const changed = next.length !== rows.length || next[0]?.id !== rows[0]?.id;
        if (changed || !messages.hasChildNodes()) {
            rows = next;
            messages.replaceChildren(...rows.map(message => {
                const row = document.createElement("article");
                row.className = "support-message";
                row.classList.toggle("is-own", message.fromStaff === Boolean(queue));
                const caption = document.createElement("small");
                caption.textContent = (message.fromStaff ? "Cửa hàng" : "Khách hàng") + " · " + time.format(new Date(message.createdAt));
                const text = document.createElement("p");
                text.textContent = message.text;
                row.append(caption, text);
                return row;
            }));
            if (prepend) stream.scrollTop += stream.scrollHeight - initialHeight;
            else if (nearBottom) stream.scrollTop = stream.scrollHeight;
        }
        if (prepend || next.length === data.messages.length) older.hidden = !data.hasOlder;
        if (close) {
            close.hidden = data.isClosed;
            form.hidden = data.isClosed;
        }
        status.textContent = data.isClosed
            ? (queue ? "Cuộc trò chuyện đã đóng." : "Cửa hàng đã đóng cuộc trò chuyện. Gửi tin mới để mở lại.")
            : rows.length ? "" : "Chưa có tin nhắn. Gửi lời nhắn để bắt đầu.";
    }

    async function loadThread(before = 0) {
        if (queue && !threadId) return;
        const selected = threadId;
        const url = new URL(root.dataset.thread, location.href);
        if (selected) url.searchParams.set("id", selected);
        if (before) url.searchParams.set("before", before);
        const response = await request(url);
        const data = await response.json();
        if (selected === threadId) render(data, Boolean(before));
    }

    let queueSnapshot;
    async function loadQueue() {
        const response = await request(root.dataset.queue);
        const items = await response.json();
        const snapshot = JSON.stringify([threadId, items]);
        if (snapshot === queueSnapshot) return;
        queueSnapshot = snapshot;
        queue.replaceChildren(...items.map(item => {
            const button = document.createElement("button");
            button.type = "button";
            button.dataset.id = item.id;
            button.setAttribute("aria-pressed", String(item.id === threadId));
            const name = document.createElement("strong");
            name.textContent = item.name || "Khách #" + item.id;
            const label = document.createElement("small");
            label.textContent = item.isClosed ? "Đã đóng" : item.needsReply ? "Chờ trả lời" : "Đã phản hồi";
            label.classList.toggle("needs-reply", item.needsReply);
            button.append(name, label);
            button.addEventListener("click", () => {
                if (busy || threadId === item.id) return;
                threadId = item.id;
                for (const entry of queue.querySelectorAll("button")) {
                    entry.setAttribute("aria-pressed", String(Number(entry.dataset.id) === threadId));
                }
                rows = [];
                input.value = "";
                form.hidden = true;
                close.hidden = true;
                messages.replaceChildren();
                older.hidden = true;
                status.textContent = "Đang tải tin nhắn…";
                root.querySelector("[data-chat-title]").textContent = name.textContent;
                loadThread().catch(error => { status.textContent = error.message; });
            });
            return button;
        }));
        if (!items.length) queue.textContent = "Chưa có cuộc trò chuyện.";
    }

    async function refresh() {
        if (refreshing || busy || document.hidden || panel?.hidden) return;
        refreshing = true;
        try {
            if (queue) await loadQueue();
            await loadThread();
        } catch (error) {
            status.textContent = error.message;
        } finally { refreshing = false; }
    }

    older.addEventListener("click", async () => {
        if (!rows.length || busy || refreshing) return;
        busy = true;
        try { await loadThread(rows[0].id); }
        catch (error) { status.textContent = error.message; }
        finally { busy = false; }
    });

    async function send(url, closing = false) {
        if (busy || queue && !threadId) return;
        if (!closing && (!input.value.trim() || !form.reportValidity())) {
            input.focus();
            return;
        }
        const body = new FormData(form);
        if (threadId) body.set("id", threadId);
        if (closing) body.delete("message");
        const submit = form.querySelector("button");
        busy = true;
        input.readOnly = true;
        submit.disabled = true;
        if (close) close.disabled = true;
        try {
            await request(url, body);
            if (!closing) input.value = "";
            await loadThread();
            if (queue) await loadQueue();
        } catch (error) { status.textContent = error.message; }
        finally {
            busy = false;
            input.readOnly = false;
            submit.disabled = false;
            if (close) close.disabled = false;
        }
    }

    form.addEventListener("submit", event => {
        event.preventDefault();
        send(form.action);
    });
    close?.addEventListener("click", () => send(root.dataset.close, true));
    document.addEventListener("visibilitychange", refresh);
    window.setInterval(refresh, 3000);
    refresh();
});
