import * as THREE from 'three';

export function drawThreeGeo({ json, radius, materialOptions, flat = false }) {
  const group = new THREE.Group();
  
  if (!json || !json.features) {
    console.error('Invalid GeoJSON data');
    return group;
  }

  const defaultMaterial = new THREE.LineBasicMaterial({
    color: materialOptions.color || 0xffffff,
  });

  json.features.forEach(feature => {
    if (feature.geometry && feature.geometry.type === 'Polygon') {
      drawPolygon(feature.geometry.coordinates, radius, defaultMaterial, group, flat);
    } else if (feature.geometry && feature.geometry.type === 'MultiPolygon') {
      feature.geometry.coordinates.forEach(polygon => {
        drawPolygon(polygon, radius, defaultMaterial, group, flat);
      });
    }
  });

  return group;
}

function drawPolygon(coordinates, radius, material, group, flat) {
  coordinates.forEach(ring => {
    const points = [];
    ring.forEach(coord => {
      const lon = coord[0];
      const lat = coord[1];
      const point = flat 
        ? convertLatLonToFlat(lat, lon, radius)
        : convertLatLonToVector3(lat, lon, radius);
      points.push(point);
    });

    if (points.length > 1) {
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(geometry, material);
      group.add(line);
    }
  });
}

function convertLatLonToVector3(lat, lon, radius) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);

  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.sin(theta);

  return new THREE.Vector3(x, y, z);
}

function convertLatLonToFlat(lat, lon, radius) {
  // Equirectangular projection (simple lat/lon to x/y mapping)
  // Scale it to similar size as the 3D globe
  const scale = radius / 50; // Adjust scale factor
  const x = lon * scale;
  const y = lat * scale;
  const z = 0;

  return new THREE.Vector3(x, y, z);
}
