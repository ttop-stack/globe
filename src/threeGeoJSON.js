import * as THREE from 'three';

export function drawThreeGeo({ json, radius, materialOptions, flat = false, interactive = false }) {
  const group = new THREE.Group();
  const countryMeshes = new Map();
  
  if (!json || !json.features) {
    console.error('Invalid GeoJSON data');
    return { group, countryMeshes };
  }

  const lineMaterial = new THREE.LineBasicMaterial({
    color: materialOptions.color || 0xffffff,
  });

  const meshMaterial = new THREE.MeshBasicMaterial({
    color: materialOptions.color || 0x80FF80,
    transparent: true,
    opacity: 0.0, // Invisible but clickable
    side: THREE.DoubleSide,
  });

  json.features.forEach(feature => {
    const countryName = feature.properties.NAME || feature.properties.name || 'Unknown';
    const countryCode = feature.properties.ISO_A3 || feature.properties.iso_a3 || '';
    const countryGroup = new THREE.Group();
    countryGroup.userData = {
      name: countryName,
      code: countryCode,
      properties: feature.properties
    };

    if (feature.geometry && feature.geometry.type === 'Polygon') {
      drawPolygon(feature.geometry.coordinates, radius, lineMaterial, meshMaterial, countryGroup, flat, interactive);
    } else if (feature.geometry && feature.geometry.type === 'MultiPolygon') {
      feature.geometry.coordinates.forEach(polygon => {
        drawPolygon(polygon, radius, lineMaterial, meshMaterial, countryGroup, flat, interactive);
      });
    }

    if (countryGroup.children.length > 0) {
      group.add(countryGroup);
      countryMeshes.set(countryName, countryGroup);
    }
  });

  return { group, countryMeshes };
}

function drawPolygon(coordinates, radius, lineMaterial, meshMaterial, group, flat, interactive) {
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
      // Draw outline
      const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(lineGeometry, lineMaterial);
      group.add(line);

      // Add clickable mesh if interactive
      if (interactive && points.length >= 3) {
        try {
          const shape = new THREE.Shape();
          points.forEach((point, i) => {
            if (i === 0) {
              shape.moveTo(point.x, point.y);
            } else {
              shape.lineTo(point.x, point.y);
            }
          });

          const shapeGeometry = new THREE.ShapeGeometry(shape);
          const mesh = new THREE.Mesh(shapeGeometry, meshMaterial.clone());
          
          // Position mesh correctly
          if (!flat) {
            mesh.lookAt(0, 0, 0);
          }
          mesh.position.copy(points[0]);
          
          group.add(mesh);
        } catch (e) {
          // Some polygons might fail, skip them
        }
      }
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
