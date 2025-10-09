# Hero Section Positioning Documentation

## Current Implementation

The hero section has been optimized to work seamlessly with the glass header component, positioning images at the absolute top of the page while maintaining proper content spacing.

### Key Positioning Properties

#### Section Container
```tsx
<section className="relative w-full h-screen overflow-hidden bg-black" 
         style={{ marginTop: '-80px' }}>
```

- **`marginTop: '-80px'`**: Negative margin brings the hero section closer to the top, ensuring images appear directly under the glass header
- **`h-screen`**: Full viewport height
- **`overflow-hidden`**: Prevents any content overflow
- **`bg-black`**: Fallback background color

#### Image Positioning
```tsx
style={{
  objectPosition: images[currentImageIndex].id === 'mission-portrait' 
    ? 'center bottom' 
    : 'center 47%'
}}
```

- **Regular images**: `center 47%` - positioned slightly below center for optimal framing
- **Mission-portrait images**: `center bottom` - specifically positioned to show the bottom of portrait-oriented images

#### Content Overlay
```tsx
<div className="relative z-10 h-full flex items-center justify-center pt-28">
```

- **`pt-28`**: 7rem (112px) padding top creates proper spacing below the 80px glass header
- **`z-10`**: Ensures content appears above the background images
- **Centered layout**: Content is vertically and horizontally centered

### Glass Header Integration

The header component uses backdrop blur styling:
```tsx
<header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
```

This creates a semi-transparent glass effect that allows the hero images to show through while maintaining header readability.

### Image Carousel

The hero section features a rotating carousel with 5 hero-appropriate images:
- update-3 (IMG_3817.JPG) - Self defense training
- mission-portrait (IMG_3818.JPG) - Training portrait  
- update-1 (IMG_3814.JPG) - Fitness training
- mission-action (IMG_4459.jpg) - Action training
- hero (IMG_2981.jpg) - Training session

### Responsive Text Sizing

```tsx
<h1 className="text-4xl md:text-6xl lg:text-7xl ...">
<p className="text-lg md:text-xl ...">
```

- Headlines scale from 4xl → 6xl → 7xl across breakpoints
- Paragraph text scales from lg → xl for optimal readability

## Visual Hierarchy

```
┌─────────────────────────────────────────┐
│              Glass Header                │  ← 80px height with backdrop blur
├─────────────────────────────────────────┤
│                                         │
│            Hero Section Images          │  ← Positioned at absolute top
│                                         │
├─────────────────────────────────────────┤
│                                         │
│            Content Overlay              │  ← Centered with pt-28 spacing
│                                         │
└─────────────────────────────────────────┘
```

## Technical Notes

- The `-80px` margin compensates for the header height
- `pt-28` ensures content appears below the header with proper visual spacing
- Image positioning preserves the original aesthetic while elevating the section
- Z-index hierarchy maintains proper layering between header, images, and content

## Files Modified

- [`TANI/src/components/home/hero-section.tsx`](../src/components/home/hero-section.tsx) - Main positioning adjustments
- Component remains fully compatible with existing [`header.tsx`](../src/components/header.tsx) implementation