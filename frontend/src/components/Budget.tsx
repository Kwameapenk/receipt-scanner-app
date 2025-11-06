import { Card } from "./ui/card";
import { Progress } from "./ui/progress";
import { 
  ShoppingBag, 
  Coffee, 
  Car, 
  Home, 
  Utensils,
  Sparkles,
  TrendingDown,
  TrendingUp
} from "lucide-react";

const categories = [
  { 
    name: "Groceries", 
    icon: ShoppingBag, 
    spent: 432, 
    budget: 600, 
    color: "bg-green-100 text-green-700",
    barColor: "bg-green-600"
  },
  { 
    name: "Dining Out", 
    icon: Utensils, 
    spent: 287, 
    budget: 300, 
    color: "bg-orange-100 text-orange-700",
    barColor: "bg-orange-600"
  },
  { 
    name: "Coffee & Tea", 
    icon: Coffee, 
    spent: 124, 
    budget: 100, 
    color: "bg-amber-100 text-amber-700",
    barColor: "bg-amber-600"
  },
  { 
    name: "Transportation", 
    icon: Car, 
    spent: 215, 
    budget: 400, 
    color: "bg-blue-100 text-blue-700",
    barColor: "bg-blue-600"
  },
  { 
    name: "Bills & Utilities", 
    icon: Home, 
    spent: 789, 
    budget: 800, 
    color: "bg-purple-100 text-purple-700",
    barColor: "bg-purple-600"
  },
];

export function Budget() {
  return (
    <div className="px-6 pb-6">
      {/* Header */}
      <div className="pt-4 pb-6">
        <h1 className="text-2xl text-gray-900 mb-2">Budget Overview</h1>
        <p className="text-sm text-gray-500">November 2025</p>
      </div>

      {/* Total Budget Card */}
      <Card className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white p-6 border-0 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-indigo-100 text-sm mb-1">Total Spending</p>
            <p className="text-3xl">$1,847</p>
          </div>
          <div className="bg-white/20 px-3 py-1.5 rounded-full">
            <span className="text-sm">74% used</span>
          </div>
        </div>
        
        <div className="mb-4">
          <Progress value={74} className="h-2 bg-white/20" />
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <span className="text-indigo-100">of $2,500 budget</span>
          <span>$653 left</span>
        </div>
      </Card>

      {/* Insights */}
      <Card className="p-4 mb-6 bg-blue-50 border-blue-100">
        <div className="flex items-start gap-3">
          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
            <Sparkles className="h-4 w-4 text-blue-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-900 mb-1">Budget Insight</p>
            <p className="text-xs text-gray-600">
              You're spending 12% less than last month. Keep it up! 🎉
            </p>
          </div>
        </div>
      </Card>

      {/* Categories */}
      <div>
        <h2 className="text-lg text-gray-900 mb-4">Categories</h2>
        
        <div className="space-y-4">
          {categories.map((category) => {
            const Icon = category.icon;
            const percentage = (category.spent / category.budget) * 100;
            const isOverBudget = percentage > 100;
            
            return (
              <Card key={category.name} className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-xl ${category.color} flex items-center justify-center`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-gray-900">{category.name}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        {isOverBudget ? (
                          <>
                            <TrendingUp className="h-3 w-3 text-red-500" />
                            <span className="text-xs text-red-500">Over budget</span>
                          </>
                        ) : (
                          <>
                            <TrendingDown className="h-3 w-3 text-green-500" />
                            <span className="text-xs text-green-500">On track</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-900">${category.spent}</p>
                    <p className="text-xs text-gray-500">of ${category.budget}</p>
                  </div>
                </div>
                
                <div className="space-y-1.5">
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${category.barColor} transition-all`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">{Math.round(percentage)}% used</span>
                    <span className={isOverBudget ? "text-red-500" : "text-gray-500"}>
                      ${category.budget - category.spent > 0 ? category.budget - category.spent : 0} left
                    </span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
