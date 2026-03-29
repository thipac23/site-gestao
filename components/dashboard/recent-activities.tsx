import { cn } from "@/lib/utils"
import { Activity, Wrench, Flame, Package, CheckCircle, Clock } from "lucide-react"

interface ActivityItem {
  id: string
  activity_type: string
  description: string | null
  status: string
  created_at: string
  profiles: { full_name: string } | null
}

interface RecentActivitiesProps {
  activities: ActivityItem[]
}

const activityIcons: Record<string, React.ElementType> = {
  discharge: Flame,
  loading: Package,
  maintenance: Wrench,
  inspection: Activity,
  cleaning: Activity,
  other: Activity,
}

const activityLabels: Record<string, string> = {
  discharge: "Desenfornamento",
  loading: "Enfornamento",
  maintenance: "Manutencao",
  inspection: "Inspecao",
  cleaning: "Limpeza",
  other: "Outro",
}

const statusLabels: Record<string, string> = {
  pending: "Pendente",
  in_progress: "Em Andamento",
  completed: "Concluido",
  cancelled: "Cancelado",
}

export function RecentActivities({ activities }: RecentActivitiesProps) {
  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <p className="text-muted-foreground">Nenhuma atividade recente</p>
        <p className="text-sm text-muted-foreground">
          As atividades registradas aparecerao aqui
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => {
        const Icon = activityIcons[activity.activity_type] || Activity
        const timeAgo = getTimeAgo(activity.created_at)

        return (
          <div key={activity.id} className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
            <div className={cn(
              "p-2 rounded-lg",
              activity.status === "completed" ? "bg-green-100 text-green-600" :
              activity.status === "in_progress" ? "bg-blue-100 text-blue-600" :
              "bg-muted text-muted-foreground"
            )}>
              <Icon className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium">
                {activityLabels[activity.activity_type]}
              </p>
              <p className="text-sm text-muted-foreground truncate">
                {activity.description || "Sem descricao"}
              </p>
              <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                <span>{activity.profiles?.full_name || "Usuario"}</span>
                <span>·</span>
                <span>{timeAgo}</span>
              </div>
            </div>
            <div className={cn(
              "flex items-center gap-1 text-xs px-2 py-1 rounded-full",
              activity.status === "completed" ? "bg-green-100 text-green-700" :
              activity.status === "in_progress" ? "bg-blue-100 text-blue-700" :
              activity.status === "cancelled" ? "bg-red-100 text-red-700" :
              "bg-muted text-muted-foreground"
            )}>
              {activity.status === "completed" ? (
                <CheckCircle className="h-3 w-3" />
              ) : (
                <Clock className="h-3 w-3" />
              )}
              {statusLabels[activity.status]}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function getTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000)

  if (diffInMinutes < 1) return "Agora"
  if (diffInMinutes < 60) return `${diffInMinutes}min atras`
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h atras`
  return `${Math.floor(diffInMinutes / 1440)}d atras`
}
