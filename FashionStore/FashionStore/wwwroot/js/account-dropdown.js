/**
 * Account Navigation Dropdown Toggle & Accessibility Script
 */
document.addEventListener("DOMContentLoaded", function () {
    const containers = document.querySelectorAll(".fs-account-dropdown-container");

    containers.forEach(container => {
        const btn = container.querySelector(".fs-account-btn");
        const popover = container.querySelector(".fs-account-popover");

        if (btn && popover) {
            btn.addEventListener("click", function (e) {
                e.stopPropagation();
                const isOpen = popover.classList.contains("is-open");

                // Close all other open dropdowns first
                document.querySelectorAll(".fs-account-popover.is-open").forEach(p => {
                    if (p !== popover) {
                        p.classList.remove("is-open");
                        p.setAttribute("aria-hidden", "true");
                        const otherBtn = p.closest(".fs-account-dropdown-container")?.querySelector(".fs-account-btn");
                        if (otherBtn) otherBtn.setAttribute("aria-expanded", "false");
                    }
                });

                if (isOpen) {
                    popover.classList.remove("is-open");
                    popover.setAttribute("aria-hidden", "true");
                    btn.setAttribute("aria-expanded", "false");
                } else {
                    popover.classList.add("is-open");
                    popover.setAttribute("aria-hidden", "false");
                    btn.setAttribute("aria-expanded", "true");
                }
            });
        }
    });

    // Close when clicking outside
    document.addEventListener("click", function (e) {
        if (!e.target.closest(".fs-account-dropdown-container")) {
            document.querySelectorAll(".fs-account-popover.is-open").forEach(p => {
                p.classList.remove("is-open");
                p.setAttribute("aria-hidden", "true");
                const b = p.closest(".fs-account-dropdown-container")?.querySelector(".fs-account-btn");
                if (b) b.setAttribute("aria-expanded", "false");
            });
        }
    });

    // Close with Escape key
    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") {
            document.querySelectorAll(".fs-account-popover.is-open").forEach(p => {
                p.classList.remove("is-open");
                p.setAttribute("aria-hidden", "true");
                const b = p.closest(".fs-account-dropdown-container")?.querySelector(".fs-account-btn");
                if (b) b.setAttribute("aria-expanded", "false");
            });
        }
    });
});
