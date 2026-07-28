import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Bell, Plus, Search, LogOut, User, CreditCard } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";

export function TopBar({ email, initials }: { email?: string; initials: string }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/login", replace: true });
  }

  return (
    <header className="bg-card/80 sticky top-0 z-30 flex h-16 items-center gap-3 border-b px-3 backdrop-blur md:px-6">
      <SidebarTrigger />

      <div className="relative ml-auto hidden w-full max-w-sm md:block">
        <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
        <Input placeholder="Search clients or invoices" className="bg-muted/60 pl-9" />
      </div>

      <Button
        variant="hero"
        className="ml-auto md:ml-0"
        onClick={() => toast("Invoice builder arrives in the next build stage.")}
      >
        <Plus />
        <span className="hidden sm:inline">New Invoice</span>
      </Button>

      <Button
        variant="ghost"
        size="icon"
        aria-label="Notifications"
        onClick={() => toast("No new notifications.")}
      >
        <Bell />
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="focus-visible:ring-ring rounded-full focus-visible:ring-2 focus-visible:outline-none"
            aria-label="Account menu"
          >
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="truncate text-xs font-normal">{email}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => navigate({ to: "/settings" })}>
            <User className="mr-2 h-4 w-4" /> Profile
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate({ to: "/settings" })}>
            <CreditCard className="mr-2 h-4 w-4" /> Billing & plan
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" /> Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
