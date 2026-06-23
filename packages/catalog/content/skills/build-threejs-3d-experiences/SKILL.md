---
name: build-threejs-3d-experiences
description: "Build 3D web experiences with proper resource management and performance patterns."
category: "Media"
author: community
version: "1.0.0"
icon: image
---

# Three.js Production Patterns

## Resource Cleanup
- Call `.dispose()` on geometries, materials, and textures before removing objects — Three.js never garbage collects GPU resources automatically
- When removing a mesh: `mesh.geometry.dispose(); mesh.material.dispose(); scene.remove(mesh)` — missing any step causes memory leaks
- Textures loaded via TextureLoader stay in GPU memory forever unless explicitly disposed — track and clean up on scene transitions

## Render Loop
- Always use `renderer.setAnimationLoop(animate)` instead of manual `requestAnimationFrame` — it handles VR, pauses when tab is hidden, and provides proper timing
- For animations, use `clock.getDelta()` for frame-independent movement — raw frame counting breaks on different refresh rates

## Responsive Canvas
- On window resize, update both camera aspect AND renderer size: `camera.aspect = width/height; camera.updateProjectionMatrix(); renderer.setSize(width, height)`
- Missing `updateProjectionMatrix()` after aspect change causes stretched/squished rendering
- Use `renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))` — values above 2 kill performance with minimal visual benefit

## Imports and Setup
- OrbitControls and other addons: `import { OrbitControls } from 'three/addons/controls/OrbitControls.js'` — the path varies by bundler, check your setup
- Always set `controls.enableDamping = true` with OrbitControls and call `controls.update()` in render loop — without this, damping silently fails

## Lighting
- MeshBasicMaterial ignores all lights — use MeshStandardMaterial or MeshPhongMaterial for lit scenes
- Add ambient light (`new THREE.AmbientLight(0xffffff, 0.5)`) as baseline — scenes with only directional lights have pitch-black shadows
- HDR environment maps via PMREMGenerator give far better reflections than point lights on metallic materials

## Loading Assets
- GLTFLoader is the standard for 3D models — use Draco compression for large meshes (add DRACOLoader)
- Texture loading is async — models may render black until textures load; use LoadingManager for loading screens
- CORS blocks textures from other domains — host assets on same origin or configure proper CORS headers

## Camera Issues
- Default near/far planes (0.1 to 1000) cause z-fighting on large scenes — adjust to smallest range that fits your scene
- Camera inside an object renders nothing — check position after loading external models (they may have unexpected transforms)
- PerspectiveCamera FOV is vertical, not horizontal — 75 degrees is a common default

## Performance
- Merge static geometries with `BufferGeometryUtils.mergeBufferGeometries()` — each mesh is a draw call, fewer meshes = faster
- Use `InstancedMesh` for many identical objects — hundreds of draw calls become one
- Set `object.frustumCulled = true` (default) but verify large objects aren't disappearing at edges — bounding sphere may be wrong
- Call `renderer.info` to debug draw calls, triangles, and textures in memory

## Animation
- AnimationMixer requires `mixer.update(delta)` every frame with actual delta time — passing 0 or skipping frames breaks animations
- Skinned meshes (characters) need `SkeletonHelper` during development to debug bone issues
