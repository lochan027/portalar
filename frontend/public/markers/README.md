# Marker Pattern Files

This directory contains AR.js marker pattern files (.patt).

## What are .patt files?

Pattern files contain the trained image data that AR.js uses to recognize markers in the camera feed. Each marker needs its own .patt file.

## Generating .patt Files

### Method 1: AR.js Marker Training Tool (Recommended)

1. Visit: https://ar-js-org.github.io/AR.js/three.js/examples/marker-training/examples/generator.html
2. Upload your marker image
3. Click "Download Pattern"
4. Save as `your-marker-id.patt`
5. Copy to this directory

### Method 2: Using Scripts

```bash
# Generate marker image
npm run generate-marker -- --markerId=marker-news-001

# Upload generated image to training tool
# Download .patt file
# Copy here
```

## File Naming

Pattern files must match marker IDs exactly:
- `marker-news-001.patt`
- `marker-ad-001.patt`
- `demo-marker-001.patt`

## Usage in Code

```html
<a-marker type="pattern" url="/markers/marker-news-001.patt">
  <!-- AR content here -->
</a-marker>
```

## Demo Patterns

Included demo patterns:
- `marker-news-001.patt` - Sample news marker
- `marker-ad-001.patt` - Sample ad marker
- `demo-marker-001.patt` - Welcome marker

## Testing

Test marker detection:
```bash
npm run test-marker -- --file=../output/markers/ar-marker-news-001.png
```

## Troubleshooting

**Marker not detected:**
1. Retrain with higher resolution image
2. Ensure high contrast (black & white)
3. Check marker size (min 4×4 inches)
4. Improve lighting

**Multiple markers conflict:**
- Ensure patterns are sufficiently different
- Increase distance between markers
- Use different pattern densities

## Resources

- AR.js Documentation: https://ar-js-org.github.io/AR.js-Docs/
- Marker Training: https://ar-js-org.github.io/AR.js/three.js/examples/marker-training/
