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

    const savedAuto = localStorage.getItem("vf_bg_auto");
    isAutoCycle = savedAuto !== null ? savedAuto === "true" : true;

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
      <svg class="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <!-- Minor Subdivisions Grid (24px) -->
          <pattern id="svgMinorGrid" width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M 24 0 L 0 0 0 24" fill="none" class="stroke-minor-grid" stroke-width="0.65" />
          </pattern>

          <!-- Major Coordinate Grid (120px) with Crosses (+) -->
          <pattern id="svgMajorGrid" width="120" height="120" patternUnits="userSpaceOnUse">
            <rect width="120" height="120" fill="url(#svgMinorGrid)" />
            <path d="M 120 0 L 0 0 0 120" fill="none" class="stroke-major-grid" stroke-width="1.25" />
            
            <!-- Primary Intersection Coordinate Crosses (+) -->
            <path d="M -7 0 L 7 0 M 0 -7 L 0 7" class="stroke-cross" stroke-width="1.8" />
            <circle cx="0" cy="0" r="1.2" class="fill-cross" />

            <path d="M 113 120 L 127 120 M 120 113 L 120 127" class="stroke-cross" stroke-width="1.8" />
            <circle cx="120" cy="120" r="1.2" class="fill-cross" />

            <!-- Intermediate Mid-Point Subtle Ticks -->
            <path d="M 54 60 L 66 60 M 60 54 L 60 66" class="stroke-cross-subtle" stroke-width="1.2" />
            <circle cx="60" cy="60" r="0.9" class="fill-cross-subtle" />
          </pattern>
        </defs>

        <!-- Base Grid Surface -->
        <rect width="100%" height="100%" fill="url(#svgMajorGrid)" />

        <!-- Viewport Perimeter Alignment Reticles & Calipers -->
        <g class="stroke-cross" fill="none" opacity="0.65">
          <!-- Top-Left Corner Caliper Target -->
          <svg x="0" y="0" width="60" height="60" overflow="visible">
            <path d="M 24 48 L 24 24 L 48 24" stroke-width="2" />
            <circle cx="24" cy="24" r="3" />
          </svg>
          
          <!-- Top-Right Corner Caliper Target -->
          <svg x="100%" y="0" width="60" height="60" overflow="visible">
            <path d="M -48 24 L -24 24 L -24 48" stroke-width="2" />
            <circle cx="-24" cy="24" r="3" />
          </svg>

          <!-- Bottom-Left Corner Caliper Target -->
          <svg x="0" y="100%" width="60" height="60" overflow="visible">
            <path d="M 24 -48 L 24 -24 L 48 -24" stroke-width="2" />
            <circle cx="24" cy="-24" r="3" />
          </svg>

          <!-- Bottom-Right Corner Caliper Target -->
          <svg x="100%" y="100%" width="60" height="60" overflow="visible">
            <path d="M -48 -24 L -24 -24 L -24 -48" stroke-width="2" />
            <circle cx="-24" cy="-24" r="3" />
          </svg>
        </g>
      </svg>
    `;
    return el;
  }

  // -------------------------------------------------------------
  // 3. LAYER 2: DUAL-SHELL 3D GEODESIC AI CONSTELLATION (NEURAL)
  // -------------------------------------------------------------
  let neuralCanvas, neuralCtx;
  let outerShellNodes = [];
  let innerCoreNodes = [];
  let sphereEdges = [];
  let synapseSparks = [];

  let rotX = 0.22;
  let rotY = 0.45;
  let targetRotX = 0.22;
  let targetRotY = 0.45;

  let mouseNormX = 0;
  let mouseNormY = 0;
  let skylineParallaxX = 0;
  let skylineParallaxAnimId = null;

  const OUTER_NODE_COUNT = 64;
  const INNER_NODE_COUNT = 16;
  const SPARK_COUNT = 20;

  function createNeuralLayer() {
    const el = document.createElement("div");
    el.id = "bgLayer-neural";
    el.className = "vector-bg-layer";

    neuralCanvas = document.createElement("canvas");
    neuralCanvas.className = "w-full h-full";
    el.appendChild(neuralCanvas);

    // Interactive mouse tilt & parallax tracking (used by Neural & Skyline)
    window.addEventListener("mousemove", (e) => {
      mouseNormX = (e.clientX / window.innerWidth) - 0.5;
      mouseNormY = (e.clientY / window.innerHeight) - 0.5;
      targetRotY = 0.45 + mouseNormX * 0.95;
      targetRotX = 0.22 + mouseNormY * 0.7;
    });

    return el;
  }

  function resizeNeuralCanvas() {
    if (!neuralCanvas) return;
    neuralCanvas.width = window.innerWidth;
    neuralCanvas.height = window.innerHeight;
    initDualSphereModel();
  }

  function initDualSphereModel() {
    outerShellNodes = [];
    innerCoreNodes = [];
    sphereEdges = [];
    synapseSparks = [];

    const w = neuralCanvas.width || window.innerWidth;
    const h = neuralCanvas.height || window.innerHeight;
    const isMobile = w < 768;

    // Radius of outer geodesic sphere
    const R_outer = Math.min(w, h) * (isMobile ? 0.42 : 0.38);
    // Radius of inner nucleus core
    const R_inner = R_outer * 0.46;

    // 1. Generate Outer Geodesic Shell (Fibonacci Sphere)
    for (let i = 0; i < OUTER_NODE_COUNT; i++) {
      const phi = Math.acos(1 - 2 * (i + 0.5) / OUTER_NODE_COUNT);
      const theta = Math.PI * (1 + Math.sqrt(5)) * (i + 0.5);
      const rVar = R_outer * (0.92 + Math.random() * 0.18);

      outerShellNodes.push({
        x: rVar * Math.sin(phi) * Math.cos(theta),
        y: rVar * Math.sin(phi) * Math.sin(theta),
        z: rVar * Math.cos(phi),
        baseRadius: Math.random() * 2.2 + 2.5,
        pulseOffset: Math.random() * Math.PI * 2,
        pulseSpeed: 0.035 + Math.random() * 0.02,
        isCoreHub: i % 6 === 0,
        isInner: false
      });
    }

    // 2. Generate Inner Nucleus Cluster
    for (let j = 0; j < INNER_NODE_COUNT; j++) {
      const phi = Math.acos(1 - 2 * (j + 0.5) / INNER_NODE_COUNT);
      const theta = Math.PI * (1 + Math.sqrt(5)) * (j + 0.5);
      const rVar = R_inner * (0.85 + Math.random() * 0.3);

      innerCoreNodes.push({
        x: rVar * Math.sin(phi) * Math.cos(theta),
        y: rVar * Math.sin(phi) * Math.sin(theta),
        z: rVar * Math.cos(phi),
        baseRadius: Math.random() * 1.8 + 2.0,
        pulseOffset: Math.random() * Math.PI * 2,
        pulseSpeed: 0.05 + Math.random() * 0.02,
        isCoreHub: j % 3 === 0,
        isInner: true
      });
    }

    // Combine all nodes for edge index mapping
    const allNodes = outerShellNodes.concat(innerCoreNodes);

    // 3. Connect Outer Shell Nodes (3D Euclidean Threshold)
    const maxOuterDist = R_outer * 0.58;
    for (let i = 0; i < outerShellNodes.length; i++) {
      for (let j = i + 1; j < outerShellNodes.length; j++) {
        const dx = outerShellNodes[i].x - outerShellNodes[j].x;
        const dy = outerShellNodes[i].y - outerShellNodes[j].y;
        const dz = outerShellNodes[i].z - outerShellNodes[j].z;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (dist < maxOuterDist) {
          sphereEdges.push({
            from: i,
            to: j,
            dist: dist,
            maxDist: maxOuterDist,
            isCoreEdge: false
          });
        }
      }
    }

    // 4. Connect Inner Nucleus Nodes & Radial Bridges to Outer Shell
    const offsetInner = outerShellNodes.length;
    for (let i = 0; i < innerCoreNodes.length; i++) {
      // Connect to closest outer shell node (radial synapse bridge)
      let closestOuter = 0;
      let minOuterDist = Infinity;
      for (let k = 0; k < outerShellNodes.length; k++) {
        const dx = innerCoreNodes[i].x - outerShellNodes[k].x;
        const dy = innerCoreNodes[i].y - outerShellNodes[k].y;
        const dz = innerCoreNodes[i].z - outerShellNodes[k].z;
        const d = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (d < minOuterDist) {
          minOuterDist = d;
          closestOuter = k;
        }
      }
      sphereEdges.push({
        from: offsetInner + i,
        to: closestOuter,
        dist: minOuterDist,
        maxDist: R_outer,
        isCoreEdge: true
      });
    }

    // 5. Initialize Travelling Synaptic Sparks
    for (let k = 0; k < SPARK_COUNT; k++) {
      spawnSpark();
    }
  }

  function spawnSpark() {
    if (sphereEdges.length === 0) return;
    const edgeIdx = Math.floor(Math.random() * sphereEdges.length);
    synapseSparks.push({
      edgeIdx: edgeIdx,
      progress: Math.random(),
      speed: 0.012 + Math.random() * 0.016,
      forward: Math.random() > 0.5,
      history: []
    });
  }

  function renderNeuralFrame() {
    if (!neuralCanvas || !neuralCanvas.parentElement) return;

    // Check if neural layer is active
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

    // Dynamic easing towards mouse target rotation + constant gentle drift
    rotX += (targetRotX - rotX) * 0.05 + 0.0008;
    rotY += (targetRotY - rotY) * 0.05 + 0.0028;

    const cosY = Math.cos(rotY), sinY = Math.sin(rotY);
    const cosX = Math.cos(rotX), sinX = Math.sin(rotX);
    const focal = 680;

    // Center position: anchored on right half for desktop, centered for mobile
    const isMobile = w < 768;
    const cx = isMobile ? w * 0.5 : w * 0.72;
    const cy = isMobile ? h * 0.44 : h * 0.46;

    const allNodes = outerShellNodes.concat(innerCoreNodes);

    // Project 3D nodes into 2D screen coordinates
    const projectedNodes = allNodes.map((n) => {
      // Rotate Y
      const x1 = n.x * cosY + n.z * sinY;
      const z1 = n.z * cosY - n.x * sinY;
      // Rotate X
      const y1 = n.y * cosX - z1 * sinX;
      const z2 = z1 * cosX + n.y * sinX;

      const scale = focal / (focal + z2 + 260);
      const screenX = cx + x1 * scale;
      const screenY = cy + y1 * scale;

      // Depth alpha (0.22 to 1.0)
      const depthAlpha = Math.max(0.22, Math.min(1.0, (z2 + 340) / 680));

      return {
        screenX,
        screenY,
        scale,
        z: z2,
        depthAlpha,
        node: n
      };
    });

    // 1. Draw 3D Edges with depth-weighted alpha
    const edgeBaseColor = isDark ? "rgba(165, 180, 252," : "rgba(79, 70, 229,";
    const coreBridgeColor = isDark ? "rgba(56, 189, 248," : "rgba(99, 102, 241,";

    for (let i = 0; i < sphereEdges.length; i++) {
      const edge = sphereEdges[i];
      const p1 = projectedNodes[edge.from];
      const p2 = projectedNodes[edge.to];
      if (!p1 || !p2) continue;

      const depthAvg = (p1.depthAlpha + p2.depthAlpha) * 0.5;
      const distFactor = Math.max(0.1, 1 - edge.dist / edge.maxDist);
      const edgeAlpha = depthAvg * distFactor * (isDark ? 0.68 : 0.45);

      neuralCtx.beginPath();
      neuralCtx.moveTo(p1.screenX, p1.screenY);
      neuralCtx.lineTo(p2.screenX, p2.screenY);
      neuralCtx.strokeStyle = edge.isCoreEdge
        ? `${coreBridgeColor} ${edgeAlpha * 1.2})`
        : `${edgeBaseColor} ${edgeAlpha})`;
      neuralCtx.lineWidth = Math.max(0.8, (p1.scale + p2.scale) * 0.5 * (isDark ? 1.4 : 1.1));
      neuralCtx.stroke();
    }

    // 2. Draw Synaptic Sparks with Motion Comet Trails
    const sparkColor = isDark ? "rgba(56, 189, 248, 1)" : "rgba(67, 56, 202, 1)";
    const trailColor = isDark ? "rgba(129, 140, 248," : "rgba(99, 102, 241,";

    for (let k = 0; k < synapseSparks.length; k++) {
      const spark = synapseSparks[k];
      const edge = sphereEdges[spark.edgeIdx];
      if (!edge) continue;

      spark.progress += spark.speed;
      if (spark.progress >= 1.0) {
        spark.edgeIdx = Math.floor(Math.random() * sphereEdges.length);
        spark.progress = 0;
        spark.forward = Math.random() > 0.5;
        spark.history = [];
      }

      const p1 = projectedNodes[spark.forward ? edge.from : edge.to];
      const p2 = projectedNodes[spark.forward ? edge.to : edge.from];
      if (!p1 || !p2) continue;

      const px = p1.screenX + (p2.screenX - p1.screenX) * spark.progress;
      const py = p1.screenY + (p2.screenY - p1.screenY) * spark.progress;
      const pDepth = (p1.depthAlpha + p2.depthAlpha) * 0.5;

      // Update comet history trail
      spark.history.push({ x: px, y: py, alpha: pDepth });
      if (spark.history.length > 5) spark.history.shift();

      // Draw comet tail
      for (let h = 0; h < spark.history.length; h++) {
        const pt = spark.history[h];
        const tAlpha = (h / spark.history.length) * pt.alpha * (isDark ? 0.7 : 0.5);
        neuralCtx.beginPath();
        neuralCtx.arc(pt.x, pt.y, (h + 1) * 0.5 * pt.alpha, 0, Math.PI * 2);
        neuralCtx.fillStyle = `${trailColor} ${tAlpha})`;
        neuralCtx.fill();
      }

      // Draw spark head with high-glow center
      neuralCtx.beginPath();
      neuralCtx.arc(px, py, 2.8 * pDepth, 0, Math.PI * 2);
      neuralCtx.fillStyle = sparkColor;
      neuralCtx.fill();
    }

    // 3. Draw 3D Nodes with Halos & Core Hub Rings
    const nodeColor = isDark ? "rgba(199, 210, 254, 0.95)" : "rgba(67, 56, 202, 0.9)";
    const coreGlow = isDark ? "rgba(255, 255, 255, 1)" : "rgba(30, 27, 75, 1)";

    for (let i = 0; i < projectedNodes.length; i++) {
      const p = projectedNodes[i];
      const n = p.node;
      n.pulseOffset += n.pulseSpeed;

      const r = (n.baseRadius + Math.sin(n.pulseOffset) * 0.7) * p.scale;

      // Outer aura ring for core hubs
      if (n.isCoreHub) {
        neuralCtx.beginPath();
        neuralCtx.arc(p.screenX, p.screenY, r * 2.5, 0, Math.PI * 2);
        neuralCtx.strokeStyle = isDark ? "rgba(165, 180, 252, 0.55)" : "rgba(99, 102, 241, 0.4)";
        neuralCtx.lineWidth = 1.25;
        neuralCtx.stroke();
      }

      // Main node circle
      neuralCtx.beginPath();
      neuralCtx.arc(p.screenX, p.screenY, Math.max(1.6, r), 0, Math.PI * 2);
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
          <!-- Top Atmospheric Sky Gradients (Architectural Slate Monochrome) -->
          <linearGradient id="skylineTopGrad1" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="var(--skyline-sky-start)" stop-opacity="0.45" />
            <stop offset="100%" stop-color="var(--skyline-sky-end)" stop-opacity="0" />
          </linearGradient>

          <linearGradient id="skylineTopGrad2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="var(--skyline-sky-start)" stop-opacity="0.25" />
            <stop offset="100%" stop-color="var(--skyline-sky-end)" stop-opacity="0" />
          </linearGradient>

          <!-- Bottom Layered Horizon Wave Gradients (Architectural Slate Monochrome) -->
          <linearGradient id="skylineWave1" x1="0" y1="0" x2="1" y2="0.6">
            <stop offset="0%" stop-color="var(--skyline-wave1-start)" stop-opacity="0.8" />
            <stop offset="100%" stop-color="var(--skyline-wave1-end)" stop-opacity="0.6" />
          </linearGradient>

          <linearGradient id="skylineWave2" x1="0" y1="0" x2="1" y2="0.5">
            <stop offset="0%" stop-color="var(--skyline-wave2-start)" stop-opacity="0.85" />
            <stop offset="100%" stop-color="var(--skyline-wave2-end)" stop-opacity="0.75" />
          </linearGradient>

          <linearGradient id="skylineWave3" x1="0" y1="0" x2="1" y2="0.3">
            <stop offset="0%" stop-color="var(--skyline-wave3-start)" stop-opacity="0.92" />
            <stop offset="100%" stop-color="var(--skyline-wave3-end)" stop-opacity="0.82" />
          </linearGradient>

          <linearGradient id="skylineWave4" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stop-color="var(--skyline-wave4-start)" stop-opacity="1" />
            <stop offset="100%" stop-color="var(--skyline-wave4-end)" stop-opacity="0.95" />
          </linearGradient>

          <!-- Soft Horizon Mist Mask to blend base of skyscrapers -->
          <linearGradient id="skyMistMaskGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#ffffff" stop-opacity="1" />
            <stop offset="68%" stop-color="#ffffff" stop-opacity="0.95" />
            <stop offset="88%" stop-color="#ffffff" stop-opacity="0.25" />
            <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
          </linearGradient>
          <mask id="skyMistMask">
            <rect x="0" y="0" width="1440" height="900" fill="url(#skyMistMaskGrad)" />
          </mask>
        </defs>

        <!-- 1. Top Atmosphere Flowing Ribbons (Parallax Plane 1) -->
        <g id="skylineGroupSky" class="skyline-sky-ribbon">
          <path d="M 0 0 L 1440 0 L 1440 115 C 1050 50 500 160 0 90 Z" fill="url(#skylineTopGrad1)" />
          <path d="M 0 0 L 1440 0 L 1440 65 C 950 15 420 105 0 50 Z" fill="url(#skylineTopGrad2)" />
          <path d="M 0 80 C 480 150 980 45 1440 100" fill="none" stroke="var(--skyline-wave2-end)" stroke-width="1.2" opacity="0.3" />
          <path d="M 0 110 C 550 185 1020 75 1440 135" fill="none" stroke="var(--skyline-wave1-end)" stroke-width="0.8" opacity="0.25" />
        </g>

        <!-- 2. Digital City Matrix Skyline (Masked with Horizon Mist - Multiplane Parallax 2 & 3) -->
        <g mask="url(#skyMistMask)">
          <g id="skylineGroupBack" class="skyline-plane-back">
            ${backBuildingsSVG}
          </g>
          <g id="skylineGroupFore" class="skyline-plane-fore">
            ${foreBuildingsSVG}
          </g>
        </g>

        <!-- 3. Bottom Layered Flowing Horizon Waves (Parallax Plane 4) -->
        <g id="skylineGroupWaves" class="skyline-wave">
          <!-- Layer 1: Uppermost gentle crest -->
          <path d="M 0 740 C 380 690 920 790 1440 710 L 1440 900 L 0 900 Z" fill="url(#skylineWave1)" />
          
          <!-- Layer 2: Rolling middle wave -->
          <path d="M 0 780 C 420 740 980 835 1440 755 L 1440 900 L 0 900 Z" fill="url(#skylineWave2)" />
          
          <!-- Layer 3: Graphite wave ribbon -->
          <path d="M 0 825 C 390 790 1040 870 1440 805 L 1440 900 L 0 900 Z" fill="url(#skylineWave3)" />
          
          <!-- Layer 4: Deepest charcoal bottom horizon ribbon -->
          <path d="M 0 865 C 450 835 1100 895 1440 850 L 1440 900 L 0 900 Z" fill="url(#skylineWave4)" />
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
    if (!layer || layer.style.opacity === "0") {
      skylineParallaxAnimId = requestAnimationFrame(renderSkylineParallax);
      return;
    }

    // Spring interpolation towards mouse position
    skylineParallaxX += (mouseNormX - skylineParallaxX) * 0.055;

    const groupFore = document.getElementById("skylineGroupFore");
    const groupBack = document.getElementById("skylineGroupBack");
    const groupWaves = document.getElementById("skylineGroupWaves");
    const groupSky = document.getElementById("skylineGroupSky");

    if (groupFore) {
      // Foreground buildings move with noticeable depth parallax (28px)
      groupFore.setAttribute("transform", `translate(${(skylineParallaxX * 28).toFixed(2)}, 0)`);
    }
    if (groupBack) {
      // Background buildings move with subtle distance parallax (12px)
      groupBack.setAttribute("transform", `translate(${(skylineParallaxX * 12).toFixed(2)}, 0)`);
    }
    if (groupWaves) {
      // Horizon waves shift gently in foreground (7px)
      groupWaves.setAttribute("transform", `translate(${(skylineParallaxX * 7).toFixed(2)}, 0)`);
    }
    if (groupSky) {
      // Sky ribbons shift subtly in opposite direction (-8px)
      groupSky.setAttribute("transform", `translate(${(-skylineParallaxX * 8).toFixed(2)}, 0)`);
    }

    skylineParallaxAnimId = requestAnimationFrame(renderSkylineParallax);
  }

  // -------------------------------------------------------------
  // 5. PATTERN DISPLAY & TRANSITIONS
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

      // If user clicks, temporarily reset cycle timer so it stays on choice for 8s
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
