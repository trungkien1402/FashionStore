
document.addEventListener("DOMContentLoaded", () => {
    // Chuyển tab Quần áo / Giày dép
    const tabs = document.querySelectorAll(".sg-tab");
    const panels = document.querySelectorAll(".sg-panel");

    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            tabs.forEach(x => x.classList.remove("active"));
            panels.forEach(x => x.classList.remove("active"));

            tab.classList.add("active");

            const panel = document.getElementById(tab.dataset.target);
            panel?.classList.add("active");
        });
    });

    // Tư vấn size quần áo
    const clothingForm = document.getElementById("clothingForm");

    clothingForm?.addEventListener("submit", event => {
        event.preventDefault();

        const height = Number(document.getElementById("sgHeight").value);
        const weight = Number(document.getElementById("sgWeight").value);
        const fit = document.getElementById("sgFit").value;

        if (!height || !weight ||
            height < 130 || height > 220 ||
            weight < 30 || weight > 180) {
            alert("Vui lòng nhập chiều cao và cân nặng hợp lệ.");
            return;
        }

        // Ước lượng theo cân nặng, sau đó điều chỉnh theo chiều cao.
        const sizes = ["XS", "S", "M", "L", "XL", "XXL"];

        let index =
            weight <= 45 ? 0 :
                weight <= 52 ? 1 :
                    weight <= 62 ? 2 :
                        weight <= 72 ? 3 :
                            weight <= 85 ? 4 : 5;

        if (height >= 185 && index < 5) index++;
        if (height < 155 && index > 0) index--;

        if (fit === "oversize" && index < 5) index++;
        if (fit === "slim" && index > 0) index--;

        const recommended = sizes[index];

        const result = document.getElementById("clothingResult");

        document.getElementById("clothingSize").textContent = recommended;
        document.getElementById("clothingTitle").textContent =
            `Gợi ý size ${recommended}`;

        document.getElementById("clothingDescription").textContent =
            `Với chiều cao ${height} cm và cân nặng ${weight} kg, ` +
            `HNMTSHOP gợi ý bạn tham khảo size ${recommended}. ` +
            `Hãy đối chiếu số đo của sản phẩm trước khi mua.`;

        result.hidden = false;
        result.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });

    // Tư vấn size giày
    const shoeForm = document.getElementById("shoeForm");

    const shoeSizes = [
        { size: 36, min: 22.5, max: 23.0 },
        { size: 37, min: 23.1, max: 23.5 },
        { size: 38, min: 23.6, max: 24.0 },
        { size: 39, min: 24.1, max: 24.5 },
        { size: 40, min: 24.6, max: 25.0 },
        { size: 41, min: 25.1, max: 26.0 },
        { size: 42, min: 26.1, max: 26.5 },
        { size: 43, min: 26.6, max: 27.0 },
        { size: 44, min: 27.1, max: 28.0 },
        { size: 45, min: 28.1, max: 28.5 }
    ];

    shoeForm?.addEventListener("submit", event => {
        event.preventDefault();

        const length = Number(
            document.getElementById("sgFootLength").value
        );

        if (!length || length < 20 || length > 32) {
            alert("Vui lòng nhập chiều dài bàn chân hợp lệ.");
            return;
        }

        const match = shoeSizes.find(
            x => length >= x.min && length <= x.max
        );

        const result = document.getElementById("shoeResult");

        if (!match) {
            document.getElementById("shoeSize").textContent = "—";
            document.getElementById("shoeDescription").textContent =
                "Chưa có dữ liệu quy đổi phù hợp với số đo này. " +
                "Vui lòng kiểm tra bảng size riêng của sản phẩm.";
        } else {
            document.getElementById("shoeSize").textContent = match.size;
            document.getElementById("shoeDescription").textContent =
                `Chiều dài bàn chân ${length} cm tương ứng khoảng ` +
                `size EU ${match.size}. Hãy kiểm tra form giày trước khi đặt.`;
        }

        result.hidden = false;
        result.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
});
