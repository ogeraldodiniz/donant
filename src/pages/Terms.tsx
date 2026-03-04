import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useSiteContent } from "@/hooks/useSiteContent";

export default function Terms() {
  const { t } = useSiteContent("terms");

  return (
    <div className="container py-6 max-w-2xl">
      <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="w-4 h-4" /> {t("back", "Voltar")}
      </Link>
      <h1 className="text-2xl font-black mb-6">{t("title", "Termos de Uso")}</h1>
      <div className="prose prose-sm max-w-none space-y-4 text-muted-foreground">
        <p className="font-semibold text-foreground">{t("last_update", "Última atualização: Março de 2026")}</p>
        <h2 className="text-lg font-bold text-foreground">{t("s1_title", "1. Aceitação")}</h2>
        <p>{t("s1_text", "Ao utilizar a plataforma DonActivo, você concorda com estes termos de uso.")}</p>
        <h2 className="text-lg font-bold text-foreground">{t("s2_title", "2. Funcionamento")}</h2>
        <p>{t("s2_text", "O MyCashbacks intermedia a doação de cashback gerado por compras em lojas parceiras para ONGs cadastradas na plataforma. O cashback é 100% doado.")}</p>
        <h2 className="text-lg font-bold text-foreground">{t("s3_title", "3. Cashback")}</h2>
        <p>{t("s3_text", "As taxas de cashback são definidas pelas lojas parceiras e podem variar. O valor é confirmado após a loja validar a compra, o que pode levar até 90 dias.")}</p>
        <h2 className="text-lg font-bold text-foreground">{t("s4_title", "4. Doações")}</h2>
        <p>{t("s4_text", "O cashback confirmado é automaticamente doado para a ONG selecionada pelo usuário no momento da compra. Não é possível resgatar cashback em dinheiro.")}</p>
        <h2 className="text-lg font-bold text-foreground">{t("s5_title", "5. Responsabilidades")}</h2>
        <p>{t("s5_text", "O MyCashbacks não é responsável por problemas na compra junto à loja parceira. Questões de troca, devolução e garantia devem ser tratadas diretamente com a loja.")}</p>
        <h2 className="text-lg font-bold text-foreground">{t("s6_title", "6. Cancelamento")}</h2>
        <p>{t("s6_text", "Você pode excluir sua conta a qualquer momento. Cashbacks pendentes serão perdidos. Cashbacks já doados não podem ser revertidos.")}</p>
        <h2 className="text-lg font-bold text-foreground">{t("s7_title", "7. Alterações")}</h2>
        <p>{t("s7_text", "Reservamo-nos o direito de alterar estes termos. Notificaremos os usuários sobre mudanças significativas.")}</p>
      </div>
    </div>
  );
}
