import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import './AsciiThreeText.css';

// === Shaders ===
const vertexShader = `
varying vec2 vUv;
uniform float uTime;
uniform float mouse;
uniform float uEnableWaves;

void main() {
    vUv = uv;
    float time = uTime * 5.;

    float waveFactor = uEnableWaves;

    vec3 transformed = position;

    transformed.x += sin(time + position.y) * 0.5 * waveFactor;
    transformed.y += cos(time + position.z) * 0.15 * waveFactor;
    transformed.z += sin(time + position.x) * waveFactor;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
}
`;

const fragmentShader = `
varying vec2 vUv;
uniform float mouse;
uniform float uTime;
uniform sampler2D uTexture;

void main() {
    float time = uTime;
    vec2 pos = vUv;

    float move = sin(time + mouse) * 0.01;
    float r = texture2D(uTexture, pos + cos(time * 2. - time + pos.x) * .01).r;
    float g = texture2D(uTexture, pos + tan(time * .5 + pos.x - time) * .01).g;
    float b = texture2D(uTexture, pos - cos(time * 2. + time + pos.y) * .01).b;
    float a = texture2D(uTexture, pos).a;
    gl_FragColor = vec4(r, g, b, a);
}
`;

// Simple mapping helper
Math.map = function (n, start, stop, start2, stop2) {
  return ((n - start) / (stop - start)) * (stop2 - start2) + start2;
};

// Pixel ratio
const PX_RATIO = typeof window !== 'undefined' ? window.devicePixelRatio : 1;

// === ASCII Filter ===
class AsciiFilter {
  constructor(renderer, { fontSize, fontFamily, charset, invert } = {}) {
    this.renderer = renderer;
    this.domElement = document.createElement('div');
    this.domElement.classList.add('ascii-filter');

    this.pre = document.createElement('pre');
    this.domElement.appendChild(this.pre);

    this.canvas = document.createElement('canvas');
    this.context = this.canvas.getContext('2d');
    this.domElement.appendChild(this.canvas);

    this.deg = 0;
    this.invert = invert ?? true;
    this.fontSize = fontSize ?? 12;
    this.fontFamily = fontFamily ?? "'Courier New', monospace";
    this.charset = charset ??
      " .'`^\",:;Il!i~+_-?][}{1)(|/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$";

    this.context.imageSmoothingEnabled = false;
    this.onMouseMove = this.onMouseMove.bind(this);
    document.addEventListener('mousemove', this.onMouseMove);
  }

  setSize(width, height) {
    this.width = width;
    this.height = height;
    this.renderer.setSize(width, height);
    this.reset();

    this.center = { x: width / 2, y: height / 2 };
    this.mouse = { x: this.center.x, y: this.center.y };
  }

  reset() {
    this.context.font = `${this.fontSize}px ${this.fontFamily}`;
    const charWidth = this.context.measureText('A').width;

    this.cols = Math.floor(
      this.width / (this.fontSize * (charWidth / this.fontSize))
    );
    this.rows = Math.floor(this.height / this.fontSize);

    this.canvas.width = this.cols;
    this.canvas.height = this.rows;

    Object.assign(this.pre.style, {
      fontFamily: this.fontFamily,
      fontSize: `${this.fontSize}px`,
      margin: '0',
      padding: '0',
      lineHeight: '1em',
      position: 'absolute',
      left: '50%',
      top: '50%',
      transform: 'translate(-50%, -50%)',
      zIndex: '9',
      mixBlendMode: 'difference',
    });
  }

  render(scene, camera) {
    this.renderer.render(scene, camera);

    const w = this.canvas.width;
    const h = this.canvas.height;
    this.context.clearRect(0, 0, w, h);
    this.context.drawImage(this.renderer.domElement, 0, 0, w, h);

    this.asciify(w, h);
    this.hue();
  }

  onMouseMove(e) {
    this.mouse = { x: e.clientX * PX_RATIO, y: e.clientY * PX_RATIO };
  }

  get dx() { return this.mouse.x - this.center.x; }
  get dy() { return this.mouse.y - this.center.y; }

  hue() {
    const deg = (Math.atan2(this.dy, this.dx) * 180) / Math.PI;
    this.deg += (deg - this.deg) * 0.075;
    this.domElement.style.filter = `hue-rotate(${this.deg.toFixed(1)}deg)`;
  }

  asciify(w, h) {
    const imgData = this.context.getImageData(0, 0, w, h).data;
    let str = '';
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = x * 4 + y * 4 * w;
        const [r, g, b, a] = [imgData[i], imgData[i + 1], imgData[i + 2], imgData[i + 3]];
        if (a === 0) { str += ' '; continue; }
        let gray = (0.3 * r + 0.6 * g + 0.1 * b) / 255;
        let idx = Math.floor((1 - gray) * (this.charset.length - 1));
        if (this.invert) idx = this.charset.length - idx - 1;
        str += this.charset[idx];
      }
      str += '\n';
    }
    this.pre.textContent = str;
  }

  dispose() {
    document.removeEventListener('mousemove', this.onMouseMove);
  }
}

// === Canvas Text Helper ===
class CanvasTxt {
  constructor(txt, { fontSize = 200, fontFamily = 'Arial', color = '#fdf9f3' } = {}) {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.txt = txt;
    this.fontSize = fontSize;
    this.fontFamily = fontFamily;
    this.color = color;
    this.font = `600 ${this.fontSize}px ${this.fontFamily}`;
  }

  resize() {
    this.ctx.font = this.font;
    const m = this.ctx.measureText(this.txt);
    const w = Math.ceil(m.width) + 20;
    const h = Math.ceil(m.actualBoundingBoxAscent + m.actualBoundingBoxDescent) + 20;
    this.canvas.width = w; this.canvas.height = h;
  }

  render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = this.color;
    this.ctx.font = this.font;
    const m = this.ctx.measureText(this.txt);
    const y = 10 + m.actualBoundingBoxAscent;
    this.ctx.fillText(this.txt, 10, y);
  }

  get width() { return this.canvas.width; }
  get height() { return this.canvas.height; }
  get texture() { return this.canvas; }
}

// === Main ASCII Canvas ===
class CanvAscii {
  constructor(opts, container, w, h) {
    Object.assign(this, opts);
    this.container = container;
    this.width = w; this.height = h;
    this.camera = new THREE.PerspectiveCamera(45, w / h, 1, 1000);
    this.camera.position.z = 30;
    this.scene = new THREE.Scene();
    this.mouse = { x: 0, y: 0 };
    this.onMouseMove = this.onMouseMove.bind(this);
    this.initMesh();
    this.initRenderer();
  }

  initMesh() {
    this.textCanvas = new CanvasTxt(this.text, { fontSize: this.textFontSize, fontFamily: 'IBM Plex Mono', color: this.textColor });
    this.textCanvas.resize();
    this.textCanvas.render();
    this.texture = new THREE.CanvasTexture(this.textCanvas.texture);
    this.texture.minFilter = THREE.NearestFilter;
    const aspect = this.textCanvas.width / this.textCanvas.height;
    const ph = this.planeBaseHeight; const pw = ph * aspect;
    this.geometry = new THREE.PlaneGeometry(pw, ph, 36, 36);
    this.material = new THREE.ShaderMaterial({
      vertexShader, fragmentShader, transparent: true,
      uniforms: {
        uTime: { value: 0 },
        mouse: { value: 1.0 },
        uTexture: { value: this.texture },
        uEnableWaves: { value: this.enableWaves ? 1.0 : 0.0 }
      }
    });
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.scene.add(this.mesh);
  }

  initRenderer() {
    this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false });
    this.renderer.setPixelRatio(1);
    this.renderer.setClearColor(0x000000, 0);
    this.filter = new AsciiFilter(this.renderer, { fontFamily: 'IBM Plex Mono', fontSize: this.asciiFontSize, invert: true });
    this.container.appendChild(this.filter.domElement);
    this.setSize(this.width, this.height);
    this.container.addEventListener('mousemove', this.onMouseMove);
    this.container.addEventListener('touchmove', this.onMouseMove);
  }

  setSize(w, h) {
    this.width = w; this.height = h;
    this.camera.aspect = w / h; this.camera.updateProjectionMatrix();
    this.filter.setSize(w, h);
    this.center = { x: w / 2, y: h / 2 };
  }

  onMouseMove(evt) {
    const e = evt.touches ? evt.touches[0] : evt;
    const r = this.container.getBoundingClientRect();
    this.mouse = { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  load() {
    const loop = () => {
      this.animationFrameId = requestAnimationFrame(loop);
      this.render();
    };
    loop();
  }

  render() {
    const t = Date.now() * 0.001;
    this.textCanvas.render();
    this.texture.needsUpdate = true;
    this.mesh.material.uniforms.uTime.value = Math.sin(t);
    const x = Math.map(this.mouse.y, 0, this.height, 0.5, -0.5);
    const y = Math.map(this.mouse.x, 0, this.width, -0.5, 0.5);
    this.mesh.rotation.x += (x - this.mesh.rotation.x) * 0.05;
    this.mesh.rotation.y += (y - this.mesh.rotation.y) * 0.05;
    this.filter.render(this.scene, this.camera);
  }

  dispose() {
    cancelAnimationFrame(this.animationFrameId);
    this.filter.dispose();
    this.container.removeChild(this.filter.domElement);
    this.container.removeEventListener('mousemove', this.onMouseMove);
    this.container.removeEventListener('touchmove', this.onMouseMove);
    this.geometry.dispose();
    this.material.dispose();
    this.renderer.dispose();
  }
}

// === React wrapper ===
export default function AsciiThreeText({
  text,
  asciiFontSize = 8,
  textFontSize = 200,
  textColor = '#fdf9f3',
  planeBaseHeight = 8,
  enableWaves = true
}) {
  const containerRef = useRef(null);
  const asciiRef = useRef(null);

  useEffect(() => {
    if (!text) return;                     // nothing to render
    const container = containerRef.current;
    if (!container) return;

    // 🔥 clear out any stray <canvas> or <pre> from prior renders
    container.innerHTML = '';

    // init our ASCII‑Three
    const { width, height } = container.getBoundingClientRect();
    asciiRef.current = new CanvAscii(
      { text, asciiFontSize, textFontSize, textColor, planeBaseHeight, enableWaves },
      container,
      width,
      height
    );
    asciiRef.current.load();

    // watch for resizes
    const ro = new ResizeObserver(entries => {
      const { width: w, height: h } = entries[0].contentRect;
      asciiRef.current.setSize(w, h);
    });
    ro.observe(container);

    return () => {
      ro.disconnect();
      asciiRef.current.dispose();
    };
  }, [text, asciiFontSize, textFontSize, textColor, planeBaseHeight, enableWaves]);

  if (!text) return null;
  return <div ref={containerRef} className="ascii-text-container" />;
}