// Brass R emblem: the clinic's R mark (traced from logo.png on theritzclinic.com) extruded in Three.js.
import * as THREE from '../vendor/three.module.min.js';
import { SVGLoader } from '../vendor/SVGLoader.js';
import { RoomEnvironment } from '../vendor/RoomEnvironment.js';


export async function mountBrassR(host, { still = false } = {}) {
  const svgText = await (await fetch(new URL('../assets/brand/r-mark.svg', import.meta.url))).text();
  const data = new SVGLoader().parse(svgText);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  const size = () => { const r = host.getBoundingClientRect(); renderer.setSize(r.width, r.height, false); camera.aspect = r.width / r.height; camera.updateProjectionMatrix(); };

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  camera.position.set(0, 0, 7.2);

  const brass = new THREE.MeshPhysicalMaterial({ color: 0xC9B08C, metalness: 1, roughness: 0.3, clearcoat: 0.5, clearcoatRoughness: 0.25 });
  const group = new THREE.Group();
  const geoms = [];
  for (const p of data.paths) {
    for (const shape of SVGLoader.createShapes(p)) {
      geoms.push(new THREE.ExtrudeGeometry(shape, { depth: 110, bevelEnabled: true, bevelThickness: 22, bevelSize: 18, bevelSegments: 6, curveSegments: 24 }));
    }
  }
  geoms.forEach((g) => group.add(new THREE.Mesh(g, brass)));
  const box = new THREE.Box3().setFromObject(group);
  const c = box.getCenter(new THREE.Vector3());
  group.children.forEach((m) => m.geometry.translate(-c.x, -c.y, -c.z));
  const s = 2.3 / (box.max.y - box.min.y);
  const emblem = new THREE.Group();
  emblem.add(group);
  group.scale.set(s, -s, s); // SVG y runs downward
  scene.add(emblem);

  const key = new THREE.DirectionalLight(0xfff1d6, 2.2); key.position.set(3, 4, 5); scene.add(key);
  const rim = new THREE.DirectionalLight(0xffffff, 1.2); rim.position.set(-4, 1, -3); scene.add(rim);

  host.innerHTML = '';
  host.appendChild(renderer.domElement);
  size();
  addEventListener('resize', size);

  let visible = true;
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(host);
  const t0 = performance.now();
  const frame = (t) => {
    const k = (t - t0) / 1000;
    emblem.rotation.y = still ? -0.35 : Math.sin(k * 0.6) * 0.55;
    emblem.rotation.x = still ? 0.06 : Math.sin(k * 0.4) * 0.06;
    if (visible) renderer.render(scene, camera);
    if (!still) requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}
