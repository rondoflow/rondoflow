---
name: avoid-common-blender-mistakes
description: "Avoid common Blender mistakes — transform application, modifier order, UV seams, and export settings for game engines."
category: "Integrations"
author: community
version: "1.0.0"
icon: plug
---

## Transforms
- Apply scale before export — `Ctrl+A` → Scale, or objects deform in game engines
- Apply rotation for correct orientation — especially for rigged models
- Non-uniform scale breaks modifiers — apply scale before Mirror, Bevel, etc.
- Reset transforms: `Alt+G/R/S` — location, rotation, scale to defaults

## Object vs Edit Mode
- Object mode transforms affect whole object — Edit mode transforms geometry only
- Modifiers applied in Object mode — Edit mode shows base mesh
- Selection works differently — Object selects whole, Edit selects vertices/edges/faces
- `Tab` to toggle — most operations mode-specific

## Normals
- Flipped normals = invisible faces — `Shift+N` to recalculate outside
- Check in Viewport Overlays → Face Orientation — blue is correct, red is flipped
- `Ctrl+Shift+N` for flip inside — useful for interior scenes
- Smooth shading issues = bad normals — recalculate first

## Modifiers
- Order matters — Mirror before Subdivision, Bevel before Mirror typically
- Apply modifiers for export — game engines don't understand Blender modifiers
- Array + Curve = deformation issues — apply Array first, then Curve
- Subdivision preview vs render levels — set same for consistent export

## UV Unwrapping
- Mark seams where texture can split — `Ctrl+E` → Mark Seam
- Seams at hidden areas — under arms, behind ears, model edges
- `U` → Unwrap after marking — Smart UV Project as fallback
- Check UV overlap — causes baking issues, separate islands

## Origin Point
- Origin affects rotation/scale pivot — `Right-click` → Set Origin
- Origin to geometry for centered pivot — Origin to 3D Cursor for precise placement
- Origin matters for game engine import — often should be at feet/base

## Export for Game Engines
- FBX or glTF for Unity/Unreal — glTF for web
- Apply transforms on export — "Apply Scalings: FBX All" for Unity
- Forward axis: `-Z Forward`, Up: `Y Up` for Unity — different for Unreal
- Embed textures or pack separately — depends on workflow

## Python API (bpy)
- `bpy.context` is current state — selection, active object, mode
- `bpy.data` is all data — access any object by name regardless of selection
- `bpy.ops` are operators — require correct context (mode, selection)
- Override context for operators — `{'object': obj, 'selected_objects': [obj]}`
- Most ops need Object mode — `bpy.ops.object.mode_set(mode='OBJECT')` first

## Common Mistakes
- Duplicate with Alt+D creates linked copy — changes affect both, use Shift+D for independent
- Delete vs Dissolve — Delete removes geometry, Dissolve merges (Edit mode)
- Proportional editing left on — affects unexpected vertices, check header
- Subdivision on high-poly crashes — start with Levels: 1, increase gradually
- Materials not linked to object — won't export, must be assigned to faces
