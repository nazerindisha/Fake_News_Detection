/**
 * VERIFACT AI — DYNAMIC VECTOR BACKGROUND ENGINE
 * Pure SVG & HTML5 Canvas generative patterns with auto-cycle & dark/light adaptation.
 */

(function () {
  const PATTERNS = ["grid", "waves", "neural", "telemetry"];
  let currentPatternIndex = 0;
  let isAutoCycle = true;
  let cycleTimer = null;
  const CYCLE_INTERVAL = 8000; // 8 seconds per pattern
  let canvasAnimId = null;

  // -------------------------------------------------------------
  // 1. INITIALIZE DYNAMIC LAYERS
  // -------------------------------------------------------------
  function initBackgroundEngine() {
    const container = document.getElementById("dynamicBgContainer");
    if (!container) return;

    // Render Layer 1: SVG Technical Grid with Crosses (+)
    container.appendChild(createGridLayer());

    // Render Layer 2: SVG Fluid Topographic Waves
    container.appendChild(createWavesLayer());

    // Render Layer 3: Interactive Neural Network Canvas
    container.appendChild(createNeuralLayer());

    // Render Layer 4: SVG Cyber Telemetry HUD Radar
    container.appendChild(createTelemetryLayer());

    // Restore saved pattern or default to grid
    const savedPattern = localStorage.getItem("vf_bg_pattern") || "grid";
    const foundIdx = PATTERNS.indexOf(savedPattern);
    currentPatternIndex = foundIdx >= 0 ? foundIdx : 0;

    const savedAuto = localStorage.getItem("vf_bg_auto");
    isAutoCycle = savedAuto !== null ? savedAuto === "true" : true;

    // Display active pattern
    showPattern(PATTERNS[currentPatternIndex]);

    // Start auto-cycling if enabled
    if (isAutoCycle) {
      startAutoCycle();
    }
    updateAutoUI();

    // Listen for window resize for canvas
    window.addEventListener("resize", resizeNeuralCanvas);
  }

  // -------------------------------------------------------------
  // 2. LAYER BUILDERS (PURE VECTOR SVG & CANVAS)
  // -------------------------------------------------------------

  // LAYER 1: Technical Blueprint Cross Grid (+)
  function createGridLayer() {
    const el = document.createElement("div");
    el.id = "bgLayer-grid";
    el.className = "vector-bg-layer";
    el.innerHTML = `
      <svg class="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="svgMinorGrid" width="28" height="28" patternUnits="userSpaceOnUse">
            <path d="M 28 0 L 0 0 0 28" fill="none" class="stroke-minor-grid" stroke-width="0.75" />
          </pattern>
          <pattern id="svgMajorGrid" width="112" height="112" patternUnits="userSpaceOnUse">
            <rect width="112" height="112" fill="url(#svgMinorGrid)" />
            <path d="M 112 0 L 0 0 0 112" fill="none" class="stroke-major-grid" stroke-width="1.2" />
            <!-- Coordinate crosses (+) at intersections -->
            <path d="M -6 0 L 6 0 M 0 -6 L 0 6" class="stroke-cross" stroke-width="1.6" />
            <path d="M 106 112 L 118 112 M 112 106 L 112 118" class="stroke-cross" stroke-width="1.6" />
            <path d="M 50 56 L 62 56 M 56 50 L 56 62" class="stroke-cross-subtle" stroke-width="1.2" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#svgMajorGrid)" />
      </svg>
    `;
    return el;
  }

  // LAYER 2: Organic Topographic Waves (Fluid Bezier Contours)
  function createWavesLayer() {
    const el = document.createElement("div");
    el.id = "bgLayer-waves";
    el.className = "vector-bg-layer";
    el.innerHTML = `
      <svg class="w-full h-full opacity-90" viewBox="0 0 1440 900" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <g fill="none" class="stroke-topo-waves">
          <path d="M-100,120 C240,60 480,260 760,180 C1040,100 1280,240 1560,160" stroke-width="1.5" opacity="0.65" />
          <path d="M-100,180 C260,110 500,320 780,230 C1060,140 1300,290 1560,210" stroke-width="1.2" opacity="0.55" />
          <path d="M-100,240 C280,160 520,380 800,280 C1080,180 1320,340 1560,260" stroke-width="1.0" opacity="0.45" />
          <path d="M-100,310 C300,220 540,440 820,340 C1100,240 1340,400 1560,320" stroke-width="1.2" opacity="0.6" />
          <path d="M-100,380 C320,280 560,500 840,400 C1120,300 1360,460 1560,380" stroke-width="1.5" opacity="0.75" />
          <path d="M-100,450 C340,340 580,560 860,460 C1140,360 1380,520 1560,440" stroke-width="1.2" opacity="0.5" />
          <path d="M-100,520 C360,400 600,620 880,520 C1160,420 1400,580 1560,500" stroke-width="1.0" opacity="0.4" />
          <path d="M-100,600 C380,470 620,690 900,590 C1180,490 1420,650 1560,570" stroke-width="1.4" opacity="0.6" />
          <path d="M-100,680 C400,540 640,760 920,660 C1200,560 1440,720 1560,640" stroke-width="1.6" opacity="0.7" />
          <path d="M-100,760 C420,610 660,830 940,730 C1220,630 1460,790 1560,710" stroke-width="1.2" opacity="0.5" />
          <!-- Accent flow ribbons -->
          <path d="M0,400 Q720,200 1440,400" stroke-width="2" class="stroke-topo-accent" opacity="0.8" />
          <path d="M0,520 Q720,320 1440,520" stroke-width="1.5" class="stroke-topo-accent" opacity="0.6" />
        </g>
      </svg>
    `;
    return el;
  }

  // LAYER 3: Dynamic Animated Neural Network Canvas
  let neuralCanvas, neuralCtx;
  let particles = [];
  const PARTICLE_COUNT = 48;

  function createNeuralLayer() {
    const el = document.createElement("div");
    el.id = "bgLayer-neural";
    el.className = "vector-bg-layer";
    
    neuralCanvas = document.createElement("canvas");
    neuralCanvas.className = "w-full h-full";
    el.appendChild(neuralCanvas);

    return el;
  }

  function resizeNeuralCanvas() {
    if (!neuralCanvas) return;
    neuralCanvas.width = window.innerWidth;
    neuralCanvas.height = window.innerHeight;
    initParticles();
  }

  function initParticles() {
    particles = [];
    const w = neuralCanvas.width || window.innerWidth;
    const h = neuralCanvas.height || window.innerHeight;
    
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        radius: Math.random() * 2 + 1.5,
        pulse: Math.random() * Math.PI
      });
    }
  }

  function renderNeuralFrame() {
    if (!neuralCanvas || !neuralCanvas.parentElement) return;
    
    // Only animate if this layer is active or transitioning
    const layer = document.getElementById("bgLayer-neural");
    if (!layer || layer.style.opacity === "0") {
      canvasAnimId = requestAnimationFrame(renderNeuralFrame);
      return;
    }

    if (!neuralCtx) neuralCtx = neuralCanvas.getContext("2d");
    const isDark = document.documentElement.getAttribute("data-theme") === "dark";

    const w = neuralCanvas.width;
    const h = neuralCanvas.height;
    neuralCtx.clearRect(0, 0, w, h);

    const nodeColor = isDark ? "rgba(165, 180, 252, 0.65)" : "rgba(79, 70, 229, 0.45)";
    const linkBase = isDark ? "rgba(129, 140, 248," : "rgba(99, 102, 241,";
    const maxDist = 140;

    // Update and draw particles
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.pulse += 0.03;

      if (p.x < 0) p.x = w;
      if (p.x > w) p.x = 0;
      if (p.y < 0) p.y = h;
      if (p.y > h) p.y = 0;

      // Draw node
      const r = p.radius + Math.sin(p.pulse) * 0.5;
      neuralCtx.beginPath();
      neuralCtx.arc(p.x, p.y, r, 0, Math.PI * 2);
      neuralCtx.fillStyle = nodeColor;
      neuralCtx.fill();

      // Connect nearby nodes
      for (let j = i + 1; j < particles.length; j++) {
        const p2 = particles[j];
        const dx = p.x - p2.x;
        const dy = p.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < maxDist) {
          const alpha = (1 - dist / maxDist) * (isDark ? 0.35 : 0.22);
          neuralCtx.beginPath();
          neuralCtx.moveTo(p.x, p.y);
          neuralCtx.lineTo(p2.x, p2.y);
          neuralCtx.strokeStyle = `${linkBase} ${alpha})`;
          neuralCtx.lineWidth = 1;
          neuralCtx.stroke();
        }
      }
    }

    canvasAnimId = requestAnimationFrame(renderNeuralFrame);
  }

  // LAYER 4: Cyber Telemetry HUD & Radar Compass
  function createTelemetryLayer() {
    const el = document.createElement("div");
    el.id = "bgLayer-telemetry";
    el.className = "vector-bg-layer";
    el.innerHTML = `
      <svg class="w-full h-full" viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
        <g class="stroke-telemetry-hud" fill="none">
          <!-- Concentric Orbit Rings -->
          <circle cx="200" cy="800" r="140" stroke-width="1" stroke-dasharray="3 6" opacity="0.6" />
          <circle cx="200" cy="800" r="240" stroke-width="1.2" opacity="0.75" />
          <circle cx="200" cy="800" r="360" stroke-width="1" stroke-dasharray="10 5 2 5" opacity="0.6" />
          <circle cx="200" cy="800" r="480" stroke-width="1.4" opacity="0.8" />
          <circle cx="200" cy="800" r="620" stroke-width="0.8" stroke-dasharray="4 8" opacity="0.5" />
          
          <!-- Azimuth Degree Radians -->
          <line x1="200" y1="180" x2="200" y2="950" stroke-width="1" stroke-dasharray="4 6" opacity="0.5" />
          <line x1="-300" y1="800" x2="820" y2="800" stroke-width="1" stroke-dasharray="4 6" opacity="0.5" />
          
          <!-- Secondary Top-Right Reticle -->
          <circle cx="850" cy="180" r="90" stroke-width="1.2" opacity="0.7" />
          <circle cx="850" cy="180" r="140" stroke-width="0.8" stroke-dasharray="6 6" opacity="0.5" />
          <line x1="850" y1="40" x2="850" y2="320" stroke-width="1" opacity="0.4" />
          <line x1="710" y1="180" x2="990" y2="180" stroke-width="1" opacity="0.4" />

          <!-- Coordinate Indicators & Technical Arcs -->
          <path d="M 120 440 A 380 380 0 0 1 580 800" stroke-width="2.5" class="stroke-telemetry-accent" opacity="0.85" />
          <path d="M 200 560 A 240 240 0 0 1 440 800" stroke-width="1.8" class="stroke-telemetry-accent" opacity="0.7" />
          
          <!-- Crosshair and Calibration Ticks -->
          <path d="M 195 790 L 205 790 M 200 785 L 200 795" stroke-width="2" />
          <circle cx="200" cy="800" r="4" fill="currentColor" opacity="0.8" />
          <circle cx="850" cy="180" r="3" fill="currentColor" opacity="0.8" />
        </g>
      </svg>
    `;
    return el;
  }

  // -------------------------------------------------------------
  // 3. PATTERN DISPLAY & TRANSITIONS
  // -------------------------------------------------------------
  function showPattern(patternName) {
    PATTERNS.forEach(name => {
      const layer = document.getElementById(`bgLayer-${name}`);
      const btn = document.getElementById(`bgBtn-${name}`);

      if (layer) {
        if (name === patternName) {
          layer.style.opacity = "1";
          layer.style.visibility = "visible";
        } else {
          layer.style.opacity = "0";
          layer.style.visibility = "hidden";
        }
      }

      if (btn) {
        if (name === patternName) {
          btn.style.background = "var(--tab-active-bg)";
          btn.style.color = "var(--tab-active-text)";
          btn.style.boxShadow = "var(--tab-active-shadow)";
          btn.classList.add("font-bold");
        } else {
          btn.style.background = "transparent";
          btn.style.color = "var(--tab-inactive-text)";
          btn.style.boxShadow = "none";
          btn.classList.remove("font-bold");
        }
      }
    });

    localStorage.setItem("vf_bg_pattern", patternName);

    // Initialize neural canvas animation when switching to it
    if (patternName === "neural") {
      resizeNeuralCanvas();
      if (!canvasAnimId) renderNeuralFrame();
    }
  }

  // -------------------------------------------------------------
  // 4. AUTO-CYCLE TIMING ENGINE
  // -------------------------------------------------------------
  function startAutoCycle() {
    stopAutoCycle();
    cycleTimer = setInterval(() => {
      currentPatternIndex = (currentPatternIndex + 1) % PATTERNS.length;
      showPattern(PATTERNS[currentPatternIndex]);
    }, CYCLE_INTERVAL);
  }

  function stopAutoCycle() {
    if (cycleTimer) {
      clearInterval(cycleTimer);
      cycleTimer = null;
    }
  }

  function toggleAutoCycle() {
    isAutoCycle = !isAutoCycle;
    localStorage.setItem("vf_bg_auto", isAutoCycle);

    if (isAutoCycle) {
      startAutoCycle();
    } else {
      stopAutoCycle();
    }
    updateAutoUI();
  }

  function updateAutoUI() {
    const autoBtn = document.getElementById("bgBtn-auto");
    const autoDot = document.getElementById("bgAutoDot");
    if (!autoBtn) return;

    if (isAutoCycle) {
      autoBtn.classList.add("badge-indigo");
      autoBtn.classList.remove("pill-theme");
      if (autoDot) autoDot.className = "w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping";
    } else {
      autoBtn.classList.remove("badge-indigo");
      autoBtn.classList.add("pill-theme");
      if (autoDot) autoDot.className = "w-1.5 h-1.5 rounded-full bg-zinc-400";
    }
  }

  // User manual pattern selection
  function selectPattern(name) {
    const idx = PATTERNS.indexOf(name);
    if (idx >= 0) {
      currentPatternIndex = idx;
      showPattern(name);

      // If user manually clicks, temporarily restart cycle timer so it stays on user's choice for 8s
      if (isAutoCycle) {
        startAutoCycle();
      }
    }
  }

  // Expose functions globally to window
  window.setBackgroundPattern = selectPattern;
  window.toggleAutoCycle = toggleAutoCycle;

  // Initialize on DOM ready
  document.addEventListener("DOMContentLoaded", () => {
    initBackgroundEngine();
  });
})();
