import { useState } from "react";
import { Camera, Image as ImageIcon, FlipHorizontal, Zap, X } from "lucide-react";
import { Button } from "./ui/button";

export function Scan() {
  const [scanning, setScanning] = useState(false);

  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Camera View */}
      <div className="flex-1 relative overflow-hidden">
        {/* Camera placeholder with grid */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-800 to-gray-900">
          <div className="absolute inset-0 opacity-20">
            <svg className="w-full h-full">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>
        </div>

        {/* Scan Frame */}
        <div className="absolute inset-0 flex items-center justify-center px-8">
          <div className="w-full aspect-[3/4] relative">
            {/* Corner borders */}
            <div className="absolute top-0 left-0 w-16 h-16 border-l-4 border-t-4 border-blue-500 rounded-tl-2xl" />
            <div className="absolute top-0 right-0 w-16 h-16 border-r-4 border-t-4 border-blue-500 rounded-tr-2xl" />
            <div className="absolute bottom-0 left-0 w-16 h-16 border-l-4 border-b-4 border-blue-500 rounded-bl-2xl" />
            <div className="absolute bottom-0 right-0 w-16 h-16 border-r-4 border-b-4 border-blue-500 rounded-br-2xl" />
            
            {/* Scanning animation */}
            {scanning && (
              <div className="absolute inset-0 overflow-hidden rounded-2xl">
                <div className="absolute w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent animate-pulse" 
                     style={{ top: '50%' }} />
              </div>
            )}
          </div>
        </div>

        {/* Top Instructions */}
        <div className="absolute top-0 left-0 right-0 p-6">
          <div className="bg-black/60 backdrop-blur-sm rounded-2xl p-4 text-center">
            <p className="text-white text-sm">
              {scanning ? "Scanning receipt..." : "Position receipt within the frame"}
            </p>
          </div>
        </div>

        {/* Bottom Instructions */}
        <div className="absolute bottom-32 left-0 right-0 px-6">
          <div className="bg-black/60 backdrop-blur-sm rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                <Zap className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-white text-sm mb-1">Quick Tip</p>
                <p className="text-gray-300 text-xs">
                  Make sure the entire receipt is visible and well-lit for best results
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-gray-900 px-6 py-6 pb-8">
        <div className="flex items-center justify-between mb-6">
          {/* Gallery */}
          <button className="h-14 w-14 rounded-full bg-gray-800 flex items-center justify-center hover:bg-gray-700 transition-colors">
            <ImageIcon className="h-6 w-6 text-white" />
          </button>

          {/* Capture Button */}
          <button 
            onClick={() => {
              setScanning(true);
              setTimeout(() => setScanning(false), 2000);
            }}
            className="h-20 w-20 rounded-full bg-blue-600 flex items-center justify-center shadow-lg hover:bg-blue-700 transition-all active:scale-95 ring-4 ring-blue-600/30"
          >
            {scanning ? (
              <div className="animate-spin h-8 w-8 border-3 border-white border-t-transparent rounded-full" />
            ) : (
              <Camera className="h-9 w-9 text-white" />
            )}
          </button>

          {/* Flip Camera */}
          <button className="h-14 w-14 rounded-full bg-gray-800 flex items-center justify-center hover:bg-gray-700 transition-colors">
            <FlipHorizontal className="h-6 w-6 text-white" />
          </button>
        </div>

        <div className="flex items-center justify-center gap-6">
          <Button variant="ghost" className="text-white hover:bg-gray-800">
            <X className="h-5 w-5 mr-2" />
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
