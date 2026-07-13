/*
 * fluid-hero.js — GPU stable-fluids solver in raw WebGL2.
 *
 * A real 2D incompressible Navier-Stokes field solved every frame on the GPU:
 *   advect velocity -> curl -> vorticity confinement -> divergence ->
 *   Jacobi pressure projection -> gradient subtract -> advect dye.
 * The cursor injects velocity + colored dye (i.e. vorticity) into the field.
 * The display pass renders the dye on a visible computational lattice with
 * ordered (Bayer) dithering — the "discretized flow" identity made literal.
 *
 * Degrades gracefully: no WebGL2 / no float render targets / reduced-motion
 * all fall back to the CSS gradient field via the `.is-static` class.
 */

const PALETTE = [
  [0.13, 0.92, 0.78], // teal  #21e6c1 / #49f4d1
  [0.16, 0.78, 0.95], // cyan-blue
  [1.0, 0.32, 0.22], // warm  #ff4d3d
  [0.78, 0.66, 0.42], // gold  #c8aa6e
];

const CONFIG = {
  SIM_RESOLUTION: 140,
  DYE_RESOLUTION: 640,
  DENSITY_DISSIPATION: 1.35,
  VELOCITY_DISSIPATION: 0.25,
  PRESSURE: 0.8,
  PRESSURE_ITERATIONS: 20,
  CURL: 26,
  SPLAT_RADIUS: 0.2,
  SPLAT_FORCE: 6200,
};

export function initFluidHero() {
  const canvas = document.querySelector("#fluid-hero");
  if (!(canvas instanceof HTMLCanvasElement)) return;

  // no live solver -> no live controls: hide the readout panel too
  const goStatic = () => {
    canvas.classList.add("is-static");
    const readout = document.querySelector(".hero-readout");
    if (readout) readout.hidden = true;
  };

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) {
    goStatic();
    return;
  }

  const gl = canvas.getContext("webgl2", {
    alpha: false,
    depth: false,
    stencil: false,
    antialias: false,
    preserveDrawingBuffer: false,
    powerPreference: "high-performance",
  });

  if (!gl || !gl.getExtension("EXT_color_buffer_float")) {
    goStatic();
    return;
  }
  gl.getExtension("OES_texture_float_linear"); // best-effort; half-float linear is core

  /* ---------- shader plumbing ---------- */

  const baseVertex = `#version 300 es
  precision highp float;
  in vec2 aPosition;
  out vec2 vUv;
  out vec2 vL; out vec2 vR; out vec2 vT; out vec2 vB;
  uniform vec2 texelSize;
  void main () {
    vUv = aPosition * 0.5 + 0.5;
    vL = vUv - vec2(texelSize.x, 0.0);
    vR = vUv + vec2(texelSize.x, 0.0);
    vT = vUv + vec2(0.0, texelSize.y);
    vB = vUv - vec2(0.0, texelSize.y);
    gl_Position = vec4(aPosition, 0.0, 1.0);
  }`;

  const clearShader = `#version 300 es
  precision mediump float; precision mediump sampler2D;
  in vec2 vUv; out vec4 fragColor;
  uniform sampler2D uTexture; uniform float value;
  void main () { fragColor = value * texture(uTexture, vUv); }`;

  const splatShader = `#version 300 es
  precision highp float; precision highp sampler2D;
  in vec2 vUv; out vec4 fragColor;
  uniform sampler2D uTarget; uniform float aspectRatio;
  uniform vec3 color; uniform vec2 point; uniform float radius;
  void main () {
    vec2 p = vUv - point.xy; p.x *= aspectRatio;
    vec3 splat = exp(-dot(p, p) / radius) * color;
    vec3 base = texture(uTarget, vUv).xyz;
    fragColor = vec4(base + splat, 1.0);
  }`;

  const advectionShader = `#version 300 es
  precision highp float; precision highp sampler2D;
  in vec2 vUv; out vec4 fragColor;
  uniform sampler2D uVelocity; uniform sampler2D uSource;
  uniform vec2 texelSize; uniform float dt; uniform float dissipation;
  void main () {
    vec2 coord = vUv - dt * texture(uVelocity, vUv).xy * texelSize;
    vec4 result = texture(uSource, coord);
    float decay = 1.0 + dissipation * dt;
    fragColor = result / decay;
  }`;

  const divergenceShader = `#version 300 es
  precision mediump float; precision mediump sampler2D;
  in vec2 vUv; in vec2 vL; in vec2 vR; in vec2 vT; in vec2 vB;
  out vec4 fragColor; uniform sampler2D uVelocity;
  void main () {
    float L = texture(uVelocity, vL).x;
    float R = texture(uVelocity, vR).x;
    float T = texture(uVelocity, vT).y;
    float B = texture(uVelocity, vB).y;
    vec2 C = texture(uVelocity, vUv).xy;
    if (vL.x < 0.0) { L = -C.x; }
    if (vR.x > 1.0) { R = -C.x; }
    if (vT.y > 1.0) { T = -C.y; }
    if (vB.y < 0.0) { B = -C.y; }
    float div = 0.5 * (R - L + T - B);
    fragColor = vec4(div, 0.0, 0.0, 1.0);
  }`;

  const curlShader = `#version 300 es
  precision mediump float; precision mediump sampler2D;
  in vec2 vUv; in vec2 vL; in vec2 vR; in vec2 vT; in vec2 vB;
  out vec4 fragColor; uniform sampler2D uVelocity;
  void main () {
    float L = texture(uVelocity, vL).y;
    float R = texture(uVelocity, vR).y;
    float T = texture(uVelocity, vT).x;
    float B = texture(uVelocity, vB).x;
    float vorticity = R - L - T + B;
    fragColor = vec4(0.5 * vorticity, 0.0, 0.0, 1.0);
  }`;

  const vorticityShader = `#version 300 es
  precision highp float; precision highp sampler2D;
  in vec2 vUv; in vec2 vL; in vec2 vR; in vec2 vT; in vec2 vB;
  out vec4 fragColor;
  uniform sampler2D uVelocity; uniform sampler2D uCurl;
  uniform float curl; uniform float dt;
  void main () {
    float L = texture(uCurl, vL).x;
    float R = texture(uCurl, vR).x;
    float T = texture(uCurl, vT).x;
    float B = texture(uCurl, vB).x;
    float C = texture(uCurl, vUv).x;
    vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
    force /= length(force) + 0.0001;
    force *= curl * C;
    force.y *= -1.0;
    vec2 vel = texture(uVelocity, vUv).xy;
    vel += force * dt;
    vel = clamp(vel, -1000.0, 1000.0);
    fragColor = vec4(vel, 0.0, 1.0);
  }`;

  const pressureShader = `#version 300 es
  precision mediump float; precision mediump sampler2D;
  in vec2 vUv; in vec2 vL; in vec2 vR; in vec2 vT; in vec2 vB;
  out vec4 fragColor;
  uniform sampler2D uPressure; uniform sampler2D uDivergence;
  void main () {
    float L = texture(uPressure, vL).x;
    float R = texture(uPressure, vR).x;
    float T = texture(uPressure, vT).x;
    float B = texture(uPressure, vB).x;
    float divergence = texture(uDivergence, vUv).x;
    float pressure = (L + R + B + T - divergence) * 0.25;
    fragColor = vec4(pressure, 0.0, 0.0, 1.0);
  }`;

  const gradientSubtractShader = `#version 300 es
  precision mediump float; precision mediump sampler2D;
  in vec2 vUv; in vec2 vL; in vec2 vR; in vec2 vT; in vec2 vB;
  out vec4 fragColor;
  uniform sampler2D uPressure; uniform sampler2D uVelocity;
  void main () {
    float L = texture(uPressure, vL).x;
    float R = texture(uPressure, vR).x;
    float T = texture(uPressure, vT).x;
    float B = texture(uPressure, vB).x;
    vec2 velocity = texture(uVelocity, vUv).xy;
    velocity.xy -= vec2(R - L, T - B);
    fragColor = vec4(velocity, 0.0, 1.0);
  }`;

  // Display: dye rendered on a visible lattice with ordered dithering.
  const displayShader = `#version 300 es
  precision highp float; precision highp sampler2D;
  in vec2 vUv; out vec4 fragColor;
  uniform sampler2D uTexture;
  uniform vec2 uResolution;
  uniform float uGrid;
  float bayer(vec2 p) {
    p = floor(mod(p, 4.0));
    int i = int(p.x) + int(p.y) * 4;
    float m[16];
    m[0]=0.0;  m[1]=8.0;  m[2]=2.0;  m[3]=10.0;
    m[4]=12.0; m[5]=4.0;  m[6]=14.0; m[7]=6.0;
    m[8]=3.0;  m[9]=11.0; m[10]=1.0; m[11]=9.0;
    m[12]=15.0;m[13]=7.0; m[14]=13.0;m[15]=5.0;
    float v = 0.0;
    for (int k = 0; k < 16; k++) { if (k == i) v = m[k]; }
    return (v + 0.5) / 16.0;
  }
  void main () {
    vec3 c = texture(uTexture, vUv).rgb;
    float lum = max(c.r, max(c.g, c.b));
    vec2 px = vUv * uResolution;

    // ordered dither -> discretized bands of the continuous field
    float b = bayer(px / max(1.0, uGrid) * 4.0);
    float levels = 7.0;
    vec3 dithered = floor(c * levels + b) / levels;

    // computational lattice
    vec2 f = abs(fract(px / max(6.0, uGrid)) - 0.5);
    float edge = max(f.x, f.y);
    float gridMask = smoothstep(0.44, 0.5, edge);
    vec3 gridColor = vec3(0.12, 0.55, 0.47);

    vec3 col = dithered;
    col += gridMask * (0.05 + 0.6 * lum) * gridColor;
    col += vec3(0.014, 0.02, 0.028); // abyssal floor

    // vignette to seat the field into the dark page
    float vig = smoothstep(1.25, 0.25, length((vUv - 0.5) * vec2(1.15, 1.0)));
    col *= vig;

    fragColor = vec4(col, 1.0);
  }`;

  function compile(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.warn(gl.getShaderInfoLog(shader));
    }
    return shader;
  }

  const vs = compile(gl.VERTEX_SHADER, baseVertex);

  function program(fragmentSource) {
    const prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, fragmentSource));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.warn(gl.getProgramInfoLog(prog));
    }
    const uniforms = {};
    const count = gl.getProgramParameter(prog, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < count; i += 1) {
      const name = gl.getActiveUniform(prog, i).name;
      uniforms[name] = gl.getUniformLocation(prog, name);
    }
    return { prog, uniforms };
  }

  const programs = {
    clear: program(clearShader),
    splat: program(splatShader),
    advection: program(advectionShader),
    divergence: program(divergenceShader),
    curl: program(curlShader),
    vorticity: program(vorticityShader),
    pressure: program(pressureShader),
    gradient: program(gradientSubtractShader),
    display: program(displayShader),
  };

  // fullscreen triangle-pair
  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]), gl.STATIC_DRAW);
  const indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2, 0, 2, 3]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

  function blit(target) {
    if (target) {
      gl.viewport(0, 0, target.width, target.height);
      gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo);
    } else {
      gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
  }

  /* ---------- framebuffers ---------- */

  function createFBO(w, h, internalFormat, format, type, filter) {
    gl.activeTexture(gl.TEXTURE0);
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, w, h, 0, format, type, null);

    const fbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    return {
      texture,
      fbo,
      width: w,
      height: h,
      texelSizeX: 1 / w,
      texelSizeY: 1 / h,
      attach(id) {
        gl.activeTexture(gl.TEXTURE0 + id);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        return id;
      },
      dispose() {
        gl.deleteTexture(texture);
        gl.deleteFramebuffer(fbo);
      },
    };
  }

  function createDoubleFBO(w, h, internalFormat, format, type, filter) {
    let fbo1 = createFBO(w, h, internalFormat, format, type, filter);
    let fbo2 = createFBO(w, h, internalFormat, format, type, filter);
    return {
      width: w,
      height: h,
      texelSizeX: fbo1.texelSizeX,
      texelSizeY: fbo1.texelSizeY,
      get read() { return fbo1; },
      set read(v) { fbo1 = v; },
      get write() { return fbo2; },
      set write(v) { fbo2 = v; },
      swap() { const t = fbo1; fbo1 = fbo2; fbo2 = t; },
      dispose() { fbo1.dispose(); fbo2.dispose(); },
    };
  }

  const HALF = gl.HALF_FLOAT;
  let velocity, dye, divergence, curl, pressure;

  function getResolution(resolution) {
    let aspect = gl.drawingBufferWidth / gl.drawingBufferHeight;
    if (aspect < 1) aspect = 1 / aspect;
    const min = Math.round(resolution);
    const max = Math.round(resolution * aspect);
    if (gl.drawingBufferWidth > gl.drawingBufferHeight) return { width: max, height: min };
    return { width: min, height: max };
  }

  function initFramebuffers() {
    // free previously allocated GPU resources before reallocating (resize)
    velocity?.dispose();
    dye?.dispose();
    divergence?.dispose();
    curl?.dispose();
    pressure?.dispose();

    const simRes = getResolution(CONFIG.SIM_RESOLUTION);
    const dyeRes = getResolution(CONFIG.DYE_RESOLUTION);
    velocity = createDoubleFBO(simRes.width, simRes.height, gl.RG16F, gl.RG, HALF, gl.LINEAR);
    dye = createDoubleFBO(dyeRes.width, dyeRes.height, gl.RGBA16F, gl.RGBA, HALF, gl.LINEAR);
    divergence = createFBO(simRes.width, simRes.height, gl.R16F, gl.RED, HALF, gl.NEAREST);
    curl = createFBO(simRes.width, simRes.height, gl.R16F, gl.RED, HALF, gl.NEAREST);
    pressure = createDoubleFBO(simRes.width, simRes.height, gl.R16F, gl.RED, HALF, gl.NEAREST);
  }

  /* ---------- sizing ---------- */

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.floor(canvas.clientWidth * dpr);
    const h = Math.floor(canvas.clientHeight * dpr);
    if (w === 0 || h === 0) return false;
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      return true;
    }
    return false;
  }

  resize();
  initFramebuffers();

  /* ---------- interaction ---------- */

  const pointer = { x: 0, y: 0, dx: 0, dy: 0, moved: false, color: PALETTE[0] };

  function pointerColor() {
    const c = PALETTE[Math.floor(Math.random() * PALETTE.length)];
    const g = 0.14 + Math.random() * 0.08;
    return [c[0] * g, c[1] * g, c[2] * g];
  }

  function updatePointer(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    const x = (clientX - rect.left) / rect.width;
    const y = 1 - (clientY - rect.top) / rect.height;
    pointer.dx = (x - pointer.x) * CONFIG.SPLAT_FORCE;
    pointer.dy = (y - pointer.y) * CONFIG.SPLAT_FORCE;
    pointer.x = x;
    pointer.y = y;
    if (Math.abs(pointer.dx) > 0 || Math.abs(pointer.dy) > 0) pointer.moved = true;
  }

  window.addEventListener(
    "pointermove",
    (e) => {
      if (paused) return;
      updatePointer(e.clientX, e.clientY);
      if (pointer.color === PALETTE[0] && Math.random() < 0.02) pointer.color = pointerColor();
    },
    { passive: true }
  );

  let splatQueue = [];
  function splat(x, y, dx, dy, color) {
    const p = programs.splat;
    gl.useProgram(p.prog);
    gl.uniform1i(p.uniforms.uTarget, velocity.read.attach(0));
    gl.uniform1f(p.uniforms.aspectRatio, canvas.width / canvas.height);
    gl.uniform2f(p.uniforms.point, x, y);
    gl.uniform3f(p.uniforms.color, dx, dy, 0);
    gl.uniform1f(p.uniforms.radius, CONFIG.SPLAT_RADIUS / 100);
    blit(velocity.write);
    velocity.swap();

    gl.uniform1i(p.uniforms.uTarget, dye.read.attach(0));
    gl.uniform3f(p.uniforms.color, color[0], color[1], color[2]);
    blit(dye.write);
    dye.swap();
  }

  function seed(count) {
    for (let i = 0; i < count; i += 1) {
      const color = pointerColor().map((v) => v * 2.4);
      const x = Math.random();
      const y = Math.random();
      const dx = 1000 * (Math.random() - 0.5);
      const dy = 1000 * (Math.random() - 0.5);
      splatQueue.push([x, y, dx, dy, color]);
    }
  }

  /* ---------- simulation step ---------- */

  function step(dt) {
    gl.disable(gl.BLEND);

    // curl
    let p = programs.curl;
    gl.useProgram(p.prog);
    gl.uniform2f(p.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
    gl.uniform1i(p.uniforms.uVelocity, velocity.read.attach(0));
    blit(curl);

    // vorticity confinement
    p = programs.vorticity;
    gl.useProgram(p.prog);
    gl.uniform2f(p.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
    gl.uniform1i(p.uniforms.uVelocity, velocity.read.attach(0));
    gl.uniform1i(p.uniforms.uCurl, curl.attach(1));
    gl.uniform1f(p.uniforms.curl, CONFIG.CURL);
    gl.uniform1f(p.uniforms.dt, dt);
    blit(velocity.write);
    velocity.swap();

    // divergence
    p = programs.divergence;
    gl.useProgram(p.prog);
    gl.uniform2f(p.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
    gl.uniform1i(p.uniforms.uVelocity, velocity.read.attach(0));
    blit(divergence);

    // clear pressure (decay)
    p = programs.clear;
    gl.useProgram(p.prog);
    gl.uniform1i(p.uniforms.uTexture, pressure.read.attach(0));
    gl.uniform1f(p.uniforms.value, CONFIG.PRESSURE);
    blit(pressure.write);
    pressure.swap();

    // Jacobi pressure iterations
    p = programs.pressure;
    gl.useProgram(p.prog);
    gl.uniform2f(p.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
    gl.uniform1i(p.uniforms.uDivergence, divergence.attach(0));
    for (let i = 0; i < CONFIG.PRESSURE_ITERATIONS; i += 1) {
      gl.uniform1i(p.uniforms.uPressure, pressure.read.attach(1));
      blit(pressure.write);
      pressure.swap();
    }

    // gradient subtract -> divergence-free velocity
    p = programs.gradient;
    gl.useProgram(p.prog);
    gl.uniform2f(p.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
    gl.uniform1i(p.uniforms.uPressure, pressure.read.attach(0));
    gl.uniform1i(p.uniforms.uVelocity, velocity.read.attach(1));
    blit(velocity.write);
    velocity.swap();

    // advect velocity
    p = programs.advection;
    gl.useProgram(p.prog);
    gl.uniform2f(p.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
    gl.uniform1i(p.uniforms.uVelocity, velocity.read.attach(0));
    gl.uniform1i(p.uniforms.uSource, velocity.read.attach(0));
    gl.uniform1f(p.uniforms.dt, dt);
    gl.uniform1f(p.uniforms.dissipation, CONFIG.VELOCITY_DISSIPATION);
    blit(velocity.write);
    velocity.swap();

    // advect dye
    gl.uniform1i(p.uniforms.uVelocity, velocity.read.attach(0));
    gl.uniform1i(p.uniforms.uSource, dye.read.attach(1));
    gl.uniform1f(p.uniforms.dissipation, CONFIG.DENSITY_DISSIPATION);
    blit(dye.write);
    dye.swap();
  }

  function render() {
    const p = programs.display;
    gl.useProgram(p.prog);
    gl.uniform1i(p.uniforms.uTexture, dye.read.attach(0));
    gl.uniform2f(p.uniforms.uResolution, canvas.width, canvas.height);
    gl.uniform1f(p.uniforms.uGrid, gridSize);
    blit(null);
  }

  /* ---------- readouts + controls ---------- */

  const frameOut = document.querySelector("#frame-readout");
  const gridInput = document.querySelector("#grid-density");
  const gridOut = document.querySelector("#grid-readout");
  let gridSize = 26;
  if (gridInput instanceof HTMLInputElement) {
    gridSize = Number(gridInput.value) || gridSize;
    if (gridOut) gridOut.textContent = String(gridSize);
    gridInput.addEventListener("input", () => {
      gridSize = Number(gridInput.value);
      if (gridOut) gridOut.textContent = String(gridSize);
    });
  }
  const resOut = document.querySelector("#res-readout");
  if (resOut) resOut.textContent = `${velocity.width}x${velocity.height}`;

  /* ---------- lifecycle ---------- */

  let paused = false;
  let running = false;
  let rafId = 0;
  let lastTime = performance.now();
  let frame = 0;
  let sinceSeed = 0;

  seed(parseInt(String(Math.random() * 8), 10) + 6);

  function update(now) {
    if (!running) return;
    let dt = (now - lastTime) / 1000;
    dt = Math.min(dt, 0.0166);
    lastTime = now;

    if (resize()) initFramebuffers();

    // flush queued splats
    if (splatQueue.length) {
      splatQueue.forEach(([x, y, dx, dy, color]) => splat(x, y, dx, dy, color));
      splatQueue = [];
    }

    // pointer splat (injects vorticity into the field)
    if (pointer.moved) {
      pointer.moved = false;
      splat(pointer.x, pointer.y, pointer.dx, pointer.dy, pointer.color);
    }

    // ambient life — periodic gentle splats so the field keeps solving
    sinceSeed += dt;
    if (sinceSeed > 2.4) {
      sinceSeed = 0;
      seed(2);
    }

    step(dt);
    render();

    frame += 1;
    if (frameOut && frame % 5 === 0) frameOut.textContent = String(frame).padStart(5, "0");
    rafId = requestAnimationFrame(update);
  }

  function start() {
    if (running) return;
    running = true;
    lastTime = performance.now();
    rafId = requestAnimationFrame(update);
  }
  function stop() {
    running = false;
    cancelAnimationFrame(rafId); // never leave a stale frame queued (double-loop guard)
  }

  // pause when the hero scrolls out of view
  const hero = canvas.closest(".premium-hero") || canvas.parentElement;
  if ("IntersectionObserver" in window && hero) {
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries[0].isIntersecting;
        paused = !visible;
        if (visible && document.visibilityState === "visible") start();
        else stop();
      },
      { threshold: 0.02 }
    );
    io.observe(hero);
  } else {
    start();
  }

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible" && !paused) start();
    else stop();
  });

  window.addEventListener("resize", () => {
    if (resize()) initFramebuffers();
  });
}
