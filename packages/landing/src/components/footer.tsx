const FOOTER_LINKS = {
  제품: [
    { label: '기능 소개', href: '#features' },
    { label: '엔터프라이즈 요금', href: '#pricing' },
    { label: '보안 안내', href: '#' },
    { label: '릴리스 노트', href: '#' },
  ],
  리소스: [
    { label: '공식 문서', href: '#' },
    { label: 'API 레퍼런스', href: '#' },
    { label: '커뮤니티 포럼', href: '#' },
    { label: '블로그', href: '#' },
  ],
  회사: [
    { label: '회사 소개', href: '#' },
    { label: '채용 정보', href: '#' },
    { label: '개인정보 처리방침', href: '#' },
    { label: '서비스 이용약관', href: '#' },
  ],
}

export function Footer() {
  return (
    <footer className="bg-surface border-t border-border-dark px-6 sm:px-10 py-16">
      <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-10">
        {/* Brand */}
        <div className="flex flex-col gap-6 col-span-2 md:col-span-1">
          <div className="flex items-center gap-2 text-white">
            <svg className="w-6 h-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 3v6M12 15v6M3 12h6M15 12h6" />
            </svg>
            <span className="text-lg font-black tracking-tight">CORTHEX</span>
          </div>
          <p className="text-sm text-slate-400">
            차세대 AI 조직 관리 플랫폼. 완벽한 통제력과 압도적인 생산성을 제공합니다.
          </p>
        </div>

        {/* Link columns */}
        {Object.entries(FOOTER_LINKS).map(([category, links]) => (
          <div key={category} className="flex flex-col gap-4">
            <h4 className="font-bold text-white">{category}</h4>
            {links.map((link) => (
              <a
                key={link.label}
                className="text-sm text-slate-400 hover:text-primary transition-colors"
                href={link.href}
              >
                {link.label}
              </a>
            ))}
          </div>
        ))}
      </div>

      {/* Copyright */}
      <div className="max-w-6xl mx-auto mt-16 pt-8 border-t border-border-dark flex justify-between items-center text-sm text-slate-400">
        <p>&copy; {new Date().getFullYear()} CORTHEX Inc. All rights reserved.</p>
      </div>
    </footer>
  )
}
