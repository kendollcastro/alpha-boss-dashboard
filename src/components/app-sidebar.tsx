import * as React from "react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { LayoutDashboardIcon, HistoryIcon, Settings2Icon, CommandIcon } from "lucide-react"

const navMain = [
  {
    title: "Nerve Center",
    url: "/dashboard",
    icon: (
      <LayoutDashboardIcon />
    ),
  },
  {
    title: "Trade History",
    url: "/trades",
    icon: (
      <HistoryIcon />
    ),
  },
  {
    title: "Settings",
    url: "/settings",
    icon: (
      <Settings2Icon />
    ),
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const userName = typeof window !== "undefined" ? localStorage.getItem("abt_name") || "User" : "User"

  const user = {
    name: userName,
    email: "",
    avatar: "",
  }

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <a href="/dashboard">
                <CommandIcon className="size-5!" />
                <span className="text-base font-semibold">ALPHA BOSS TRADER</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}
