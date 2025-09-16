import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { supabase } from "@/lib/supabase";

interface OrderItem {
  product_id: string;
  name: string;
  quantity: number;
  total?: number;
}

interface Order {
  id: string;
  order_number: string;
  customer_id?: string;
  total: number;
  payment_method?: string;
  status: string;
  created_at: string;
  items: OrderItem[];
}

const Orders: React.FC = () => {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [paymentLink, setPaymentLink] = useState<string | null>(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL as string | undefined;

  const filteredOrders = orders.filter(o => {
    const q = filter.toLowerCase();
    return o.order_number.toLowerCase().includes(q) || o.status.toLowerCase().includes(q);
  });

  useEffect(() => {
    async function fetchOrders() {
      try {
        // Buscar restaurant_id do usuário logado
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setOrders([]);
          setLoading(false);
          return;
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('restaurant_id')
          .eq('id', user.id)
          .single();

        if (!profile?.restaurant_id) {
          setOrders([]);
          setLoading(false);
          return;
        }

        // Buscar pedidos do restaurante
        const { data: orders, error } = await supabase
          .from('orders')
          .select(`*, customers(name, email), order_items(*)`)
          .eq('restaurant_id', profile.restaurant_id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Erro ao buscar pedidos:', error);
          setOrders([]);
          setLoading(false);
          return;
        }

        setOrders(orders || []);
      } catch (error) {
        console.error('Erro ao buscar pedidos:', error);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

  const handleCreatePaymentLink = async (orderId: string, provider: 'stripe' | 'mercadopago') => {
    try {
      const url = `${apiBaseUrl ? apiBaseUrl.replace(/\/$/, '') : ''}/api/payments/link` || '/api/payments/link';
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: orderId, provider })
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Falha ao gerar link');
      }
      const data = await res.json();
      setPaymentLink(data.url || null);
      setShowPaymentDialog(true);
      toast({ title: 'Link gerado', description: 'O link de pagamento foi criado com sucesso.' });
    } catch (error) {
      console.error('Erro ao criar link de pagamento:', error);
      toast({ title: 'Erro ao gerar link', description: error instanceof Error ? error.message : 'Tente novamente', variant: 'destructive' });
    }
  };

  if (loading) return <div>Carregando pedidos...</div>;

  return (
    <div className="space-y-6">
      <Breadcrumbs />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Pedidos</h1>
          <p className="text-muted-foreground">Gerencie seus pedidos e gere links de pagamento</p>
        </div>
        <div className="w-full sm:w-64">
          <Input placeholder="Buscar por número ou status..." value={filter} onChange={(e) => setFilter(e.target.value)} />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Pedidos</CardTitle>
          <CardDescription>Pedidos do seu restaurante</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nº Pedido</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell className="text-foreground">{o.order_number}</TableCell>
                    <TableCell className="text-foreground">{new Date(o.created_at).toLocaleString('pt-BR')}</TableCell>
                    <TableCell className="text-foreground capitalize">{o.status}</TableCell>
                    <TableCell className="text-foreground">R$ {o.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleCreatePaymentLink(o.id, 'stripe')}>Link Stripe</Button>
                        <Button variant="outline" size="sm" onClick={() => handleCreatePaymentLink(o.id, 'mercadopago')}>Link Mercado Pago</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {filteredOrders.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Nenhum pedido encontrado.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Link de Pagamento</DialogTitle>
          </DialogHeader>
          {paymentLink ? (
            <div className="space-y-3">
              <p className="text-sm text-foreground break-all">{paymentLink}</p>
              <Button onClick={() => navigator.clipboard.writeText(paymentLink)}>Copiar</Button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Não foi possível obter o link.</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Orders;