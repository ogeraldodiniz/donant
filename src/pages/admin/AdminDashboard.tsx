import { Heart, Store, FileText, Bell, Users, AlertTriangle, Newspaper } from "lucide-react";
import { Link } from "react-router-dom";
import { DuoCard } from "@/components/ui/duo-card";

const cards = [
  { title: "ONGs", description: "Gerenciar ONGs cadastradas", icon: Heart, to: "/admin/ongs", color: "text-primary" },
  { title: "Lojas", description: "Ativar/desativar lojas do catálogo", icon: Store, to: "/admin/lojas", color: "text-secondary" },
  { title: "Blog", description: "Criar e gerenciar conteúdos", icon: FileText, to: "/admin/blog", color: "text-accent-foreground" },
  { title: "Notícias", description: "Criar e publicar notícias", icon: Newspaper, to: "/admin/noticias", color: "text-primary" },
  { title: "Push", description: "Enviar notificações push", icon: Bell, to: "/admin/push", color: "text-destructive" },
  { title: "Usuários", description: "Ver dados e preferências dos usuários", icon: Users, to: "/admin/usuarios", color: "text-muted-foreground" },
  { title: "Reclamações", description: "Gerenciar reclamações de cashback", icon: AlertTriangle, to: "/admin/reclamacoes", color: "text-destructive" },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {cards.map((card) => (
          <Link key={card.title} to={card.to}>
            <DuoCard className="hover:border-primary/30 transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <card.icon className={`w-8 h-8 ${card.color}`} />
                <div>
                  <p className="font-bold">{card.title}</p>
                  <p className="text-sm text-muted-foreground">{card.description}</p>
                </div>
              </div>
            </DuoCard>
          </Link>
        ))}
      </div>
    </div>
  );
}
