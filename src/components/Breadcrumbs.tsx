import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Home, Users, FileText, BarChart3, Settings, Grid2x2 } from "lucide-react";

interface BreadcrumbConfig {
  label: string;
  href?: string;
  icon?: React.ElementType;
}

const routeConfig: Record<string, BreadcrumbConfig> = {
  "/": { label: "Início", icon: Home },
  "/dashboard": { label: "Dashboard", icon: Grid2x2 },
  "/clients": { label: "Clientes", icon: Users },
  "/campaigns": { label: "Campanhas", icon: FileText },
  "/reports": { label: "Relatórios", icon: BarChart3 },
  "/settings": { label: "Configurações", icon: Settings },
};

interface BreadcrumbsProps {
  customItems?: BreadcrumbConfig[];
  showIcons?: boolean;
  maxItems?: number;
}

export function Breadcrumbs({ customItems, showIcons = true, maxItems = 3 }: BreadcrumbsProps) {
  const location = useLocation();
  
  // Generate breadcrumb items from current path
  const generateBreadcrumbs = (): BreadcrumbConfig[] => {
    if (customItems) return customItems;
    
    const pathSegments = location.pathname.split("/").filter(Boolean);
    const breadcrumbs: BreadcrumbConfig[] = [];
    
    // Add dashboard as root for protected routes
    if (pathSegments.length > 0 && pathSegments[0] !== "dashboard") {
      breadcrumbs.push({
        label: "Dashboard",
        href: "/dashboard",
        icon: Grid2x2
      });
    }
    
    // Build breadcrumbs from path segments
    let currentPath = "";
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const config = routeConfig[currentPath];
      
      if (config) {
        breadcrumbs.push({
          label: config.label,
          href: index === pathSegments.length - 1 ? undefined : currentPath,
          icon: config.icon
        });
      }
    });
    
    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();
  
  // If no breadcrumbs or only one item, don't render
  if (breadcrumbs.length <= 1) return null;

  // Handle truncation for long breadcrumb lists
  const shouldTruncate = breadcrumbs.length > maxItems;
  const displayItems = shouldTruncate 
    ? [
        breadcrumbs[0], // Always show first
        ...breadcrumbs.slice(-2) // Show last 2
      ]
    : breadcrumbs;

  return (
    <Breadcrumb className="mb-6">
      <BreadcrumbList>
        {displayItems.map((item, index) => {
          const isLast = index === displayItems.length - 1;
          const Icon = item.icon;
          
          // Show ellipsis if truncated and this is the second item
          if (shouldTruncate && index === 1 && breadcrumbs.length > maxItems) {
            return (
              <React.Fragment key="ellipsis">
                <BreadcrumbItem>
                  <BreadcrumbEllipsis />
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </React.Fragment>
            );
          }
          
          return (
            <React.Fragment key={item.href || item.label}>
              <BreadcrumbItem>
                {item.href ? (
                  <BreadcrumbLink asChild>
                    <Link to={item.href} className="flex items-center gap-1.5">
                      {showIcons && Icon && <Icon className="h-4 w-4" />}
                      {item.label}
                    </Link>
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbPage className="flex items-center gap-1.5">
                    {showIcons && Icon && <Icon className="h-4 w-4" />}
                    {item.label}
                  </BreadcrumbPage>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator />}
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

// Utility component for custom breadcrumbs
export function CustomBreadcrumbs({ items }: { items: BreadcrumbConfig[] }) {
  return <Breadcrumbs customItems={items} />;
}