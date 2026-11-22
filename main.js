import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const planetData = [
  { name:"Mercury", type:"TERRESTRIAL PLANET", color:0x9a8d80, size:.34, orbit:5.2, speed:1.6, au:".39 AU", day:"58.6 days", moons:"0", description:"A small, cratered world racing around the Sun in just 88 Earth days." },
  { name:"Venus", type:"TERRESTRIAL PLANET", color:0xd9a66c, size:.55, orbit:7.2, speed:1.15, au:".72 AU", day:"243 days", moons:"0", description:"A bright world wrapped in thick clouds, with a surface hot enough to melt lead." },
  { name:"Earth", type:"TERRESTRIAL PLANET", color:0x438bd0, size:.58, orbit:9.5, speed:1, au:"1.00 AU", day:"24 hours", moons:"1", description:"Our pale blue home, the only known world to host life." },
  { name:"Mars", type:"TERRESTRIAL PLANET", color:0xc96d4e, size:.43, orbit:12, speed:.8, au:"1.52 AU", day:"24.6 hours", moons:"2", description:"A cold desert world with towering volcanoes, ancient valleys, and two tiny moons." },
  { name:"Jupiter", type:"GAS GIANT", color:0xd2a77e, size:1.25, orbit:16.2, speed:.43, au:"5.20 AU", day:"9.9 hours", moons:"95", description:"The giant of our planetary family, famous for its swirling storms and Great Red Spot." },
  { name:"Saturn", type:"GAS GIANT", color:0xd9c18c, size:1.05, orbit:21, speed:.31, au:"9.58 AU", day:"10.7 hours", moons:"146", description:"A magnificent gas giant surrounded by a vast system of icy rings." },
  { name:"Uranus", type:"ICE GIANT", color:0x86cbd0, size:.78, orbit:25.5, speed:.22, au:"19.2 AU", day:"17.2 hours", moons:"28", description:"An icy blue giant that rotates on its side, giving it extreme seasons." },
  { name:"Neptune", type:"ICE GIANT", color:0x456fe0, size:.76, orbit:29.5, speed:.17, au:"30.1 AU", day:"16.1 hours", moons:"16", description:"A distant, deep-blue world swept by some of the fastest winds in the Solar System." }
];

const host = document.querySelector("#scene");
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x070918, .006);
const camera = new THREE.PerspectiveCamera(45, 1, .1, 220);
camera.position.set(0, 25, 47);
const renderer = new THREE.WebGLRenderer({ antialias:true, alpha:true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(host.clientWidth, host.clientHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
host.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = .045;
controls.minDistance = 13;
controls.maxDistance = 90;
controls.maxPolarAngle = Math.PI * .48;
controls.target.set(0, 0, 0);

scene.add(new THREE.AmbientLight(0x8290c9, 1.0));
const sunLight = new THREE.PointLight(0xffd7a0, 2300, 130, 1.5);
sunLight.position.set(0, 0, 0);
scene.add(sunLight);

function makeGlowTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 128;
  const ctx = canvas.getContext("2d");
  const g = ctx.createRadialGradient(64,64,2,64,64,64);
  g.addColorStop(0,"rgba(255,224,160,1)");
  g.addColorStop(.18,"rgba(255,174,94,.55)");
  g.addColorStop(.48,"rgba(255,125,65,.12)");
  g.addColorStop(1,"rgba(255,125,65,0)");
  ctx.fillStyle = g; ctx.fillRect(0,0,128,128);
  return new THREE.CanvasTexture(canvas);
}

const sun = new THREE.Mesh(new THREE.SphereGeometry(1.75, 48, 48), new THREE.MeshBasicMaterial({ color:0xffd58b }));
scene.add(sun);
const sunGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map:makeGlowTexture(), transparent:true, blending:THREE.AdditiveBlending, depthWrite:false }));
sunGlow.scale.set(11,11,1); scene.add(sunGlow);

const starGeometry = new THREE.BufferGeometry();
const starPositions = [];
for (let i=0; i<2600; i++) {
  const radius = 38 + Math.random()*95;
  const theta = Math.random()*Math.PI*2;
  const phi = Math.acos(2*Math.random()-1);
  starPositions.push(radius*Math.sin(phi)*Math.cos(theta), radius*Math.cos(phi), radius*Math.sin(phi)*Math.sin(theta));
}
starGeometry.setAttribute("position", new THREE.Float32BufferAttribute(starPositions,3));
const stars = new THREE.Points(starGeometry, new THREE.PointsMaterial({ color:0xc7c8ff, size:.12, transparent:true, opacity:.8, sizeAttenuation:true }));
scene.add(stars);

const planetMeshes = [];
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let selectedPlanet = null;
let paused = false;
let speedMultiplier = 1;
let elapsed = 0;
let toastTimer;

function createOrbit(radius) {
  const points = [];
  for (let i=0; i<=180; i++) {
    const a = i/180*Math.PI*2;
    points.push(new THREE.Vector3(Math.cos(a)*radius, 0, Math.sin(a)*radius));
  }
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const line = new THREE.LineLoop(geometry, new THREE.LineBasicMaterial({ color:0x55577f, transparent:true, opacity:.42 }));
  scene.add(line);
}

planetData.forEach((data, index) => {
  createOrbit(data.orbit);
  const pivot = new THREE.Group();
  scene.add(pivot);
  const material = new THREE.MeshStandardMaterial({ color:data.color, roughness:.82, metalness:.02 });
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(data.size, 36, 28), material);
  mesh.position.x = data.orbit;
  mesh.userData.planetIndex = index;
  pivot.add(mesh);
  // Subtle atmospheric halo for the inner rocky worlds and blue ice giants.
  if ([2,6,7].includes(index)) {
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map:makePlanetHalo(data.color), transparent:true, blending:THREE.AdditiveBlending, depthWrite:false, opacity:.38 }));
    halo.scale.set(data.size*4.2, data.size*4.2, 1);
    mesh.add(halo);
  }
  if (data.name === "Saturn") {
    const ring = new THREE.Mesh(new THREE.RingGeometry(1.35, 2.05, 64), new THREE.MeshBasicMaterial({ color:0xc9b58c, side:THREE.DoubleSide, transparent:true, opacity:.72 }));
    ring.rotation.x = Math.PI/2.25;
    ring.rotation.y = .15;
    mesh.add(ring);
  }
  planetMeshes.push({ data, pivot, mesh, index, initialAngle:index*.8 });
});

function makePlanetHalo(color) {
  const c = document.createElement("canvas"); c.width=c.height=128;
  const ctx=c.getContext("2d"), g=ctx.createRadialGradient(64,64,8,64,64,64);
  const col = new THREE.Color(color);
  const rgb = `${Math.round(col.r*255)},${Math.round(col.g*255)},${Math.round(col.b*255)}`;
  g.addColorStop(0,`rgba(${rgb},.32)`); g.addColorStop(1,`rgba(${rgb},0)`);
  ctx.fillStyle=g; ctx.fillRect(0,0,128,128);
  return new THREE.CanvasTexture(c);
}

function showToast(message) {
  const toast = document.querySelector("#toast");
  toast.textContent = message; toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 1900);
}

function selectPlanet(index) {
  const item = planetMeshes[index];
  if (!item) return;
  selectedPlanet = item;
  document.querySelector("#planetType").textContent = item.data.type;
  document.querySelector("#planetName").textContent = item.data.name;
  document.querySelector("#planetDescription").textContent = item.data.description;
  document.querySelector("#planetOrbit").textContent = item.data.au;
  document.querySelector("#planetDay").textContent = item.data.day;
  document.querySelector("#planetMoons").textContent = item.data.moons;
  document.querySelector("#planetCard").classList.add("visible");
  document.querySelectorAll(".planet-chip").forEach((chip, i) => chip.classList.toggle("active", i===index));
  document.querySelector("#planetSearch").value = item.data.name;
  focusSelected(false);
}

function focusSelected(showMessage=true) {
  if (!selectedPlanet) return;
  const world = new THREE.Vector3();
  selectedPlanet.mesh.getWorldPosition(world);
  const direction = new THREE.Vector3().subVectors(camera.position, controls.target).normalize();
  const distance = Math.max(7, selectedPlanet.data.size*8);
  controls.target.copy(world);
  camera.position.copy(world.clone().add(direction.multiplyScalar(distance)));
  controls.update();
  if (showMessage) showToast(`FOCUS LOCKED // ${selectedPlanet.data.name.toUpperCase()}`);
}

const picker = document.querySelector("#planetPicker");
planetData.forEach((planet, index) => {
  const button = document.createElement("button");
  button.className = "planet-chip"; button.type = "button"; button.textContent = planet.name.toUpperCase();
  button.addEventListener("click", () => selectPlanet(index));
  picker.appendChild(button);
});

document.querySelector("#closeCard").addEventListener("click", () => document.querySelector("#planetCard").classList.remove("visible"));
document.querySelector("#focusPlanet").addEventListener("click", () => focusSelected(true));
document.querySelector("#playPause").addEventListener("click", (event) => {
  paused = !paused;
  event.currentTarget.textContent = paused ? "▶" : "Ⅱ";
  event.currentTarget.setAttribute("aria-label", paused ? "Resume simulation" : "Pause simulation");
  showToast(paused ? "SIMULATION PAUSED" : "SIMULATION RESUMED");
});
document.querySelector("#speedSlider").addEventListener("input", (event) => {
  speedMultiplier = Number(event.target.value);
  document.querySelector("#speedValue").textContent = `${speedMultiplier.toFixed(1)}×`;
});
document.querySelector("#zoomIn").addEventListener("click", () => { camera.position.multiplyScalar(.88); controls.update(); });
document.querySelector("#zoomOut").addEventListener("click", () => { camera.position.multiplyScalar(1.12); controls.update(); });
document.querySelector("#resetView").addEventListener("click", () => {
  camera.position.set(0,25,47); controls.target.set(0,0,0); controls.update();
  document.querySelector("#planetCard").classList.remove("visible");
  document.querySelectorAll(".planet-chip").forEach(chip => chip.classList.remove("active"));
  selectedPlanet = null; document.querySelector("#planetSearch").value = "";
  showToast("CAMERA RESET");
});
document.querySelector("#cinematicBtn").addEventListener("click", () => {
  document.body.classList.toggle("cinematic");
  setTimeout(onResize, 80);
  showToast(document.body.classList.contains("cinematic") ? "CINEMATIC MODE // ON" : "CINEMATIC MODE // OFF");
});
document.querySelector("#planetSearch").addEventListener("keydown", (event) => {
  if (event.key !== "Enter") return;
  const query = event.currentTarget.value.trim().toLowerCase();
  const index = planetData.findIndex(p => p.name.toLowerCase() === query);
  if (index >= 0) selectPlanet(index);
  else showToast(query ? "NO PLANET FOUND — TRY A PLANET NAME" : "ENTER A PLANET NAME");
});
document.querySelector("#planetSearch").addEventListener("input", (event) => {
  const query = event.target.value.trim().toLowerCase();
  document.querySelectorAll(".planet-chip").forEach((chip, i) => {
    chip.style.display = planetData[i].name.toLowerCase().includes(query) ? "" : "none";
  });
});

renderer.domElement.addEventListener("click", (event) => {
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((event.clientX-rect.left)/rect.width)*2-1;
  pointer.y = -((event.clientY-rect.top)/rect.height)*2+1;
  raycaster.setFromCamera(pointer,camera);
  const hits = raycaster.intersectObjects(planetMeshes.map(p=>p.mesh), false);
  if (hits.length) selectPlanet(hits[0].object.userData.planetIndex);
});

function onResize() {
  const width = host.clientWidth, height = host.clientHeight;
  if (!width || !height) return;
  camera.aspect = width/height; camera.updateProjectionMatrix();
  renderer.setSize(width,height);
}
window.addEventListener("resize", onResize);
if ("ResizeObserver" in window) new ResizeObserver(onResize).observe(host);

const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const delta = Math.min(clock.getDelta(), .05);
  if (!paused) {
    elapsed += delta * speedMultiplier;
    planetMeshes.forEach(({data,pivot,mesh,initialAngle,index}) => {
      pivot.rotation.y = initialAngle + elapsed * data.speed * .075;
      mesh.rotation.y += delta * (index%2 ? .22 : -.18);
    });
    sun.rotation.y += delta*.035;
    stars.rotation.y += delta*.0015;
  }
  controls.update();
  renderer.render(scene,camera);
}
animate();

selectPlanet(2);
document.querySelector("#planetCard").classList.remove("visible");
