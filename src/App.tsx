import { useState, useEffect } from 'react'
import { 
  LayoutDashboard, 
  Phone, 
  MessageSquare,
  User,
  Settings,
  Bell,
  Moon,
  Sun
} from 'lucide-react'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
  SidebarInset
} from '@/components/ui/sidebar'

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import SipPage from './pages/SipPage'
import ChatPage from './pages/ChatPage'
import useSipStore from './stores/sipStore'
import useChatStore from './stores/chatStore'
import { useTheme } from 'next-themes'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './components/ui/dropdown-menu'
function ThemeToggle() {
  const { setTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function App() {
  const [activeMenu, setActiveMenu] = useState<string>('dashboard')
  
  const { initializeConnection: initSipConnection } = useSipStore()
  const { initializeConnection: initChatConnection } = useChatStore()
  useEffect(() => {
    // Initialize connections when the app starts
    initSipConnection()
    initChatConnection()
  }, [initSipConnection, initChatConnection])
  return (
    <div className="min-h-screen h-screen flex overflow-hidden">
      <SidebarProvider defaultOpen={true}>
        <Sidebar variant="sidebar" side="left" className="border-r h-screen">
          <SidebarHeader className="flex h-14 items-center px-4">
            <span className="font-semibold">Admin Dashboard</span>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  isActive={activeMenu === 'dashboard'}
                  onClick={() => setActiveMenu('dashboard')}
                >
                  <LayoutDashboard /> <span>Dashboard</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  isActive={activeMenu === 'sip'}
                  onClick={() => setActiveMenu('sip')}
                >
                  <Phone /> <span>SIP Accounts</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  isActive={activeMenu === 'chat'}
                  onClick={() => setActiveMenu('chat')}
                >
                  <MessageSquare /> <span>Chat & Agents</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
            <SidebarSeparator className="my-4" />
            <SidebarGroup>
              <SidebarGroupLabel>System</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      isActive={activeMenu === 'settings'}
                      onClick={() => setActiveMenu('settings')}
                    >
                      <Settings /> <span>Settings</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="p-4 space-y-2">
            <Button variant="outline" className="w-full justify-start gap-2">
              <User className="h-4 w-4" /> <span>Profile</span>
            </Button>
            <ThemeToggle />
          </SidebarFooter>
        </Sidebar>
        <SidebarInset className="flex-1 flex flex-col overflow-hidden">
          <div className="relative flex-shrink-0">
            <SidebarTrigger className="absolute left-4 top-3 z-10" />
          </div>
          <div className="flex flex-col gap-4 pt-12 " style={{height: 'calc(100dvh - 48px)'}}>
            {/* Dashboard Content */}
            {activeMenu === 'dashboard' && (
              <>
                <div className="flex justify-between items-center">
                  <h1 className="text-2xl font-bold">Dashboard</h1>
                  <div className="flex items-center gap-2">
                    <ThemeToggle />
                    <Button size="icon" variant="ghost">
                      <Bell className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Card className="dashboard-card">
                    <CardHeader>
                      <CardTitle>Total Users</CardTitle>
                      <CardDescription>Active users in your system</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold">1,234</p>
                    </CardContent>
                    <CardFooter>
                      <p className="text-sm text-muted-foreground">+12% from last month</p>
                    </CardFooter>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Revenue</CardTitle>
                      <CardDescription>Monthly revenue</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold">$45,231</p>
                    </CardContent>
                    <CardFooter>
                      <p className="text-sm text-muted-foreground">+5.2% from last month</p>
                    </CardFooter>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Active Sessions</CardTitle>
                      <CardDescription>Current active sessions</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold">342</p>
                    </CardContent>
                    <CardFooter>
                      <p className="text-sm text-muted-foreground">+18% from yesterday</p>
                    </CardFooter>
                  </Card>
                </div>
                <Card className="w-full">
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Your recent activity on the platform</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[1, 2, 3, 4, 5].map((item) => (
                        <div key={item} className="flex items-center gap-4 rounded-lg border p-3">
                          <div className="flex-1">
                            <p className="font-medium">Activity {item}</p>
                            <p className="text-sm text-muted-foreground">Action performed {item} hours ago</p>
                          </div>
                          <Button variant="ghost" size="sm">Details</Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
            {/* SIP Account Content */}
            {activeMenu === 'sip' && <SipPage />}
            
            {/* Chat & Agents Content */}
            {activeMenu === 'chat' && <ChatPage />}
            
            {/* Settings Content */}
            {activeMenu === 'settings' && (
              <>
                <div className="flex justify-between items-center">
                  <h1 className="text-2xl font-bold">Settings</h1>
                  <ThemeToggle />
                </div>
                <Card>
                  <CardHeader>
                    <CardTitle>Appearance</CardTitle>
                    <CardDescription>Customize the appearance of the application</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-medium mb-2">Theme</h3>
                        <p className="text-sm text-muted-foreground mb-4">Select your preferred theme mode.</p>
                        <div className="flex items-center gap-2">
                          <ThemeToggle />
                          <span className="text-sm">Toggle between light, dark, and system theme</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <p className="mt-4">Other system settings content goes here.</p>
              </>
            )}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}

export default App
