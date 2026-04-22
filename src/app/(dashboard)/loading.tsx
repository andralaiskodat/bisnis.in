import { Store } from "lucide-react";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
      <div className="relative">
        {/* Outer pulse effect */}
        <div className="absolute inset-0 animate-ping rounded-full bg-[#1D9E75]/20" />
        
        {/* Inner circle with icon */}
        <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-xl border border-[#1D9E75]/10">
          <Store className="h-10 w-10 text-[#1D9E75] animate-pulse" />
        </div>
      </div>
      
      {/* Text with fade-in animation */}
      <div className="mt-6 flex flex-col items-center">
        <h2 className="text-xl font-bold text-gray-900 animate-pulse">Dibisnis.IN</h2>
        <p className="mt-2 text-sm text-gray-500 font-medium">Sedang menyiapkan pengalaman terbaik untuk Anda...</p>
      </div>
      
      {/* Progress line animation */}
      <div className="mt-8 h-1 w-48 overflow-hidden rounded-full bg-gray-100">
        <div className="h-full w-full origin-left animate-loading-bar bg-[#1D9E75]" />
      </div>
    </div>
  );
}
