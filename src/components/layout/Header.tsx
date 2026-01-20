export default function Header() {
  return (
    <header className="w-full bg-white border-b border-gray-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        <div className="flex items-center justify-between h-16 md:h-20 lg:h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <h1 className="text-xl md:text-2xl font-semibold text-black tracking-tight">Zyntrex</h1>
          </div>

          {/* Navigation */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8 2xl:gap-10">
            <a href="#" className="text-black hover:text-gray-700 text-sm xl:text-base 2xl:text-lg font-medium transition-colors">
              Our Process
            </a>
            <a href="#" className="text-black hover:text-gray-700 text-sm xl:text-base 2xl:text-lg font-medium transition-colors">
              Case Study
            </a>
            <a href="#" className="text-black hover:text-gray-700 text-sm xl:text-base 2xl:text-lg font-medium transition-colors">
              Our Services
            </a>
            <a href="#" className="text-black hover:text-gray-700 text-sm xl:text-base 2xl:text-lg font-medium transition-colors">
              About
            </a>
            <a href="#" className="text-black hover:text-gray-700 text-sm xl:text-base 2xl:text-lg font-medium transition-colors">
              Contact
            </a>
          </nav>

          {/* Right side actions */}
          <div className="flex items-center gap-4 md:gap-5 lg:gap-6">
            <a href="#" className="hidden md:block text-black hover:text-gray-700 text-sm xl:text-base 2xl:text-lg font-medium transition-colors whitespace-nowrap">
              Retainer Plan
            </a>
            <button className="bg-black text-white px-5 md:px-6 lg:px-7 xl:px-8 py-2 md:py-2.5 rounded-lg text-sm md:text-base xl:text-lg font-medium hover:bg-gray-800 transition-colors whitespace-nowrap">
              Get Quote
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
