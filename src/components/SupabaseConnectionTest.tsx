import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, XCircle, Database, Users, Mail, TrendingUp } from 'lucide-react';

interface ConnectionStatus {
  supabase: boolean;
  auth: boolean;
  database: boolean;
  tables: {
    profiles: boolean;
    restaurants: boolean;
    customers: boolean;
    campaigns: boolean;
    messages: boolean;
    orders: boolean;
  };
  error?: string;
}

export default function SupabaseConnectionTest() {
  const [status, setStatus] = useState<ConnectionStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [userCount, setUserCount] = useState(0);
  const [campaignCount, setCampaignCount] = useState(0);

  const testConnection = async () => {
    setLoading(true);
    
    try {
      const newStatus: ConnectionStatus = {
        supabase: false,
        auth: false,
        database: false,
        tables: {
          profiles: false,
          restaurants: false,
          customers: false,
          campaigns: false,
          messages: false,
          orders: false,
        }
      };

      // Test 1: Verificar conexão básica
      const { data: health, error: healthError } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);

      if (healthError) throw healthError;
      newStatus.supabase = true;

      // Test 2: Verificar autenticação
      const { data: { session } } = await supabase.auth.getSession();
      newStatus.auth = !!session;

      // Test 3: Verificar tabelas individualmente
      const tables = [
        'profiles',
        'restaurants', 
        'customers',
        'campaigns',
        'messages',
        'orders'
      ] as const;

      for (const table of tables) {
        try {
          const { error } = await supabase
            .from(table)
            .select('id')
            .limit(1);
          
          newStatus.tables[table] = !error;
          newStatus.database = newStatus.database || !error;
        } catch {
          newStatus.tables[table] = false;
        }
      }

      // Test 4: Contar registros
      if (newStatus.tables.profiles) {
        const { count } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });
        setUserCount(count || 0);
      }

      if (newStatus.tables.campaigns) {
        const { count } = await supabase
          .from('campaigns')
          .select('*', { count: 'exact', head: true });
        setCampaignCount(count || 0);
      }

      setStatus(newStatus);
    } catch (error: any) {
      setStatus({
        supabase: false,
        auth: false,
        database: false,
        tables: {
          profiles: false,
          restaurants: false,
          customers: false,
          campaigns: false,
          messages: false,
          orders: false,
        },
        error: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    testConnection();
  }, []);

  const getStatusIcon = (isSuccess: boolean) => {
    return isSuccess ? 
      <CheckCircle className="h-4 w-4 text-green-500" /> : 
      <XCircle className="h-4 w-4 text-red-500" />;
  };

  const getStatusBadge = (isSuccess: boolean) => {
    return (
      <Badge variant={isSuccess ? "default" : "destructive"}>
        {isSuccess ? "OK" : "ERRO"}
      </Badge>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Teste de Conexão Supabase
          </CardTitle>
          <CardDescription>
            Verifique se todas as configurações estão corretas e o banco está acessível
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={testConnection} 
            disabled={loading}
            className="mb-4"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Testando...
              </>
            ) : (
              'Testar Conexão'
            )}
          </Button>

          {status?.error && (
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>Erro de Conexão</AlertTitle>
              <AlertDescription>{status.error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            {/* Status Principal */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Supabase</p>
                      <p className="text-xs text-muted-foreground">Conexão básica</p>
                    </div>
                    {getStatusBadge(status?.supabase || false)}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Autenticação</p>
                      <p className="text-xs text-muted-foreground">Sessão ativa</p>
                    </div>
                    {getStatusBadge(status?.auth || false)}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Database</p>
                      <p className="text-xs text-muted-foreground">Tabelas acessíveis</p>
                    </div>
                    {getStatusBadge(status?.database || false)}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Status das Tabelas */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tabelas do Banco</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(status?.tables || {}).map(([table, isAccessible]) => (
                    <div key={table} className="flex items-center justify-between py-2 border-b last:border-0">
                      <span className="capitalize font-medium">{table}</span>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(isAccessible)}
                        <span className="text-sm">{isAccessible ? 'Acessível' : 'Inacessível'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Estatísticas */}
            {(userCount > 0 || campaignCount > 0) && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Estatísticas do Banco
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-blue-500" />
                      <div>
                        <p className="text-2xl font-bold">{userCount}</p>
                        <p className="text-sm text-muted-foreground">Usuários</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-green-500" />
                      <div>
                        <p className="text-2xl font-bold">{campaignCount}</p>
                        <p className="text-sm text-muted-foreground">Campanhas</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}