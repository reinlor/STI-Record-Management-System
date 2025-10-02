function LoadingDots(){
  return (
    <div className="flex items-center justify-center h-screen bg-white">
      <div className="flex gap-3">
        <span className="h-4 w-4 rounded-full bg-[#0172b9] animate-[pulseDot_1s_infinite] [animation-delay:-0.6s]"></span>
        <span className="h-4 w-4 rounded-full bg-[#0172b9] animate-[pulseDot_1s_infinite] [animation-delay:-0.45s]"></span>
        <span className="h-4 w-4 rounded-full bg-[#0172b9] animate-[pulseDot_1s_infinite] [animation-delay:-0.3s]"></span>
        <span className="h-4 w-4 rounded-full bg-[#0172b9] animate-[pulseDot_1s_infinite] [animation-delay:-0.15s]"></span>
        <span className="h-4 w-4 rounded-full bg-[#0172b9] animate-[pulseDot_1s_infinite]"></span>
      </div>
    </div>
  );
};

export default LoadingDots;
