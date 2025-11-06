import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Card } from "./ui/card";
import { 
  ChevronRight, 
  Bell, 
  CreditCard, 
  FileText, 
  Settings, 
  HelpCircle,
  LogOut,
  Shield
} from "lucide-react";

const menuItems = [
  {
    section: "Account",
    items: [
      { icon: CreditCard, label: "Payment Methods", badge: null },
      { icon: Bell, label: "Notifications", badge: "3" },
      { icon: FileText, label: "Export Data", badge: null },
    ]
  },
  {
    section: "App",
    items: [
      { icon: Settings, label: "Preferences", badge: null },
      { icon: Shield, label: "Privacy & Security", badge: null },
      { icon: HelpCircle, label: "Help & Support", badge: null },
    ]
  }
];

export function Profile() {
  return (
    <div className="px-6 pb-6">
      {/* Header */}
      <div className="pt-4 pb-6">
        <h1 className="text-2xl text-gray-900 mb-6">Profile</h1>
        
        {/* User Info Card */}
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 border-blue-100">
          <div className="flex items-center gap-4 mb-4">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1639149888905-fb39731f2e6c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXJzb24lMjBhdmF0YXIlMjBwb3J0cmFpdHxlbnwxfHx8fDE3NjIzOTg4OTZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt="Profile"
              className="h-16 w-16 rounded-full object-cover ring-2 ring-white"
            />
            <div className="flex-1">
              <h2 className="text-xl text-gray-900 mb-0.5">Sarah Johnson</h2>
              <p className="text-sm text-gray-600">sarah.j@email.com</p>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-blue-200">
            <div className="text-center">
              <p className="text-lg text-gray-900">127</p>
              <p className="text-xs text-gray-600">Receipts</p>
            </div>
            <div className="text-center border-l border-r border-blue-200">
              <p className="text-lg text-gray-900">5</p>
              <p className="text-xs text-gray-600">Categories</p>
            </div>
            <div className="text-center">
              <p className="text-lg text-gray-900">$2.4K</p>
              <p className="text-xs text-gray-600">Saved</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Menu Sections */}
      <div className="space-y-6">
        {menuItems.map((section) => (
          <div key={section.section}>
            <h3 className="text-sm text-gray-500 mb-3 px-1">{section.section}</h3>
            <Card className="divide-y divide-gray-100">
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors first:rounded-t-lg last:rounded-b-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-gray-100 flex items-center justify-center">
                        <Icon className="h-5 w-5 text-gray-700" />
                      </div>
                      <span className="text-gray-900">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.badge && (
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                          {item.badge}
                        </span>
                      )}
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </div>
                  </button>
                );
              })}
            </Card>
          </div>
        ))}
      </div>

      {/* Logout Button */}
      <button className="w-full mt-6 flex items-center justify-center gap-2 p-4 rounded-xl border-2 border-red-200 text-red-600 hover:bg-red-50 transition-colors">
        <LogOut className="h-5 w-5" />
        <span>Log Out</span>
      </button>

      {/* Version */}
      <p className="text-center text-xs text-gray-400 mt-6">
        ReceiptTrack v1.2.0
      </p>
    </div>
  );
}
