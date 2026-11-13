/**
 * HNMTSHOP — INLINE AUTHENTICATION MODAL CONTROLLER
 * Seamless pop-up without navigation, elevated luxury fields, live validation
 */

(function () {
    "use strict";

    const AuthModal = {
        backdrop: null,
        card: null,
        alertBox: null,
        alertText: null,

        init() {
            this.backdrop = document.getElementById("hnmtAuthBackdrop");
            this.card = document.getElementById("hnmtAuthCard");
            this.alertBox = document.getElementById("hnmtAuthAlert");
            this.alertText = document.getElementById("hnmtAuthAlertText");

            if (!this.backdrop) return;

            // Close on click outside
            this.backdrop.addEventListener("click", (e) => {
                if (e.target === this.backdrop) {
                    this.close();
                }
            });

            // Close button
            const closeBtn = document.getElementById("hnmtAuthCloseBtn");
            if (closeBtn) {
                closeBtn.addEventListener("click", () => this.close());
            }

            // Keyboard Escape
            document.addEventListener("keydown", (e) => {
                if (e.key === "Escape" && this.backdrop.classList.contains("is-open")) {
                    this.close();
                }
            });

            // Instant 1-click focus for all input wraps
            document.addEventListener("click", (e) => {
                const wrap = e.target.closest(".hnmt-pure-input-wrap, .hnmt-input-pill, .hnmt-elevated-field");
                if (wrap && !e.target.closest(".hnmt-pure-eye-btn, .hnmt-eye-toggle-btn, .hnmt-field-eye-btn")) {
                    const input = wrap.querySelector(".hnmt-pure-input, .hnmt-input-control, .hnmt-field-input");
                    if (input && document.activeElement !== input) {
                        input.focus();
                    }
                }
            });

            // Intercept all unauthenticated login/register triggers across the whole site
            this.bindGlobalTriggers();
        },

        bindGlobalTriggers() {
            document.addEventListener("click", (e) => {
                // Check if user clicked an account button or login link
                const target = e.target.closest('a[href*="/Account/Login"], a[href*="/Account/Register"], .hnmt-auth-trigger');
                
                // If user is already authenticated (indicated by popover existence or role), don't intercept
                if (target) {
                    const isAuthDropdown = target.closest(".fs-account-dropdown-container");
                    const hasMenu = isAuthDropdown && isAuthDropdown.querySelector(".fs-account-popover");
                    if (hasMenu) {
                        return; // Let dropdown menu toggle normally
                    }

                    e.preventDefault();
                    e.stopPropagation();

                    const href = target.getAttribute("href") || "";
                    if (href.toLowerCase().includes("register") || target.dataset.authTab === "register") {
                        this.open("register");
                    } else {
                        this.open("login");
                    }
                }
            }, true);
        },

        open(tab = "login") {
            if (!this.backdrop) {
                this.init();
            }
            if (!this.backdrop) return;

            // Populate ReturnUrl
            const returnUrlInput = document.getElementById("loginReturnUrl");
            if (returnUrlInput) {
                returnUrlInput.value = window.location.pathname + window.location.search;
            }

            this.hideAlert();
            this.backdrop.style.display = "flex";
            // Trigger reflow for transition
            void this.backdrop.offsetWidth;
            this.backdrop.classList.add("is-open");
            document.body.style.overflow = "hidden";

            this.switchTab(tab);

            // Focus on first input
            setTimeout(() => {
                const activeView = document.querySelector(".hnmt-auth-view.is-active");
                const firstInput = activeView?.querySelector("input:not([type='hidden'])");
                if (firstInput) firstInput.focus();
            }, 100);
        },

        close() {
            if (!this.backdrop) return;
            this.backdrop.classList.remove("is-open");
            document.body.style.overflow = "";

            setTimeout(() => {
                if (!this.backdrop.classList.contains("is-open")) {
                    this.backdrop.style.display = "none";
                    this.hideAlert();
                }
            }, 250);
        },

        switchTab(tab) {
            this.hideAlert();
            const tabsWrap = document.getElementById("hnmtAuthTabsWrap");
            const tabLogin = document.getElementById("tabBtnLogin");
            const tabRegister = document.getElementById("tabBtnRegister");

            const viewLogin = document.getElementById("authViewLogin");
            const viewRegister = document.getElementById("authViewRegister");
            const viewForgot = document.getElementById("authViewForgot");

            const title = document.getElementById("hnmtAuthTitle");
            const sub = document.getElementById("hnmtAuthSub");

            if (tabsWrap) tabsWrap.style.display = "block";

            if (tab === "register") {
                tabLogin?.classList.remove("is-active");
                tabRegister?.classList.add("is-active");

                viewLogin?.classList.remove("is-active");
                viewForgot?.classList.remove("is-active");
                viewRegister?.classList.add("is-active");

                if (title) title.textContent = "Tạo Tài Khoản";
                if (sub) sub.textContent = "Gia nhập cộng đồng thành viên để nhận ưu đãi đặc quyền.";
            } else {
                tabLogin?.classList.add("is-active");
                tabRegister?.classList.remove("is-active");

                viewRegister?.classList.remove("is-active");
                viewForgot?.classList.remove("is-active");
                viewLogin?.classList.add("is-active");

                if (title) title.textContent = "Đăng Nhập";
                if (sub) sub.textContent = "Chào mừng bạn trở lại với không gian thời trang HNMT.";
            }
        },

        showForgot() {
            this.hideAlert();
            const tabsWrap = document.getElementById("hnmtAuthTabsWrap");
            const viewLogin = document.getElementById("authViewLogin");
            const viewRegister = document.getElementById("authViewRegister");
            const viewForgot = document.getElementById("authViewForgot");

            const title = document.getElementById("hnmtAuthTitle");
            const sub = document.getElementById("hnmtAuthSub");

            if (tabsWrap) tabsWrap.style.display = "none";
            viewLogin?.classList.remove("is-active");
            viewRegister?.classList.remove("is-active");
            viewForgot?.classList.add("is-active");

            if (title) title.textContent = "Khôi Phục Mật Khẩu";
            if (sub) sub.textContent = "Thiết lập lại quyền truy cập tài khoản thời trang của bạn.";

            // Pre-fill email from login field if user already typed it
            const loginEmail = document.getElementById("loginEmailInput")?.value;
            const forgotEmail = document.getElementById("forgotEmailInput");
            if (loginEmail && forgotEmail) {
                forgotEmail.value = loginEmail;
            }
        },

        togglePass(inputId, btn) {
            const input = document.getElementById(inputId);
            if (!input || !btn) return;

            const icon = btn.querySelector("i");
            if (input.type === "password") {
                input.type = "text";
                if (icon) icon.className = "bi bi-eye-slash";
            } else {
                input.type = "password";
                if (icon) icon.className = "bi bi-eye";
            }
        },

        showAlert(message) {
            if (!this.alertBox || !this.alertText) return;
            this.alertText.textContent = message;
            this.alertBox.style.display = "flex";
        },

        hideAlert() {
            if (!this.alertBox) return;
            this.alertBox.style.display = "none";
        },

        async handleLoginSubmit(e) {
            e.preventDefault();
            this.hideAlert();

            const form = e.target;
            const submitBtn = document.getElementById("loginSubmitBtn");
            const originalContent = submitBtn?.innerHTML;

            const email = form.querySelector('input[name="Email"]')?.value?.trim();
            const password = form.querySelector('input[name="Password"]')?.value;

            if (!email || !password) {
                this.showAlert("Vui lòng nhập đầy đủ Email và Mật khẩu.");
                return;
            }

            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = "Đang đăng nhập...";
            }

            try {
                const formData = new FormData(form);
                const response = await fetch("/Account/Login", {
                    method: "POST",
                    body: formData,
                    headers: {
                        "X-Requested-With": "XMLHttpRequest",
                        "Accept": "application/json"
                    }
                });

                // Check if JSON response
                const contentType = response.headers.get("content-type") || "";
                if (contentType.includes("application/json")) {
                    const data = await response.json();
                    if (data.success) {
                        submitBtn.textContent = "Đăng nhập thành công";
                        setTimeout(() => {
                            window.location.reload();
                        }, 400);
                        return;
                    } else {
                        this.showAlert(data.message || "Email hoặc mật khẩu không chính xác.");
                    }
                } else {
                    // Fallback if returned HTML (e.g. redirected or standard view)
                    if (response.redirected) {
                        window.location.href = response.url;
                        return;
                    }
                    const text = await response.text();
                    if (text.includes("Đăng xuất") || text.includes("fs-menu-logout-btn") || response.ok) {
                        window.location.reload();
                        return;
                    }
                    this.showAlert("Email hoặc mật khẩu không chính xác. Vui lòng thử lại.");
                }
            } catch (err) {
                console.error("Login Error:", err);
                this.showAlert("Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại mạng.");
            } finally {
                if (submitBtn && !submitBtn.textContent.includes("thành công")) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalContent || "Đăng nhập";
                }
            }
        },

        async handleRegisterSubmit(e) {
            e.preventDefault();
            this.hideAlert();

            const form = e.target;
            const submitBtn = document.getElementById("regSubmitBtn");
            const originalContent = submitBtn?.innerHTML;

            const pass = form.querySelector('input[name="Password"]')?.value;
            const confirmPass = form.querySelector('input[name="ConfirmPassword"]')?.value;

            if (pass !== confirmPass) {
                this.showAlert("Mật khẩu xác nhận không trùng khớp.");
                return;
            }

            if (pass.length < 8) {
                this.showAlert("Mật khẩu phải có độ dài tối thiểu 8 ký tự.");
                return;
            }

            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = "Đang tạo tài khoản...";
            }

            try {
                const formData = new FormData(form);
                const response = await fetch("/Account/Register", {
                    method: "POST",
                    body: formData,
                    headers: {
                        "X-Requested-With": "XMLHttpRequest",
                        "Accept": "application/json"
                    }
                });

                const contentType = response.headers.get("content-type") || "";
                if (contentType.includes("application/json")) {
                    const data = await response.json();
                    if (data.success) {
                        submitBtn.textContent = "Tạo tài khoản thành công";
                        setTimeout(() => {
                            window.location.reload();
                        }, 400);
                        return;
                    } else {
                        this.showAlert(data.message || "Đăng ký không thành công. Vui lòng kiểm tra lại.");
                    }
                } else {
                    if (response.redirected) {
                        window.location.href = response.url;
                        return;
                    }
                    window.location.reload();
                }
            } catch (err) {
                console.error("Register Error:", err);
                this.showAlert("Có lỗi xảy ra khi tạo tài khoản. Vui lòng thử lại sau.");
            } finally {
                if (submitBtn && !submitBtn.textContent.includes("thành công")) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalContent || "Tạo tài khoản";
                }
            }
        },

        handleForgotSubmit(e) {
            e.preventDefault();
            const emailInput = document.getElementById("forgotEmailInput");
            const successBox = document.getElementById("forgotSuccessAlert");
            const submitBtn = document.getElementById("forgotSubmitBtn");

            if (!emailInput?.value) return;

            submitBtn.disabled = true;
            submitBtn.textContent = "Đang gửi...";

            setTimeout(() => {
                if (successBox) {
                    successBox.style.display = "block";
                    successBox.innerHTML = `Hướng dẫn khôi phục mật khẩu đã được gửi tới <strong>${emailInput.value}</strong>.`;
                }
                submitBtn.disabled = false;
                submitBtn.textContent = "Đã gửi thành công";
            }, 700);
        },

        socialLogin(provider) {
            alert(`[HNMTSHOP ATELIER] Đang kết nối tài khoản ${provider} sang không gian thành viên... (Tính năng OAuth đang ở chế độ thử nghiệm).`);
        }
    };

    // Attach to window
    window.HNMTAuthModal = AuthModal;

    // Auto-init on DOM ready
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => AuthModal.init());
    } else {
        AuthModal.init();
    }
})();
