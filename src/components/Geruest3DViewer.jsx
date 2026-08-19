import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export default function Geruest3DViewer({ params }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || container.clientWidth === 0) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf3f4f6);

    const camera = new THREE.PerspectiveCamera(
      50,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const dir = new THREE.DirectionalLight(0xffffff, 0.8);
    dir.position.set(10, 20, 10);
    scene.add(dir);

    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(60, 60),
      new THREE.MeshStandardMaterial({ color: 0xe5e7eb })
    );
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);

    const scaffold = buildScaffold(params);
    scene.add(scaffold);

    const box = new THREE.Box3().setFromObject(scaffold);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z, 5);
    camera.position.set(center.x + maxDim * 0.8, center.y + maxDim * 0.5, center.z + maxDim * 1.2);
    controls.target.copy(center);
    controls.update();

    let raf;
    function animate() {
      raf = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    }
    animate();

    const resizeObs = new ResizeObserver(() => {
      if (!container.clientWidth || !container.clientHeight) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    });
    resizeObs.observe(container);

    return () => {
      cancelAnimationFrame(raf);
      resizeObs.disconnect();
      controls.dispose();
      scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
          else obj.material.dispose();
        }
      });
      renderer.dispose();
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, [params]);

  return <div ref={containerRef} className="w-full h-full" />;
}

function buildScaffold({ length, height, bayLength }) {
  const group = new THREE.Group();
  const bayCount = Math.max(1, Math.ceil(length / bayLength));
  const actualBay = length / bayCount;
  const levelH = 2;
  const totalLevels = Math.max(1, Math.ceil(height / levelH));
  const totalHeight = totalLevels * levelH;
  const frameW = 1.5;
  const frameCount = bayCount + 1;

  const orangeMat = new THREE.MeshStandardMaterial({ color: 0xf97316, metalness: 0.3, roughness: 0.5 });
  const plankMat = new THREE.MeshStandardMaterial({ color: 0x92744a, roughness: 0.8 });
  const braceMat = new THREE.MeshStandardMaterial({ color: 0x9ca3af, metalness: 0.5, roughness: 0.4 });

  // Vertical posts + horizontal bars per frame
  for (let f = 0; f < frameCount; f++) {
    const x = f * actualBay - length / 2;
    for (let z = 0; z < 2; z++) {
      const zPos = z === 0 ? -frameW / 2 : frameW / 2;
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.08, totalHeight, 0.08), orangeMat);
      post.position.set(x, totalHeight / 2, zPos);
      group.add(post);
    }
    for (let l = 1; l <= totalLevels; l++) {
      const bar = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, frameW + 0.05), orangeMat);
      bar.position.set(x, l * levelH, 0);
      group.add(bar);
    }
  }

  // Platforms (Beläge)
  for (let l = 1; l <= totalLevels; l++) {
    for (let b = 0; b < bayCount; b++) {
      const x = b * actualBay + actualBay / 2 - length / 2;
      const plank = new THREE.Mesh(new THREE.BoxGeometry(actualBay - 0.05, 0.05, frameW), plankMat);
      plank.position.set(x, l * levelH + 0.03, 0);
      group.add(plank);
    }
  }

  // Cross braces (Kreuzverbände)
  for (let b = 0; b < bayCount; b++) {
    const x1 = b * actualBay - length / 2;
    const x2 = (b + 1) * actualBay - length / 2;
    for (let l = 0; l < totalLevels; l++) {
      const y1 = l * levelH;
      const y2 = (l + 1) * levelH;
      const dx = x2 - x1;
      const dy = y2 - y1;
      const len = Math.sqrt(dx * dx + dy * dy);
      const brace = new THREE.Mesh(new THREE.BoxGeometry(len, 0.03, 0.03), braceMat);
      brace.position.set((x1 + x2) / 2, (y1 + y2) / 2, -frameW / 2);
      brace.rotation.z = Math.atan2(dy, dx);
      group.add(brace);
    }
  }

  // Top railings (Geländer)
  for (let f = 0; f < frameCount; f++) {
    const x = f * actualBay - length / 2;
    for (let z = 0; z < 2; z++) {
      const zPos = z === 0 ? -frameW / 2 : frameW / 2;
      const rPost = new THREE.Mesh(new THREE.BoxGeometry(0.04, 1.0, 0.04), orangeMat);
      rPost.position.set(x, totalHeight + 0.5, zPos);
      group.add(rPost);
    }
  }
  for (let b = 0; b < bayCount; b++) {
    const x = b * actualBay + actualBay / 2 - length / 2;
    for (let z = 0; z < 2; z++) {
      const zPos = z === 0 ? -frameW / 2 : frameW / 2;
      const rail = new THREE.Mesh(new THREE.BoxGeometry(actualBay, 0.04, 0.04), orangeMat);
      rail.position.set(x, totalHeight + 1.0, zPos);
      group.add(rail);
    }
  }

  return group;
}