# Marker Creation Guide

## Overview

PortalAR supports two marker approaches:

1. **Companion Marker** (Recommended)
   - Separate QR code + AR marker
   - Better tracking reliability
   - Larger print size needed

2. **Enhanced QR**
   - Single hybrid QR/AR image
   - Space-efficient
   - May have reduced tracking quality

## Creating Markers

### Step 1: Generate QR Code

```bash
npm run generate-qr -- --markerId=your-marker-001 --baseUrl=https://your-domain.com
```

Output: `scripts/output/qr-codes/qr-your-marker-001.png`

### Step 2: Generate AR Marker

**Companion Method:**
```bash
npm run generate-marker -- --markerId=your-marker-001 --method=companion
```

**Enhanced QR Method:**
```bash
npm run generate-marker -- --markerId=your-marker-001 --method=enhanced-qr
```

### Step 3: Train Marker (Critical!)

1. Go to AR.js Marker Training: https://ar-js-org.github.io/AR.js/three.js/examples/marker-training/examples/generator.html
2. Upload your marker image
3. Download the .patt file
4. Copy to `frontend/public/markers/your-marker-001.patt`

### Step 4: Print

- **Size:** Minimum 4×4 inches (10×10 cm)
- **Paper:** Matte white cardstock
- **Resolution:** 300 DPI minimum
- **Finish:** Matte lamination (optional but recommended)

## Best Practices

### Printing
- ✅ Matte paper
- ✅ High contrast (black & white)
- ✅ Large size (4-6 inches)
- ✅ Flat surface
- ❌ Glossy paper (glare)
- ❌ Colored paper
- ❌ Small sizes (<3 inches)
- ❌ Wrinkled/bent prints

### Environment
- ✅ Bright, even lighting
- ✅ 8-20 inches from camera
- ✅ 0-45° viewing angle
- ❌ Direct sunlight (glare)
- ❌ Shadows
- ❌ Low light

### Testing
```bash
# Test marker detection quality
npm run test-marker -- --file=./scripts/output/markers/ar-marker-your-001.png
```

Aim for detection score > 0.7

## Troubleshooting

**Marker not detected:**
1. Check marker size (min 4 inches)
2. Improve lighting
3. Reduce camera distance
4. Flatten marker (no wrinkles)
5. Re-train marker with AR.js tool

**Tracking is jittery:**
1. Use companion marker instead of QR
2. Increase marker size
3. Improve lighting uniformity
4. Use higher contrast

**QR doesn't scan:**
1. Check QR size (min 1 inch)
2. Ensure high contrast
3. Test with multiple phone cameras
4. Verify URL is correct

## Advanced

### Custom Patterns
Edit `generate-marker.js` to create custom patterns:
- Adjust grid size
- Modify contrast threshold
- Add custom graphics

### Multi-Marker Tracking
Configure A-Frame scene to track multiple markers simultaneously.

### Dynamic Marker Update
Update marker content via admin API without reprinting.

## Resources

- AR.js Documentation: https://ar-js-org.github.io/AR.js-Docs/
- Marker Training Tool: https://ar-js-org.github.io/AR.js/three.js/examples/marker-training/
- A-Frame Documentation: https://aframe.io/docs/

## Support

Questions? Open an issue: https://github.com/yourusername/portal-ar/issues
