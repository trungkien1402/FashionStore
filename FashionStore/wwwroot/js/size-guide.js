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

    // ==========================================
    // 1. TƯ VẤN SIZE QUẦN ÁO
    // ==========================================
    const clothingForm = document.getElementById("clothingForm");

    clothingForm?.addEventListener("submit", event => {
        event.preventDefault();

        const height = Number(document.getElementById("sgHeight").value);
        const weight = Number(document.getElementById("sgWeight").value);
        const fit = document.getElementById("sgFit").value;

        if (!height || !weight || height < 120 || height > 230 || weight < 25 || weight > 200) {
            alert("Vui lòng nhập chiều cao và cân nặng hợp lệ.");
            return;
        }

        const result = document.getElementById("clothingResult");
        const eyebrowEl = document.getElementById("clothingEyebrow");
        const sizeEl = document.getElementById("clothingSize");
        const titleEl = document.getElementById("clothingTitle");
        const descEl = document.getElementById("clothingDescription");
        const supportBox = document.getElementById("clothingSupportBox");
        const noteEl = document.getElementById("clothingNote");
        const contactBtn = document.getElementById("clothingContactBtn");

        // KIỂM TRA ĐIỀU KIỆN SỐ ĐO KHÔNG PHÙ HỢP BẢNG SIZE:
        // Bảng chuẩn: Chiều cao 145 - 195 cm, Cân nặng 35 - 100 kg
        // Tính chỉ số BMI cơ bản: weight / ((height/100)^2)
        const bmi = weight / Math.pow(height / 100, 2);

        const isWeightOutOfRange = weight < 35 || weight > 100;
        const isHeightOutOfRange = height < 145 || height > 195;
        const isDisproportionate = (height >= 180 && weight < 50) || 
                                   (height <= 155 && weight > 72) ||
                                   (bmi < 15.5 || bmi > 33);

        const isUnsupported = isWeightOutOfRange || isHeightOutOfRange || isDisproportionate;

        if (isUnsupported) {
            // SỐ ĐO KHÔNG PHÙ HỢP -> HIỂN THỊ THÔNG BÁO LIÊN HỆ BỘ PHẬN CSKH
            result.classList.add("unsupported");
            eyebrowEl.textContent = "CẦN TƯ VẤN RIÊNG";
            sizeEl.textContent = "CSKH";
            titleEl.textContent = "Số đo của bạn cần được hỗ trợ riêng";

            let reasonText = "";
            if (isWeightOutOfRange || isHeightOutOfRange) {
                reasonText = `Số đo chiều cao (${height} cm) hoặc cân nặng (${weight} kg) hiện nằm ngoài dải kích thước may sẵn thông thường của bảng size (XS – XXL).`;
            } else {
                reasonText = `Tỷ lệ vóc dáng với chiều cao (${height} cm) và cân nặng (${weight} kg) có sự chênh lệch so với phom dáng may sẵn tiêu chuẩn.`;
            }

            descEl.textContent = `${reasonText} Để đảm bảo trang phục vừa vặn và tôn dáng nhất, bạn vui lòng liên hệ ngay với bộ phận Chăm Sóc Khách Hàng của FashionStore để được chuyên viên tư vấn phom dáng phù hợp hoặc hỗ trợ đặt may theo yêu cầu.`;

            // Cập nhật link dẫn về trang liên hệ với nội dung điền sẵn
            const fitLabel = fit === "oversize" ? "Oversize (rộng thoải mái)" : (fit === "slim" ? "Slim Fit (ôm gọn)" : "Regular Fit (vừa vặn)");
            const prefilledMessage = encodeURIComponent(
                `Xin chào bộ phận CSKH FashionStore, tôi cần tư vấn chọn size trang phục phù hợp.\n` +
                `Thông số cơ thể của tôi:\n` +
                `- Chiều cao: ${height} cm\n` +
                `- Cân nặng: ${weight} kg\n` +
                `- Phong cách mặc mong muốn: ${fitLabel}\n` +
                `Rất mong được chuyên viên hỗ trợ tư vấn mẫu và size phù hợp nhất!`
            );
            contactBtn.href = `/contact?subject=T%C6%B0+v%E1%BA%A5n+s%E1%BA%A3n+ph%E1%BA%A9m+%26+Ch%E1%BB%8Dn+size&message=${prefilledMessage}#contactForm`;

            supportBox.hidden = false;
            noteEl.hidden = true;
        } else {
            // SỐ ĐO PHÙ HỢP -> TÍNH SIZE BÌNH THƯỜNG
            result.classList.remove("unsupported");
            eyebrowEl.textContent = "YOUR RECOMMENDED SIZE";

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

            sizeEl.textContent = recommended;
            titleEl.textContent = `Gợi ý size ${recommended}`;
            descEl.textContent = `Với chiều cao ${height} cm và cân nặng ${weight} kg, FashionStore gợi ý bạn tham khảo size ${recommended}. Hãy đối chiếu chi tiết số đo của từng sản phẩm trước khi mua hàng.`;

            supportBox.hidden = true;
            noteEl.hidden = false;
        }

        result.hidden = false;
        result.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });

    // ==========================================
    // 2. TƯ VẤN SIZE GIÀY
    // ==========================================
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

        const length = Number(document.getElementById("sgFootLength").value);

        if (!length || length < 18 || length > 35) {
            alert("Vui lòng nhập chiều dài bàn chân hợp lệ.");
            return;
        }

        const result = document.getElementById("shoeResult");
        const eyebrowEl = document.getElementById("shoeEyebrow");
        const sizeEl = document.getElementById("shoeSize");
        const titleEl = document.getElementById("shoeTitle");
        const descEl = document.getElementById("shoeDescription");
        const supportBox = document.getElementById("shoeSupportBox");
        const noteEl = document.getElementById("shoeNote");
        const contactBtn = document.getElementById("shoeContactBtn");

        const match = shoeSizes.find(x => length >= x.min && length <= x.max);

        if (!match) {
            // SỐ ĐO GIÀY KHÔNG CÓ TRONG BẢNG QUY ĐỔI (36 - 45) -> BÁO LIÊN HỆ CSKH
            result.classList.add("unsupported");
            eyebrowEl.textContent = "CẦN TƯ VẤN RIÊNG";
            sizeEl.textContent = "CSKH";
            titleEl.textContent = "Bàn chân của bạn chưa có size tiêu chuẩn phù hợp";

            let lengthComment = length < 22.5 ? "nhỏ hơn cỡ giày 36" : "lớn hơn cỡ giày 45";
            descEl.textContent = `Chiều dài bàn chân ${length} cm (${lengthComment}) nằm ngoài dải size giày phổ thông của bảng quy đổi. Bạn vui lòng liên hệ bộ phận Chăm Sóc Khách Hàng để nhân viên hỗ trợ kiểm tra các dòng giày phom ngoại cỡ (Big Size) hoặc giày phom đặc biệt.`;

            const prefilledMessage = encodeURIComponent(
                `Xin chào CSKH FashionStore, tôi cần tư vấn size giày.\n` +
                `- Chiều dài bàn chân của tôi: ${length} cm\n` +
                `Số đo này nằm ngoài bảng size phổ thông (36 - 45). Xin cửa hàng tư vấn giúp tôi các mẫu giày hoặc form dáng có kích cỡ phù hợp.`
            );
            contactBtn.href = `/contact?subject=T%C6%B0+v%E1%BA%A5n+s%E1%BA%A3n+ph%E1%BA%A9m+%26+Ch%E1%BB%8Dn+size&message=${prefilledMessage}#contactForm`;

            supportBox.hidden = false;
            noteEl.hidden = true;
        } else {
            // CÓ SIZE PHÙ HỢP
            result.classList.remove("unsupported");
            eyebrowEl.textContent = "YOUR RECOMMENDED SHOE SIZE";
            sizeEl.textContent = match.size;
            titleEl.textContent = "Size giày EU tham khảo";
            descEl.textContent = `Chiều dài bàn chân ${length} cm tương ứng khoảng size EU ${match.size}. Hãy kiểm tra kỹ phom giày trước khi đặt mua.`;

            supportBox.hidden = true;
            noteEl.hidden = false;
        }

        result.hidden = false;
        result.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
});
