// === Setup Scene, Camera, Renderer ===
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById("container").appendChild(renderer.domElement);

// === Add Light ===
const light = new THREE.PointLight(0xffffff, 2, 1000);
light.position.set(0, 0, 0);
scene.add(light);

// === Add Sun ===
const sunGeometry = new THREE.SphereGeometry(3, 32, 32);
const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xFDB813 });
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
scene.add(sun);

// === Planet Data ===
const planetData = [
  { name: "Mercury", color: 0xaaaaaa, size: 0.4, distance: 5, speed: 0.04 },
  { name: "Venus",   color: 0xffcc99, size: 0.8, distance: 7, speed: 0.015 },
  { name: "Earth",   color: 0x3399ff, size: 1.0, distance: 10, speed: 0.01 },
  { name: "Mars",    color: 0xff3300, size: 0.6, distance: 13, speed: 0.008 },
  { name: "Jupiter", color: 0xff9966, size: 2.0, distance: 17, speed: 0.005 },
  { name: "Saturn",  color: 0xffcc66, size: 1.7, distance: 21, speed: 0.003 },
  { name: "Uranus",  color: 0x66ffff, size: 1.2, distance: 25, speed: 0.002 },
  { name: "Neptune", color: 0x6666ff, size: 1.2, distance: 29, speed: 0.0015 }
];

const planets = [];

planetData.forEach((data) => {
  const geometry = new THREE.SphereGeometry(data.size, 32, 32);
  const material = new THREE.MeshStandardMaterial({ color: data.color });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.userData = { angle: Math.random() * Math.PI * 2, speed: data.speed, distance: data.distance };
  scene.add(mesh);
  planets.push(mesh);
});

// === Camera Position ===
camera.position.z = 50;

// === Animate ===
function animate() {
  requestAnimationFrame(animate);

  planets.forEach(planet => {
    planet.userData.angle += planet.userData.speed;
    planet.position.x = planet.userData.distance * Math.cos(planet.userData.angle);
    planet.position.z = planet.userData.distance * Math.sin(planet.userData.angle);
  });

  renderer.render(scene, camera);
}

animate();

// === Responsive Resize ===
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
