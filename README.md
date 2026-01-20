# Next.js GSAP Portfolio Starter

A production-ready Next.js 14 portfolio starter with GSAP animations and ScrollTrigger, built with TypeScript and Tailwind CSS.

## 🚀 Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view your portfolio.

## 📁 Project Structure

```
src/
├── app/
│   ├── layout.tsx      # Root layout with metadata
│   ├── page.tsx        # Home page
│   └── globals.css     # Global styles with Tailwind
├── components/
│   ├── layout/         # Layout components (headers, footers, etc.)
│   ├── sections/        # Page sections (Hero, About, etc.)
│   └── ui/             # Reusable UI components
├── hooks/
│   └── useGsap.ts      # Custom GSAP hook for animations
└── lib/
    └── gsap.ts         # GSAP plugin registration
```

## 🎨 Adding New GSAP + ScrollTrigger Animations

### Basic Pattern

1. **Create a new component** in `src/components/sections/`:

```tsx
'use client'

import { useGsap } from '@/hooks/useGsap'
import { gsap } from '@/lib/gsap'

export default function MySection() {
  useGsap((ctx) => {
    // Add your animations here
    ctx.add(() => {
      gsap.from('.my-element', {
        opacity: 0,
        y: 50,
        duration: 1,
        scrollTrigger: {
          trigger: '.my-element',
          start: 'top 80%',
        }
      })
    })
  }, [])

  return (
    <section className="my-section">
      <div className="my-element">Animated content</div>
    </section>
  )
}
```

### ScrollTrigger Example

```tsx
useGsap((ctx) => {
  ctx.add(() => {
    gsap.to('.element', {
      x: 100,
      rotation: 360,
      scrollTrigger: {
        trigger: '.element',
        start: 'top center',
        end: 'bottom center',
        scrub: true, // Smooth scrubbing
      }
    })
  })
}, [])
```

### Multiple Animations

```tsx
useGsap((ctx) => {
  // Animation 1
  ctx.add(() => {
    gsap.from('.title', {
      opacity: 0,
      y: 50,
      duration: 1,
    })
  })

  // Animation 2 with ScrollTrigger
  ctx.add(() => {
    gsap.from('.subtitle', {
      opacity: 0,
      x: -100,
      scrollTrigger: {
        trigger: '.subtitle',
        start: 'top 80%',
      }
    })
  })

  // Custom cleanup (optional)
  return () => {
    // Any custom cleanup logic
  }
}, [])
```

### Animation with Dependencies

If your animation depends on props or state:

```tsx
useGsap((ctx) => {
  ctx.add(() => {
    gsap.to('.element', {
      x: isActive ? 100 : 0,
      duration: 0.5,
    })
  })
}, [isActive]) // Re-run when isActive changes
```

## 🔧 Key Features

- ✅ **SSR Safe**: All GSAP animations run only on the client
- ✅ **React Strict Mode Compatible**: Proper cleanup prevents duplicate registrations
- ✅ **ScrollTrigger Ready**: Pre-configured and registered correctly
- ✅ **TypeScript**: Full type safety
- ✅ **Performance Optimized**: Uses GSAP Context for efficient cleanup
- ✅ **Clean Architecture**: Organized structure for scalability

## 📝 Best Practices

1. **Always use `'use client'`** directive in components with GSAP animations
2. **Use the `useGsap` hook** instead of direct `useEffect` with GSAP
3. **Wrap animations in `ctx.add()`** for proper cleanup
4. **Return cleanup functions** if you need custom cleanup logic
5. **Use refs for element selection** when possible for better performance
6. **Test in production build** to ensure animations work correctly

## 🎯 Next Steps

- Add more sections (About, Projects, Contact, etc.)
- Create reusable animation components
- Add custom easing functions
- Implement page transitions
- Add loading animations

## 📚 Resources

- [GSAP Documentation](https://greensock.com/docs/)
- [ScrollTrigger Documentation](https://greensock.com/docs/v3/Plugins/ScrollTrigger)
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
