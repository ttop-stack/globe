import * as THREE from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import getStarfield from "./src/getStarfield.js";
import { drawThreeGeo } from "./src/threeGeoJSON.js";

const w = window.innerWidth;
const h = window.innerHeight;
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x000000, 0.3);
const camera = new THREE.PerspectiveCamera(75, w / h, 1, 100);
camera.position.z = 5;
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(w, h);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// State management
let is3D = true;
let globeGroup = new THREE.Group();
let flatGroup = new THREE.Group();
let geoJsonData = null;

scene.add(globeGroup);
scene.add(flatGroup);

const geometry = new THREE.SphereGeometry(2);
const lineMat = new THREE.LineBasicMaterial({ 
  color: 0xffffff,
  transparent: true,
  opacity: 0.4, 
});
const edges = new THREE.EdgesGeometry(geometry, 1);
const line = new THREE.LineSegments(edges, lineMat);
globeGroup.add(line);

const stars = getStarfield({ numStars: 1000, fog: false });
scene.add(stars);

// check here for more datasets ...
// https://github.com/martynafford/natural-earth-geojson
// non-geojson datasets: https://www.naturalearthdata.com/downloads/
fetch('./geojson/ne_110m_land.json')
  .then(response => {
    console.log('Fetch response:', response.status);
    return response.text();
  })
  .then(text => {
    console.log('GeoJSON loaded, length:', text.length);
    geoJsonData = JSON.parse(text);
    console.log('GeoJSON parsed, features:', geoJsonData.features?.length);
    
    // Create 3D version
    const countries3D = drawThreeGeo({
      json: geoJsonData,
      radius: 2,
      materialOptions: {
        color: 0x80FF80,
      },
    });
    console.log('3D Countries group children:', countries3D.children.length);
    globeGroup.add(countries3D);
    
    // Create 2D version
    const countries2D = drawThreeGeo({
      json: geoJsonData,
      radius: 2,
      materialOptions: {
        color: 0x80FF80,
      },
      flat: true,
    });
    console.log('2D Countries group children:', countries2D.children.length);
    flatGroup.add(countries2D);
    
    // Initially hide flat version
    flatGroup.visible = false;
  })
  .catch(err => {
    console.error('Error loading GeoJSON:', err);
  });

// Toggle between 2D and 3D
function toggle2D3D() {
  is3D = !is3D;
  
  if (is3D) {
    // Switch to 3D
    globeGroup.visible = true;
    flatGroup.visible = false;
    stars.visible = true;
    scene.fog = new THREE.FogExp2(0x000000, 0.3);
    camera.position.set(0, 0, 5);
    controls.enabled = true;
  } else {
    // Switch to 2D
    globeGroup.visible = false;
    flatGroup.visible = true;
    stars.visible = false;
    scene.fog = null;
    camera.position.set(0, 0, 10);
    controls.enabled = true;
  }
  
  controls.reset();
  document.getElementById('toggleBtn').textContent = is3D ? 'Switch to 2D' : 'Switch to 3D';
}

// Add keyboard shortcut
window.addEventListener('keydown', (e) => {
  if (e.key === ' ' || e.key === 't' || e.key === 'T') {
    e.preventDefault();
    toggle2D3D();
  }
});

// Add toggle button
const toggleBtn = document.createElement('button');
toggleBtn.id = 'toggleBtn';
toggleBtn.textContent = 'Switch to 2D';
toggleBtn.style.position = 'absolute';
toggleBtn.style.top = '20px';
toggleBtn.style.right = '20px';
toggleBtn.style.padding = '10px 20px';
toggleBtn.style.fontSize = '16px';
toggleBtn.style.cursor = 'pointer';
toggleBtn.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
toggleBtn.style.color = 'white';
toggleBtn.style.border = '2px solid rgba(255, 255, 255, 0.3)';
toggleBtn.style.borderRadius = '5px';
toggleBtn.style.backdropFilter = 'blur(10px)';
toggleBtn.style.zIndex = '1000';
toggleBtn.addEventListener('click', toggle2D3D);
document.body.appendChild(toggleBtn);

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  controls.update();
}

animate();

function handleWindowResize () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', handleWindowResize, false);