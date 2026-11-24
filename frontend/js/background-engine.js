/**
 * VERIFACT AI — ULTRA-LUXURY DYNAMIC VECTOR BACKGROUND ENGINE
 * Masterwork Generative Patterns:
 *  1. Grid (+)  : Technical Blueprint Architectural Coordinate Grid with Corner Calipers
 *  2. Neural    : Dual-Shell 3D Geodesic AI Core with Synaptic Sparks & Comet Trails
 *  3. Skyline   : Digital City Matrix Skyline & Layered Horizon Waves
 */

(function () {
  const PATTERNS = ["grid", "neural", "skyline"];
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

    // Render Layer 1: Enhanced SVG Technical Grid with Coordinate Reticles (+)
    container.appendChild(createGridLayer());

    // Render Layer 2: Dual-Shell 3D Geodesic AI Constellation Canvas
    container.appendChild(createNeuralLayer());

    // Render Layer 3: Digital City Matrix Skyline & Horizon Waves (User Style Match)
    container.appendChild(createSkylineLayer());

    // Restore saved pattern or default to grid
    const savedPattern = localStorage.getItem("vf_bg_pattern") || "grid";
    const foundIdx = PATTERNS.indexOf(savedPattern);
    currentPatternIndex = foundIdx >= 0 ? foundIdx : 0;

    // Default auto-cycle enabled for seamless theme transitions
    isAutoCycle = true;
    localStorage.setItem("vf_bg_auto", "true");

    // Display active pattern
    showPattern(PATTERNS[currentPatternIndex]);

    // Start auto-cycling if enabled
    if (isAutoCycle) {
      startAutoCycle();
    }
    updateAutoUI();

    // Listen for window resize for canvas and responsive re-centering
    window.addEventListener("resize", () => {
      resizeNeuralCanvas();
    });
  }

  // -------------------------------------------------------------
  // 2. LAYER 1: ENHANCED TECHNICAL BLUEPRINT COORDINATE GRID (+)
  // -------------------------------------------------------------
  function createGridLayer() {
    const el = document.createElement("div");
    el.id = "bgLayer-grid";
    el.className = "vector-bg-layer";
    el.innerHTML = `
      <!-- Dynamic Cursor Illumination Spotlight -->
      <div id="gridCursorSpotlight" class="absolute inset-0 pointer-events-none transition-opacity duration-300"></div>

      <!-- Autonomous Sweeping Laser Line -->
      <div class="grid-laser-scan-line"></div>

      <svg class="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <!-- Minor Subdivisions Dot Matrix (24px) -->
          <pattern id="svgDotGrid" width="24" height="24" patternUnits="userSpaceOnUse">
            <circle cx="12" cy="12" r="0.75" class="fill-cross-subtle" opacity="0.45" />
          </pattern>

          <!-- Minor Subdivisions Grid Lines (24px) -->
          <pattern id="svgMinorGrid" width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M 24 0 L 0 0 0 24" fill="none" class="stroke-minor-grid" stroke-width="0.55" stroke-dasharray="2 3" />
          </pattern>

          <!-- Major Technical Coordinate Grid (120px) with Crosses (+) -->
          <pattern id="svgMajorGrid" width="120" height="120" patternUnits="userSpaceOnUse">
            <rect width="120" height="120" fill="url(#svgMinorGrid)" />
            <rect width="120" height="120" fill="url(#svgDotGrid)" />
            <path d="M 120 0 L 0 0 0 120" fill="none" class="stroke-major-grid" stroke-width="1.1" />

            <!-- Primary Intersection Coordinate Crosses (+) with concentric ring -->
            <path d="M -9 0 L 9 0 M 0 -9 L 0 9" class="stroke-cross" stroke-width="1.8" />
            <circle cx="0" cy="0" r="2.5" class="stroke-cross" fill="none" stroke-width="0.8" opacity="0.8" />
            <circle cx="0" cy="0" r="1" class="fill-cross" />

            <path d="M 111 120 L 129 120 M 120 111 L 120 129" class="stroke-cross" stroke-width="1.8" />
            <circle cx="120" cy="120" r="2.5" class="stroke-cross" fill="none" stroke-width="0.8" opacity="0.8" />
            <circle cx="120" cy="120" r="1" class="fill-cross" />

            <!-- Intermediate Mid-Point Sub-ticks at (60, 60) -->
            <path d="M 53 60 L 67 60 M 60 53 L 60 67" class="stroke-cross-subtle" stroke-width="1.2" />
            <circle cx="60" cy="60" r="1.1" class="fill-cross-subtle" />

            <!-- Micro Hash Ticks on Major Axis -->
            <path d="M 0 57 L 0 63 M 120 57 L 120 63 M 57 0 L 63 0 M 57 120 L 63 120" class="stroke-minor-grid" stroke-width="1.2" />
          </pattern>
        </defs>

        <!-- Base Grid Surface -->
        <rect width="100%" height="100%" fill="url(#svgMajorGrid)" />

        <!-- Viewport Perimeter Alignment Reticles & Calipers -->
        <g class="stroke-cross" fill="none" opacity="0.85">
          <!-- Top-Left Corner Caliper Target -->
          <svg x="0" y="0" width="80" height="80" overflow="visible">
            <g transform="translate(24, 24)">
              <path d="M 0 32 L 0 0 L 32 0" stroke-width="2" />
              <circle cx="0" cy="0" r="4" stroke-width="1.2" />
              <circle cx="0" cy="0" r="1.5" class="fill-cross" />
              <path d="M -6 0 L 6 0 M 0 -6 L 0 6" stroke-width="1" />
            </g>
          </svg>

          <!-- Top-Right Corner Caliper Target -->
          <svg x="100%" y="0" width="80" height="80" overflow="visible">
            <g transform="translate(-24, 24)">
              <path d="M 0 32 L 0 0 L -32 0" stroke-width="2" />
              <circle cx="0" cy="0" r="4" stroke-width="1.2" />
              <circle cx="0" cy="0" r="1.5" class="fill-cross" />
              <path d="M -6 0 L 6 0 M 0 -6 L 0 6" stroke-width="1" />
            </g>
          </svg>

          <!-- Bottom-Left Corner Caliper Target -->
          <svg x="0" y="100%" width="80" height="80" overflow="visible">
            <g transform="translate(24, -24)">
              <path d="M 0 -32 L 0 0 L 32 0" stroke-width="2" />
              <circle cx="0" cy="0" r="4" stroke-width="1.2" />
              <circle cx="0" cy="0" r="1.5" class="fill-cross" />
              <path d="M -6 0 L 6 0 M 0 -6 L 0 6" stroke-width="1" />
            </g>
          </svg>

          <!-- Bottom-Right Corner Caliper Target -->
          <svg x="100%" y="100%" width="80" height="80" overflow="visible">
            <g transform="translate(-24, -24)">
              <path d="M 0 -32 L 0 0 L -32 0" stroke-width="2" />
              <circle cx="0" cy="0" r="4" stroke-width="1.2" />
              <circle cx="0" cy="0" r="1.5" class="fill-cross" />
              <path d="M -6 0 L 6 0 M 0 -6 L 0 6" stroke-width="1" />
            </g>
          </svg>
        </g>
      </svg>
    `;
    return el;
  }

  // -------------------------------------------------------------
  // 2. LAYER 2: FULL-PAGE 3D NEURAL CONSTELLATION NETWORK
  // -------------------------------------------------------------
  let neuralCanvas, neuralCtx;
  let neuralNodes = [];
  let neuralEdges = [];
  let synapseSparks = [];

  let mouseNormX = 0;
  let mouseNormY = 0;
  let mouseScreenX = -9999;
  let mouseScreenY = -9999;
  let skylineParallaxX = 0;
  let skylineParallaxAnimId = null;

  const NODE_COUNT_DESKTOP = 105;
  const NODE_COUNT_MOBILE = 65;
  const SPARK_COUNT = 32;

  function createNeuralLayer() {
    const el = document.createElement("div");
    el.id = "bgLayer-neural";
    el.className = "vector-bg-layer";

    neuralCanvas = document.createElement("canvas");
    neuralCanvas.className = "w-full h-full";
    el.appendChild(neuralCanvas);

    // Interactive mouse tilt, spotlight & parallax tracking (used across Grid, Neural & Skyline)
    window.addEventListener("mousemove", (e) => {
      mouseScreenX = e.clientX;
      mouseScreenY = e.clientY;
      mouseNormX = (e.clientX / window.innerWidth) - 0.5;
      mouseNormY = (e.clientY / window.innerHeight) - 0.5;

      // Real-time Grid Spotlight
      const gridLayer = document.getElementById("bgLayer-grid");
      if (gridLayer && (gridLayer.classList.contains("active") || (window.getComputedStyle(gridLayer).visibility !== "hidden" && parseFloat(window.getComputedStyle(gridLayer).opacity) > 0.04))) {
        const spotlight = document.getElementById("gridCursorSpotlight");
        const isDark = document.documentElement.getAttribute("data-theme") === "dark";

        if (spotlight) {
          spotlight.style.background = isDark 
            ? `radial-gradient(circle 380px at ${e.clientX}px ${e.clientY}px, rgba(99, 102, 241, 0.22), transparent 75%)`
            : `radial-gradient(circle 380px at ${e.clientX}px ${e.clientY}px, rgba(99, 102, 241, 0.14), transparent 75%)`;
        }
      }
    });

    window.addEventListener("mouseleave", () => {
      mouseScreenX = -9999;
      mouseScreenY = -9999;
      const spotlight = document.getElementById("gridCursorSpotlight");
      if (spotlight) spotlight.style.background = "transparent";
    });

    return el;
  }

  function resizeNeuralCanvas() {
    if (!neuralCanvas) return;
    neuralCanvas.width = window.innerWidth;
    neuralCanvas.height = window.innerHeight;
    initFullPageNeuralModel();
  }

  function initFullPageNeuralModel() {
    neuralNodes = [];
    neuralEdges = [];
    synapseSparks = [];

    const w = neuralCanvas.width || window.innerWidth;
    const h = neuralCanvas.height || window.innerHeight;
    const isMobile = w < 768;
    const count = isMobile ? NODE_COUNT_MOBILE : NODE_COUNT_DESKTOP;

    // Distribute neural nodes across the ENTIRE viewport (Full-Page Coverage)
    for (let i = 0; i < count; i++) {
      neuralNodes.push({
        x: Math.random() * w,
        y: Math.random() * h,
        z: (Math.random() - 0.5) * 260,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        vz: (Math.random() - 0.5) * 0.25,
        baseRadius: Math.random() * 2.2 + 2.0,
        pulseOffset: Math.random() * Math.PI * 2,
        pulseSpeed: 0.03 + Math.random() * 0.025,
        isCoreHub: i % 7 === 0 // Major neural processing hubs
      });
    }

    // Initialize travelling sparks across the network
    for (let k = 0; k < SPARK_COUNT; k++) {
      spawnSpark();
    }
  }

  function spawnSpark() {
    synapseSparks.push({
      fromNode: Math.floor(Math.random() * neuralNodes.length),
      toNode: Math.floor(Math.random() * neuralNodes.length),
      progress: Math.random(),
      speed: 0.012 + Math.random() * 0.018,
      history: []
    });
  }

  function renderNeuralFrame() {
    if (!neuralCanvas || !neuralCanvas.parentElement) return;

    // Check if neural layer is active or in crossfade transition
    const layer = document.getElementById("bgLayer-neural");
    const isVisible = layer && (layer.classList.contains("active") || (window.getComputedStyle(layer).visibility !== "hidden" && parseFloat(window.getComputedStyle(layer).opacity) > 0.02));
    if (!layer || !isVisible) {
      canvasAnimId = requestAnimationFrame(renderNeuralFrame);
      return;
    }

    if (!neuralCtx) neuralCtx = neuralCanvas.getContext("2d");
    const isDark = document.documentElement.getAttribute("data-theme") === "dark";

    const w = neuralCanvas.width;
    const h = neuralCanvas.height;
    neuralCtx.clearRect(0, 0, w, h);

    const isMobile = w < 768;
    const maxEdgeDist = isMobile ? 120 : 155;
    const activeEdges = [];

    // 1. Update node physics across the FULL PAGE with boundary wrapping
    for (let i = 0; i < neuralNodes.length; i++) {
      const n = neuralNodes[i];
      n.x += n.vx;
      n.y += n.vy;
      n.z += n.vz;

      // Mouse proximity deflection
      if (mouseScreenX > -1000) {
        const dx = n.x - mouseScreenX;
        const dy = n.y - mouseScreenY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 180 && dist > 0) {
          const force = (1 - dist / 180) * 1.2;
          n.x += (dx / dist) * force;
          n.y += (dy / dist) * force;
        }
      }

      // Smooth wrap-around across full page edges
      if (n.x < -30) n.x = w + 30;
      if (n.x > w + 30) n.x = -30;
      if (n.y < -30) n.y = h + 30;
      if (n.y > h + 30) n.y = -30;
      if (n.z < -130) { n.z = -130; n.vz = -n.vz; }
      if (n.z > 130) { n.z = 130; n.vz = -n.vz; }
    }

    // 2. Project 3D nodes into screen coordinates with parallax tilt
    const projectedNodes = neuralNodes.map((n) => {
      const depthScale = 1 + n.z / 420;
      const screenX = n.x + mouseNormX * (n.z * 0.16);
      const screenY = n.y + mouseNormY * (n.z * 0.16);
      const depthAlpha = Math.max(0.2, Math.min(1.0, 0.6 + n.z / 300));
      return {
        screenX,
        screenY,
        depthScale,
        depthAlpha,
        node: n
      };
    });

    // 3. Connect dynamic synaptic edges across full page
    const edgeColor = isDark ? "rgba(165, 180, 252," : "rgba(99, 102, 241,";
    const coreEdgeColor = isDark ? "rgba(56, 189, 248," : "rgba(79, 70, 229,";

    for (let i = 0; i < projectedNodes.length; i++) {
      for (let j = i + 1; j < projectedNodes.length; j++) {
        const p1 = projectedNodes[i];
        const p2 = projectedNodes[j];
        const dx = p1.screenX - p2.screenX;
        const dy = p1.screenY - p2.screenY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < maxEdgeDist) {
          activeEdges.push({ from: i, to: j, dist, maxDist: maxEdgeDist });
          const distFactor = (1 - dist / maxEdgeDist);
          const alpha = distFactor * (p1.depthAlpha + p2.depthAlpha) * 0.5 * (isDark ? 0.65 : 0.42);
          const isHubConn = p1.node.isCoreHub || p2.node.isCoreHub;

          neuralCtx.beginPath();
          neuralCtx.moveTo(p1.screenX, p1.screenY);
          neuralCtx.lineTo(p2.screenX, p2.screenY);
          neuralCtx.strokeStyle = isHubConn
            ? `${coreEdgeColor} ${alpha * 1.25})`
            : `${edgeColor} ${alpha})`;
          neuralCtx.lineWidth = Math.max(0.6, distFactor * 1.4);
          neuralCtx.stroke();
        }
      }
    }

    // 4. Draw Travelling Synaptic Sparks across Full Page
    const sparkColor = isDark ? "rgba(56, 189, 248, 1)" : "rgba(67, 56, 202, 1)";
    const trailColor = isDark ? "rgba(129, 140, 248," : "rgba(99, 102, 241,";

    if (activeEdges.length > 0) {
      for (let k = 0; k < synapseSparks.length; k++) {
        const spark = synapseSparks[k];
        const edge = activeEdges[k % activeEdges.length];
        if (!edge) continue;

        spark.progress += spark.speed;
        if (spark.progress >= 1.0) {
          spark.progress = 0;
          spark.history = [];
        }

        const p1 = projectedNodes[edge.from];
        const p2 = projectedNodes[edge.to];
        if (!p1 || !p2) continue;

        const px = p1.screenX + (p2.screenX - p1.screenX) * spark.progress;
        const py = p1.screenY + (p2.screenY - p1.screenY) * spark.progress;
        const pDepth = (p1.depthAlpha + p2.depthAlpha) * 0.5;

        spark.history.push({ x: px, y: py, alpha: pDepth });
        if (spark.history.length > 5) spark.history.shift();

        // Draw spark comet tail
        for (let h = 0; h < spark.history.length; h++) {
          const pt = spark.history[h];
          const tAlpha = (h / spark.history.length) * pt.alpha * (isDark ? 0.7 : 0.45);
          neuralCtx.beginPath();
          neuralCtx.arc(pt.x, pt.y, (h + 1) * 0.45 * pt.alpha, 0, Math.PI * 2);
          neuralCtx.fillStyle = `${trailColor} ${tAlpha})`;
          neuralCtx.fill();
        }

        // Draw spark head
        neuralCtx.beginPath();
        neuralCtx.arc(px, py, 2.5 * pDepth, 0, Math.PI * 2);
        neuralCtx.fillStyle = sparkColor;
        neuralCtx.fill();
      }
    }

    // 5. Draw Neural Nodes with Pulsing Hub Rings across Full Page
    const nodeColor = isDark ? "rgba(199, 210, 254, 0.95)" : "rgba(67, 56, 202, 0.88)";
    const coreGlow = isDark ? "rgba(255, 255, 255, 1)" : "rgba(30, 27, 75, 1)";

    for (let i = 0; i < projectedNodes.length; i++) {
      const p = projectedNodes[i];
      const n = p.node;
      n.pulseOffset += n.pulseSpeed;

      const r = (n.baseRadius + Math.sin(n.pulseOffset) * 0.6) * p.depthScale;

      // Outer aura ring for major hub centers
      if (n.isCoreHub) {
        neuralCtx.beginPath();
        neuralCtx.arc(p.screenX, p.screenY, r * 2.4, 0, Math.PI * 2);
        neuralCtx.strokeStyle = isDark ? "rgba(165, 180, 252, 0.5)" : "rgba(99, 102, 241, 0.35)";
        neuralCtx.lineWidth = 1.1;
        neuralCtx.stroke();
      }

      // Main node circle
      neuralCtx.beginPath();
      neuralCtx.arc(p.screenX, p.screenY, Math.max(1.5, r), 0, Math.PI * 2);
      neuralCtx.fillStyle = n.isCoreHub ? coreGlow : nodeColor;
      neuralCtx.globalAlpha = p.depthAlpha;
      neuralCtx.fill();
      neuralCtx.globalAlpha = 1.0;
    }

    canvasAnimId = requestAnimationFrame(renderNeuralFrame);
  }

  // -------------------------------------------------------------
  // 3. LAYER 3: DIGITAL CITY MATRIX SKYLINE & HORIZON WAVES (SKYLINE)
  // -------------------------------------------------------------
  function createSkylineLayer() {
    const el = document.createElement("div");
    el.id = "bgLayer-skyline";
    el.className = "vector-bg-layer";

    // Procedural building generator
    let backBuildingsSVG = "";
    let foreBuildingsSVG = "";

    // 1. Faint Background Skyline Silhouette (Depth layer)
    const backBuildings = [
      { x: 30, w: 45, h: 220 },
      { x: 95, w: 40, h: 270 },
      { x: 195, w: 55, h: 290 },
      { x: 260, w: 50, h: 240 },
      { x: 380, w: 60, h: 310 },
      { x: 490, w: 45, h: 260 },
      { x: 580, w: 50, h: 320 },
      { x: 770, w: 45, h: 250 },
      { x: 840, w: 55, h: 300 },
      { x: 930, w: 45, h: 230 },
      { x: 1010, w: 60, h: 280 },
      { x: 1110, w: 50, h: 250 },
      { x: 1210, w: 55, h: 290 },
      { x: 1300, w: 65, h: 240 },
      { x: 1380, w: 50, h: 200 }
    ];

    backBuildings.forEach((b, idx) => {
      const baseY = 820;
      const bY = baseY - b.h;
      const cols = Math.floor(b.w / 8);
      const rows = Math.floor(b.h / 12);

      let dots = "";
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const dx = b.x + 3 + c * 8;
          const dy = bY + 6 + r * 12;
          const op = (0.16 + (Math.sin(c * 1.5 + r * 0.8) * 0.5 + 0.5) * 0.22).toFixed(2);
          dots += `<rect x="${dx}" y="${dy}" width="4" height="6" rx="1" fill="var(--skyline-win-back)" opacity="${op}" class="skyline-window" />`;
        }
      }
      backBuildingsSVG += `<g class="skyline-bldg-item" style="animation-delay: ${(idx * 35).toFixed(0)}ms">${dots}</g>`;
    });

    // 2. Foreground High-Definition Matrix Skyline
    const foreBuildings = [
      { x: 65, w: 60, h: 260, style: "step", cols: 5 },
      { x: 140, w: 65, h: 340, style: "matrix", cols: 6 },
      { x: 220, w: 50, h: 230, style: "matrix", cols: 4 },
      { x: 285, w: 95, h: 290, style: "stepped-tower", cols: 8 },
      { x: 395, w: 45, h: 215, style: "matrix", cols: 4 },
      { x: 455, w: 70, h: 320, style: "matrix", cols: 6 },
      { x: 540, w: 55, h: 255, style: "matrix", cols: 5 },
      // HERO CENTERPIECE: CYLINDER SKYSCRAPER (from user's image)
      { x: 630, w: 126, h: 410, style: "cylinder", cols: 14 },
      { x: 775, w: 75, h: 310, style: "matrix", cols: 7 },
      { x: 865, w: 55, h: 235, style: "matrix", cols: 5 },
      { x: 935, w: 85, h: 330, style: "stepped-tower", cols: 7 },
      { x: 1035, w: 75, h: 285, style: "matrix", cols: 6 },
      { x: 1125, w: 60, h: 240, style: "matrix", cols: 5 },
      { x: 1200, w: 70, h: 275, style: "matrix", cols: 6 },
      { x: 1285, w: 60, h: 220, style: "step", cols: 5 }
    ];

    foreBuildings.forEach((b, idx) => {
      const baseY = 820;
      const bY = baseY - b.h;
      let dots = "";

      if (b.style === "cylinder") {
        // Centerpiece Cylindrical Tower with curved elliptical window bands
        const rows = Math.floor(b.h / 11);
        const midC = (b.cols - 1) / 2;

        // Top cap dome ellipse
        dots += `<ellipse cx="${b.x + b.w / 2}" cy="${bY}" rx="${b.w / 2}" ry="12" fill="none" stroke="var(--skyline-win-fore)" stroke-width="1.5" opacity="0.6" />`;

        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < b.cols; c++) {
            // Horizontal cosine projection for 3D cylinder curvature
            const normC = (c - midC) / midC;
            const angle = normC * (Math.PI * 0.42);
            const cx = b.x + b.w / 2 + Math.sin(angle) * (b.w / 2 - 4);
            const curveOffset = (1 - Math.cos(angle)) * 5;
            const cy = bY + 14 + r * 11 + curveOffset;

            const dotW = Math.max(2.5, 5 * Math.cos(angle));
            const dotH = 6;
            const op = (0.42 + Math.cos(angle) * 0.48).toFixed(2);
            const isPulse = (r + c) % 8 === 0 ? "matrix-live-pulse" : "";
            const delay = ((r * 0.15 + c * 0.25) % 3).toFixed(2);

            dots += `<rect x="${(cx - dotW / 2).toFixed(1)}" y="${cy.toFixed(1)}" width="${dotW.toFixed(1)}" height="${dotH}" rx="1" fill="var(--skyline-win-fore)" opacity="${op}" class="skyline-window ${isPulse}" style="animation-delay: ${delay}s" />`;
          }
        }
      } else {
        // Standard high-tech rectangular or stepped tower
        const rows = Math.floor(b.h / 12);
        const colW = (b.w - 8) / b.cols;

        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < b.cols; c++) {
            if (b.style === "step" && r < 4 && (c === 0 || c === b.cols - 1)) continue;
            if (b.style === "stepped-tower" && r < 6 && (c === 0 || c === b.cols - 1)) continue;
            if (b.style === "stepped-tower" && r < 3 && (c === 1 || c === b.cols - 2)) continue;

            const dx = b.x + 4 + c * colW;
            const dy = bY + 8 + r * 12;
            const op = (0.35 + (Math.sin(c * 2 + r * 1.3) * 0.5 + 0.5) * 0.5).toFixed(2);
            const isPulse = (r * 3 + c) % 11 === 0 ? "matrix-live-pulse" : "";
            const delay = ((r * 0.2 + c * 0.15) % 3).toFixed(2);

            dots += `<rect x="${dx.toFixed(1)}" y="${dy.toFixed(1)}" width="${(colW - 2.5).toFixed(1)}" height="6.5" rx="1.2" fill="var(--skyline-win-fore)" opacity="${op}" class="skyline-window ${isPulse}" style="animation-delay: ${delay}s" />`;
          }
        }
      }

      foreBuildingsSVG += `<g class="skyline-bldg-item" style="animation-delay: ${(idx * 55 + 60).toFixed(0)}ms">${dots}</g>`;
    });

    el.innerHTML = `
      <svg class="w-full h-full animate-build" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <!-- Top Atmospheric Sky Gradients (Soft, Light & Airy) -->
          <linearGradient id="skylineTopGrad1" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="var(--skyline-sky-start)" stop-opacity="0.3" />
            <stop offset="100%" stop-color="var(--skyline-sky-end)" stop-opacity="0" />
          </linearGradient>

          <linearGradient id="skylineTopGrad2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="var(--skyline-sky-start)" stop-opacity="0.15" />
            <stop offset="100%" stop-color="var(--skyline-sky-end)" stop-opacity="0" />
          </linearGradient>

          <!-- Soft Horizon Mist Mask to blend base of skyscrapers seamlessly into clean canvas -->
          <linearGradient id="skyMistMaskGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#ffffff" stop-opacity="1" />
            <stop offset="65%" stop-color="#ffffff" stop-opacity="0.95" />
            <stop offset="84%" stop-color="#ffffff" stop-opacity="0.2" />
            <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
          </linearGradient>
          <mask id="skyMistMask">
            <rect x="0" y="0" width="1440" height="900" fill="url(#skyMistMaskGrad)" />
          </mask>
        </defs>

        <!-- 1. Top Atmosphere Flowing Ribbons (Parallax Plane 1) -->
        <g id="skylineGroupSky" class="skyline-sky-ribbon">
          <path d="M 0 0 L 1440 0 L 1440 100 C 1050 45 500 135 0 75 Z" fill="url(#skylineTopGrad1)" />
          <path d="M 0 0 L 1440 0 L 1440 55 C 950 15 420 85 0 40 Z" fill="url(#skylineTopGrad2)" />
        </g>

        <!-- 2. Digital City Matrix Skyline (Clean Horizon - Multiplane Parallax 2 & 3) -->
        <g mask="url(#skyMistMask)">
          <g id="skylineGroupBack" class="skyline-plane-back">
            ${backBuildingsSVG}
          </g>
          <g id="skylineGroupFore" class="skyline-plane-fore">
            ${foreBuildingsSVG}
          </g>
        </g>
      </svg>
    `;

    return el;
  }

  // -------------------------------------------------------------
  // 4. SKYLINE INTERACTIVE 3D PARALLAX LOOP ("MOVABLE")
  // -------------------------------------------------------------
  function renderSkylineParallax() {
    const layer = document.getElementById("bgLayer-skyline");
    const isVisible = layer && (layer.classList.contains("active") || (window.getComputedStyle(layer).visibility !== "hidden" && parseFloat(window.getComputedStyle(layer).opacity) > 0.02));
    if (!layer || !isVisible) {
      skylineParallaxAnimId = requestAnimationFrame(renderSkylineParallax);
      return;
    }

    // Spring interpolation towards mouse position
    skylineParallaxX += (mouseNormX - skylineParallaxX) * 0.055;

    const groupFore = document.getElementById("skylineGroupFore");
    const groupBack = document.getElementById("skylineGroupBack");
    const groupSky = document.getElementById("skylineGroupSky");

    if (groupFore) {
      // Foreground buildings move with noticeable depth parallax (28px)
      groupFore.setAttribute("transform", `translate(${(skylineParallaxX * 28).toFixed(2)}, 0)`);
    }
    if (groupBack) {
      // Background buildings move with subtle distance parallax (12px)
      groupBack.setAttribute("transform", `translate(${(skylineParallaxX * 12).toFixed(2)}, 0)`);
    }
    if (groupSky) {
      // Sky ribbons shift subtly in opposite direction (-8px)
      groupSky.setAttribute("transform", `translate(${(-skylineParallaxX * 8).toFixed(2)}, 0)`);
    }

    skylineParallaxAnimId = requestAnimationFrame(renderSkylineParallax);
  }

  // -------------------------------------------------------------
  // 5. PATTERN DISPLAY & TRANSITIONS (CINEMATIC CROSSFADE)
  // -------------------------------------------------------------
  function showPattern(patternName) {
    PATTERNS.forEach(name => {
      const layer = document.getElementById(`bgLayer-${name}`);
      const btn = document.getElementById(`bgBtn-${name}`);

      if (layer) {
        // Clear any old inline overrides so CSS 1.6s cross-fade executes cleanly
        layer.style.opacity = "";
        layer.style.visibility = "";
        if (name === patternName) {
          layer.classList.add("active");
        } else {
          layer.classList.remove("active");
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

    // Initialize 3D neural canvas animation when switching to it
    if (patternName === "neural") {
      resizeNeuralCanvas();
      if (!canvasAnimId) renderNeuralFrame();
    }

    // Trigger progressive construction ("Build Making") and start parallax when switching to Skyline
    if (patternName === "skyline") {
      const svgEl = document.querySelector("#bgLayer-skyline svg");
      if (svgEl) {
        svgEl.classList.remove("animate-build");
        void svgEl.offsetWidth; // Force reflow to re-trigger rising animation
        svgEl.classList.add("animate-build");
      }
      if (!skylineParallaxAnimId) renderSkylineParallax();
    }
  }

  // -------------------------------------------------------------
  // 5. AUTO-CYCLE TIMING ENGINE (CYCLES BETWEEN GRID & NEURAL)
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

      // Keep auto-cycling running with smooth transitions
      isAutoCycle = true;
      localStorage.setItem("vf_bg_auto", "true");
      updateAutoUI();
      startAutoCycle();
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
