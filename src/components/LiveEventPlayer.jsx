export default function LiveEventPlayer() {
  return (
    <div className="card-surface overflow-hidden">
      <div className="relative overflow-hidden bg-surface-muted/30 h-80">
        <img
          src="https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&h=450&fit=crop&q=80"
          alt="Live Event"
          className="w-full h-full object-cover"
        />
        {/* Gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        
        {/* Content overlay */}
        <div className="absolute inset-0 flex flex-col justify-end p-6">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-2 drop-shadow-lg leading-tight">
            Stocks extend jump as Trump's U-turn calms nerves
          </h2>
          <p className="text-sm text-white/90 drop-shadow-md max-w-2xl mb-3">
            Major indices surge higher as investors welcome policy reversal, with tech stocks leading the rally amid renewed market optimism.
          </p>
          {/* Symbol pills */}
          <div className="flex gap-1 flex-wrap">
            <div className="px-1.5 py-0.5 rounded-full bg-white/20 backdrop-blur-sm border border-white/30">
              <span className="text-[10px] font-semibold text-white">SPY</span>
              <span className="text-[10px] font-semibold text-green-300 ml-1">+0.85%</span>
            </div>
            <div className="px-1.5 py-0.5 rounded-full bg-white/20 backdrop-blur-sm border border-white/30">
              <span className="text-[10px] font-semibold text-white">QQQ</span>
              <span className="text-[10px] font-semibold text-green-300 ml-1">+1.23%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
