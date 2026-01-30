// ======================================
// GSAP INITIALIZATION
// ======================================
gsap.registerPlugin(ScrollTrigger);

console.log('✅ GSAP Loaded');
console.log('✅ ScrollTrigger Loaded');

// ======================================
// CONFIGURATION
// ======================================
const config = {
  ease: "power2.inOut",
  smoothness: 1.2, // Adjust between 0.8-2.0 for speed
  cardAlignmentStart: 0.08,  // When cards start aligning (8% scroll)
  cardAlignmentEnd: 0.18,    // When cards finish aligning (18% scroll)
  manufacturingZoomStart: 0.22, // When manufacturing starts zooming
  manufacturingZoomEnd: 0.35,   // When manufacturing finishes zooming
};

// ======================================
// SET INITIAL STATES
// ======================================
function setInitialStates() {
  console.log('Setting initial states...');
  
  // Hide all full sections
  gsap.set([
    '#manufacturing-section',
    '#electricity-section',
    '#agriculture-section',
    '#transportation-section',
    '#buildings-section'
  ], {
    opacity: 0,
    visibility: 'hidden'
  });
  
  // Hide all zoomed images
  gsap.set('.zoomed-image', {
    opacity: 0,
    scale: 1.1
  });
  
  // Hide all section titles
  gsap.set('.section-title', {
    opacity: 0,
    y: 50
  });
  
  // Hide all info content
  gsap.set('.info-content', {
    opacity: 0,
    y: 40
  });
  
  // Directional entry: each card comes from different origin
  // Card 1 (Manufacturing) - from upper-left
  gsap.set('#card-manufacturing', {
    opacity: 0,
    x: -120,
    y: -80
  });
  
  // Card 2 (Electricity) - from upper-right
  gsap.set('#card-electricity', {
    opacity: 0,
    x: 120,
    y: -90
  });
  
  // Card 3 (Agriculture) - from bottom center (keeps translateX(-50%))
  gsap.set('#card-agriculture', {
    opacity: 0,
    x: '-50%',
    y: 120
  });
  
  // Card 4 (Transportation) - from right side, slight upward diagonal
  gsap.set('#card-transportation', {
    opacity: 0,
    x: 140,
    y: 60
  });
  
  // Card 5 (Buildings) - from lower-left (keeps translateX(-50%))
  gsap.set('#card-buildings', {
    opacity: 0,
    x: 'calc(-50% - 100px)',
    y: 140
  });
  
  console.log('✅ Initial states set');
}

setInitialStates();

// ======================================
// MASTER TIMELINE
// ======================================
const masterTL = gsap.timeline({
  scrollTrigger: {
    trigger: '.scroll-container',
    start: 'top top',
    end: 'bottom bottom',
    scrub: config.smoothness,
    onUpdate: (self) => {
      updateNavigationDots(self.progress);
      
      // Fade scroll hint after initial scroll
      if (self.progress > 0.03) {
        gsap.to('.scroll-hint', { opacity: 0, duration: 0.3 });
      } else {
        gsap.to('.scroll-hint', { opacity: 0.6, duration: 0.3 });
      }
      
      // Debug progress
      console.log('Scroll Progress:', (self.progress * 100).toFixed(1) + '%');
    }
  }
});

console.log('✅ Master timeline created');

// ======================================
// PHASE 1: HERO SECTION - Cards Fade In (scattered layout)
// ======================================
masterTL
  // Card 1: Manufacturing - floats from upper-left
  .to('#card-manufacturing', {
    opacity: 1,
    x: 0,
    y: 0,
    duration: 1.2,
    delay: 0,
    ease: [0.22, 1, 0.36, 1]
  }, 0)
  
  // Card 2: Electricity - floats from upper-right
  .to('#card-electricity', {
    opacity: 1,
    x: 0,
    y: 0,
    duration: 1.2,
    delay: 0.15,
    ease: [0.22, 1, 0.36, 1]
  }, 0)
  
  // Card 3: Agriculture - floats up from bottom (maintains center)
  .to('#card-agriculture', {
    opacity: 1,
    x: '-50%',
    y: 0,
    duration: 1.2,
    delay: 0.3,
    ease: [0.22, 1, 0.36, 1]
  }, 0)
  
  // Card 4: Transportation - floats from right diagonal
  .to('#card-transportation', {
    opacity: 1,
    x: 0,
    y: 0,
    duration: 1.2,
    delay: 0.45,
    ease: [0.22, 1, 0.36, 1]
  }, 0)
  
  // Card 5: Buildings - floats from lower-left (maintains center)
  .to('#card-buildings', {
    opacity: 1,
    x: '-50%',
    y: 0,
    duration: 1.2,
    delay: 0.6,
    ease: [0.22, 1, 0.36, 1]
  }, 0)
  
  // Hold hero section
  .to({}, { duration: 2 });

console.log('✅ Phase 1: Cards fade-in added');

// ======================================
// PHASE 2: EACH CARD GOES DOWN ONE BY ONE AND DISAPPEARS
// Before each exit, remaining cards reposition into scattered layout (like reference)
// Order: Buildings → Transportation → Agriculture → Electricity
// Only Manufacturing stays and gets zoomed (Phase 3)
// ======================================
const exitBottom = '115%';
const exitDuration = 1.8;
const readyDuration = 1.2;
const smoothEase = [0.25, 0.46, 0.45, 0.94]; // Smooth ease out for repositioning

// Keep cards in original positions, only reposition the ones that need to move
// After Buildings exits: keep 4 cards in original spots (no repositioning yet)
// After Transportation exits: remaining 3 cards reposition
const layout3 = {
  manufacturing: { top: '20%', left: '38%' },
  electricity: { top: '18%', left: '70%' },
  agriculture: { top: '50%', left: '50%' }
};
// After Agriculture exits: remaining 2 cards reposition
const layout2 = {
  manufacturing: { top: '35%', left: '45%' },
  electricity: { top: '60%', left: '55%' }
};

masterTL
  // Hold initial positions while scrolling starts
  .to({}, { duration: 1.5 })
  
  // 1. Buildings slides down and transforms to full section
  .to('#card-buildings', { 
    y: 500, 
    scale: 1.15,
    duration: exitDuration * 1.4, 
    ease: [0.6, 0.04, 0.98, 0.34]
  })
  // Show Buildings full section as card exits
  .to('#buildings-section', {
    opacity: 1,
    visibility: 'visible',
    duration: 1.2,
    ease: smoothEase
  }, '<+0.8')
  .to('#img-buildings', {
    opacity: 1,
    scale: 1,
    duration: 2,
    ease: 'power2.out'
  }, '<')
  .to('#title-buildings', {
    opacity: 1,
    y: 0,
    duration: 1.3,
    ease: smoothEase
  }, '<+0.5')
  .to('#content-buildings', {
    opacity: 1,
    y: 0,
    duration: 1.2,
    ease: smoothEase
  }, '<+0.3')
  
  // Hold Buildings section
  .to({}, { duration: 2 })
  
  // Fade out Buildings section
  .to('#title-buildings, #content-buildings', {
    opacity: 0,
    y: -30,
    duration: 0.9,
    ease: smoothEase
  })
  .to('#img-buildings', {
    opacity: 0,
    scale: 1.03,
    duration: 1,
    ease: smoothEase
  }, '<')
  .to('#buildings-section', {
    opacity: 0,
    visibility: 'hidden',
    duration: 0.4
  }, '<+0.5')
  
  // 2. Transportation slides down and transforms to full section
  .to('#card-transportation', { 
    y: 500, 
    scale: 1.15,
    duration: exitDuration * 1.4, 
    ease: [0.6, 0.04, 0.98, 0.34]
  })
  // Show Transportation full section
  .to('#transportation-section', {
    opacity: 1,
    visibility: 'visible',
    duration: 1.2,
    ease: smoothEase
  }, '<+0.8')
  .to('#img-transportation', {
    opacity: 1,
    scale: 1,
    duration: 2,
    ease: 'power2.out'
  }, '<')
  .to('#title-transportation', {
    opacity: 1,
    y: 0,
    duration: 1.3,
    ease: smoothEase
  }, '<+0.5')
  .to('#content-transportation', {
    opacity: 1,
    y: 0,
    duration: 1.2,
    ease: smoothEase
  }, '<+0.3')
  
  // Hold Transportation section
  .to({}, { duration: 2 })
  
  // Fade out Transportation section
  .to('#title-transportation, #content-transportation', {
    opacity: 0,
    y: -30,
    duration: 0.9,
    ease: smoothEase
  })
  .to('#img-transportation', {
    opacity: 0,
    scale: 1.03,
    duration: 1,
    ease: smoothEase
  }, '<')
  .to('#transportation-section', {
    opacity: 0,
    visibility: 'hidden',
    duration: 0.4
  }, '<+0.5')
  
  // Remaining 3 cards (Manufacturing, Electricity, Agriculture) reposition smoothly
  .to('#card-manufacturing', { 
    top: layout3.manufacturing.top, 
    left: layout3.manufacturing.left, 
    x: '-50%', 
    y: 0, 
    duration: readyDuration * 1.5, 
    ease: smoothEase 
  })
  .to('#card-electricity', { 
    top: layout3.electricity.top, 
    left: layout3.electricity.left, 
    x: '-50%', 
    y: 0, 
    duration: readyDuration * 1.5, 
    ease: smoothEase 
  }, '<')
  .to('#card-agriculture', { 
    top: layout3.agriculture.top, 
    left: layout3.agriculture.left, 
    x: '-50%', 
    y: 0, 
    duration: readyDuration * 1.5, 
    ease: smoothEase 
  }, '<')
  
  // Hold
  .to({}, { duration: 0.8 })
  
  // 3. Agriculture slides down and transforms to full section
  .to('#card-agriculture', { 
    y: 500, 
    scale: 1.15,
    duration: exitDuration * 1.4, 
    ease: [0.6, 0.04, 0.98, 0.34]
  })
  // Show Agriculture full section
  .to('#agriculture-section', {
    opacity: 1,
    visibility: 'visible',
    duration: 1.2,
    ease: smoothEase
  }, '<+0.8')
  .to('#img-agriculture', {
    opacity: 1,
    scale: 1,
    duration: 2,
    ease: 'power2.out'
  }, '<')
  .to('#title-agriculture', {
    opacity: 1,
    y: 0,
    duration: 1.3,
    ease: smoothEase
  }, '<+0.5')
  .to('#content-agriculture', {
    opacity: 1,
    y: 0,
    duration: 1.2,
    ease: smoothEase
  }, '<+0.3')
  
  // Hold Agriculture section
  .to({}, { duration: 2 })
  
  // Fade out Agriculture section
  .to('#title-agriculture, #content-agriculture', {
    opacity: 0,
    y: -30,
    duration: 0.9,
    ease: smoothEase
  })
  .to('#img-agriculture', {
    opacity: 0,
    scale: 1.03,
    duration: 1,
    ease: smoothEase
  }, '<')
  .to('#agriculture-section', {
    opacity: 0,
    visibility: 'hidden',
    duration: 0.4
  }, '<+0.5')
  
  // Remaining 2 cards (Manufacturing, Electricity) reposition smoothly
  .to('#card-manufacturing', { 
    top: layout2.manufacturing.top, 
    left: layout2.manufacturing.left, 
    x: '-50%', 
    y: 0, 
    duration: readyDuration * 1.5, 
    ease: smoothEase 
  })
  .to('#card-electricity', { 
    top: layout2.electricity.top, 
    left: layout2.electricity.left, 
    x: '-50%', 
    y: 0, 
    duration: readyDuration * 1.5, 
    ease: smoothEase 
  }, '<')
  
  // Hold
  .to({}, { duration: 0.8 })
  
  // 4. Electricity slides down and transforms to full section
  .to('#card-electricity', { 
    y: 500, 
    scale: 1.15,
    duration: exitDuration * 1.4, 
    ease: [0.6, 0.04, 0.98, 0.34]
  })
  // Show Electricity full section
  .to('#electricity-section', {
    opacity: 1,
    visibility: 'visible',
    duration: 1.2,
    ease: smoothEase
  }, '<+0.8')
  .to('#img-electricity', {
    opacity: 1,
    scale: 1,
    duration: 2,
    ease: 'power2.out'
  }, '<')
  .to('#title-electricity', {
    opacity: 1,
    y: 0,
    duration: 1.3,
    ease: smoothEase
  }, '<+0.5')
  .to('#content-electricity', {
    opacity: 1,
    y: 0,
    duration: 1.2,
    ease: smoothEase
  }, '<+0.3')
  
  // Hold Electricity section
  .to({}, { duration: 2 })
  
  // Fade out Electricity section
  .to('#title-electricity, #content-electricity', {
    opacity: 0,
    y: -30,
    duration: 0.9,
    ease: smoothEase
  })
  .to('#img-electricity', {
    opacity: 0,
    scale: 1.03,
    duration: 1,
    ease: smoothEase
  }, '<')
  .to('#electricity-section', {
    opacity: 0,
    visibility: 'hidden',
    duration: 0.4
  }, '<+0.5')
  
  // Last card (Manufacturing) slides down and transforms to full section
  .to('#card-manufacturing', { 
    y: 500, 
    scale: 1.15,
    duration: exitDuration * 1.4, 
    ease: [0.6, 0.04, 0.98, 0.34]
  })
  
  // Fade out hero section
  .to('#hero-section', {
    opacity: 0,
    visibility: 'hidden',
    duration: 0.8,
    ease: smoothEase
  }, '<')
  
  // Show Manufacturing full section
  .to('#manufacturing-section', {
    opacity: 1,
    visibility: 'visible',
    duration: 1.2,
    ease: smoothEase
  }, '<+0.8')
  .to('#img-manufacturing', {
    opacity: 1,
    scale: 1,
    duration: 2,
    ease: 'power2.out'
  }, '<')
  .to('#title-manufacturing', {
    opacity: 1,
    y: 0,
    duration: 1.3,
    ease: smoothEase
  }, '<+0.5')
  .to('#content-manufacturing', {
    opacity: 1,
    y: 0,
    duration: 1.2,
    ease: smoothEase
  }, '<+0.3')
  
  // Hold Manufacturing section (final)
  .to({}, { duration: 3 });

console.log('✅ Phase 2: Remaining cards reposition scattered then one goes down; only Manufacturing zooms');

// ======================================
// PHASE 3: MANUFACTURING CARD ZOOM
// ======================================
masterTL
  // Fade out hero text
  .to('.hero-content', {
    opacity: 0,
    y: -40,
    duration: 1,
    ease: config.ease
  })
  
  // Fade out other cards (electricity, agriculture, transportation, buildings)
  .to('#card-electricity, #card-agriculture, #card-transportation, #card-buildings', {
    opacity: 0,
    scale: 0.8,
    duration: 1.2,
    ease: config.ease
  }, '<')
  
  // Manufacturing card: break out of row and zoom to full screen (fixed to viewport)
  .to('#card-manufacturing', {
    position: 'fixed',
    left: '50%',
    top: '50%',
    xPercent: -50,
    yPercent: -50,
    width: '85vw',
    height: '85vh',
    scale: 1,
    duration: 2.5,
    ease: 'power2.out'
  }, '<+0.3')
  
  // Fade out hero section background
  .to('#hero-section', {
    opacity: 0,
    visibility: 'hidden',
    duration: 0.8,
    ease: config.ease
  }, '<+1')
  
  // Show manufacturing section and fade out the zoomed card (section has its own image)
  .to('#manufacturing-section', {
    opacity: 1,
    visibility: 'visible',
    duration: 0.6,
    ease: config.ease
  }, '<+0.2')
  .to('#card-manufacturing', {
    opacity: 0,
    duration: 0.5,
    ease: config.ease
  }, '<+0.4')
  
  // Zoom manufacturing image to full screen
  .to('#img-manufacturing', {
    opacity: 1,
    scale: 1,
    duration: 2,
    ease: 'power2.out'
  }, '<');

console.log('✅ Phase 3: Manufacturing zoom added');

// ======================================
// NAVIGATION DOTS UPDATE
// ======================================
function updateNavigationDots(progress) {
  const dots = document.querySelectorAll('.nav-dot');
  const totalSections = 6;
  
  let activeSection = Math.floor(progress * totalSections);
  if (activeSection >= totalSections) activeSection = totalSections - 1;
  
  dots.forEach((dot, index) => {
    if (index === activeSection) {
      dot.classList.add('active');
    } else {
      dot.classList.remove('active');
    }
  });
}

// Dot click navigation
document.querySelectorAll('.nav-dot').forEach((dot, index) => {
  dot.addEventListener('click', () => {
    const scrollContainer = document.querySelector('.scroll-animation-section');
    const containerHeight = document.querySelector('.scroll-container').offsetHeight;
    const targetScroll = scrollContainer.offsetTop + (index / 6) * containerHeight;
    
    window.scrollTo({
      top: targetScroll,
      behavior: 'smooth'
    });
  });
});

console.log('✅ Navigation dots initialized');

// ======================================
// WINDOW RESIZE HANDLER
// ======================================
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    ScrollTrigger.refresh();
    console.log('🔄 ScrollTrigger refreshed');
  }, 250);
});

// ======================================
// PAGE LOAD
// ======================================
window.addEventListener('load', () => {
  ScrollTrigger.refresh();
  console.log('✅ Page loaded - ScrollTrigger refreshed');
  console.log('📊 Smoothness setting:', config.smoothness);
});

// ======================================
// REDUCED MOTION SUPPORT
// ======================================
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  gsap.globalTimeline.timeScale(100);
  console.log('⚡ Reduced motion enabled');
}

// ======================================
// PHASE 4: MANUFACTURING CONTENT REVEAL
// ======================================
masterTL
  // Manufacturing title appears
  .to('#title-manufacturing', {
    opacity: 1,
    y: 0,
    duration: 1.3,
    ease: config.ease
  }, '-=0.5')
  
  // Manufacturing content appears
  .to('#content-manufacturing', {
    opacity: 1,
    y: 0,
    duration: 1.2,
    ease: config.ease
  }, '-=0.6')
  
  // Hold manufacturing section
  .to({}, { duration: 2.5 });

console.log('✅ Phase 4: Manufacturing content reveal added');

// ======================================
// PHASE 5: TRANSITION TO ELECTRICITY
// ======================================
masterTL
  // Fade out manufacturing
  .to('#title-manufacturing, #content-manufacturing', {
    opacity: 0,
    y: -30,
    duration: 0.9,
    ease: config.ease
  })
  
  .to('#img-manufacturing', {
    opacity: 0,
    scale: 1.03,
    duration: 1,
    ease: config.ease
  }, '<')
  
  .to('#manufacturing-section', {
    opacity: 0,
    visibility: 'hidden',
    duration: 0.4
  }, '<+0.5')
  
  // Show electricity section
  .to('#electricity-section', {
    opacity: 1,
    visibility: 'visible',
    duration: 0.5,
    ease: config.ease
  })
  
  // Electricity image zoom in
  .to('#img-electricity', {
    opacity: 1,
    scale: 1,
    duration: 2,
    ease: 'power2.out'
  }, '<+0.2')
  
  // Electricity title appears
  .to('#title-electricity', {
    opacity: 1,
    y: 0,
    duration: 1.3,
    ease: config.ease
  }, '<+0.8')
  
  // Electricity content appears
  .to('#content-electricity', {
    opacity: 1,
    y: 0,
    duration: 1.2,
    ease: config.ease
  }, '<+0.3')
  
  // Hold electricity section
  .to({}, { duration: 2.5 });

console.log('✅ Phase 5: Electricity transition added');

// ======================================
// PHASE 6: TRANSITION TO AGRICULTURE
// ======================================
masterTL
  // Fade out electricity
  .to('#title-electricity, #content-electricity', {
    opacity: 0,
    y: -30,
    duration: 0.9,
    ease: config.ease
  })
  
  .to('#img-electricity', {
    opacity: 0,
    scale: 1.03,
    duration: 1,
    ease: config.ease
  }, '<')
  
  .to('#electricity-section', {
    opacity: 0,
    visibility: 'hidden',
    duration: 0.4
  }, '<+0.5')
  
  // Show agriculture section
  .to('#agriculture-section', {
    opacity: 1,
    visibility: 'visible',
    duration: 0.5,
    ease: config.ease
  })
  
  // Agriculture image zoom in
  .to('#img-agriculture', {
    opacity: 1,
    scale: 1,
    duration: 2,
    ease: 'power2.out'
  }, '<+0.2')
  
  // Agriculture title appears
  .to('#title-agriculture', {
    opacity: 1,
    y: 0,
    duration: 1.3,
    ease: config.ease
  }, '<+0.8')
  
  // Agriculture content appears
  .to('#content-agriculture', {
    opacity: 1,
    y: 0,
    duration: 1.2,
    ease: config.ease
  }, '<+0.3')
  
  // Hold agriculture section
  .to({}, { duration: 2.5 });

console.log('✅ Phase 6: Agriculture transition added');

// ======================================
// PHASE 7: TRANSITION TO TRANSPORTATION
// ======================================
masterTL
  // Fade out agriculture
  .to('#title-agriculture, #content-agriculture', {
    opacity: 0,
    y: -30,
    duration: 0.9,
    ease: config.ease
  })
  
  .to('#img-agriculture', {
    opacity: 0,
    scale: 1.03,
    duration: 1,
    ease: config.ease
  }, '<')
  
  .to('#agriculture-section', {
    opacity: 0,
    visibility: 'hidden',
    duration: 0.4
  }, '<+0.5')
  
  // Show transportation section
  .to('#transportation-section', {
    opacity: 1,
    visibility: 'visible',
    duration: 0.5,
    ease: config.ease
  })
  
  // Transportation image zoom in
  .to('#img-transportation', {
    opacity: 1,
    scale: 1,
    duration: 2,
    ease: 'power2.out'
  }, '<+0.2')
  
  // Transportation title appears
  .to('#title-transportation', {
    opacity: 1,
    y: 0,
    duration: 1.3,
    ease: config.ease
  }, '<+0.8')
  
  // Transportation content appears
  .to('#content-transportation', {
    opacity: 1,
    y: 0,
    duration: 1.2,
    ease: config.ease
  }, '<+0.3')
  
  // Hold transportation section
  .to({}, { duration: 2.5 });

console.log('✅ Phase 7: Transportation transition added');

// ======================================
// PHASE 8: TRANSITION TO BUILDINGS (FINAL)
// ======================================
masterTL
  // Fade out transportation
  .to('#title-transportation, #content-transportation', {
    opacity: 0,
    y: -30,
    duration: 0.9,
    ease: config.ease
  })
  
  .to('#img-transportation', {
    opacity: 0,
    scale: 1.03,
    duration: 1,
    ease: config.ease
  }, '<')
  
  .to('#transportation-section', {
    opacity: 0,
    visibility: 'hidden',
    duration: 0.4
  }, '<+0.5')
  
  // Show buildings section
  .to('#buildings-section', {
    opacity: 1,
    visibility: 'visible',
    duration: 0.5,
    ease: config.ease
  })
  
  // Buildings image zoom in
  .to('#img-buildings', {
    opacity: 1,
    scale: 1,
    duration: 2,
    ease: 'power2.out'
  }, '<+0.2')
  
  // Buildings title appears
  .to('#title-buildings', {
    opacity: 1,
    y: 0,
    duration: 1.3,
    ease: config.ease
  }, '<+0.8')
  
  // Buildings content appears
  .to('#content-buildings', {
    opacity: 1,
    y: 0,
    duration: 1.2,
    ease: config.ease
  }, '<+0.3')
  
  // Hold buildings section (end)
  .to({}, { duration: 3 });

console.log('✅ Phase 8: Buildings transition added');
console.log('🎉 All animations complete!');

// ======================================
// KEYBOARD NAVIGATION (BONUS)
// ======================================
document.addEventListener('keydown', (e) => {
  // Don't trigger if user is typing in input
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
  
  const vh = window.innerHeight;
  
  switch(e.key) {
    case 'ArrowDown':
    case 'PageDown':
      e.preventDefault();
      window.scrollBy({ top: vh * 0.8, behavior: 'smooth' });
      break;
      
    case 'ArrowUp':
    case 'PageUp':
      e.preventDefault();
      window.scrollBy({ top: -vh * 0.8, behavior: 'smooth' });
      break;
      
    case 'Home':
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      break;
      
    case 'End':
      e.preventDefault();
      window.scrollTo({ 
        top: document.querySelector('.scroll-container').offsetHeight, 
        behavior: 'smooth' 
      });
      break;
  }
});

console.log('✅ Keyboard navigation enabled');

// ======================================
// PERFORMANCE MONITORING (OPTIONAL)
// ======================================
let frameCount = 0;
let fps = 0;
let lastTime = performance.now();

function measureFPS() {
  const now = performance.now();
  frameCount++;
  
  if (now >= lastTime + 1000) {
    fps = Math.round((frameCount * 1000) / (now - lastTime));
    frameCount = 0;
    lastTime = now;
    
    // Log FPS every second (comment out in production)
    // console.log('FPS:', fps);
  }
  
  requestAnimationFrame(measureFPS);
}

// Uncomment to enable FPS monitoring
// measureFPS();
