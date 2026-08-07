import { ReactNode } from "react";

// Every top-level section on the page (DataRail, MarketMoodSection,
// RoutesTabs, NoticeSection) needs the exact same "inset from the viewport
// edge, cap the content width on huge screens" behavior. That used to be
// copy-pasted as a Tailwind class string in each file separately
// (`px-6 sm:px-10 lg:px-[clamp(24px,7.5vw,120px)]`), which meant 4 separate
// places that all had to stay byte-for-byte identical to actually render
// the same width — and after a long debugging session where the mood
// panel kept measuring narrower than the route cards despite the class
// strings looking identical, moving this to one single shared component
// (using inline styles, not Tailwind's arbitrary-value class parsing, so
// there's no JIT/purge step that could compile two "identical" strings
// differently) removes the possibility of that ever happening again —
// there is now only one implementation of this behavior, used everywhere.
//
// The clamp() formula also replaces the old 3-breakpoint px-6/sm:px-10/
// lg:px-[clamp(...)] stack with one continuous value: 24px on small
// screens, scaling smoothly up to 120px on very wide ones, no breakpoint
// jumps.
export default function PageGutter({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={className}
      style={{
        marginLeft: "auto",
        marginRight: "auto",
        maxWidth: "1440px",
        paddingLeft: "clamp(24px, 6vw, 120px)",
        paddingRight: "clamp(24px, 6vw, 120px)",
        boxSizing: "border-box",
        width: "100%",
      }}
    >
      {children}
    </div>
  );
}
