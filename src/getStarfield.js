import * as THREE from 'three';

export default function getStarfield({ numStars = 500, fog = true } = {}) {
  const verts = [];
  
  for (let i = 0; i < numStars; i++) {
    const x = Math.random() * 600 - 300;
    const y = Math.random() * 600 - 300;
    const z = Math.random() * 600 - 300;
    verts.push(x, y, z);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
  
  const material = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.7,
    fog: fog
  });

  const points = new THREE.Points(geometry, material);
  return points;
}
