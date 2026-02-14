export const AddLink = () => {
    return <div className="p-6 bg-[#111] border-t border-white/10">
            <div className="relative">
              <input 
                type="text" 
                placeholder="PASTE YOUTUBE URL TO QUEUE..."
                className="w-full bg-black border border-white/10 p-4 pr-12 text-xs font-bold focus:outline-none focus:border-[#CCFF00] transition-colors"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20">
                ↵
              </div>
            </div>
          </div>
}