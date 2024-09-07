// below I have nextjs combine with threeJS library to create server tower that has 4 racks
// modify the code below, so the scene background is more bright, and make each racks transparent , so we can see through it,
// each racks separated bt their solid borders 

'use client'

import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const ServerRoom = () => {
  const mountRef = useRef(null);
  const [hoveredRack, setHoveredRack] = useState(null);
  const [rackTemperatures, setRackTemperatures] = useState([]);

  useEffect(() => {
    const width = 800;
    const height = 600;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    mountRef.current.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    // Mesh floor
    const floorGeometry = new THREE.PlaneGeometry(20, 20, 20, 20);
    const floorMaterial = new THREE.MeshPhongMaterial({
      color: 0xfefefe,
      wireframe: true,
      side: THREE.DoubleSide,
      // opacity: 1
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = Math.PI / 2;
    floor.position.y = -2;
    scene.add(floor);

    // Function to create a server tower
    const createServerTower = (x, z) => {
      const towerGroup = new THREE.Group();
      
      // Server tower
      const towerGeometry = new THREE.BoxGeometry(2, 4, 1);
      const towerMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x888888,
        transparent: true,
        opacity: 0.2
      });
      const tower = new THREE.Mesh(towerGeometry, towerMaterial);
      towerGroup.add(tower);

      // Racks
      const rackGeometry = new THREE.BoxGeometry(1.8, 0.8, 0.9);
      const borderGeometry = new THREE.EdgesGeometry(rackGeometry);
      const borderColors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00];

      for (let i = 0; i < 4; i++) {
        const rackGroup = new THREE.Group();
        
        // Transparent rack
        const rackMaterial = new THREE.MeshPhongMaterial({
          transparent: true,
          opacity: 0,
          side: THREE.DoubleSide
        });
        const rack = new THREE.Mesh(rackGeometry, rackMaterial);
        
        // Solid border
        const borderMaterial = new THREE.LineBasicMaterial({ color: borderColors[i], linewidth: 2 });
        const border = new THREE.LineSegments(borderGeometry, borderMaterial);
        
        rackGroup.add(rack);
        rackGroup.add(border);
        
        // Add some internal components to each rack
        const componentGeometry = new THREE.BoxGeometry(0.3, 0.3, 0.7);
        const componentMaterial = new THREE.MeshPhongMaterial({ color: 0x222222 });
        for (let j = 0; j < 3; j++) {
          const component = new THREE.Mesh(componentGeometry, componentMaterial);
          component.position.set(-0.5 + j * 0.5, 0, 0);
          rackGroup.add(component);
        }
        
        rackGroup.position.y = -1.5 + i;
        rackGroup.userData = { id: rackTemperatures.length };
        tower.add(rackGroup);
        allRacks.push(rackGroup);

        // Initialize temperature
        setRackTemperatures(prev => [...prev, Math.floor(Math.random() * 20) + 20]);
      }

      towerGroup.position.set(x, 0, z);
      return towerGroup;
    };

    // Create three server towers
    const allRacks = [];
    const tower1 = createServerTower(-3, 0);
    const tower2 = createServerTower(0, 0);
    const tower3 = createServerTower(3, 0);
    scene.add(tower1, tower2, tower3);

    // Camera position
    camera.position.set(0, 5, 10);
    camera.lookAt(0, 0, 0);

    // Orbit controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.enableZoom = true;

    // Raycaster for interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Mouse move event listener for hover effect
    const onMouseMove = (event) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(allRacks, true);

      if (intersects.length > 0) {
        const hoveredObject = intersects[0].object.parent;
        setHoveredRack(hoveredObject.userData.id);
      } else {
        setHoveredRack(null);
      }
    };

    renderer.domElement.addEventListener('mousemove', onMouseMove);

    // Temperature simulation
    const simulateTemperature = () => {
      setRackTemperatures(prevTemps => 
        prevTemps.map(temp => {
          const change = Math.random() > 0.5 ? 1 : -1;
          return Math.max(20, Math.min(40, temp + change));
        })
      );
    };

    const temperatureInterval = setInterval(simulateTemperature, 2000);

    // Cleanup
    return () => {
      renderer.dispose();
      mountRef.current.removeChild(renderer.domElement);
      clearInterval(temperatureInterval);
    };
  }, []);

  return (
    <div>
      <div ref={mountRef}></div>
      <div style={{ position: 'absolute', top: '10px', left: '10px', background: 'rgba(255,255,255,0.7)', color:'#000', padding: '10px' }}>
        {hoveredRack !== null ? (
          <p>Rack {hoveredRack + 1} Temperature: {rackTemperatures[hoveredRack]}°C</p>
        ) : (
          <p>Hover over a rack to see its temperature</p>
        )}
      </div>
    </div>
  );
};

export default ServerRoom;