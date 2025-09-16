import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/ThemeToggle";
import { supabase } from "@/lib/supabase";

const benefits = [
  {
    title: "Aumento de 35% nas Vendas",
    description: "Automação inteligente que identifica oportunidades e engaja clientes no momento certo."
  },
  {
    title: "Redução de 70% no Tempo",
    description: "Elimine tarefas manuais e foque no que realmente importa: seus clientes."
  },
  {
    title: "ROI de 300% em 3 meses",
    description: "Recupere clientes inativos e aumente o ticket médio com campanhas personalizadas."
  }
];

const Login = () => {
  const [currentBenefit, setCurrentBenefit] = useState(0);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBenefit((prev) => (prev + 1) % benefits.length);
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Login realizado!",
        description: `Bem-vindo ao SmartFlow Sales, ${data.user?.email}!`,
      });
      
      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Erro ao fazer login",
        description: error.message || "Credenciais inválidas.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-8">
          <div className="absolute top-4 right-4">
            <ThemeToggle />
          </div>
          
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mb-4">
              <span className="text-primary-foreground font-bold text-xl">SF</span>
            </div>
            <h1 className="text-3xl font-bold text-foreground">Bem-vindo de volta</h1>
            <p className="text-muted-foreground mt-2">Entre na sua conta para continuar</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Fazer Login</CardTitle>
              <CardDescription>
                Digite suas credenciais para acessar sua conta
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remember"
                      checked={rememberMe}
                      onCheckedChange={(checked) => setRememberMe(checked === true)}
                    />
                    <Label htmlFor="remember" className="text-sm">
                      Lembrar-me
                    </Label>
                  </div>
                  <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                    Esqueci minha senha
                  </Link>
                </div>

                <Button type="submit" className="w-full">
                  Entrar
                </Button>
              </form>
            </CardContent>
          </Card>

          <p className="text-center text-sm text-muted-foreground">
            Não tem uma conta?{" "}
            <Link to="/register" className="text-primary hover:underline font-medium">
              Cadastre-se gratuitamente
            </Link>
          </p>
        </div>
      </div>

      {/* Right Side - Benefits Carousel */}
      <div className="flex-1 bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center p-8">
        <div className="text-center text-primary-foreground max-w-lg">
          <div className="mb-8">
            <h2 className="text-4xl font-bold mb-4">
              Transforme seu restaurante em uma máquina de vendas
            </h2>
          </div>

          <div className="space-y-6">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className={`transition-all duration-500 ${
                  index === currentBenefit
                    ? "opacity-100 scale-100"
                    : "opacity-30 scale-95"
                }`}
              >
                <h3 className="text-2xl font-semibold mb-2">{benefit.title}</h3>
                <p className="text-lg text-primary-foreground/80">{benefit.description}</p>
              </div>
            ))}
          </div>

          <div className="flex justify-center space-x-2 mt-8">
            {benefits.map((_, index) => (
              <button
                key={index}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentBenefit ? "bg-primary-foreground" : "bg-primary-foreground/30"
                }`}
                onClick={() => setCurrentBenefit(index)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
