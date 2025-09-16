import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'

export function SupabaseTest() {
  const [status, setStatus] = useState<'testing' | 'success' | 'error' | 'idle'>('idle')
  const [error, setError] = useState<string | null>(null)
  const [connectionInfo, setConnectionInfo] = useState<any>(null)

  const testConnection = async () => {
    setStatus('testing')
    setError(null)
    
    try {
      // Testar conexão básica
      const { data, error } = await supabase.from('restaurants').select('*').limit(1)
      
      if (error) {
        throw error
      }
      
      setStatus('success')
      setConnectionInfo({
        connected: true,
        tableCount: data?.length || 0,
        url: import.meta.env.VITE_SUPABASE_URL
      })
    } catch (err: any) {
      setStatus('error')
      setError(err.message || 'Erro ao conectar ao Supabase')
    }
  }

  const testAuth = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) throw error
      
      return session ? 'Autenticado' : 'Não autenticado'
    } catch (err: any) {
      return `Erro: ${err.message}`
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Teste de Conexão Supabase</CardTitle>
        <CardDescription>
          Verifique se sua conexão com o Supabase está funcionando corretamente
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-center">
          {status === 'testing' && (
            <div className="flex items-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Testando conexão...</span>
            </div>
          )}
          {status === 'success' && (
            <div className="flex items-center space-x-2 text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span>Conectado com sucesso!</span>
            </div>
          )}
          {status === 'error' && (
            <div className="flex items-center space-x-2 text-red-600">
              <XCircle className="h-4 w-4" />
              <span>Erro na conexão</span>
            </div>
          )}
        </div>

        <Button 
          onClick={testConnection}
          disabled={status === 'testing'}
          className="w-full"
        >
          {status === 'testing' ? 'Testando...' : 'Testar Conexão'}
        </Button>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
            <strong>Erro:</strong> {error}
          </div>
        )}

        {connectionInfo && (
          <div className="text-sm space-y-1">
            <p><strong>Status:</strong> Conectado</p>
            <p><strong>URL:</strong> {connectionInfo.url}</p>
            <p><strong>Registros encontrados:</strong> {connectionInfo.tableCount}</p>
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          <p>Certifique-se de que:</p>
          <ul className="list-disc list-inside ml-2">
            <li>VITE_SUPABASE_URL está configurada no .env</li>
            <li>VITE_SUPABASE_ANON_KEY está configurada no .env</li>
            <li>Sua tabela 'restaurants' existe no Supabase</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}