/**
 * VERIFACT AI — ULTRA-LUXURY DYNAMIC VECTOR BACKGROUND ENGINE
 * Masterwork Generative Patterns:
 *  1. Grid (+)   : Technical Blueprint Coordinate Cross-Grid
 *  2. Waves      : Dense Topographic Organic Contour Ribbons (Matching Ref Image 2)
 *  3. Neural     : 3D Geodesic AI Constellation with Synaptic Sparks (Matching Ref Image 3)
 *  4. Telemetry  : CAD Aerospace Blueprint HUD with Rose Target Beacon (Matching Ref Image 4)
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

    // Render Layer 2: Dense Organic Topographic Contour Ribbons (Waves)
    container.appendChild(createWavesLayer());

    // Render Layer 3: Interactive 3D Geodesic AI Sphere & Synaptic Sparks
    container.appendChild(createNeuralLayer());

    // Render Layer 4: Aerospace CAD Blueprint Telemetry & Radar HUD
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

    // Listen for window resize for canvas and responsive re-centering
    window.addEventListener("resize", () => {
      resizeNeuralCanvas();
    });
  }

  // -------------------------------------------------------------
  // 2. LAYER 1: TECHNICAL BLUEPRINT CROSS GRID (+)
  // -------------------------------------------------------------
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

  // -------------------------------------------------------------
  // 3. LAYER 2: DENSE TOPOGRAPHIC ORGANIC CONTOUR RIBBONS (WAVES)
  // Matching user's Reference Image 2: fluid undulating parallel ribbons
  // -------------------------------------------------------------
  function createWavesLayer() {
    const el = document.createElement("div");
    el.id = "bgLayer-waves";
    el.className = "vector-bg-layer wave-breathe";

    // Build 38 dense, harmonic undulating contour ribbons covering the screen
    const totalLines = 38;
    let pathsSvg = "";

    for (let i = 0; i < totalLines; i++) {
      const t = i / totalLines;
      const isIndex = i % 5 === 0;
      const strokeClass = isIndex ? "stroke-topo-index" : "stroke-topo-hairline";
      const strokeWidth = isIndex ? "2.6" : (i % 2 === 0 ? "1.4" : "0.85");
      const opacity = isIndex ? "0.9" : (i % 2 === 0 ? "0.65" : "0.4");

      // Spanning from left-top to bottom-right with organic s-bends
      const baseX = -200 + t * 1800;
      const x0 = baseX;
      const y0 = -120;

      // Harmonic undulating wave offsets
      const wavePhase = i * 0.28;
      const cx1 = baseX + 160 + Math.sin(wavePhase) * 110;
      const cy1 = 260 + Math.cos(wavePhase * 0.9) * 80;
      const cx2 = baseX - 120 + Math.cos(wavePhase * 1.1) * 130;
      const cy2 = 680 + Math.sin(wavePhase * 0.8) * 90;
      const xEnd = baseX + 280 + Math.sin(wavePhase) * 100;
      const yEnd = 1320;

      pathsSvg += `<path d="M ${x0} ${y0} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${xEnd} ${yEnd}" class="${strokeClass}" stroke-width="${strokeWidth}" opacity="${opacity}" fill="none" />`;

      // Concentric elliptical wave loop on left flank (exact match to user Image 2)
      if (i % 3 === 0 && i < 24) {
        const rx = 100 + i * 28;
        const ry = 180 + i * 44;
        const rot = -14 + i * 0.8;
        pathsSvg += `<ellipse cx="-40" cy="540" rx="${rx}" ry="${ry}" transform="rotate(${rot} -40 540)" class="${strokeClass}" stroke-width="${strokeWidth * 0.85}" opacity="${opacity * 0.6}" fill="none" />`;
      }

      // Elevation tags along index contours
      if (isIndex && i > 3 && i < totalLines - 4) {
        const elevation = (i / 5) * 200;
        const lx = cx1 + 10;
        const ly = cy1 + 18;
        pathsSvg += `
          <g transform="rotate(-15 ${lx} ${ly})">
            <rect x="${lx - 4}" y="${ly - 10}" width="54" height="13" rx="3" class="fill-topo-badge" opacity="0.65" />
            <text x="${lx + 2}" y="${ly}" class="fill-topo-text text-[9px] font-mono tracking-wider font-bold select-none pointer-events-none">+${elevation}m</text>
          </g>
        `;
      }
    }

    // High-contrast accent flow ribbons
    pathsSvg += `
      <path d="M -80 440 C 420 180, 880 780, 1720 520" class="stroke-topo-accent" stroke-width="2.8" opacity="0.85" fill="none" />
      <path d="M -80 510 C 470 240, 930 840, 1720 590" class="stroke-topo-accent" stroke-width="1.8" opacity="0.6" fill="none" />
    `;

    el.innerHTML = `
      <svg class="w-full h-full" viewBox="0 0 1600 1200" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        ${pathsSvg}
      </svg>
    `;
    return el;
  }

  // -------------------------------------------------------------
  // 4. LAYER 3: 3D GEODESIC AI SPHERE & SYNAPTIC SPARKS (NEURAL)
  // Matching user's Reference Image 3: high-contrast 3D constellation
  // -------------------------------------------------------------
  let neuralCanvas, neuralCtx;
  let sphereNodes = [];
  let sphereEdges = [];
  let synapsePulses = [];
  let rotX = 0.22;
  let rotY = 0.45;
  let targetRotX = 0.22;
  let targetRotY = 0.45;

  const SPHERE_NODE_COUNT = 68;
  const PULSE_COUNT = 18;

  function createNeuralLayer() {
    const el = document.createElement("div");
    el.id = "bgLayer-neural";
    el.className = "vector-bg-layer";

    neuralCanvas = document.createElement("canvas");
    neuralCanvas.className = "w-full h-full";
    el.appendChild(neuralCanvas);

    // Interactive mouse tilt parallax tracking
    window.addEventListener("mousemove", (e) => {
      const nx = (e.clientX / window.innerWidth) - 0.5;
      const ny = (e.clientY / window.innerHeight) - 0.5;
      targetRotY = 0.45 + nx * 0.95;
      targetRotX = 0.22 + ny * 0.7;
    });

    return el;
  }

  function resizeNeuralCanvas() {
    if (!neuralCanvas) return;
    neuralCanvas.width = window.innerWidth;
    neuralCanvas.height = window.innerHeight;
    initSphereModel();
  }

  function initSphereModel() {
    sphereNodes = [];
    sphereEdges = [];
    synapsePulses = [];

    const w = neuralCanvas.width || window.innerWidth;
    const h = neuralCanvas.height || window.innerHeight;
    const isMobile = w < 768;

    // Radius of the 3D geodesic sphere (matches user Image 3)
    const R = Math.min(w, h) * (isMobile ? 0.42 : 0.38);

    // Fibonacci sphere distribution for uniform 3D spherical constellation
    for (let i = 0; i < SPHERE_NODE_COUNT; i++) {
      const phi = Math.acos(1 - 2 * (i + 0.5) / SPHERE_NODE_COUNT);
      const theta = Math.PI * (1 + Math.sqrt(5)) * (i + 0.5);

      const rVar = R * (0.90 + Math.random() * 0.22);

      sphereNodes.push({
        x: rVar * Math.sin(phi) * Math.cos(theta),
        y: rVar * Math.sin(phi) * Math.sin(theta),
        z: rVar * Math.cos(phi),
        baseRadius: Math.random() * 2.5 + 2.5,
        pulseOffset: Math.random() * Math.PI * 2,
        pulseSpeed: 0.035 + Math.random() * 0.02,
        isCoreHub: i % 6 === 0 // 1 in 6 is a prominent AI core hub
      });
    }

    // Connect nodes within 3D Euclidean threshold
    const maxEdgeDist = R * 0.58;
    for (let i = 0; i < sphereNodes.length; i++) {
      for (let j = i + 1; j < sphereNodes.length; j++) {
        const dx = sphereNodes[i].x - sphereNodes[j].x;
        const dy = sphereNodes[i].y - sphereNodes[j].y;
        const dz = sphereNodes[i].z - sphereNodes[j].z;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (dist < maxEdgeDist) {
          sphereEdges.push({
            from: i,
            to: j,
            dist: dist,
            maxDist: maxEdgeDist
          });
        }
      }
    }

    // Initialize travelling synaptic sparks
    for (let k = 0; k < PULSE_COUNT; k++) {
      spawnPulse();
    }
  }

  function spawnPulse() {
    if (sphereEdges.length === 0) return;
    const edgeIdx = Math.floor(Math.random() * sphereEdges.length);
    synapsePulses.push({
      edgeIdx: edgeIdx,
      progress: Math.random(),
      speed: 0.010 + Math.random() * 0.016,
      forward: Math.random() > 0.5
    });
  }

  function renderNeuralFrame() {
    if (!neuralCanvas || !neuralCanvas.parentElement) return;

    // Check if neural layer is visible
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

    // Project 3D nodes into 2D screen space
    const projectedNodes = sphereNodes.map((n) => {
      // Rotate Y
      const x1 = n.x * cosY + n.z * sinY;
      const z1 = n.z * cosY - n.x * sinY;
      // Rotate X
      const y1 = n.y * cosX - z1 * sinX;
      const z2 = z1 * cosX + n.y * sinX;

      const scale = focal / (focal + z2 + 260);
      const screenX = cx + x1 * scale;
      const screenY = cy + y1 * scale;

      // Depth alpha (0.25 to 1.0)
      const depthAlpha = Math.max(0.25, Math.min(1.0, (z2 + 340) / 680));

      return {
        screenX,
        screenY,
        scale,
        z: z2,
        depthAlpha,
        node: n
      };
    });

    // 1. Draw 3D Edges with depth-weighted alpha (high contrast)
    const edgeBaseColor = isDark ? "rgba(165, 180, 252," : "rgba(79, 70, 229,";
    for (let i = 0; i < sphereEdges.length; i++) {
      const edge = sphereEdges[i];
      const p1 = projectedNodes[edge.from];
      const p2 = projectedNodes[edge.to];
      if (!p1 || !p2) continue;

      const edgeAlpha = ((p1.depthAlpha + p2.depthAlpha) * 0.5) * (1 - edge.dist / edge.maxDist) * (isDark ? 0.65 : 0.42);
      neuralCtx.beginPath();
      neuralCtx.moveTo(p1.screenX, p1.screenY);
      neuralCtx.lineTo(p2.screenX, p2.screenY);
      neuralCtx.strokeStyle = `${edgeBaseColor} ${edgeAlpha})`;
      neuralCtx.lineWidth = Math.max(0.8, (p1.scale + p2.scale) * 0.5 * (isDark ? 1.4 : 1.1));
      neuralCtx.stroke();
    }

    // 2. Update and draw travelling Synaptic Sparks
    const pulseGlow = isDark ? "rgba(56, 189, 248, 1)" : "rgba(67, 56, 202, 1)";
    for (let k = 0; k < synapsePulses.length; k++) {
      const pulse = synapsePulses[k];
      const edge = sphereEdges[pulse.edgeIdx];
      if (!edge) continue;

      pulse.progress += pulse.speed;
      if (pulse.progress >= 1.0) {
        pulse.edgeIdx = Math.floor(Math.random() * sphereEdges.length);
        pulse.progress = 0;
        pulse.forward = Math.random() > 0.5;
      }

      const p1 = projectedNodes[pulse.forward ? edge.from : edge.to];
      const p2 = projectedNodes[pulse.forward ? edge.to : edge.from];
      if (!p1 || !p2) continue;

      const px = p1.screenX + (p2.screenX - p1.screenX) * pulse.progress;
      const py = p1.screenY + (p2.screenY - p1.screenY) * pulse.progress;
      const pDepth = (p1.depthAlpha + p2.depthAlpha) * 0.5;

      neuralCtx.beginPath();
      neuralCtx.arc(px, py, 2.8 * pDepth, 0, Math.PI * 2);
      neuralCtx.fillStyle = pulseGlow;
      neuralCtx.fill();
    }

    // 3. Draw 3D Nodes with crisp geometry & halos
    const nodeColor = isDark ? "rgba(199, 210, 254, 0.9)" : "rgba(67, 56, 202, 0.85)";
    const coreGlow = isDark ? "rgba(255, 255, 255, 1)" : "rgba(30, 27, 75, 1)";

    for (let i = 0; i < projectedNodes.length; i++) {
      const p = projectedNodes[i];
      const n = p.node;
      n.pulseOffset += n.pulseSpeed;

      const r = (n.baseRadius + Math.sin(n.pulseOffset) * 0.7) * p.scale;

      // Outer aura ring for core hubs
      if (n.isCoreHub) {
        neuralCtx.beginPath();
        neuralCtx.arc(p.screenX, p.screenY, r * 2.4, 0, Math.PI * 2);
        neuralCtx.strokeStyle = isDark ? "rgba(165, 180, 252, 0.5)" : "rgba(99, 102, 241, 0.35)";
        neuralCtx.lineWidth = 1.2;
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
  // 5. LAYER 4: AEROSPACE CAD BLUEPRINT TELEMETRY & RADAR HUD
  // Matching user's Reference Image 4: Calipers, traces, rose beacon
  // -------------------------------------------------------------
  function createTelemetryLayer() {
    const el = document.createElement("div");
    el.id = "bgLayer-telemetry";
    el.className = "vector-bg-layer";

    // Precision calibrated degree tick marks around origin (240, 840)
    const cx = 240, cy = 840;
    let ticksSvg = "";
    for (let deg = 0; deg <= 90; deg += 3) {
      const rad = (deg * Math.PI) / 180;
      const isMajor = deg % 15 === 0;
      const len = isMajor ? 14 : 7;
      const r1 = 340;
      const r2 = r1 + len;
      const x1 = cx + r1 * Math.cos(rad);
      const y1 = cy - r1 * Math.sin(rad);
      const x2 = cx + r2 * Math.cos(rad);
      const y2 = cy - r2 * Math.sin(rad);

      ticksSvg += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke-width="${isMajor ? 1.8 : 0.9}" opacity="${isMajor ? 0.9 : 0.5}" />`;

      if (isMajor && deg > 0 && deg < 90) {
        const tx = cx + (r2 + 16) * Math.cos(rad);
        const ty = cy - (r2 + 16) * Math.sin(rad);
        ticksSvg += `<text x="${tx.toFixed(1)}" y="${ty.toFixed(1)}" class="text-[9px] font-mono fill-current font-bold" text-anchor="middle" dominant-baseline="middle">${deg}°</text>`;
      }
    }

    el.innerHTML = `
      <svg class="w-full h-full" viewBox="0 0 1600 1100" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <!-- Arrow marker for dimension leaders -->
          <marker id="cadArrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="currentColor" />
          </marker>
          <!-- Sweeping Radar Gradient -->
          <linearGradient id="radarBeam" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.65" />
            <stop offset="100%" stop-color="#38bdf8" stop-opacity="0" />
          </linearGradient>
        </defs>

        <g class="stroke-telemetry-hud" fill="none">
          <!-- Concentric Precision Caliper Arcs around Origin (240, 840) -->
          <circle cx="${cx}" cy="${cy}" r="160" stroke-width="1.2" stroke-dasharray="3 5" opacity="0.6" />
          <circle cx="${cx}" cy="${cy}" r="260" stroke-width="1.4" opacity="0.75" />
          <circle cx="${cx}" cy="${cy}" r="340" stroke-width="1.8" opacity="0.9" />
          <circle cx="${cx}" cy="${cy}" r="480" stroke-width="1.4" stroke-dasharray="12 6 2 6" opacity="0.65" />
          <circle cx="${cx}" cy="${cy}" r="640" stroke-width="1.6" opacity="0.8" />
          <circle cx="${cx}" cy="${cy}" r="820" stroke-width="1.0" stroke-dasharray="4 8" opacity="0.45" />

          <!-- Degree Calibration Ticks -->
          <g class="stroke-telemetry-hud fill-telemetry-text">
            ${ticksSvg}
          </g>

          <!-- Rectilinear Circuit & Bus Traces (45° & 90° Draft Lines with Terminal Vias) -->
          <!-- Bus Trace 1 -->
          <path d="M 120 840 L 120 540 L 260 400 L 460 400 L 520 340 L 520 180 L 680 180" stroke-width="1.6" opacity="0.85" />
          <circle cx="680" cy="180" r="5" class="stroke-telemetry-accent" stroke-width="1.6" />
          <circle cx="680" cy="180" r="1.8" fill="currentColor" />

          <!-- Bus Trace 2 -->
          <path d="M 240 700 L 380 560 L 580 560 L 640 500 L 780 500" stroke-width="1.5" opacity="0.8" />
          <circle cx="780" cy="500" r="4.5" class="stroke-telemetry-accent" stroke-width="1.6" />

          <!-- Bus Trace 3 -->
          <path d="M 340 840 L 500 680 L 720 680 L 780 620 L 960 620" stroke-width="1.4" stroke-dasharray="8 4" opacity="0.7" />
          <circle cx="960" cy="620" r="4.5" class="stroke-telemetry-accent" stroke-width="1.6" />

          <!-- Technical Dimensioning Extension Lines with Arrowheads -->
          <g class="stroke-telemetry-accent" marker-start="url(#cadArrow)" marker-end="url(#cadArrow)">
            <line x1="240" y1="180" x2="680" y2="180" stroke-width="1.2" opacity="0.75" />
            <line x1="840" y1="500" x2="1140" y2="500" stroke-width="1.2" opacity="0.7" />
          </g>

          <!-- Secondary Top-Right HUD Caliper (1180, 180) -->
          <circle cx="1180" cy="180" r="110" stroke-width="1.5" opacity="0.8" />
          <circle cx="1180" cy="180" r="180" stroke-width="1.0" stroke-dasharray="6 6" opacity="0.55" />
          <line x1="1180" y1="30" x2="1180" y2="330" stroke-width="1.4" opacity="0.65" />
          <line x1="1030" y1="180" x2="1330" y2="180" stroke-width="1.4" opacity="0.65" />

          <!-- Dimension Annotations -->
          <text x="460" y="170" class="fill-telemetry-text text-[10px] font-mono tracking-wider font-bold" opacity="0.85">Ø 680.00 mm [CAD_CH-01]</text>
          <text x="960" y="490" class="fill-telemetry-text text-[10px] font-mono tracking-wider font-bold" opacity="0.85">EXT // 300.00 [TOL: ±0.02]</text>

          <!-- SIGNATURE ACCENT BEACON (Exact Match to User's Reference Image 4) -->
          <g transform="translate(680, 260)">
            <!-- Outer Pulsating Radar Aura -->
            <circle cx="0" cy="0" r="14" class="fill-telemetry-beacon" opacity="0.25">
              <animate attributeName="r" values="8;26;8" dur="3s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.45;0.05;0.45" dur="3s" repeatCount="indefinite" />
            </circle>
            <!-- Solid Coral Accent Focal Dot -->
            <circle cx="0" cy="0" r="5.5" class="fill-telemetry-beacon" />
            <!-- Leader Line to Target Annotation -->
            <path d="M 0 0 L 40 -35 L 140 -35" stroke-width="1.5" class="stroke-telemetry-beacon" fill="none" opacity="0.95" />
            <text x="46" y="-42" class="fill-telemetry-beacon text-[10px] font-mono font-extrabold tracking-widest">ACQ // TARGET 01 [CONFIRMED]</text>
          </g>

          <!-- Monospace Aerospace Metadata Tags -->
          <text x="240" y="870" class="fill-telemetry-text text-[10px] font-mono tracking-widest font-bold" opacity="0.8">ORIGIN: WGS-84 // LAT 23°46'N LONG 90°23'E</text>
          <text x="240" y="888" class="fill-telemetry-text text-[10px] font-mono tracking-widest" opacity="0.65">FORENSIC_RADAR // 70,000+ ARTICLES INDEXED</text>
          <text x="1190" y="210" class="fill-telemetry-text text-[10px] font-mono tracking-widest font-semibold" opacity="0.8">CALIPER: 0.001 // SEC: 04-A</text>

          <!-- Smooth Rotating Radar Azimuth Sweeper -->
          <line x1="${cx}" y1="${cy}" x2="${cx}" y2="200" stroke="url(#radarBeam)" stroke-width="2.6" opacity="0.75">
            <animateTransform attributeName="transform" type="rotate" from="0 ${cx} ${cy}" to="360 ${cx} ${cy}" dur="22s" repeatCount="indefinite" />
          </line>
        </g>
      </svg>
    `;
    return el;
  }

  // -------------------------------------------------------------
  // 6. PATTERN DISPLAY & TRANSITIONS
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
  }

  // -------------------------------------------------------------
  // 7. AUTO-CYCLE TIMING ENGINE
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
