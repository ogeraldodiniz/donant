import { FileText } from "lucide-react";
import { DuoCard } from "@/components/ui/duo-card";

export default function AdminBlog() {
  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-2xl font-black">Blog / Conteúdos</h1>
      <DuoCard className="flex flex-col items-center justify-center py-12 text-center">
        <FileText className="w-12 h-12 text-muted-foreground mb-4" />
        <p className="font-bold text-lg">Em breve</p>
        <p className="text-sm text-muted-foreground mt-1">
          Aqui você poderá criar posts e enviar notificações push para os usuários.
        </p>
      </DuoCard>
    </div>
  );
}
