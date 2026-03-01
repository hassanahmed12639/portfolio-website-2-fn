/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ['class'],
    content: [
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
  	extend: {
  		fontFamily: {
  			sans: ['"Segoe UI"', '"Segoe UI Variable"', '-apple-system', 'BlinkMacSystemFont', '"Helvetica Neue"', 'Arial', 'sans-serif'],
  			playfair: ['Playfair Display', 'serif'],
  			overusedGrotesk: ['Overused Grotesk', 'sans-serif']
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		colors: {
  			designBg: '#0F0F0F',
  			textPrimary: '#FFFFFF',
  			accent: '#AAFF00',
  			accentHover: '#AAFF00',
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		animation: {
  			move: 'move 5s linear infinite',
  			'float-gentle': 'floatGentle 4s ease-in-out infinite',
  			marquee: 'marquee 30s linear infinite',
  			'beam-scatter-1': 'beamScatter1 12s ease-in-out infinite',
  			'beam-scatter-2': 'beamScatter2 15s ease-in-out infinite'
  		},
  		keyframes: {
  			marquee: {
  				'0%': { transform: 'translateX(0)' },
  				'100%': { transform: 'translateX(-25%)' }
  			},
  			move: {
  				'0%': {
  					transform: 'translateX(-200px)'
  				},
  				'100%': {
  					transform: 'translateX(200px)'
  				}
  			},
  			floatGentle: {
  				'0%, 100%': {
  					transform: 'translateY(0px)'
  				},
  				'50%': {
  					transform: 'translateY(-15px)'
  				}
  			},
  			beamScatter1: {
  				'0%': { transform: 'translate(0, 0) rotate(-12deg)' },
  				'20%': { transform: 'translate(80px, -60px) rotate(8deg)' },
  				'40%': { transform: 'translate(-40px, 40px) rotate(-5deg)' },
  				'60%': { transform: 'translate(100px, 30px) rotate(15deg)' },
  				'80%': { transform: 'translate(-60px, -40px) rotate(-8deg)' },
  				'100%': { transform: 'translate(0, 0) rotate(-12deg)' }
  			},
  			beamScatter2: {
  				'0%': { transform: 'translate(0, 0) rotate(20deg)' },
  				'25%': { transform: 'translate(-90px, 50px) rotate(5deg)' },
  				'50%': { transform: 'translate(50px, -70px) rotate(28deg)' },
  				'75%': { transform: 'translate(-70px, -30px) rotate(12deg)' },
  				'100%': { transform: 'translate(0, 0) rotate(20deg)' }
  			}
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
}
