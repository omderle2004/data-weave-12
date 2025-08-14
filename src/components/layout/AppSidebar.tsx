import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Files,
  Database,
  Users,
  Settings,
  User,
  Share2,
  BookOpen,
  FileText,
  HelpCircle,
  ChevronDown,
  ChevronRight,
  FolderOpen,
  Plus
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const teamItems = [
  { title: "Files", url: "/files", icon: Files },
  { title: "Connections", url: "/connections", icon: Database },
  { title: "Members", url: "/members", icon: Users },
  { title: "Settings", url: "/settings", icon: Settings },
];

const personalItems = [
  { title: "My Files", url: "/my-files", icon: User },
  { title: "Shared with Me", url: "/shared", icon: Share2 },
];

const resourceItems = [
  { title: "Examples", url: "/examples", icon: BookOpen },
  { title: "Documentation", url: "/docs", icon: FileText },
  { title: "Support", url: "/support", icon: HelpCircle },
];

export function AppSidebar() {
  const { state, isMobile } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const collapsed = state === "collapsed";

  const [teamExpanded, setTeamExpanded] = useState(true);
  const [personalExpanded, setPersonalExpanded] = useState(true);
  const [resourcesExpanded, setResourcesExpanded] = useState(false);

  const isActive = (path: string) => currentPath === path;
  
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? "bg-primary-light text-primary font-medium border-r-2 border-primary" 
      : "hover:bg-accent text-muted-foreground hover:text-foreground";

  const renderMenuItems = (items: typeof teamItems) => (
    <SidebarMenu>
      {items.map((item) => (
        <SidebarMenuItem key={item.title}>
          <SidebarMenuButton asChild>
            <NavLink to={item.url} className={getNavCls}>
              <item.icon className="mr-2 h-4 w-4" />
              {!collapsed && <span>{item.title}</span>}
            </NavLink>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );

  return (
    <Sidebar
      className={cn(
        "border-r border-sidebar-border bg-sidebar transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
      collapsible="icon"
    >
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
            <FolderOpen className="h-4 w-4 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div>
              <h1 className="font-semibold text-sidebar-foreground">DataSpace</h1>
              <p className="text-xs text-muted-foreground">AI Workspace</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="p-2">
        {/* Team Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="px-2 text-xs font-medium text-muted-foreground flex items-center justify-between">
            <span>TEAM</span>
            {!collapsed && (
              <button
                onClick={() => setTeamExpanded(!teamExpanded)}
                className="hover:text-foreground"
              >
                {teamExpanded ? (
                  <ChevronDown className="h-3 w-3" />
                ) : (
                  <ChevronRight className="h-3 w-3" />
                )}
              </button>
            )}
          </SidebarGroupLabel>
          {(teamExpanded || collapsed) && (
            <SidebarGroupContent>
              {renderMenuItems(teamItems)}
            </SidebarGroupContent>
          )}
        </SidebarGroup>

        {/* Personal Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="px-2 text-xs font-medium text-muted-foreground flex items-center justify-between">
            <span>PERSONAL</span>
            {!collapsed && (
              <button
                onClick={() => setPersonalExpanded(!personalExpanded)}
                className="hover:text-foreground"
              >
                {personalExpanded ? (
                  <ChevronDown className="h-3 w-3" />
                ) : (
                  <ChevronRight className="h-3 w-3" />
                )}
              </button>
            )}
          </SidebarGroupLabel>
          {(personalExpanded || collapsed) && (
            <SidebarGroupContent>
              {renderMenuItems(personalItems)}
            </SidebarGroupContent>
          )}
        </SidebarGroup>

        {/* Resources Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="px-2 text-xs font-medium text-muted-foreground flex items-center justify-between">
            <span>RESOURCES</span>
            {!collapsed && (
              <button
                onClick={() => setResourcesExpanded(!resourcesExpanded)}
                className="hover:text-foreground"
              >
                {resourcesExpanded ? (
                  <ChevronDown className="h-3 w-3" />
                ) : (
                  <ChevronRight className="h-3 w-3" />
                )}
              </button>
            )}
          </SidebarGroupLabel>
          {(resourcesExpanded || collapsed) && (
            <SidebarGroupContent>
              {renderMenuItems(resourceItems)}
            </SidebarGroupContent>
          )}
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-muted rounded-full flex items-center justify-center">
            <User className="h-4 w-4" />
          </div>
          {!collapsed && (
            <div className="flex-1">
              <p className="text-sm font-medium">John Doe</p>
              <p className="text-xs text-muted-foreground">john@company.com</p>
            </div>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}