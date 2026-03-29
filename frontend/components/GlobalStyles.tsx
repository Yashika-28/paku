"use client";
export const GlobalStyles = () => (
  <style jsx global>{`
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
    @keyframes fillBar { from { width: 0%; } to { width: 100%; } }
    @keyframes popIn { 0% { transform: scale(0.9); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
    .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
    .animate-slide-up { animation: slideUp 0.3s ease-out forwards; }
    .animate-pop-in { animation: popIn 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
    .hover-progress-bar { animation: fillBar 1.5s linear forwards; }
    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 4px; }
    .custom-scrollbar:hover::-webkit-scrollbar-thumb { background-color: #94a3b8; }

    /* === Sky Banner Animations === */

    /* Sun positions */
    .sky-sun-morning { bottom: 10%; left: 15%; }
    .sky-sun-noon { top: 8%; left: 50%; transform: translateX(-50%); }
    .sky-sun-evening { bottom: 10%; right: 15%; }

    /* Pulse glow */
    @keyframes skyPulse {
      0%, 100% { transform: scale(1); opacity: 0.3; }
      50% { transform: scale(1.15); opacity: 0.15; }
    }
    .sky-pulse { animation: skyPulse 3s ease-in-out infinite; }
    .sky-pulse-delayed { animation: skyPulse 3s ease-in-out infinite 1.5s; }

    /* Float */
    @keyframes skyFloat {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-6px); }
    }
    .sky-float { animation: skyFloat 6s ease-in-out infinite; }

    /* Star twinkle */
    @keyframes skyTwinkle {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.2; transform: scale(0.6); }
    }
    .sky-twinkle { animation: skyTwinkle 2s ease-in-out infinite; }
    .sky-twinkle-delayed { animation: skyTwinkle 2s ease-in-out infinite 1s; }

    /* Star sparkle cross */
    @keyframes skySpark {
      0%, 100% { transform: scale(1) rotate(0deg); opacity: 0.8; }
      50% { transform: scale(1.5) rotate(45deg); opacity: 0.3; }
    }
    .sky-sparkle { animation: skySpark 3s ease-in-out infinite; }

    /* Cloud drift */
    @keyframes skyCloudDrift {
      0% { transform: translateX(-120px); }
      100% { transform: translateX(calc(100vw + 120px)); }
    }
    @keyframes skyCloudDriftReverse {
      0% { transform: translateX(calc(100vw + 80px)); }
      100% { transform: translateX(-160px); }
    }
    .sky-cloud-drift { animation: skyCloudDrift 30s linear infinite; }
    .sky-cloud-drift-reverse { animation: skyCloudDriftReverse 35s linear infinite; }
    .sky-cloud-drift-fast .sky-cloud-drift,
    .sky-cloud-drift-fast.sky-cloud-drift { animation-duration: 15s !important; }
    .sky-cloud-drift-fast .sky-cloud-drift-reverse,
    .sky-cloud-drift-fast.sky-cloud-drift-reverse { animation-duration: 18s !important; }

    /* Rain */
    @keyframes skyRain {
      0% { transform: translateY(-20px); opacity: 0; }
      10% { opacity: 1; }
      100% { transform: translateY(250px); opacity: 0; }
    }
    .sky-rain { animation: skyRain 0.8s linear infinite; }

    /* Lightning */
    @keyframes skyLightning {
      0%, 93%, 100% { background: transparent; }
      94% { background: rgba(255, 255, 255, 0.3); }
      96% { background: transparent; }
      97% { background: rgba(255, 255, 255, 0.15); }
    }
    .sky-lightning { animation: skyLightning 8s ease-in-out infinite; }

    /* Shooting star — appears briefly every 12s */
    @keyframes skyShootingStar {
      0%, 90% { transform: translate(0, 0) scale(0); opacity: 0; }
      92% { transform: translate(0, 0) scale(1); opacity: 1; }
      100% { transform: translate(60vw, 8vh) scale(0.3); opacity: 0; }
    }
    .sky-shooting-star { animation: skyShootingStar 12s ease-in-out infinite; }

    /* Fix white overscroll flash */
    html, body {
      overscroll-behavior: none;
    }
  `}</style>
);