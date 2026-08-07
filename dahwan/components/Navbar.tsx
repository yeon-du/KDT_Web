export default function Navbar() {
  return (
    <nav
      aria-label="주요 메뉴"
      className="sticky top-0 z-40 flex h-[68px] items-center border-b border-white/10 bg-forest/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-forest/80 sm:h-[76px] sm:px-10"
    >
      <a
        href="#top"
        aria-label="다환 홈"
        className="inline-flex items-center gap-2.5 text-[19px] font-bold tracking-tight text-white transition-opacity hover:opacity-80 sm:text-[22px]"
      >
        {/* Swap glyph instead of "$" — a dollar sign reads as USD-specific,
            which doesn't fit 다환 now that it compares seven currencies.
            Mint-filled circle + coral glyph reuses the exact same badge
            treatment as RouteIcon's own "은행 환전" icon (₩↔$) elsewhere in
            the app, so the wordmark and the in-app iconography read as the
            same visual language instead of two unrelated styles. */}
        <span className="grid h-[27px] w-[27px] place-items-center rounded-full bg-mint text-[12px] text-coral sm:h-[31px] sm:w-[31px] sm:text-[13px]">
          ⇄
        </span>
        <span>다환</span>
      </a>
    </nav>
  );
}
