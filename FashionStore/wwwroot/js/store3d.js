/**
 * ==============================================================================
 * HNMTSHOP - 3D DARK WATER SHOWROOM (CHILE 20 PHOTOREALISTIC 3D ENGINE)
 * Chuẩn 1:1 theo video 1107.mp4 & ảnh nền nước đọng Đen - Đỏ - Trắng:
 * 1. Không gian 3D Photorealistic:
 *    - Khối Cột 3D ĐEN - ĐỎ - TRẮNG (Trái: Kính thang cuốn viền neon đỏ,
 *      Giữa: Đèn hộp Đỏ Crimson, Phải: Đèn hộp LED Trắng) có độ sâu 3D thật.
 *    - Mặt Nước Đọng Gợn Sóng Tròn Đồng Tâm (Real-time GLSL Water Ripple Refraction)
 *      uốn lượn liên tục và đổi ánh sáng Đỏ / Trắng theo món đồ đang trỏ chuột
 *      (giống hệt hiệu ứng đổi màu phòng trong video 1107.mp4).
 * 2. 3 Món Đồ 3D Chân Thật Như Ảnh Thật (.GLB Volumetric Photorealistic PBR):
 *    - BÊN TRÁI CỘT: Quần Streetwear Denim-Track 3D (Đen Charcoal phối sọc Đỏ-Trắng)
 *    - CHÍNH GIỮA CỘT: Áo Khoác Track Jacket Chile 20 3D (Đen phối sọc Đỏ-Trắng)
 *    - BÊN PHẢI CỘT: Giày Sneaker Street 3D (Đen phối sọc Đỏ đế Trắng)
 * ==============================================================================
 */

(function () {
    'use strict';

    // --- State & DOM References ---
    let portalEl = null;
    let canvasEl = null;
    let exitBtnEl = null;
    let hoverTagEl = null;
    let hoverCatEl = null;
    let hoverNameEl = null;
    let flashEl = null;

    let scene, camera, renderer;
    let animId = null;
    let isPortalOpen = false;

    // 3D Objects, Reflections & Shader Uniforms
    const itemWrappers = [];
    const itemReflections = [];
    let stageUniforms = null;
    let centerRedLight = null;
    let rightWhiteLight = null;
    let keyLight = null;
    let activeHoveredIndex = -1;

    // Mouse & Camera Parallax State
    let mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const FLOOR_Y = -1.18;

    // Cấu hình 3 Món Đồ 3D Chân Thật (Trái: Quần Cargo Jeans 3D | Chính giữa: Áo Hoodie Essentials 3D | Phải: Giày Sneaker 3D)
    // Tỷ lệ kích thước thật ngoài đời (Quần dài ~1.48, Áo Hoodie ~1.14, Giày ~0.36), đội hình chữ V quanh cột Đen-Đỏ-Trắng
    const MODEL_CONFIGS = [
        {
            id: 'quan',
            category: '01 // QUẦN CARGO JEANS 3D',
            name: 'Quần Baggy Cargo Jeans Acid-Wash Đen Xám',
            target: '/Products?search=quan',
            modelUrl: '/models/clothes/cargo-jeans-video-3d.glb?v=solid3d2',
            targetHeight: 1.36,
            posX: -1.24,
            posY: -0.28,
            posZ: 0.46,
            baseRotX: 0.06,
            baseRotY: 0.28,
            baseRotZ: 0.0,
            roughness: 0.76,
            metalness: 0.0,
            normalScale: 1.35,
            aoStrength: 1.0,
            shadowW: 0.88,
            shadowD: 0.46,
            hoverMood: 'left'
        },
        {
            id: 'ao',
            category: '02 // ÁO THUN 3D',
            name: 'Áo Thun Cotton Trắng Heavyweight',
            target: '/Products?search=ao',
            modelUrl: '/models/clothes/tshirt-white-3d.glb?v=photoreal_white_tee2',
            targetHeight: 0.98,
            posX: 0.0,
            posY: -0.32,
            posZ: 0.80,
            baseRotX: 0.04,
            baseRotY: -0.05,
            baseRotZ: 0.0,
            roughness: 0.74,
            metalness: 0.0,
            normalScale: 1.25,
            aoStrength: 0.85,
            shadowW: 1.15,
            shadowD: 0.55,
            hoverMood: 'center'
        },
        {
            id: 'giay',
            category: '03 // GIÀY SNEAKER 3D',
            name: 'Giày Sneaker Street Chile 20 Đen Đỏ Trắng',
            target: '/Products?search=sneaker',
            modelUrl: '/models/shoes/sneaker.glb?v=chile20',
            targetHeight: 0.36,
            posX: 1.18,
            posY: -0.66,
            posZ: 0.48,
            baseRotX: 0.10,
            baseRotY: -0.32,
            baseRotZ: -0.10,
            roughness: 0.38,
            metalness: 0.08,
            shadowW: 0.78,
            shadowD: 0.34,
            hoverMood: 'right'
        }
    ];

    const raycaster = new THREE.Raycaster();
    const mouseNormalized = new THREE.Vector2(-999, -999);

    // --- Khởi tạo không gian Three.js WebGL ---
    function initThreeScene() {
        if (!canvasEl) return;

        // 1. Scene & Không gian tối đen sâu thẳm (#030305)
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0x030305);

        // 2. Camera thu gần cân đối khung hình (z = 4.65, fov = 34)
        const aspect = window.innerWidth / window.innerHeight;
        camera = new THREE.PerspectiveCamera(34, aspect, 0.1, 100);
        camera.position.set(0, 0.10, 4.65);
        camera.lookAt(0, -0.05, 0.0);

        // 3. WebGL Renderer chuẩn PBR sắc nét
        renderer = new THREE.WebGLRenderer({
            canvas: canvasEl,
            antialias: true,
            alpha: false,
            powerPreference: 'high-performance'
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.0;
        renderer.outputEncoding = THREE.sRGBEncoding;

        // 4. Hệ thống ánh sáng Studio chân thật làm nổi khối 3D & chất vải
        setupPhotorealisticLighting();

        // 5. Dựng Không Gian 3D Cột Đen-Đỏ-Trắng & Mặt Nước Đọng Gợn Sóng Đồng Tâm
        buildPhotorealistic3DStage();

        // 6. Nạp 3 Model 3D Thực Thụ (Trái: Quần | Giữa: Áo | Phải: Giày)
        loadAll3DModels();
    }

    function setupPhotorealisticLighting() {
        // Ánh sáng môi trường cân bằng giúp màu sắc ảnh thật hiển thị chuẩn xác 100%
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.22);
        scene.add(ambientLight);

        const hemiLight = new THREE.HemisphereLight(0xf2f5fa, 0x181a22, 0.25);
        hemiLight.position.set(0, 8, 0);
        scene.add(hemiLight);

        // Đèn Key Light chiếu từ phía trước làm nổi khối 3D của ngực áo, ống quần và mũi giày
        keyLight = new THREE.DirectionalLight(0xffffff, 0.95);
        keyLight.position.set(2.2, 3.8, 5.5);
        scene.add(keyLight);

        // Đèn Rim Light bên trái & phải tạo viền sáng 3D tách biệt khỏi nền tối
        const leftRimLight = new THREE.DirectionalLight(0xff2a36, 0.35);
        leftRimLight.position.set(-3.5, 2.0, 2.5);
        scene.add(leftRimLight);

        const rightRimLight = new THREE.DirectionalLight(0xeef4ff, 0.40);
        rightRimLight.position.set(3.5, 2.2, 2.5);
        scene.add(rightRimLight);

        // Ánh sáng Đỏ hắt nhẹ ra từ trụ Đỏ ở giữa
        centerRedLight = new THREE.PointLight(0xff1e27, 0.75, 6.5, 1.5);
        centerRedLight.position.set(0, 0.35, -0.15);
        scene.add(centerRedLight);

        // Ánh sáng Trắng hắt nhẹ ra từ trụ Trắng bên phải
        rightWhiteLight = new THREE.PointLight(0xffffff, 0.75, 6.5, 1.5);
        rightWhiteLight.position.set(0.65, 0.35, -0.15);
        scene.add(rightWhiteLight);
    }

    // ==============================================================================
    // 5. KHÔNG GIAN 3D THẬT (100% hình học Three.js, không dùng ảnh nền phẳng)
    //    - Cột đèn hình trụ thon (CylinderGeometry) 3 dải Đen - Đỏ - Trắng + chân đế kim loại
    //    - Mặt nước đen có PHẢN CHIẾU THẬT (planar reflection) + gợn sóng đồng tâm
    //    - Quầng sáng, vũng sáng Đỏ/Trắng hắt xuống nước, bóng đổ dưới từng món đồ
    // ==============================================================================
    const PILLAR_Z = -0.95;
    const PILLAR_R = 0.15;
    let reflRT = null;
    let reflCam = null;
    let floorMesh = null;
    let reflTexMatrix = null;

    const _rPos = new THREE.Vector3();
    const _cPos = new THREE.Vector3();
    const _normal = new THREE.Vector3(0, 1, 0);
    const _view = new THREE.Vector3();
    const _lookAt = new THREE.Vector3();
    const _target = new THREE.Vector3();
    const _rot = new THREE.Matrix4();

    const srgbColor = (hex) => new THREE.Color(hex).convertSRGBToLinear();

    function makeCanvas(w, h) {
        const c = document.createElement('canvas');
        c.width = w;
        c.height = h;
        return c;
    }

    function buildPhotorealistic3DStage() {
        scene.background = new THREE.Color(0x020203);
        buildPillar();
        buildWaterFloor();
        buildLightHalos();
    }

    // Texture bọc quanh thân trụ: kính thang cuốn viền neon đỏ | Đỏ Crimson | Trắng LED
    function makePillarTexture() {
        const W = 1024, H = 128;
        const cv = makeCanvas(W, H);
        const ctx = cv.getContext('2d');
        const img = ctx.createImageData(W, H);
        for (let y = 0; y < H; y++) {
            const v = y / (H - 1);
            const vfac = 0.86 + 0.14 * Math.sin(Math.PI * v);
            for (let x = 0; x < W; x++) {
                const th = (x / W) * Math.PI * 2;
                const xr = Math.sin(th);
                const facing = Math.abs(Math.cos(th));
                const shade = (0.5 + 0.5 * Math.pow(facing, 0.55)) * vfac;
                let r, g, b;
                if (xr < -0.5) {
                    const edge = Math.exp(-Math.pow((xr + 0.93) / 0.05, 2));
                    const diag = (((xr * 10.0 + v * 7.0) % 1 + 1) % 1) < 0.07 ? 38 : 0;
                    const base = 34 + 34 * (1 - v);
                    r = base + diag + edge * 210;
                    g = base + diag + edge * 14;
                    b = base + 3 + diag + edge * 20;
                } else if (xr < -0.43) {
                    r = g = b = 8;
                } else if (xr < 0.22) {
                    r = 232; g = 14; b = 24;
                } else if (xr < 0.28) {
                    r = g = b = 8;
                } else {
                    r = g = b = 252;
                }
                const i = (y * W + x) * 4;
                img.data[i] = Math.min(255, r * shade);
                img.data[i + 1] = Math.min(255, g * shade);
                img.data[i + 2] = Math.min(255, b * shade);
                img.data[i + 3] = 255;
            }
        }
        ctx.putImageData(img, 0, 0);
        const tex = new THREE.CanvasTexture(cv);
        tex.encoding = THREE.sRGBEncoding;
        tex.anisotropy = 8;
        return tex;
    }

    function buildPillar() {
        const g = new THREE.Group();
        g.position.set(0, FLOOR_Y, PILLAR_Z);
        const R = PILLAR_R;

        const darkMat = new THREE.MeshStandardMaterial({ color: srgbColor(0x2a2a30), roughness: 0.4, metalness: 0.6 });
        const brushedMat = new THREE.MeshStandardMaterial({ color: srgbColor(0x40404a), roughness: 0.3, metalness: 0.75 });
        const addCyl = (rt, rb, h, y, mat) => {
            const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, 80), mat);
            m.position.y = y + h / 2;
            g.add(m);
            return m;
        };

        addCyl(R * 1.38, R * 1.46, 0.04, 0.0, darkMat);      // đế chân
        addCyl(R * 1.0, R * 1.03, 0.42, 0.04, brushedMat);   // thân kim loại dưới
        addCyl(R * 0.84, R * 0.84, 0.07, 0.46, darkMat);     // rãnh thắt cổ trụ
        addCyl(R * 1.05, R * 1.05, 0.03, 0.53, brushedMat);  // vòng đai
        addCyl(R * 1.0, R * 1.0, 0.04, 0.56, darkMat);       // đệm dưới ống đèn

        const tubeH = 1.75;
        const tubeTex = makePillarTexture();
        const tubeMat = new THREE.MeshStandardMaterial({
            color: srgbColor(0x202020),
            emissive: 0xffffff,
            emissiveMap: tubeTex,
            emissiveIntensity: 0.85,
            roughness: 0.22,
            metalness: 0.0
        });
        const tube = new THREE.Mesh(new THREE.CylinderGeometry(R, R, tubeH, 96, 1, true), tubeMat);
        tube.position.y = 0.6 + tubeH / 2;
        g.add(tube);

        addCyl(R * 1.07, R * 1.07, 0.045, 0.6 + tubeH, brushedMat);   // nắp đỉnh
        addCyl(R * 0.9, R * 0.9, 0.02, 0.6 + tubeH + 0.045, darkMat);

        scene.add(g);

        // Đèn Đỏ & Trắng hắt ra từ ống đèn lên đồ vật
        if (centerRedLight) centerRedLight.position.set(-0.05, FLOOR_Y + 1.15, PILLAR_Z + 0.5);
        if (rightWhiteLight) rightWhiteLight.position.set(0.24, FLOOR_Y + 1.15, PILLAR_Z + 0.5);
    }

    function radialGlowTexture(hard) {
        const cv = makeCanvas(128, 128);
        const ctx = cv.getContext('2d');
        const gr = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
        gr.addColorStop(0, 'rgba(255,255,255,1)');
        gr.addColorStop(hard ? 0.35 : 0.2, 'rgba(255,255,255,' + (hard ? 0.75 : 0.45) + ')');
        gr.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = gr;
        ctx.fillRect(0, 0, 128, 128);
        return new THREE.CanvasTexture(cv);
    }

    function buildLightHalos() {
        const tex = radialGlowTexture(false);
        [
            { c: 0xff1a24, x: -0.08, w: 1.5, o: 0.42 },
            { c: 0xffffff, x: 0.12, w: 1.2, o: 0.30 }
        ].forEach((h) => {
            const s = new THREE.Sprite(new THREE.SpriteMaterial({
                map: tex, color: h.c, blending: THREE.AdditiveBlending,
                transparent: true, depthWrite: false, opacity: h.o
            }));
            s.scale.set(h.w, 3.4, 1);
            s.position.set(h.x, FLOOR_Y + 1.5, PILLAR_Z - 0.14);
            scene.add(s);
        });
    }

    function buildWaterFloor() {
        const w = Math.floor(window.innerWidth * 0.75);
        const h = Math.floor(window.innerHeight * 0.75);
        reflRT = new THREE.WebGLRenderTarget(w, h, {
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter,
            format: THREE.RGBAFormat
        });
        reflCam = new THREE.PerspectiveCamera();
        reflTexMatrix = new THREE.Matrix4();

        stageUniforms = {
            tDiffuse: { value: reflRT.texture },
            textureMatrix: { value: reflTexMatrix },
            uTime: { value: 0 },
            uRedMood: { value: 0.0 },
            uWhiteMood: { value: 0.0 },
            uLeftMood: { value: 0.0 }
        };

        const vertexShader = `
            uniform mat4 textureMatrix;
            varying vec4 vUv4;
            varying vec3 vWorld;
            void main() {
                vUv4 = textureMatrix * vec4(position, 1.0);
                vec4 wp = modelMatrix * vec4(position, 1.0);
                vWorld = wp.xyz;
                gl_Position = projectionMatrix * viewMatrix * wp;
            }
        `;

        const fragmentShader = `
            uniform sampler2D tDiffuse;
            uniform float uTime;
            uniform float uRedMood;
            uniform float uWhiteMood;
            uniform float uLeftMood;
            varying vec4 vUv4;
            varying vec3 vWorld;

            void main() {
                vec2 p = vWorld.xz;
                vec2 c1 = vec2(0.0, -0.95);
                float d1 = length(p - c1);
                vec2 dir1 = (p - c1) / max(d1, 0.001);
                float w1 = cos(d1 * 34.0 - uTime * 2.6) * exp(-d1 * 0.5);

                vec2 c2 = vec2(-2.1, 0.5);
                float d2 = length(p - c2);
                vec2 dir2 = (p - c2) / max(d2, 0.001);
                float w2 = cos(d2 * 30.0 - uTime * 2.0) * exp(-d2 * 0.9) * 0.55;

                vec2 c3 = vec2(2.2, 0.2);
                float d3 = length(p - c3);
                vec2 dir3 = (p - c3) / max(d3, 0.001);
                float w3 = cos(d3 * 32.0 - uTime * 2.3) * exp(-d3 * 0.9) * 0.55;

                vec2 mw = vec2(
                    sin(p.x * 9.0 + uTime * 0.9 + sin(p.y * 6.0 + uTime * 0.6)),
                    cos(p.y * 8.0 - uTime * 0.7 + sin(p.x * 5.0))
                ) * 0.12;

                vec2 grad = dir1 * w1 + dir2 * w2 + dir3 * w3 + mw;
                vec3 N = normalize(vec3(grad.x * 0.05, 1.0, grad.y * 0.05));
                vec3 V = normalize(cameraPosition - vWorld);
                float fres = 0.30 + 0.70 * pow(1.0 - clamp(dot(N, V), 0.0, 1.0), 4.0);

                vec4 uvp = vUv4;
                uvp.xy += grad * 0.02 * uvp.w;
                vec3 refl = vec3(0.0);
                float wsum = 0.0;
                for (int i = -3; i <= 3; i++) {
                    float fi = float(i);
                    vec4 q = uvp;
                    q.y += fi * 0.0035 * uvp.w;
                    float wt = exp(-fi * fi * 0.25);
                    refl += texture2DProj(tDiffuse, q).rgb * wt;
                    wsum += wt;
                }
                refl /= wsum;

                vec3 col = vec3(0.004, 0.004, 0.006);
                // Tăng nhẹ độ nét phản chiếu cho Quần Cargo Jeans & Áo Thun Trắng dưới mặt nước
                float itemReflBoost = 1.0 + 0.38 * exp(-length((p - vec2(-1.24, 0.46)) * vec2(1.4, 1.0)) * 2.2)
                                          + 0.46 * exp(-length((p - vec2(0.0, 0.80)) * vec2(1.1, 1.0)) * 2.0);
                col += refl * fres * 0.98 * itemReflBoost;

                // Vũng sáng Đỏ & Trắng hắt từ ống đèn xuống mặt nước + ánh phản chiếu gợn sóng dưới chân Quần Cargo & Áo Thun
                float poolR = exp(-length((p - vec2(-0.06, -0.62)) * vec2(1.0, 0.8)) * 1.9);
                float poolW = exp(-length((p - vec2(0.20, -0.62)) * vec2(1.0, 0.8)) * 2.2);
                float poolCargo = exp(-length((p - vec2(-1.24, 0.46)) * vec2(1.2, 0.9)) * 2.1);
                float poolTee = exp(-length((p - vec2(0.0, 0.80)) * vec2(0.95, 1.1)) * 2.0);
                col += vec3(0.55, 0.03, 0.05) * poolR * (0.20 + 0.35 * uRedMood);
                col += vec3(0.85, 0.90, 1.00) * poolW * (0.14 + 0.30 * uWhiteMood);
                col += (vec3(0.18, 0.19, 0.22) * (0.16 + 0.22 * max(0.0, w2)) + vec3(0.48, 0.04, 0.06) * uLeftMood * 0.28) * poolCargo;
                col += (vec3(0.40, 0.42, 0.46) * (0.18 + 0.24 * max(0.0, w1))) * poolTee;

                // Lấp lánh trên đỉnh sóng
                float crest = pow(max(0.0, w1), 6.0) * exp(-d1 * 0.3);
                col += (vec3(0.9, 0.10, 0.12) * poolR + vec3(0.9) * poolW) * crest * 0.55;

                // Mặt nước tan dần vào bóng tối ở xa
                float far = smoothstep(6.0, 18.0, length(p - cameraPosition.xz));
                col *= (1.0 - far);

                gl_FragColor = vec4(col, 1.0);
                #include <tonemapping_fragment>
                #include <encodings_fragment>
            }
        `;

        const mat = new THREE.ShaderMaterial({
            uniforms: stageUniforms,
            vertexShader: vertexShader,
            fragmentShader: fragmentShader
        });

        floorMesh = new THREE.Mesh(new THREE.PlaneGeometry(80, 80, 1, 1), mat);
        floorMesh.rotation.x = -Math.PI / 2;
        floorMesh.position.y = FLOOR_Y;
        floorMesh.updateMatrixWorld(true);
        scene.add(floorMesh);
    }

    // Phản chiếu mặt phẳng thật: render cảnh bằng camera đối xứng qua mặt nước
    function updateReflection() {
        if (!floorMesh || !reflRT) return;
        camera.updateMatrixWorld();
        _rPos.setFromMatrixPosition(floorMesh.matrixWorld);
        _cPos.setFromMatrixPosition(camera.matrixWorld);
        _rot.extractRotation(camera.matrixWorld);

        _view.subVectors(_rPos, _cPos);
        _view.reflect(_normal).negate();
        _view.add(_rPos);

        _lookAt.set(0, 0, -1).applyMatrix4(_rot).add(_cPos);
        _target.subVectors(_rPos, _lookAt);
        _target.reflect(_normal).negate();
        _target.add(_rPos);

        reflCam.position.copy(_view);
        reflCam.up.set(0, 1, 0).applyMatrix4(_rot).reflect(_normal);
        reflCam.lookAt(_target);
        reflCam.far = camera.far;
        reflCam.updateMatrixWorld();
        reflCam.projectionMatrix.copy(camera.projectionMatrix);

        reflTexMatrix.set(0.5, 0, 0, 0.5, 0, 0.5, 0, 0.5, 0, 0, 0.5, 0.5, 0, 0, 0, 1);
        reflTexMatrix.multiply(reflCam.projectionMatrix);
        reflTexMatrix.multiply(reflCam.matrixWorldInverse);
        reflTexMatrix.multiply(floorMesh.matrixWorld);

        floorMesh.visible = false;
        const prev = renderer.getRenderTarget();
        renderer.setRenderTarget(reflRT);
        renderer.clear();
        renderer.render(scene, reflCam);
        renderer.setRenderTarget(prev);
        floorMesh.visible = true;
    }

    function addContactShadow(cfg) {
        const cv = makeCanvas(128, 128);
        const ctx = cv.getContext('2d');
        const gr = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
        gr.addColorStop(0, 'rgba(0,0,0,0.9)');
        gr.addColorStop(0.5, 'rgba(0,0,0,0.5)');
        gr.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = gr;
        ctx.fillRect(0, 0, 128, 128);
        const m = new THREE.Mesh(
            new THREE.PlaneGeometry(1, 1),
            new THREE.MeshBasicMaterial({
                map: new THREE.CanvasTexture(cv), transparent: true, depthWrite: false,
                polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2
            })
        );
        m.rotation.x = -Math.PI / 2;
        m.scale.set(cfg.shadowW || 1.0, cfg.shadowD || 0.5, 1);
        m.position.set(cfg.posX, FLOOR_Y + 0.004, cfg.posZ);
        scene.add(m);
    }

    // ==============================================================================
    // VẢI & HÌNH HỌC 3D PROCEDURAL: ÁO THUN + QUẦN SHORT (xoay 360° thấy đủ mọi cạnh)
    // ==============================================================================
    const _fabricCache = {};

    function fabricTextures(kind) {
        if (_fabricCache[kind]) return _fabricCache[kind];
        const S = 128;
        const hc = makeCanvas(S, S);
        const hx = hc.getContext('2d');
        const hd = hx.createImageData(S, S);
        const hArr = new Float32Array(S * S);
        for (let y = 0; y < S; y++) {
            for (let x = 0; x < S; x++) {
                let h;
                if (kind === 'jersey') {
                    const u = (x % 8) / 8, v = (y % 8) / 8;
                    const side = u < 0.5 ? u : 1 - u;
                    h = Math.pow(Math.sin(Math.PI * u), 1.3) * (0.62 + 0.38 * Math.sin(Math.PI * (v + side * 0.9)));
                } else {
                    const dd = ((x + y) % 8) / 8;
                    h = Math.pow(0.5 + 0.5 * Math.sin(dd * Math.PI * 2), 1.4) * 0.85 + 0.15 * (((x * 7 + y * 13) % 5) / 5);
                }
                h += (Math.random() - 0.5) * 0.08;
                h = Math.max(0, Math.min(1, h));
                hArr[y * S + x] = h;
                const i = (y * S + x) * 4;
                const val = h * 255;
                hd.data[i] = hd.data[i + 1] = hd.data[i + 2] = val;
                hd.data[i + 3] = 255;
            }
        }
        hx.putImageData(hd, 0, 0);

        // Normal map từ height map
        const nc = makeCanvas(S, S);
        const nctx = nc.getContext('2d');
        const nd = nctx.createImageData(S, S);
        const H = (x, y) => hArr[((y + S) % S) * S + ((x + S) % S)];
        const strength = 2.2;
        for (let y = 0; y < S; y++) {
            for (let x = 0; x < S; x++) {
                const dx = (H(x + 1, y) - H(x - 1, y)) * strength;
                const dy = (H(x, y + 1) - H(x, y - 1)) * strength;
                const len = Math.sqrt(dx * dx + dy * dy + 1);
                const i = (y * S + x) * 4;
                nd.data[i] = (-dx / len * 0.5 + 0.5) * 255;
                nd.data[i + 1] = (dy / len * 0.5 + 0.5) * 255;
                nd.data[i + 2] = (1 / len * 0.5 + 0.5) * 255;
                nd.data[i + 3] = 255;
            }
        }
        nctx.putImageData(nd, 0, 0);

        // Map độ sáng nhẹ (thớ vải sáng tối) nhân với màu vải
        const cc = makeCanvas(S, S);
        const cctx = cc.getContext('2d');
        const cd = cctx.createImageData(S, S);
        for (let i = 0; i < S * S; i++) {
            const rowJ = 1 + (hash3(0, Math.floor(i / S), 7) - 0.5) * 0.10;
            const v = Math.min(255, (0.78 + 0.22 * hArr[i]) * rowJ * 255);
            cd.data[i * 4] = cd.data[i * 4 + 1] = cd.data[i * 4 + 2] = v;
            cd.data[i * 4 + 3] = 255;
        }
        cctx.putImageData(cd, 0, 0);

        const res = { map: new THREE.CanvasTexture(cc), normal: new THREE.CanvasTexture(nc) };
        res.map.encoding = THREE.sRGBEncoding;
        _fabricCache[kind] = res;
        return res;
    }

    function makeFabricMaterial(kind, color, repX, repY, nScale, rough) {
        const t = fabricTextures(kind);
        const aniso = renderer ? renderer.capabilities.getMaxAnisotropy() : 4;
        const map = t.map.clone();
        const nrm = t.normal.clone();
        [map, nrm].forEach((tx) => {
            tx.wrapS = tx.wrapT = THREE.RepeatWrapping;
            tx.repeat.set(repX, repY);
            tx.anisotropy = aniso;
            tx.needsUpdate = true;
        });
        map.encoding = THREE.sRGBEncoding;
        return new THREE.MeshPhysicalMaterial({
            color: srgbColor(color),
            map: map,
            normalMap: nrm,
            normalScale: new THREE.Vector2(nScale, nScale),
            roughness: rough,
            metalness: 0.0,
            sheen: new THREE.Color(0.10, 0.10, 0.10),
            side: THREE.DoubleSide
        });
    }

    const ss = (a, b, x) => {
        const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
        return t * t * (3 - 2 * t);
    };

    function hash3(ix, iy, iz) {
        let h = Math.imul(ix, 374761393) ^ Math.imul(iy, 668265263) ^ Math.imul(iz, 1274126177);
        h = Math.imul(h ^ (h >>> 13), 1274126177);
        h ^= h >>> 16;
        return (h & 0xffff) / 65535;
    }
    function vnoise(x, y, z) {
        const ix = Math.floor(x), iy = Math.floor(y), iz = Math.floor(z);
        const fx = x - ix, fy = y - iy, fz = z - iz;
        const u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy), w = fz * fz * (3 - 2 * fz);
        const l = (a, b, k) => a + (b - a) * k;
        return l(
            l(l(hash3(ix, iy, iz), hash3(ix + 1, iy, iz), u), l(hash3(ix, iy + 1, iz), hash3(ix + 1, iy + 1, iz), u), v),
            l(l(hash3(ix, iy, iz + 1), hash3(ix + 1, iy, iz + 1), u), l(hash3(ix, iy + 1, iz + 1), hash3(ix + 1, iy + 1, iz + 1), u), v),
            w
        );
    }
    function fbm(x, y, z) {
        return (vnoise(x, y, z) * 0.55 + vnoise(x * 2.1, y * 2.1, z * 2.1) * 0.3 + vnoise(x * 4.3, y * 4.3, z * 4.3) * 0.15 - 0.5) * 2;
    }

    // Loft: nối các mặt cắt elip thành một ống 3D liền khối
    function makeLoft(sections, segs) {
        const n = sections.length;
        const pos = [], uv = [], idx = [];
        for (let i = 0; i < n; i++) {
            const s = sections[i];
            for (let j = 0; j <= segs; j++) {
                const a = (j / segs) * Math.PI * 2;
                const cs = Math.cos(a), sn = Math.sin(a);
                pos.push(
                    s.c.x + s.u.x * cs + s.v.x * sn,
                    s.c.y + s.u.y * cs + s.v.y * sn,
                    s.c.z + s.u.z * cs + s.v.z * sn
                );
                uv.push(j / segs, i / (n - 1));
            }
        }
        for (let i = 0; i < n - 1; i++) {
            for (let j = 0; j < segs; j++) {
                const a = i * (segs + 1) + j;
                const b = a + segs + 1;
                idx.push(a, b, a + 1, b, b + 1, a + 1);
            }
        }
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
        geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
        geo.setIndex(idx);
        return geo;
    }

    function finishLoft(geo, rows, segs) {
        geo.computeVertexNormals();
        const N = geo.attributes.normal;
        for (let i = 0; i < rows; i++) {
            const a = i * (segs + 1), b = a + segs;
            const nx = N.getX(a) + N.getX(b), ny = N.getY(a) + N.getY(b), nz = N.getZ(a) + N.getZ(b);
            const l = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;
            N.setXYZ(a, nx / l, ny / l, nz / l);
            N.setXYZ(b, nx / l, ny / l, nz / l);
        }
        N.needsUpdate = true;
    }

    function ringPointsOf(geo, row, segs) {
        const P = geo.attributes.position;
        const pts = [];
        for (let j = 0; j < segs; j++) {
            const k = row * (segs + 1) + j;
            pts.push(new THREE.Vector3(P.getX(k), P.getY(k), P.getZ(k)));
        }
        return pts;
    }

    function tubeAlong(points, closed, radius, mat) {
        const curve = new THREE.CatmullRomCurve3(points, closed);
        const geo = new THREE.TubeGeometry(curve, Math.max(24, points.length * (closed ? 1 : 3)), radius, 6, closed);
        return new THREE.Mesh(geo, mat);
    }

    // ---------------- ÁO THUN COTTON TRẮNG (cổ tròn, tay ngắn) ----------------
    function buildTee() {
        const group = new THREE.Group();
        const bodyMat = makeFabricMaterial('jersey', 0xdedcd6, 22, 13, 0.30, 0.95);
        const sleeveMat = makeFabricMaterial('jersey', 0xdedcd6, 9, 5, 0.30, 0.95);
        const trimMat = makeFabricMaterial('jersey', 0xcfcdc7, 40, 1, 0.5, 0.95);

        const rows = 46, segs = 96;
        const torsoRX = (y) => {
            const base = (0.292 - 0.010 * ss(0, 0.35, y) + 0.014 * ss(0.35, 0.75, y)) * (1 - 0.06 * ss(0.8, 0.9, y));
            return base + (0.105 - base) * ss(0.905, 1.0, y);
        };
        const torsoRZ = (y) => {
            const base = 0.150 - 0.004 * ss(0, 0.4, y);
            return base + (0.088 - base) * Math.pow(ss(0.905, 1.0, y), 1.2);
        };

        const sections = [];
        for (let i = 0; i < rows; i++) {
            const y = (i / (rows - 1)) * 1.0;
            sections.push({
                c: new THREE.Vector3(0, y, 0),
                u: new THREE.Vector3(torsoRX(y), 0, 0),
                v: new THREE.Vector3(0, 0, torsoRZ(y))
            });
        }
        const torso = makeLoft(sections, segs);

        // Nếp vải tự nhiên + cổ áo trước thấp hơn cổ sau
        const P = torso.attributes.position;
        for (let k = 0; k < P.count; k++) {
            let x = P.getX(k), y = P.getY(k), z = P.getZ(k);
            const a = Math.atan2(z, x);
            const env = 0.35 + 0.65 * (1 - ss(0.0, 0.9, y));
            const d = env * (
                0.016 * fbm(x * 7.0, y * 2.4, z * 7.0) +
                0.005 * fbm(x * 24.0, y * 10.0, z * 24.0) +
                0.004 * Math.sin(a * 5.0 + y * 12.0 + Math.sin(y * 6.0) * 1.6)
            );
            const rl = Math.hypot(x, z) || 1;
            x += (x / rl) * d;
            z += (z / rl) * d;
            const k2 = ss(0.90, 1.0, y);
            const nzv = Math.max(-1, Math.min(1, z / 0.09));
            y -= k2 * (nzv > 0 ? 0.05 * nzv * nzv : 0.012 * nzv * nzv);
            P.setXYZ(k, x, y, z);
        }
        finishLoft(torso, rows, segs);
        group.add(new THREE.Mesh(torso, bodyMat));

        // Viền cổ áo (bo gân) + gấu áo
        group.add(tubeAlong(ringPointsOf(torso, rows - 1, segs), true, 0.0125, trimMat));
        group.add(tubeAlong(ringPointsOf(torso, 0, segs), true, 0.0055, bodyMat));
        const stitchTee = new THREE.MeshStandardMaterial({ color: srgbColor(0xe9e7e1), roughness: 0.9 });
        group.add(tubeAlong(ringPointsOf(torso, 2, segs), true, 0.0013, stitchTee));
        [0, segs / 2].forEach((col) => {
            const sp = [];
            for (let i = 1; i < rows - 6; i += 2) {
                const k = i * (segs + 1) + col;
                sp.push(new THREE.Vector3(P.getX(k), P.getY(k), P.getZ(k)));
            }
            group.add(tubeAlong(sp, false, 0.0016, bodyMat));
        });

        // Hai tay áo ngắn
        [-1, 1].forEach((side) => {
            const start = new THREE.Vector3(side * 0.13, 0.855, 0);
            const dir = new THREE.Vector3(side * 0.78, -0.55, 0).normalize();
            const perp = new THREE.Vector3(dir.y, -dir.x, 0).normalize();
            const L = 0.30, sRows = 10;
            const secs = [];
            for (let k = 0; k < sRows; k++) {
                const t = k / (sRows - 1);
                const ra = 0.104 + (0.100 - 0.104) * t + 0.004 * Math.sin(t * Math.PI);
                const rb = 0.118 + (0.100 - 0.118) * t;
                secs.push({
                    c: start.clone().addScaledVector(dir, L * t),
                    u: new THREE.Vector3(0, 0, ra),
                    v: perp.clone().multiplyScalar(rb)
                });
            }
            const sleeve = makeLoft(secs, 64);
            const SP = sleeve.attributes.position;
            for (let k = 0; k < SP.count; k++) {
                const x = SP.getX(k), y = SP.getY(k), z = SP.getZ(k);
                const cxs = start.x + dir.x * 0.15, cys = start.y + dir.y * 0.15;
                const rx2 = x - cxs, ry2 = y - cys;
                const rl = Math.hypot(rx2, ry2, z) || 1;
                const d = 0.010 * fbm(x * 9, y * 9, z * 9 + side * 3) + 0.003 * fbm(x * 28, y * 28, z * 28);
                SP.setXYZ(k, x + (rx2 / rl) * d, y + (ry2 / rl) * d, z + (z / rl) * d);
            }
            finishLoft(sleeve, sRows, 64);
            group.add(new THREE.Mesh(sleeve, sleeveMat));
            group.add(tubeAlong(ringPointsOf(sleeve, sRows - 1, 64), true, 0.0055, sleeveMat));
            group.add(tubeAlong(ringPointsOf(sleeve, sRows - 2, 64), true, 0.0013, stitchTee));
        });

        return group;
    }

    // ---------------- QUẦN SHORT KAKI NÂU (có cạp, túi, khuy, đường may) ----------------
    function buildShorts() {
        const group = new THREE.Group();
        const COLOR = 0x4d3627;
        const bodyMat = makeFabricMaterial('twill', COLOR, 10, 6, 0.9, 0.88);
        const legMat = makeFabricMaterial('twill', COLOR, 8, 7, 0.9, 0.88);
        const bandMat = makeFabricMaterial('twill', 0x42301f, 14, 1, 0.9, 0.88);
        const threadMat = new THREE.MeshStandardMaterial({ color: srgbColor(0x2d1a10), roughness: 0.8 });
        const stitchMat = new THREE.MeshStandardMaterial({ color: srgbColor(0x8a6446), roughness: 0.8 });
        const buttonMat = new THREE.MeshStandardMaterial({ color: srgbColor(0xb08d57), roughness: 0.35, metalness: 0.85 });

        const Y_TOP = 0.62, Y_BAND = 0.575, Y_CROTCH = 0.26;
        const rxS = (y) => {
            const t = Math.max(0, Math.min(1, (y - Y_CROTCH) / (Y_TOP - Y_CROTCH)));
            return (0.164 + 0.026 * Math.sin(Math.PI * t) + 0.004 * t) * (0.80 + 0.20 * ss(0.27, 0.42, y));
        };
        const rzS = (y) => {
            const t = Math.max(0, Math.min(1, (y - Y_CROTCH) / (Y_TOP - Y_CROTCH)));
            return (0.106 + 0.018 * Math.sin(Math.PI * t) + 0.002 * t) * (0.25 + 0.75 * ss(0.27, 0.42, y));
        };
        const surf = (x, y, sign, off) => {
            const rx = rxS(y), rz = rzS(y);
            const q = Math.max(0, 1 - (x / rx) * (x / rx));
            return new THREE.Vector3(x, y, sign * (rz * Math.sqrt(q) + off));
        };

        // Thân hông
        const bRows = 16, segs = 80;
        const bSecs = [];
        for (let i = 0; i < bRows; i++) {
            const y = Y_TOP - (i / (bRows - 1)) * (Y_TOP - Y_CROTCH);
            bSecs.push({
                c: new THREE.Vector3(0, y, 0),
                u: new THREE.Vector3(rxS(y), 0, 0),
                v: new THREE.Vector3(0, 0, rzS(y))
            });
        }
        const body = makeLoft(bSecs, segs);
        const BP = body.attributes.position;
        for (let k = 0; k < BP.count; k++) {
            const x = BP.getX(k), y = BP.getY(k), z = BP.getZ(k);
            const env = 0.45 + 0.9 * (1 - ss(0.28, 0.6, y));
            const d = env * (0.010 * fbm(x * 9, y * 4, z * 9) + 0.003 * fbm(x * 26, y * 14, z * 26));
            const rl = Math.hypot(x, z) || 1;
            BP.setXYZ(k, x + (x / rl) * d, y, z + (z / rl) * d);
        }
        finishLoft(body, bRows, segs);
        group.add(new THREE.Mesh(body, bodyMat));

        // Cạp quần
        const wSecs = [];
        for (let i = 0; i < 4; i++) {
            const y = Y_TOP - (i / 3) * (Y_TOP - Y_BAND);
            wSecs.push({
                c: new THREE.Vector3(0, y, 0),
                u: new THREE.Vector3(rxS(y) + 0.005, 0, 0),
                v: new THREE.Vector3(0, 0, rzS(y) + 0.005)
            });
        }
        const band = makeLoft(wSecs, segs);
        finishLoft(band, 4, segs);
        group.add(new THREE.Mesh(band, bandMat));
        group.add(tubeAlong(ringPointsOf(band, 0, segs), true, 0.0035, bandMat));
        group.add(tubeAlong(ringPointsOf(band, 3, segs), true, 0.0028, threadMat));

        // Hai ống quần
        const lRows = 18, lSegs = 64;
        [-1, 1].forEach((side) => {
            const secs = [];
            for (let i = 0; i < lRows; i++) {
                const t = i / (lRows - 1);
                const y = 0.40 - t * 0.40;
                secs.push({
                    c: new THREE.Vector3(side * (0.080 + 0.014 * t), y, 0),
                    u: new THREE.Vector3(0.093 + 0.007 * t, 0, 0),
                    v: new THREE.Vector3(0, 0, 0.113 - 0.001 * t)
                });
            }
            const leg = makeLoft(secs, lSegs);
            const LP = leg.attributes.position;
            for (let k = 0; k < LP.count; k++) {
                const x = LP.getX(k), y = LP.getY(k), z = LP.getZ(k);
                const a = Math.atan2(z, x - side * 0.087);
                const d = (0.010 * fbm(x * 8, y * 3.2, z * 8 + side * 5) + 0.003 * fbm(x * 26, y * 14, z * 26)) * (0.6 + 0.8 * (1 - ss(0.0, 0.4, y)))
                    + 0.0025 * Math.sin(a * 4 + y * 22);
                const cx = side * 0.087;
                const rl = Math.hypot(x - cx, z) || 1;
                LP.setXYZ(k, x + ((x - cx) / rl) * d, y, z + (z / rl) * d);
            }
            finishLoft(leg, lRows, lSegs);
            group.add(new THREE.Mesh(leg, legMat));
            group.add(tubeAlong(ringPointsOf(leg, lRows - 1, lSegs), true, 0.005, legMat));

            // Đường may gấu ống quần
            const hemPts = [];
            for (let j = 0; j < 48; j++) {
                const a = (j / 48) * Math.PI * 2;
                const y = 0.04;
                const t = (0.40 - y) / 0.40;
                hemPts.push(new THREE.Vector3(
                    side * (0.080 + 0.014 * t) + Math.cos(a) * (0.093 + 0.007 * t + 0.0015),
                    y,
                    Math.sin(a) * (0.113 - 0.001 * t + 0.0015)
                ));
            }
            group.add(tubeAlong(hemPts, true, 0.0018, stitchMat));
        });

        // Đường may khóa kéo (fly) + khuy
        const flyPts = [];
        for (let k = 0; k <= 8; k++) {
            const t = k / 8;
            const y = Y_BAND - 0.002 - t * 0.14;
            const x = t > 0.55 ? (t - 0.55) * 0.07 : 0;
            flyPts.push(surf(x, y, 1, 0.0015));
        }
        group.add(tubeAlong(flyPts, false, 0.0022, stitchMat));

        const button = new THREE.Mesh(new THREE.CylinderGeometry(0.011, 0.011, 0.005, 24), buttonMat);
        button.rotation.x = Math.PI / 2;
        const bp = surf(0, 0.598, 1, 0.006);
        button.position.copy(bp);
        group.add(button);

        // Túi chéo phía trước
        [-1, 1].forEach((side) => {
            const pts = [
                surf(side * 0.105, 0.572, 1, 0.0015),
                surf(side * 0.130, 0.545, 1, 0.0015),
                surf(side * 0.155, 0.505, 1, 0.0015),
                surf(side * 0.171, 0.455, 1, 0.0015)
            ];
            group.add(tubeAlong(pts, false, 0.0024, threadMat));
        });

        // Túi sau (đường may viền chữ nhật bo góc)
        [-1, 1].forEach((side) => {
            const cx = side * 0.075, cy = 0.50, hw = 0.045, hh = 0.042;
            const pts = [];
            const corners = [[-hw, hh], [hw, hh], [hw, -hh], [-hw, -hh]];
            for (let c = 0; c < 4; c++) {
                const a = corners[c], b = corners[(c + 1) % 4];
                for (let s = 0; s < 6; s++) {
                    const t = s / 6;
                    pts.push(surf(cx + a[0] + (b[0] - a[0]) * t, cy + a[1] + (b[1] - a[1]) * t, -1, 0.0015));
                }
            }
            group.add(tubeAlong(pts, true, 0.0020, stitchMat));
        });

        // Dây đai
        for (let i = 0; i < 5; i++) {
            const th = Math.PI / 2 + (i - 2) * 0.62 + (i >= 3 ? 0 : 0);
            const rx = rxS(0.60) + 0.005, rz = rzS(0.60) + 0.005;
            const px = rx * Math.cos(th), pz = rz * Math.sin(th);
            const n = new THREE.Vector3(Math.cos(th) / rx, 0, Math.sin(th) / rz).normalize();
            const loop = new THREE.Mesh(new THREE.BoxGeometry(0.014, 0.08, 0.006), bandMat);
            loop.position.set(px + n.x * 0.003, 0.595, pz + n.z * 0.003);
            loop.rotation.y = Math.atan2(n.x, n.z);
            group.add(loop);
        }
        return group;
    }

    // --- 6. Nạp 3 món đồ 3D (Trái: Quần short | Giữa: Áo thun | Phải: Giày) ---
    function loadAll3DModels() {
        MODEL_CONFIGS.forEach((cfg, idx) => {
            if (cfg.procedural) {
                const g = cfg.id === 'ao' ? buildTee() : buildShorts();
                setup3DModelInstance(g, cfg, idx);
            }
        });

        const need = MODEL_CONFIGS.some((c) => !c.procedural);
        if (!need) return;
        if (typeof THREE.GLTFLoader === 'undefined') {
            setTimeout(loadAll3DModels_gltf, 100);
            return;
        }
        loadAll3DModels_gltf();
    }

    function loadAll3DModels_gltf() {
        if (typeof THREE.GLTFLoader === 'undefined') {
            setTimeout(loadAll3DModels_gltf, 100);
            return;
        }
        const loader = new THREE.GLTFLoader();
        MODEL_CONFIGS.forEach((cfg, idx) => {
            if (cfg.procedural) return;
            loader.load(cfg.modelUrl, (gltf) => {
                setup3DModelInstance(gltf.scene, cfg, idx);
            });
        });
    }

    function setup3DModelInstance(modelScene, cfg, idx) {
        const box = new THREE.Box3().setFromObject(modelScene);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());

        const scaleFactor = cfg.targetHeight / (size.y || 1);
        modelScene.scale.set(scaleFactor, scaleFactor, scaleFactor);
        modelScene.position.x = -center.x * scaleFactor;
        modelScene.position.y = -center.y * scaleFactor;
        modelScene.position.z = -center.z * scaleFactor;

        const maxAniso = renderer ? renderer.capabilities.getMaxAnisotropy() : 4;

        // Giày Sneaker: giữ nguyên cấu hình PBR chân thật. Áo & Quần là hình học 3D tự dựng nên giữ nguyên vật liệu vải.
        if (!cfg.procedural) {
            modelScene.traverse((child) => {
                if (child.isMesh && child.material) {
                    child.material = child.material.clone();
                    if (child.material.map) {
                        child.material.map.encoding = THREE.sRGBEncoding;
                        child.material.map.anisotropy = maxAniso;
                        child.material.map.needsUpdate = true;
                    }
                    if (child.material.normalMap) {
                        child.material.normalMap.anisotropy = maxAniso;
                        if (cfg.normalRepeat) {
                            child.material.normalMap.wrapS = THREE.RepeatWrapping;
                            child.material.normalMap.wrapT = THREE.RepeatWrapping;
                            child.material.normalMap.repeat.set(cfg.normalRepeat, cfg.normalRepeat);
                            child.material.normalMap.needsUpdate = true;
                        }
                        if (cfg.normalScale !== undefined) {
                            child.material.normalScale = new THREE.Vector2(cfg.normalScale, cfg.normalScale);
                        }
                    }
                    if (child.material.aoMap) {
                        child.material.aoMap.anisotropy = maxAniso;
                        if (cfg.aoStrength !== undefined) {
                            child.material.aoMapIntensity = cfg.aoStrength;
                        }
                    }
                    if (child.material.roughnessMap) {
                        child.material.roughnessMap.anisotropy = maxAniso;
                    }
                    child.material.roughness = cfg.roughness !== undefined ? cfg.roughness : 0.38;
                    child.material.metalness = cfg.metalness !== undefined ? cfg.metalness : 0.08;
                    child.material.side = THREE.DoubleSide;
                    child.material.transparent = false;
                    child.material.opacity = 1.0;
                    child.material.depthWrite = true;
                    child.material.depthTest = true;
                    child.material.needsUpdate = true;
                }
            });
        }

        const wrapper = new THREE.Group();
        wrapper.add(modelScene);
        wrapper.position.set(cfg.posX, cfg.posY, cfg.posZ);
        wrapper.rotation.set(cfg.baseRotX, cfg.baseRotY, cfg.baseRotZ);
        wrapper.userData = { config: cfg, index: idx };

        scene.add(wrapper);
        itemWrappers[idx] = wrapper;

        addContactShadow(cfg);
    }

    // --- 7. Render Loop: Mặt nước gợn sóng & Không gian 3D tương tác thời gian thực ---
    function render() {
        if (!isPortalOpen) return;

        const time = performance.now() * 0.001;

        // Cập nhật sóng nước thời gian thực
        if (stageUniforms) {
            stageUniforms.uTime.value = time;
        }

        // 1. Chuyển động lơ lửng & XOAY 3D NHẸ theo chuột cho Quần (Trái), Áo (Giữa), Giày (Phải)
        if (isInspectingShirt && itemWrappers[1]) {
            if (isAutoRotatingShirt) {
                itemWrappers[1].rotation.y += 0.0075;
            }
        }

        itemWrappers.forEach((wrapper, idx) => {
            if (!wrapper) return;
            const cfg = wrapper.userData.config;

            const floatOffset = Math.sin(time * 1.55 + idx * 1.4) * 0.038;
            wrapper.position.y = cfg.posY + floatOffset;

            // Xoay nhịp thở 3D + nghiêng xoay 3D mượt mà theo vị trí con trỏ chuột
            const breathRotY = Math.sin(time * 1.1 + idx * 1.3) * 0.055;
            const breathRotX = Math.cos(time * 0.9 + idx * 1.1) * 0.02;

            const mouseRotY = (mouse.x - (cfg.posX / 3.0)) * 0.28;
            const mouseRotX = (mouse.y - (cfg.posY / 2.2)) * 0.11;

            wrapper.rotation.y = cfg.baseRotY + breathRotY + mouseRotY + (window.location.hash.indexOf('spin') >= 0 ? 2.5 : 0);
            wrapper.rotation.x = cfg.baseRotX + breathRotX - mouseRotX;
        });

        // 2. Chuyển động Camera 3D Perspective thật khi di chuột (như trong video 1107.mp4)
        if (!isDragging) {
            mouse.x += (mouse.targetX - mouse.x) * 0.065;
            mouse.y += (mouse.targetY - mouse.y) * 0.065;

            const targetCamX = mouse.x * 0.95;
            const targetCamY = 0.10 - mouse.y * 0.28;

            camera.position.x += (targetCamX - camera.position.x) * 0.065;
            camera.position.y += (targetCamY - camera.position.y) * 0.065;
            camera.lookAt(0, -0.05, 0.0);
        }

        // 3. Bắt sự kiện trỏ chuột vào từng món đồ
        updateRaycasting();

        // Hiệu ứng ánh sáng cột & nước theo món đồ đang trỏ chuột
        if (stageUniforms) {
            if (centerRedLight) centerRedLight.intensity = 0.55 + 1.0 * stageUniforms.uRedMood.value + 0.5 * stageUniforms.uLeftMood.value;
            if (rightWhiteLight) rightWhiteLight.intensity = 0.5 + 0.9 * stageUniforms.uWhiteMood.value;
        }

        updateReflection();
        renderer.render(scene, camera);
        animId = requestAnimationFrame(render);
    }

    function updateRaycasting() {
        if (!camera) return;

        raycaster.setFromCamera(mouseNormalized, camera);

        const hitMeshes = [];
        itemWrappers.forEach((w) => {
            if (w) w.traverse((c) => { if (c.isMesh) hitMeshes.push(c); });
        });

        const intersects = raycaster.intersectObjects(hitMeshes);

        if (intersects.length > 0) {
            let hitWrapper = intersects[0].object;
            while (hitWrapper.parent && !hitWrapper.userData?.config) {
                hitWrapper = hitWrapper.parent;
            }

            if (hitWrapper?.userData?.config) {
                const hitIdx = hitWrapper.userData.index;
                if (activeHoveredIndex !== hitIdx) {
                    activeHoveredIndex = hitIdx;
                    onItemHoverStart(hitWrapper, hitIdx);
                }
                updateHoverTagPosition(hitWrapper);
            }
        } else {
            if (activeHoveredIndex !== -1) {
                onItemHoverEnd();
                activeHoveredIndex = -1;
            }
        }
    }

    function onItemHoverStart(wrapper, idx) {
        const cfg = wrapper.userData.config;

        itemWrappers.forEach((otherW, otherIdx) => {
            if (!otherW) return;
            if (otherIdx === idx) {
                if (window.gsap) {
                    gsap.to(otherW.scale, { x: 1.07, y: 1.07, z: 1.07, duration: 0.32, ease: 'power2.out' });
                } else {
                    otherW.scale.set(1.07, 1.07, 1.07);
                }
            } else {
                if (window.gsap) {
                    gsap.to(otherW.scale, { x: 0.95, y: 0.95, z: 0.95, duration: 0.32, ease: 'power2.out' });
                } else {
                    otherW.scale.set(0.95, 0.95, 0.95);
                }
            }
        });

        // Đổi màu ánh sáng Cột & Phòng theo đúng hiệu ứng trong video 1107.mp4
        if (stageUniforms && window.gsap) {
            gsap.to(stageUniforms.uRedMood, { value: cfg.hoverMood === 'center' ? 1.0 : 0.0, duration: 0.45, ease: 'power2.out' });
            gsap.to(stageUniforms.uWhiteMood, { value: cfg.hoverMood === 'right' ? 1.0 : 0.0, duration: 0.45, ease: 'power2.out' });
            gsap.to(stageUniforms.uLeftMood, { value: cfg.hoverMood === 'left' ? 1.0 : 0.0, duration: 0.45, ease: 'power2.out' });
        }

        if (hoverTagEl && hoverCatEl && hoverNameEl) {
            hoverCatEl.textContent = cfg.category;
            hoverNameEl.textContent = cfg.name;
            hoverTagEl.classList.add('is-visible');
        }

        canvasEl.style.cursor = 'pointer';
    }

    function onItemHoverEnd() {
        itemWrappers.forEach((w) => {
            if (!w) return;
            if (window.gsap) {
                gsap.to(w.scale, { x: 1, y: 1, z: 1, duration: 0.32, ease: 'power2.out' });
            } else {
                w.scale.set(1, 1, 1);
            }
        });

        if (stageUniforms && window.gsap) {
            gsap.to(stageUniforms.uRedMood, { value: 0.0, duration: 0.45, ease: 'power2.out' });
            gsap.to(stageUniforms.uWhiteMood, { value: 0.0, duration: 0.45, ease: 'power2.out' });
            gsap.to(stageUniforms.uLeftMood, { value: 0.0, duration: 0.45, ease: 'power2.out' });
        }

        if (hoverTagEl) {
            hoverTagEl.classList.remove('is-visible');
        }

        canvasEl.style.cursor = 'grab';
    }

    function updateHoverTagPosition(wrapper) {
        if (!hoverTagEl) return;
        const pos = wrapper.position.clone();
        pos.y += wrapper.userData.config.targetHeight * 0.54;

        pos.project(camera);
        const screenX = (pos.x * 0.5 + 0.5) * window.innerWidth;
        const screenY = (-(pos.y * 0.5) + 0.5) * window.innerHeight;

        hoverTagEl.style.left = `${screenX}px`;
        hoverTagEl.style.top = `${screenY}px`;
    }

    // --- Nhấp chọn món đồ để đi tiếp vào danh mục tương ứng ---
    function onItemClick() {
        if (activeHoveredIndex === -1) return;
        const wrapper = itemWrappers[activeHoveredIndex];
        if (!wrapper) return;

        const cfg = wrapper.userData.config;

        // Bật chế độ soi chi tiết Áo thun treo móc thực tế (như video FraxBIT)
        if (cfg.id === 'ao') {
            openShirtInspectionStage(wrapper, cfg);
            return;
        }

        if (flashEl) {
            flashEl.classList.add('is-flashing');
            setTimeout(() => flashEl.classList.remove('is-flashing'), 400);
        }

        if (window.gsap) {
            gsap.to(camera.position, {
                x: cfg.posX,
                y: cfg.posY + 0.08,
                z: cfg.posZ + 1.95,
                duration: 0.55,
                ease: 'power3.in',
                onComplete: () => {
                    window.location.href = cfg.target;
                }
            });
        } else {
            window.location.href = cfg.target;
        }
    }

    // --- Sự kiện chuột ---
    function onMouseMove(e) {
        mouse.targetX = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.targetY = (e.clientY / window.innerHeight) * 2 - 1;

        mouseNormalized.x = (e.clientX / window.innerWidth) * 2 - 1;
        mouseNormalized.y = -(e.clientY / window.innerHeight) * 2 + 1;

        if (isDragging) {
            const deltaX = e.clientX - previousMousePosition.x;
            const deltaY = e.clientY - previousMousePosition.y;

            if (isInspectingShirt && itemWrappers[1]) {
                // Xoay tự do áo theo cử chỉ kéo rê chuột
                itemWrappers[1].rotation.y += deltaX * 0.012;
            } else {
                camera.position.x -= deltaX * 0.0045;
                camera.position.y += deltaY * 0.0045;
                camera.position.x = Math.max(-2.0, Math.min(2.0, camera.position.x));
                camera.position.y = Math.max(-0.25, Math.min(1.0, camera.position.y));
                camera.lookAt(0, -0.05, 0.0);
            }

            previousMousePosition = { x: e.clientX, y: e.clientY };
        }
    }

    function onMouseDown(e) {
        if (e.target !== canvasEl) return;
        isDragging = true;
        previousMousePosition = { x: e.clientX, y: e.clientY };
    }

    function onMouseUp(e) {
        isDragging = false;
        if (e.target === canvasEl && activeHoveredIndex !== -1) {
            onItemClick();
        }
    }

    function onResize() {
        if (!camera || !renderer) return;
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        if (reflRT) reflRT.setSize(Math.floor(window.innerWidth * 0.75), Math.floor(window.innerHeight * 0.75));
    }

    // --- Mở / Đóng Showroom với hiệu ứng Zoom-Out từ cột giữa chuẩn video 1107.mp4 ---
    function openPortal() {
        if (!portalEl) return;
        isPortalOpen = true;

        portalEl.classList.add('is-active');
        portalEl.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';

        if (!renderer) {
            initThreeScene();
        }

        onResize();
        cancelAnimationFrame(animId);
        render();

        if (window.gsap) {
            camera.position.set(0, 0.12, 3.20);
            camera.fov = 26;
            camera.updateProjectionMatrix();

            gsap.to(camera.position, {
                x: 0,
                y: 0.10,
                z: 4.65,
                duration: (window.location.hash === '#nozoom' ? 0.01 : 1.25),
                ease: 'power3.out'
            });

            gsap.to(camera, {
                fov: 34,
                duration: (window.location.hash === '#nozoom' ? 0.01 : 1.25),
                ease: 'power3.out',
                onUpdate: () => camera.updateProjectionMatrix()
            });

            gsap.fromTo('.hnmt-portal-header, .hnmt-portal-footer', { opacity: 0 }, { opacity: 1, duration: 0.8, delay: 0.2 });
        }
    }

    function closePortal() {
        if (!portalEl) return;

        if (window.gsap) {
            gsap.to(portalEl, {
                opacity: 0,
                duration: 0.35,
                ease: 'power2.in',
                onComplete: () => {
                    isPortalOpen = false;
                    portalEl.classList.remove('is-active');
                    portalEl.style.opacity = '';
                    portalEl.setAttribute('aria-hidden', 'true');
                    document.body.style.overflow = '';
                    cancelAnimationFrame(animId);

                    if (window.location.pathname.toLowerCase().startsWith('/products') && !window.location.search) {
                        window.location.href = '/';
                    }
                }
            });
        } else {
            isPortalOpen = false;
            portalEl.classList.remove('is-active');
            portalEl.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
            cancelAnimationFrame(animId);
        }
    }

    // --- Bắt sự kiện click vào bất kỳ Danh Mục hoặc Cửa Hàng ---
    function bindTriggers() {
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a, .cat-card, [data-open-chile-portal]');
            if (!link) return;

            if (link.closest('#hnmtChilePortal')) return;

            const href = (link.getAttribute('href') || '').trim();
            const isCategoryCard = link.classList.contains('cat-card') || link.closest('#categories') !== null;
            const isStoreNav =
                href === '/Products' ||
                href === '/Products/Index' ||
                href.startsWith('/Products#') ||
                link.hasAttribute('data-open-chile-portal');

            if (isCategoryCard || isStoreNav) {
                e.preventDefault();
                e.stopPropagation();
                openPortal();
            }
        }, true);

        const path = window.location.pathname.toLowerCase();
        const search = window.location.search.toLowerCase();
        if ((path === '/products' || path === '/products/index') && !search.includes('search=') && !search.includes('category=') && !search.includes('view=')) {
            setTimeout(openPortal, 60);
        }
    }
    // ==============================================================================
    // 6b. CHẾ ĐỘ SOI ÁO THUN TREO MÓC 3D & BẢNG ĐIỀU KHIỂN SẢN PHẨM (KẾT NỐI DATABASE)
    // ==============================================================================
    let isInspectingShirt = false;
    let isAutoRotatingShirt = true;
    let currentShirtData = null;
    let selectedColorName = 'Trắng';
    let selectedSizeName = 'M';
    let selectedVariantId = null;

    let shirtDrawerEl = null;
    let shirtControlsBarEl = null;
    let shirtToastEl = null;
    let shirtBackBtnEl = null;
    let shirtTitleEl = null;
    let shirtPriceEl = null;
    let shirtDescEl = null;
    let shirtCatTagEl = null;
    let shirtStockBadgeEl = null;
    let shirtSelectedColorNameEl = null;
    let shirtSelectedStockEl = null;
    let shirtColorSwatchesEl = null;
    let shirtSizePillsEl = null;
    let shirtModelSwitcherEl = null;
    let shirtAddToCartBtnEl = null;
    let shirtBuyNowBtnEl = null;

    const INSPECT_CAM_POS = { x: -0.42, y: -0.16, z: 2.25 };

    function initShirtInspectionDOM() {
        shirtDrawerEl = document.getElementById('shirtInspectionDrawer');
        shirtControlsBarEl = document.getElementById('shirtControlsBar');
        shirtToastEl = document.getElementById('shirtToast');
        shirtBackBtnEl = document.getElementById('shirtBackToStageBtn');
        shirtTitleEl = document.getElementById('shirtTitle');
        shirtPriceEl = document.getElementById('shirtPrice');
        shirtDescEl = document.getElementById('shirtDescription');
        shirtCatTagEl = document.getElementById('shirtCategoryTag');
        shirtStockBadgeEl = document.getElementById('shirtStockBadge');
        shirtSelectedColorNameEl = document.getElementById('shirtSelectedColorName');
        shirtSelectedStockEl = document.getElementById('shirtSelectedStock');
        shirtColorSwatchesEl = document.getElementById('shirtColorSwatches');
        shirtSizePillsEl = document.getElementById('shirtSizePills');
        shirtModelSwitcherEl = document.getElementById('shirtModelSwitcher');
        shirtAddToCartBtnEl = document.getElementById('shirtAddToCartBtn');
        shirtBuyNowBtnEl = document.getElementById('shirtBuyNowBtn');

        if (shirtBackBtnEl) {
            shirtBackBtnEl.addEventListener('click', closeShirtInspectionStage);
        }

        if (shirtAddToCartBtnEl) {
            shirtAddToCartBtnEl.addEventListener('click', () => addShirtToCart(false));
        }

        if (shirtBuyNowBtnEl) {
            shirtBuyNowBtnEl.addEventListener('click', () => addShirtToCart(true));
        }

        // Bắt sự kiện thanh công cụ góc nhìn 3D
        const btnRotate = document.getElementById('ctrlBtnRotate360');
        const btnFront = document.getElementById('ctrlBtnFront');
        const btnBack = document.getElementById('ctrlBtnBack');
        const btnZoom = document.getElementById('ctrlBtnZoomFabric');

        if (btnRotate) {
            btnRotate.addEventListener('click', () => {
                isAutoRotatingShirt = !isAutoRotatingShirt;
                btnRotate.classList.toggle('is-active', isAutoRotatingShirt);
            });
            btnRotate.classList.add('is-active');
        }

        if (btnFront) {
            btnFront.addEventListener('click', () => {
                isAutoRotatingShirt = false;
                if (btnRotate) btnRotate.classList.remove('is-active');
                if (itemWrappers[1]) {
                    if (window.gsap) gsap.to(itemWrappers[1].rotation, { y: 0.0, duration: 0.6, ease: 'power2.out' });
                    else itemWrappers[1].rotation.y = 0.0;
                }
            });
        }

        if (btnBack) {
            btnBack.addEventListener('click', () => {
                isAutoRotatingShirt = false;
                if (btnRotate) btnRotate.classList.remove('is-active');
                if (itemWrappers[1]) {
                    if (window.gsap) gsap.to(itemWrappers[1].rotation, { y: Math.PI, duration: 0.6, ease: 'power2.out' });
                    else itemWrappers[1].rotation.y = Math.PI;
                }
            });
        }

        if (btnZoom) {
            let isZoomed = false;
            btnZoom.addEventListener('click', () => {
                isZoomed = !isZoomed;
                btnZoom.classList.toggle('is-active', isZoomed);
                const targetZ = isZoomed ? 1.48 : INSPECT_CAM_POS.z;
                const targetY = isZoomed ? -0.22 : INSPECT_CAM_POS.y;
                if (window.gsap) {
                    gsap.to(camera.position, { z: targetZ, y: targetY, duration: 0.7, ease: 'power2.out' });
                } else {
                    camera.position.z = targetZ;
                    camera.position.y = targetY;
                }
            });
        }
    }

    function openShirtInspectionStage(wrapper, cfg) {
        isInspectingShirt = true;
        isAutoRotatingShirt = true;

        const promptEl = document.querySelector('.hnmt-portal-footer');
        if (promptEl) promptEl.style.opacity = '0';

        if (window.gsap) {
            gsap.to(camera.position, {
                x: INSPECT_CAM_POS.x,
                y: INSPECT_CAM_POS.y,
                z: INSPECT_CAM_POS.z,
                duration: 0.95,
                ease: 'power3.out'
            });

            if (itemWrappers[0]) gsap.to(itemWrappers[0].position, { x: -3.6, duration: 0.8, ease: 'power3.inOut' });
            if (itemWrappers[2]) gsap.to(itemWrappers[2].position, { x: 3.6, duration: 0.8, ease: 'power3.inOut' });

            gsap.to(wrapper.position, {
                x: -0.42,
                y: -0.25,
                z: 0.90,
                duration: 0.9,
                ease: 'power3.out'
            });
        } else {
            camera.position.set(INSPECT_CAM_POS.x, INSPECT_CAM_POS.y, INSPECT_CAM_POS.z);
            if (itemWrappers[0]) itemWrappers[0].position.x = -3.6;
            if (itemWrappers[2]) itemWrappers[2].position.x = 3.6;
            wrapper.position.set(-0.42, -0.25, 0.90);
        }

        if (shirtDrawerEl) {
            shirtDrawerEl.classList.add('is-active');
            shirtDrawerEl.setAttribute('aria-hidden', 'false');
        }
        if (shirtControlsBarEl) {
            shirtControlsBarEl.classList.add('is-active');
            shirtControlsBarEl.setAttribute('aria-hidden', 'false');
        }

        fetchShirtProductData('oversize-streetwear-tee-clean-white');
    }

    function closeShirtInspectionStage() {
        isInspectingShirt = false;

        const promptEl = document.querySelector('.hnmt-portal-footer');
        if (promptEl) promptEl.style.opacity = '1';

        if (shirtDrawerEl) {
            shirtDrawerEl.classList.remove('is-active');
            shirtDrawerEl.setAttribute('aria-hidden', 'true');
        }
        if (shirtControlsBarEl) {
            shirtControlsBarEl.classList.remove('is-active');
            shirtControlsBarEl.setAttribute('aria-hidden', 'true');
        }

        if (window.gsap) {
            gsap.to(camera.position, {
                x: 0,
                y: 0.10,
                z: 4.65,
                duration: 0.85,
                ease: 'power3.out'
            });

            if (itemWrappers[0]) gsap.to(itemWrappers[0].position, { x: MODEL_CONFIGS[0].posX, duration: 0.85, ease: 'power3.out' });
            if (itemWrappers[1]) gsap.to(itemWrappers[1].position, { x: MODEL_CONFIGS[1].posX, y: MODEL_CONFIGS[1].posY, z: MODEL_CONFIGS[1].posZ, duration: 0.85, ease: 'power3.out' });
            if (itemWrappers[2]) gsap.to(itemWrappers[2].position, { x: MODEL_CONFIGS[2].posX, duration: 0.85, ease: 'power3.out' });
        } else {
            camera.position.set(0, 0.10, 4.65);
            if (itemWrappers[0]) itemWrappers[0].position.x = MODEL_CONFIGS[0].posX;
            if (itemWrappers[1]) itemWrappers[1].position.set(MODEL_CONFIGS[1].posX, MODEL_CONFIGS[1].posY, MODEL_CONFIGS[1].posZ);
            if (itemWrappers[2]) itemWrappers[2].position.x = MODEL_CONFIGS[2].posX;
        }
    }

    async function fetchShirtProductData(slug, id) {
        try {
            const url = slug ? `/Products/GetProduct3DData?slug=${encodeURIComponent(slug)}` : `/Products/GetProduct3DData?id=${id}`;
            const res = await fetch(url);
            if (!res.ok) throw new Error('Failed to fetch 3D product');
            const data = await res.json();
            if (!data.success) return;

            currentShirtData = data;
            renderShirtProductUI(data);
        } catch (err) {
            console.warn('[3D Shirt Atelier Data Fetch Warning]:', err);
        }
    }

    function renderShirtProductUI(data) {
        if (shirtTitleEl) shirtTitleEl.textContent = data.name;
        if (shirtPriceEl) shirtPriceEl.textContent = data.priceFormatted;
        if (shirtDescEl) shirtDescEl.textContent = data.description;
        if (shirtCatTagEl) shirtCatTagEl.textContent = '02 // ' + data.categoryName.toUpperCase();

        if (shirtColorSwatchesEl && data.colors) {
            shirtColorSwatchesEl.innerHTML = '';
            data.colors.forEach((c, idx) => {
                const sw = document.createElement('div');
                sw.className = `hnmt-color-swatch ${c.name === selectedColorName || idx === 0 ? 'is-selected' : ''}`;
                sw.style.backgroundColor = c.code;
                sw.title = c.name;
                sw.addEventListener('click', () => {
                    document.querySelectorAll('.hnmt-color-swatch').forEach(el => el.classList.remove('is-selected'));
                    sw.classList.add('is-selected');
                    selectedColorName = c.name;
                    if (shirtSelectedColorNameEl) shirtSelectedColorNameEl.textContent = c.name;
                    applyShirtColorTint(c.tint);
                    updateSelectedVariant();
                });
                shirtColorSwatchesEl.appendChild(sw);
            });
            if (data.colors.length > 0 && shirtSelectedColorNameEl) {
                shirtSelectedColorNameEl.textContent = data.colors[0].name;
            }
        }

        if (shirtSizePillsEl && data.sizes) {
            shirtSizePillsEl.innerHTML = '';
            data.sizes.forEach((s, idx) => {
                const pill = document.createElement('button');
                pill.type = 'button';
                pill.className = `hnmt-size-pill ${s === selectedSizeName || idx === 0 ? 'is-selected' : ''}`;
                pill.textContent = s;
                pill.addEventListener('click', () => {
                    document.querySelectorAll('.hnmt-size-pill').forEach(el => el.classList.remove('is-selected'));
                    pill.classList.add('is-selected');
                    selectedSizeName = s;
                    updateSelectedVariant();
                });
                shirtSizePillsEl.appendChild(pill);
            });
            if (data.sizes.length > 0) selectedSizeName = data.sizes[0];
        }

        if (shirtModelSwitcherEl) {
            shirtModelSwitcherEl.innerHTML = '';
            const models = [
                { id: 259, name: 'Oversize Clean White', slug: 'oversize-streetwear-tee-clean-white', price: '290.000 ₫' },
                { id: 258, name: 'Vintage Boxy Charcoal', slug: 'vintage-washed-boxy-tee-charcoal', price: '320.000 ₫' },
                { id: 257, name: 'Heavyweight Hoodie Grey', slug: 'heavyweight-boxy-hoodie-ash-grey', price: '550.000 ₫' }
            ];

            models.forEach(m => {
                const card = document.createElement('div');
                card.className = `hnmt-other-shirt-card ${m.slug === data.slug ? 'is-active' : ''}`;
                card.innerHTML = `
                    <span class="hnmt-other-shirt-title">${m.name}</span>
                    <span class="hnmt-other-shirt-price">${m.price}</span>
                `;
                card.addEventListener('click', () => {
                    fetchShirtProductData(m.slug);
                });
                shirtModelSwitcherEl.appendChild(card);
            });
        }

        updateSelectedVariant();
    }

    function updateSelectedVariant() {
        if (!currentShirtData || !currentShirtData.variants) return;
        const v = currentShirtData.variants.find(item => 
            item.size.toLowerCase() === selectedSizeName.toLowerCase() &&
            item.color.toLowerCase() === selectedColorName.toLowerCase()
        ) || currentShirtData.variants.find(item => item.size.toLowerCase() === selectedSizeName.toLowerCase()) || currentShirtData.variants[0];

        if (v) {
            selectedVariantId = v.id;
            if (shirtSelectedStockEl) {
                shirtSelectedStockEl.textContent = v.stock > 0 ? `Còn ${v.stock} sản phẩm` : 'Tạm hết hàng';
                shirtSelectedStockEl.style.color = v.stock > 0 ? '#2ed573' : '#ff4757';
            }
        }
    }

    function applyShirtColorTint(tint) {
        if (!itemWrappers[1]) return;
        itemWrappers[1].traverse(child => {
            if (child.isMesh && child.material && child.geometry?.attributes?.position?.count > 5000) {
                if (window.gsap) {
                    gsap.to(child.material.color, {
                        r: tint[0],
                        g: tint[1],
                        b: tint[2],
                        duration: 0.35,
                        ease: 'power2.out'
                    });
                } else {
                    child.material.color.setRGB(tint[0], tint[1], tint[2]);
                }
            }
        });
    }

    async function addShirtToCart(buyNow = false) {
        if (!currentShirtData || !selectedVariantId) return;

        try {
            const payload = {
                productId: currentShirtData.id,
                variantId: selectedVariantId,
                quantity: 1
            };

            const res = await fetch('/Cart/AddAjax', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                const resData = await res.json();
                showShirtToast(`Đã thêm ${currentShirtData.name}`, `Size ${selectedSizeName} · Màu ${selectedColorName}`);
                
                const cartBadges = document.querySelectorAll('.cart-count, #cartCountBadge, .badge-cart');
                cartBadges.forEach(badge => {
                    badge.textContent = resData.cartCount || (parseInt(badge.textContent || '0', 10) + 1);
                });

                if (buyNow) {
                    setTimeout(() => {
                        window.location.href = '/Cart';
                    }, 400);
                }
            }
        } catch (e) {
            console.error('Cart add error:', e);
        }
    }

    function showShirtToast(title, desc) {
        if (!shirtToastEl) return;
        const tTitle = document.getElementById('shirtToastTitle');
        const tDesc = document.getElementById('shirtToastDesc');
        if (tTitle) tTitle.textContent = title;
        if (tDesc) tDesc.textContent = desc;

        shirtToastEl.classList.add('is-visible');
        shirtToastEl.setAttribute('aria-hidden', 'false');
        setTimeout(() => {
            shirtToastEl.classList.remove('is-visible');
            shirtToastEl.setAttribute('aria-hidden', 'true');
        }, 3200);
    }


    function init() {
        portalEl = document.getElementById('hnmtChilePortal');
        canvasEl = document.getElementById('hnmt3dCanvas');
        exitBtnEl = document.getElementById('hnmtPortalExitBtn');
        hoverTagEl = document.getElementById('hnmtHoverTag');
        hoverCatEl = document.getElementById('hnmtHoverCat');
        hoverNameEl = document.getElementById('hnmtHoverName');
        flashEl = document.getElementById('hnmtPortalFlash');

        if (!portalEl || !canvasEl) return;
        initShirtInspectionDOM();

        window.addEventListener('mousemove', onMouseMove, { passive: true });
        window.addEventListener('mousedown', onMouseDown);
        window.addEventListener('mouseup', onMouseUp);
        window.addEventListener('resize', onResize);

        if (exitBtnEl) {
            exitBtnEl.addEventListener('click', closePortal);
        }

        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && isPortalOpen) {
                closePortal();
            }
        });

        bindTriggers();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    window.HNMTChilePortal = { open: openPortal, close: closePortal };
})();
