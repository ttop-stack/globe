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
let countryMeshes3D = new Map(); // Map country names to their 3D meshes
let countryMeshes2D = new Map(); // Map country names to their 2D meshes
let selectedCountry = null;
let highlightedMesh = null;

scene.add(globeGroup);
scene.add(flatGroup);

// Raycaster for click detection
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

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
fetch('./geojson/ne_110m_admin_0_countries.json')
  .then(response => {
    console.log('Fetch response:', response.status);
    return response.text();
  })
  .then(text => {
    console.log('GeoJSON loaded, length:', text.length);
    geoJsonData = JSON.parse(text);
    console.log('GeoJSON parsed, features:', geoJsonData.features?.length);
    
    // Create 3D version
    const result3D = drawThreeGeo({
      json: geoJsonData,
      radius: 2,
      materialOptions: {
        color: 0x80FF80,
      },
      interactive: true,
    });
    console.log('3D Countries group children:', result3D.group.children.length);
    globeGroup.add(result3D.group);
    countryMeshes3D = result3D.countryMeshes;
    
    // Create 2D version
    const result2D = drawThreeGeo({
      json: geoJsonData,
      radius: 2,
      materialOptions: {
        color: 0x80FF80,
      },
      flat: true,
      interactive: true,
    });
    console.log('2D Countries group children:', result2D.group.children.length);
    flatGroup.add(result2D.group);
    countryMeshes2D = result2D.countryMeshes;
    
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

// Country selection handling
function onCountryClick(event) {
  // Calculate mouse position in normalized device coordinates (-1 to +1)
  const rect = renderer.domElement.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  // Update raycaster
  raycaster.setFromCamera(mouse, camera);

  // Get intersected objects from the active group
  const activeGroup = is3D ? globeGroup : flatGroup;
  const intersects = raycaster.intersectObjects(activeGroup.children, true);

  if (intersects.length > 0) {
    // Find the country group (parent of the intersected mesh)
    let countryGroup = intersects[0].object;
    while (countryGroup.parent && !countryGroup.userData.name) {
      countryGroup = countryGroup.parent;
    }

    if (countryGroup.userData && countryGroup.userData.name) {
      selectCountry(countryGroup.userData);
    }
  }
}

function selectCountry(countryData) {
  // Clear previous highlight
  if (highlightedMesh) {
    highlightedMesh.children.forEach(child => {
      if (child.material) {
        child.material.color.setHex(0x80FF80);
      }
    });
  }

  selectedCountry = countryData;
  
  // Get the appropriate mesh map
  const meshMap = is3D ? countryMeshes3D : countryMeshes2D;
  highlightedMesh = meshMap.get(countryData.name);
  
  // Highlight selected country
  if (highlightedMesh) {
    highlightedMesh.children.forEach(child => {
      if (child.material) {
        child.material.color.setHex(0xFFFF00); // Yellow highlight
      }
    });
  }

  console.log('Selected country:', countryData);
  
  // Dispatch custom event for your news aggregator to listen to
  const event = new CustomEvent('countrySelected', {
    detail: {
      name: countryData.name,
      code: countryData.code,
      properties: countryData.properties
    }
  });
  window.dispatchEvent(event);
  
  // Post message for iframe integration
  if (window.parent !== window) {
    window.parent.postMessage({
      type: 'countrySelected',
      country: {
        name: countryData.name,
        code: countryData.code,
        properties: countryData.properties
      }
    }, '*');
  }
  
  // Also update the info display
  updateCountryInfo(countryData);
}

function updateCountryInfo(countryData) {
  let infoPanel = document.getElementById('countryInfo');
  if (!infoPanel) {
    infoPanel = document.createElement('div');
    infoPanel.id = 'countryInfo';
    infoPanel.style.position = 'absolute';
    infoPanel.style.bottom = '20px';
    infoPanel.style.left = '20px';
    infoPanel.style.padding = '15px';
    infoPanel.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    infoPanel.style.color = 'white';
    infoPanel.style.borderRadius = '5px';
    infoPanel.style.fontFamily = 'Arial, sans-serif';
    infoPanel.style.maxWidth = '300px';
    infoPanel.style.zIndex = '1000';
    document.body.appendChild(infoPanel);
  }
  
  infoPanel.innerHTML = `
    <h3 style="margin: 0 0 10px 0;">${countryData.name}</h3>
    <p style="margin: 5px 0;"><strong>Code:</strong> ${countryData.code || 'N/A'}</p>
    <p style="margin: 5px 0; font-size: 12px; color: #aaa;">Click detected - your news aggregator can now display news for this country</p>
  `;
}

// Add click listener
renderer.domElement.addEventListener('click', onCountryClick, false);

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