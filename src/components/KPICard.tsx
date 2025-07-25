
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string;
  change: number;
  changeLabel: string;
  icon: LucideIcon;
  color?: "blue" | "green" | "yellow" | "red";
}

export function KPICard({ 
  title, 
  value, 
  change, 
  changeLabel, 
  icon: Icon, 
  color = "blue" 
}: KPICardProps) {
  const colorClasses = {
    blue: "bg-blue-500",
    green: "bg-green-500",
    yellow: "bg-yellow-500",
    red: "bg-red-500",
  };

  const isPositive = change > 0;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="text-sm font-medium text-muted-foreground mb-1">{title}</h3>
            <p className="text-2xl font-bold text-foreground mb-2">{value}</p>
            <div className="flex items-center text-sm">
              <span
                className={`font-medium ${
                  isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                }`}
              >
                {isPositive ? "+" : ""}{change}%
              </span>
              <span className="text-muted-foreground ml-1">{changeLabel}</span>
            </div>
          </div>
          <div className={`p-3 rounded-full ${colorClasses[color]}`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
