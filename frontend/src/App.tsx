import { Home } from "./components/Home";
import { BottomNav } from "./components/BottomNav";

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      {/* Mobile App Container */}
      <div className="w-full max-w-md bg-white shadow-2xl rounded-3xl overflow-hidden h-[812px] flex flex-col relative">
        {/* Status Bar */}
        <div className="bg-white px-6 pt-3 pb-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-900">9:41</span>
            <div className="flex items-center gap-1">
              <div className="w-4 h-3 border border-gray-900 rounded-sm relative">
                <div className="absolute inset-0.5 bg-gray-900 rounded-sm" />
              </div>
            </div>
          </div>
        </div>

        {/* Screen Content */}
        <div className="flex-1 overflow-y-auto">
          <Home />
        </div>

        {/* Bottom Navigation */}
        <BottomNav />
      </div>
    </div>
  );
}
