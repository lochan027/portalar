# Sample 3D Model Placeholder

This directory should contain GLB/GLTF 3D models for AR display.

## Recommended Models

Download free 3D models from:
- **Sketchfab**: https://sketchfab.com/3d-models?features=downloadable&sort_by=-likeCount
- **Google Poly Archive**: https://poly.pizza/
- **Smithsonian 3D**: https://3d.si.edu/

## Model Requirements

- **Format**: GLB (binary GLTF) preferred
- **Size**: Maximum 5MB for mobile optimization
- **Polygons**: < 50,000 triangles
- **Textures**: 1024×1024 or 2048×2048 max
- **Animation**: Supported but keep simple

## Optimization

```bash
# Install gltf-pipeline
npm install -g gltf-pipeline

# Optimize model
gltf-pipeline -i model.glb -o optimized.glb -d
```

## Example Models

Place your GLB files here:
- `sample-product.glb` - Product showcase
- `sample-character.glb` - Character model
- `sample-building.glb` - Architecture

## Usage

Reference in content API:
```json
{
  "type": "3d",
  "modelUrl": "/assets/models/sample-product.glb"
}
```

## Testing

Test model in A-Frame:
```html
<a-entity gltf-model="/assets/models/sample-product.glb" 
          scale="0.5 0.5 0.5"></a-entity>
```

## License

Ensure models are licensed for commercial use if deploying publicly.
