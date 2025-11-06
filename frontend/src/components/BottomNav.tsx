import { Home, Upload, PieChart, User, ScanLine } from "lucide-react";

export function BottomNav() {
  const leftTabs = [
    { id: "home", label: "Home", icon: Home },
    { id: "upload", label: "Upload", icon: Upload },
  ];

  const rightTabs = [
    { id: "budget", label: "Budget", icon: PieChart },
    { id: "profile", label: "Profile", icon: User },
  ];

  return (
    <div className="relative bg-white border-t border-gray-200 px-2 pt-2 pb-2 safe-area-bottom">
      {/* Floating Scan Button */}
      <div className="absolute -top-8 left-1/2 -translate-x-1/2">
        <button className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-xl hover:shadow-2xl transition-all active:scale-95 ring-4 ring-white">
          <ScanLine className="h-7 w-7 text-white" />
        </button>
      </div>

      <div className="flex items-center justify-between px-4">
        {/* Left tabs */}
        <div className="flex gap-4">
          {leftTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = tab.id === "home";
            
            return (
              <button
                key={tab.id}
                className={`flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-xl transition-all ${
                  isActive ? "text-blue-600" : "text-gray-500"
                }`}
              >
                <Icon className={`h-6 w-6 ${isActive ? "fill-blue-100" : ""}`} />
                <span className="text-xs">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Spacer for floating button */}
        <div className="w-16" />

        {/* Right tabs */}
        <div className="flex gap-4">
          {rightTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = false;
            
            return (
              <button
                key={tab.id}
                className={`flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-xl transition-all ${
                  isActive ? "text-blue-600" : "text-gray-500"
                }`}
              >
                <Icon className={`h-6 w-6 ${isActive ? "fill-blue-100" : ""}`} />
                <span className="text-xs">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
