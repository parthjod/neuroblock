import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import PatientOverview from "@/components/dashboard/patient-overview";
import { getPatients } from "@/lib/data";

export default function Home() {
  const patients = getPatients();
  const currentUser = {
    name: "Dr. Evelyn Reed",
    avatarUrl: "https://picsum.photos/seed/dr-reed/100/100",
  };

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="size-8 text-primary"
            >
              <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2Zm-1.431 3.526h2.862l.859 3.435h-4.58l.859-3.435ZM12 14.25a.75.75 0 0 1-.75-.75v-2.25a.75.75 0 0 1 1.5 0V13.5a.75.75 0 0 1-.75.75Zm3.974 4.224h-7.948l.859-3.435h6.23l.859 3.435Zm-9.06-5.266 1.718-6.874a.75.75 0 0 1 .721-.534h2.862a.75.75 0 0 1 .721.534l1.718 6.874H6.914Z" />
            </svg>
            <div className="flex flex-col">
              <span className="font-semibold text-lg text-foreground">
                NeuroBlock
              </span>
              <span className="text-xs text-muted-foreground">Rehab</span>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                href="#"
                isActive
                tooltip={{ children: "Dashboard" }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" >
                  <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h7.5"/>
                </svg>
                <span>Dashboard</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <div className="mt-auto p-4">
          <div className="flex items-center gap-3">
            <Avatar className="size-8">
              <AvatarImage
                src={currentUser.avatarUrl}
                alt={currentUser.name}
              />
              <AvatarFallback>
                {currentUser.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-foreground">
                {currentUser.name}
              </span>
              <span className="text-xs text-muted-foreground">
                Neurologist
              </span>
            </div>
          </div>
        </div>
      </Sidebar>
      <SidebarInset>
        <PatientOverview initialPatients={patients} />
      </SidebarInset>
    </SidebarProvider>
  );
}
