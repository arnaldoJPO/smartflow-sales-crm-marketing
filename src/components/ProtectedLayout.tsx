
import { Outlet } from "react-router-dom";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Header } from "@/components/Header";
import React from "react";
import { supabase } from "@/lib/supabase";

function useCurrentUser() {
  const [user, setUser] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchUser() {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (!authUser) {
          setUser(null);
          return;
        }

        // Buscar informações adicionais do perfil
        const { data: profile } = await supabase
          .from('profiles')
          .select('*, restaurants(*)')
          .eq('id', authUser.id)
          .single();

        setUser({
          ...authUser,
          ...profile
        });
      } catch (e) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, []);

  return { user, loading };
}

export const Access: React.FC<{ roles?: string[]; plans?: string[]; children: React.ReactNode }> = ({ roles, plans, children }) => {
  const { user, loading } = useCurrentUser();
  if (loading) return null;
  if (!user) return <>{children}</>; // permissivo quando sem auth
  const userRole = (user.role || '').toLowerCase();
  const userPlan = (user.plan || '').toLowerCase();
  const hasRole = roles ? roles.map(r => r.toLowerCase()).includes(userRole) : true;
  const hasPlan = plans ? plans.map(p => p.toLowerCase()).includes(userPlan) : true;
  if (!hasRole || !hasPlan) return null;
  return <>{children}</>;
};

const ProtectedLayout = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 p-6 bg-background">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default ProtectedLayout;
