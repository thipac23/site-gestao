import { cn } from "@/lib/utils"

interface Battery {
  id: string
  name: string
  status: string
  total_furnaces: number
  furnaces_operational: number
}

interface BatteryOverviewProps {
  batteries: Battery[]
}

export function BatteryOverview({ batteries }: BatteryOverviewProps) {
  if (batteries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <p className="text-muted-foreground">Nenhuma bateria configurada</p>
        <p className="text-sm text-muted-foreground">
          Configure as baterias no painel de administracao
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {batteries.map((battery) => {
        const operationalPercent = battery.total_furnaces > 0
          ? Math.round((battery.furnaces_operational / battery.total_furnaces) * 100)
          : 0

        return (
          <div key={battery.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-medium">{battery.name}</span>
              <span className="text-sm text-muted-foreground">
                {battery.furnaces_operational}/{battery.total_furnaces} fornos
              </span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className={cn(
                  "h-full rounded-full transition-all",
                  operationalPercent >= 80 ? "bg-green-500" :
                  operationalPercent >= 50 ? "bg-amber-500" : "bg-red-500"
                )}
                style={{ width: `${operationalPercent}%` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
