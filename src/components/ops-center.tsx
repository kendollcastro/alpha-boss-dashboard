import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { AlertTriangleIcon, CheckCircle2Icon, RadarIcon, UserIcon, ClockIcon } from "lucide-react"

function statusVariant(status?: string) {
  const s = (status || "").toUpperCase()
  if (s === "ALERT" || s === "CRITICAL") return "alert"
  if (s === "OK" || s === "GO") return "ok"
  return "muted"
}

function StatusBadge({ status }: { status?: string }) {
  const s = (status || "").toUpperCase()
  if (s === "ALERT" || s === "CRITICAL") {
    return (
      <Badge variant="outline" className="border-red-500 text-red-600 dark:text-red-400">
        <AlertTriangleIcon className="size-3" />
        {status}
      </Badge>
    )
  }
  if (s === "OK" || s === "GO") {
    return (
      <Badge variant="outline" className="border-green-500 text-green-600 dark:text-green-400">
        <CheckCircle2Icon className="size-3" />
        {status}
      </Badge>
    )
  }
  return (
    <Badge variant="outline" className="text-muted-foreground">
      {status || "—"}
    </Badge>
  )
}

function fmtTime(ts?: string) {
  if (!ts) return "—"
  try {
    const d = new Date(ts)
    return d.toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false })
  } catch {
    return ts
  }
}

export function OpsCenter({ opsData }: { opsData: any }) {
  const brief = opsData?.brief
  const sections = brief?.sections ?? []

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <RadarIcon className="size-4" />
          Operations Center
        </CardTitle>
        <CardDescription>
          {brief?.version || "No brief"} ·{" "}
          {brief?.author ? (
            <span className="inline-flex items-center gap-1">
              <UserIcon className="size-3" /> {brief.author}
            </span>
          ) : null}{" "}
          ·{" "}
          <span className="inline-flex items-center gap-1">
            <ClockIcon className="size-3" /> {fmtTime(brief?.generated_at)}
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        {sections.length > 0 ? (
          <div className="grid gap-3 @xl/main:grid-cols-2 @4xl/main:grid-cols-3">
            {sections.map((sec: any, i: number) => (
              <div key={i} className="flex flex-col gap-2 rounded-lg border p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold">{sec.title}</span>
                  <StatusBadge status={sec.status} />
                </div>
                {(sec.lines ?? []).length > 0 && (
                  <ul className="flex flex-col gap-1 text-sm">
                    {(sec.lines ?? []).map((line: string, j: number) => (
                      <li key={j} className="flex gap-1.5 text-muted-foreground">
                        <span className="mt-1.5 size-1 shrink-0 rounded-full bg-muted-foreground/50" />
                        {line}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex h-16 items-center justify-center text-sm text-muted-foreground" style={{ minHeight: statusVariant(undefined) }}>
            No operations brief published yet
          </div>
        )}
      </CardContent>
    </Card>
  )
}