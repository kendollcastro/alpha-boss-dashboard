import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { PauseIcon, PlayIcon, RefreshCwIcon, LoaderIcon } from "lucide-react"

export function SiteHeader({
  title = "Alpha Boss Trader",
  displayActive,
  demoMode = true,
  pausing,
  resuming,
  onPause,
  onResume,
  onRefresh,
}: {
  title?: string
  displayActive: any
  demoMode?: boolean
  pausing: any
  resuming: any
  onPause: any
  onResume: any
  onRefresh: any
}) {

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium">{title}</h1>
        <div className="ml-auto flex items-center gap-2">
          <Badge
            variant="outline"
            className={displayActive ? "border-green-500 text-green-600 dark:text-green-400" : "border-red-500 text-red-600 dark:text-red-400"}
          >
            <span className={`mr-1 inline-block size-1.5 rounded-full ${displayActive ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
            {displayActive ? "ACTIVE" : "PAUSED"}
          </Badge>
          <Badge
            variant="outline"
            className={demoMode ? "border-amber-500 text-amber-600 dark:text-amber-400" : "border-green-500 text-green-600 dark:text-green-400"}
          >
            {demoMode ? "DEMO" : "LIVE"}
          </Badge>
          <Button variant="outline" size="icon" onClick={onRefresh} title="Refresh">
            <RefreshCwIcon className="size-3.5" />
          </Button>
          {displayActive ? (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" disabled={pausing}>
                  {pausing ? <LoaderIcon className="size-3.5 animate-spin" /> : <PauseIcon className="size-3.5" />}
                  {pausing ? "Pausing..." : "Pause"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Pause Bot</AlertDialogTitle>
                  <AlertDialogDescription>Are you sure you want to pause the trading bot? No new positions will be opened while paused.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={onPause}>Pause</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ) : (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" disabled={resuming}>
                  {resuming ? <LoaderIcon className="size-3.5 animate-spin" /> : <PlayIcon className="size-3.5" />}
                  {resuming ? "Resuming..." : "Resume"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Resume Bot</AlertDialogTitle>
                  <AlertDialogDescription>Are you sure you want to resume the trading bot? It will start opening new positions again.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={onResume}>Resume</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>
    </header>
  )
}
