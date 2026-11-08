/* ===================================================================
   HNMTSHOP 3D & MOTION ENGINE (Three.js, GSAP, Vanilla-tilt, Lenis)
   =================================================================== */

window.HNMT3D = {
  // 1. Lenis Smooth Scroll Integration with GSAP ScrollTrigger
  initLenis: function () {
    if (typeof Lenis === "undefined") return null;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1
    });

    lenis.on("scroll", () => {
      if (typeof ScrollTrigger !== "undefined") {
        ScrollTrigger.update();
      }
    });

    if (typeof gsap !== "undefined") {
      gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(0);
    }

    console.log("🚀 [HNMT3D] Lenis Smooth Scroll Initialized");
    return lenis;
  },

  // 2. Vanilla-tilt 3D Glare & Card Tilt
  initTilt: function (selector = "[data-tilt]", customOptions = {}) {
    if (typeof VanillaTilt === "undefined") return;

    const defaultOptions = {
      max: 12,
      perspective: 1000,
      scale: 1.04,
      speed: 800,
      glare: true,
      "max-glare": 0.25,
      gyroscope: true,
      easing: "cubic-bezier(.03,.98,.52,.99)"
    };

    const options = Object.assign({}, defaultOptions, customOptions);
    const elements = document.querySelectorAll(selector);
    if (elements.length > 0) {
      VanillaTilt.init(Array.from(elements), options);
      console.log(`✨ [HNMT3D] Vanilla-tilt mounted on ${elements.length} elements`);
    }
  },

  // 3. Three.js WebGL Interactive 3D Model Viewer (.glb / .gltf)
  createViewer: function (containerEl, modelUrl, config = {}) {
    if (typeof THREE === "undefined") {
      console.warn("[HNMT3D] Three.js not loaded");
      return null;
    }

    const container = typeof containerEl === "string" ? document.getElementById(containerEl) : containerEl;
    if (!container) return null;

    const width = container.clientWidth || 400;
    const height = container.clientHeight || 400;

    // Scene
    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0.5, 2.5);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    // Controls
    let controls = null;
    if (typeof THREE.OrbitControls !== "undefined") {
      controls = new THREE.OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.autoRotate = config.autoRotate ?? true;
      controls.autoRotateSpeed = 2.0;
      controls.maxPolarAngle = Math.PI / 2; // don't go below floor
    }

    // Studio Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 2.0);
    dirLight1.position.set(3, 5, 4);
    scene.add(dirLight1);

    const rimLight = new THREE.DirectionalLight(0xff6b00, 1.8); // Neon orange rim light
    rimLight.position.set(-3, -2, -3);
    scene.add(rimLight);

    // Load .glb / .gltf
    let currentMesh = null;
    if (modelUrl && typeof THREE.GLTFLoader !== "undefined") {
      const loader = new THREE.GLTFLoader();
      loader.load(
        modelUrl,
        (gltf) => {
          currentMesh = gltf.scene;

          // Center bounding box
          const box = new THREE.Box3().setFromObject(currentMesh);
          const center = box.getCenter(new THREE.Vector3());
          const size = box.getSize(new THREE.Vector3());
          currentMesh.position.sub(center);

          const maxDim = Math.max(size.x, size.y, size.z);
          if (maxDim > 0) {
            const scale = 1.6 / maxDim;
            currentMesh.scale.set(scale, scale, scale);
          }

          scene.add(currentMesh);
          console.log(`📦 [HNMT3D] Loaded 3D Model: ${modelUrl}`);
        },
        undefined,
        (err) => console.warn(`[HNMT3D] Model load warning for ${modelUrl}:`, err)
      );
    }

    // Render Loop
    let animId;
    function animate() {
      animId = requestAnimationFrame(animate);
      if (controls) controls.update();
      renderer.render(scene, camera);
    }
    animate();

    // Resize handler
    function onResize() {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }
    window.addEventListener("resize", onResize);

    return {
      scene,
      camera,
      renderer,
      controls,
      destroy: () => {
        cancelAnimationFrame(animId);
        window.removeEventListener("resize", onResize);
        renderer.dispose();
      }
    };
  }
};
