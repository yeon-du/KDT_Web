export default function NoticeSection() {
  return (
    <section className="mx-auto mb-14 max-w-[1140px] rounded-2xl border border-line bg-forest2 px-6 py-5 sm:mb-20">
      <p className="text-[10px] leading-relaxed text-muted">
        <span className="mr-1.5 font-bold text-coral">계산 방식</span>
        기준환율 설정 → 경로별 비용(스프레드·송금·거래·네트워크) 반영 → 최종 수령액 환산, 모든 경로를 같은 출발선에서
        비교해요.
      </p>
      <div className="mt-4 flex gap-4 border-t border-line pt-4">
        <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-coral font-serif text-xs font-bold text-forest">
          !
        </span>
        <p className="text-[11px] leading-relaxed text-muted">
          <b className="text-ink">이 결과는 실시간 견적이 아닌 가상 시뮬레이션입니다.</b> 실제 환율과 수수료는
          금융기관·거래소·거래 시점에 따라 달라집니다. USDT 경로는 가격 변동, 거래소 정책, 트래블룰 및 외환·세무
          규정을 함께 확인해야 하며, 실행 전 각 제공기관의 최종 견적을 반드시 확인하세요. 본 서비스는 투자 또는
          법률 자문을 제공하지 않습니다.
        </p>
      </div>
    </section>
  );
}
