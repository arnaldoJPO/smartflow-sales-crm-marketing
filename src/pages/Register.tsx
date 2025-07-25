
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    restaurant: "",
    phone: "",
    acceptTerms: false,
  });
  
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.password || !formData.restaurant) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.acceptTerms) {
      toast({
        title: "Erro",
        description: "Você deve aceitar os termos de uso.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Conta criada com sucesso!",
      description: "Redirecionando para o onboarding...",
    });
    
    navigate("/onboarding");
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Registration Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mb-4">
              <span className="text-white font-bold text-xl">SF</span>
            </div>
            <h1 className="text-3xl font-bold text-neutral-900">Crie sua conta</h1>
            <p className="text-neutral-600 mt-2">Comece sua jornada de automação de vendas</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Cadastro Gratuito</CardTitle>
              <CardDescription>
                Preencha os dados abaixo para criar sua conta
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Nome Completo *</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Seu nome completo"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="restaurant">Nome do Restaurante *</Label>
                  <Input
                    id="restaurant"
                    type="text"
                    placeholder="Nome do seu restaurante"
                    value={formData.restaurant}
                    onChange={(e) => handleInputChange("restaurant", e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="(11) 99999-9999"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="password">Senha *</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="confirmPassword">Confirmar Senha *</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    required
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="terms"
                    checked={formData.acceptTerms}
                    onCheckedChange={(checked) => handleInputChange("acceptTerms", checked)}
                  />
                  <Label htmlFor="terms" className="text-sm">
                    Aceito os{" "}
                    <Link to="/terms" className="text-primary hover:underline">
                      termos de uso
                    </Link>{" "}
                    e{" "}
                    <Link to="/privacy" className="text-primary hover:underline">
                      política de privacidade
                    </Link>
                  </Label>
                </div>

                <Button type="submit" className="w-full">
                  Criar Conta Gratuita
                </Button>
              </form>
            </CardContent>
          </Card>

          <p className="text-center text-sm text-neutral-600">
            Já tem uma conta?{" "}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Faça login
            </Link>
          </p>
        </div>
      </div>

      {/* Right Side - Benefits */}
      <div className="flex-1 bg-gradient-to-br from-success-500 to-success-600 flex items-center justify-center p-8">
        <div className="text-center text-white max-w-lg">
          <h2 className="text-4xl font-bold mb-6">
            Junte-se a +2.000 restaurantes
          </h2>
          <p className="text-xl mb-8 text-green-100">
            Que já aumentaram suas vendas com automação inteligente
          </p>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <span className="text-lg">Setup em menos de 5 minutos</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <span className="text-lg">Teste grátis por 14 dias</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <span className="text-lg">Suporte especializado incluído</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <span className="text-lg">Integração com WhatsApp e PDV</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
