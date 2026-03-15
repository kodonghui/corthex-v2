import { Hero } from './components/hero'
import { Features } from './components/features'
import { Pricing } from './components/pricing'
import { Cta } from './components/cta'
import { Footer } from './components/footer'

const APP_URL = '/login'

function Header() {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between whitespace-nowrap border-b border-border-dark px-6 sm:px-10 py-4 bg-surface/80 backdrop-blur-md">
      <div className="flex items-center gap-3 text-white">
        <svg className="w-6 h-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M12 3v6M12 15v6M3 12h6M15 12h6" />
        </svg>
        <span className="text-lg font-black tracking-tight">CORTHEX</span>
      </div>
      <div className="flex flex-1 justify-end items-center gap-6 sm:gap-8">
        <nav className="hidden md:flex items-center gap-8">
          <a className="text-sm font-medium text-slate-300 hover:text-primary transition-colors" href="#features">
            기능
          </a>
          <a className="text-sm font-medium text-slate-300 hover:text-primary transition-colors" href="#pricing">
            요금
          </a>
        </nav>
        <a
          href={APP_URL}
          className="flex min-w-[84px] cursor-pointer items-center justify-center rounded-lg h-10 px-6 bg-primary text-slate-900 text-sm font-bold tracking-wide hover:bg-primary-hover transition-colors"
        >
          로그인
        </a>
      </div>
    </header>
  )
}

export function App() {
  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden">
      <Header />
      <main className="flex-1 flex flex-col">
        <Hero appUrl={APP_URL} />
        <Features />
        <Pricing />
        <Cta appUrl={APP_URL} />
      </main>
      <Footer />
    </div>
  )
}
