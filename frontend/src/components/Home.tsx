import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Card } from "./ui/card";
import { ArrowUpRight, ArrowDownRight, TrendingDown, Calendar } from "lucide-react";

const recentReceipts = [
  { id: 1, store: "Whole Foods", amount: 47.23, category: "Groceries", date: "Today, 2:30 PM", color: "bg-green-100 text-green-700" },
  { id: 2, store: "Starbucks", amount: 8.45, category: "Coffee & Tea", date: "Today, 9:15 AM", color: "bg-orange-100 text-orange-700" },
  { id: 3, store: "Shell Gas", amount: 52.00, category: "Transportation", date: "Yesterday, 5:45 PM", color: "bg-blue-100 text-blue-700" },
  { id: 4, store: "Target", amount: 124.67, category: "Shopping", date: "Nov 4, 3:20 PM", color: "bg-purple-100 text-purple-700" },
];

export function Home() {
  return (
    <div className="px-6 pb-6">
      {/* Header */}
      <div className="pt-4 pb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-sm text-gray-500">Welcome back,</p>
            <h1 className="text-2xl text-gray-900">Sarah</h1>
          </div>
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1639149888905-fb39731f2e6c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXJzb24lMjBhdmF0YXIlMjBwb3J0cmFpdHxlbnwxfHx8fDE3NjIzOTg4OTZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
            alt="Profile"
            className="h-12 w-12 rounded-full object-cover ring-2 ring-blue-100"
          />
        </div>

        {/* Budget Overview Card */}
        <Card className="bg-gradient-to-br from-blue-600 to-blue-700 text-white p-6 border-0">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-blue-100 text-sm mb-1">November Budget</p>
              <p className="text-3xl">$1,847</p>
            </div>
            <div className="bg-white/20 px-3 py-1.5 rounded-full flex items-center gap-1">
              <TrendingDown className="h-4 w-4" />
              <span className="text-sm">-12%</span>
            </div>
          </div>
          
          <div className="mb-3">
            <div className="flex justify-between text-sm mb-1.5">
              <span className="text-blue-100">$1,847 of $2,500</span>
              <span>74%</span>
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-white rounded-full" style={{ width: '74%' }} />
            </div>
          </div>
          
          <p className="text-sm text-blue-100">$653 remaining this month</p>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <Card className="p-4 border-green-100 bg-green-50">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
              <ArrowDownRight className="h-4 w-4 text-green-600" />
            </div>
            <span className="text-sm text-gray-600">This Week</span>
          </div>
          <p className="text-2xl text-gray-900">$284</p>
          <p className="text-xs text-green-600 mt-1">8 receipts</p>
        </Card>
        
        <Card className="p-4 border-purple-100 bg-purple-50">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
              <ArrowUpRight className="h-4 w-4 text-purple-600" />
            </div>
            <span className="text-sm text-gray-600">Avg Daily</span>
          </div>
          <p className="text-2xl text-gray-900">$61</p>
          <p className="text-xs text-purple-600 mt-1">vs $73 last week</p>
        </Card>
      </div>

      {/* Recent Receipts */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg text-gray-900">Recent Receipts</h2>
          <button className="text-sm text-blue-600">View All</button>
        </div>

        <div className="space-y-3">
          {recentReceipts.map((receipt) => (
            <Card key={receipt.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-gray-100 flex items-center justify-center">
                    <span className="text-lg">🧾</span>
                  </div>
                  <div>
                    <p className="text-gray-900">{receipt.store}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${receipt.color}`}>
                        {receipt.category}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-gray-900">${receipt.amount}</p>
                  <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {receipt.date.split(',')[0]}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
