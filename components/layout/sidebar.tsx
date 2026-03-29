"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { 
  LayoutDashboard, 
  Activity, 
  Flame, 
  Package, 
  Calendar, 
  Users, 
  FileText, 
  Settings,
  Factory
} from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Mapa de Baterias", href: "/dashboard/batteries", icon: Flame },
  { name: "Atividades", href: "/dashboard/activities", icon: Activity },
  { name: "Logistica", href: "/dashboard/logistics", icon: Package },
  { name: "Programacao", href: "/dashboard/schedule", icon: Calendar },
  { name: "Equipe", href: "/dashboard/team", icon: Users },
  { name: "Relatorios", href: "/dashboard/reports", icon: FileText },
  { name: "Administracao", href: "/dashboard/admin", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-card border-r">
      <div className="flex items-center gap-3 h-16 px-6 border-b">
        <div className="p-1.5 bg-primary rounded-lg">
          <Factory className="h-5 w-5 text-primary-foreground" />
        </div>
        <span className="font-bold text-lg">REFRAMAX</span>
      </div>
      
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== "/dashboard" && pathname.startsWith(item.href))
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
