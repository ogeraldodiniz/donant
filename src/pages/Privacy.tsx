import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function Privacy() {
  return (
    <div className="container py-6 max-w-2xl">
      <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </Link>
      <h1 className="text-2xl font-black mb-6">Política de Privacidade</h1>
      <div className="prose prose-sm max-w-none space-y-4 text-muted-foreground">
        <p className="font-semibold text-foreground">Última atualização: Março de 2026</p>
        <h2 className="text-lg font-bold text-foreground">1. Coleta de Dados</h2>
        <p>Coletamos apenas os dados necessários para o funcionamento da plataforma: nome, email, e informações de navegação para rastreamento de cashback.</p>
        <h2 className="text-lg font-bold text-foreground">2. Uso dos Dados</h2>
        <p>Seus dados são utilizados exclusivamente para: identificação na plataforma, rastreamento de cashback, direcionamento de doações e comunicação sobre suas transações.</p>
        <h2 className="text-lg font-bold text-foreground">3. Compartilhamento</h2>
        <p>Não vendemos ou compartilhamos seus dados pessoais com terceiros, exceto com as lojas parceiras para fins de rastreamento de compras.</p>
        <h2 className="text-lg font-bold text-foreground">4. LGPD</h2>
        <p>Em conformidade com a Lei Geral de Proteção de Dados (LGPD), você tem direito a: acessar seus dados, corrigi-los, excluí-los e solicitar a portabilidade.</p>
        <h2 className="text-lg font-bold text-foreground">5. Exclusão de Conta</h2>
        <p>Ao solicitar exclusão, seus dados pessoais serão anonimizados. Registros de doações são mantidos para transparência, porém sem identificação pessoal.</p>
        <h2 className="text-lg font-bold text-foreground">6. Cookies</h2>
        <p>Utilizamos cookies essenciais para autenticação e cookies de rastreamento para contabilizar cashback corretamente.</p>
        <h2 className="text-lg font-bold text-foreground">7. Contato</h2>
        <p>Para dúvidas sobre privacidade, entre em contato: privacidade@mycashbacks.com.br</p>
      </div>
    </div>
  );
}
