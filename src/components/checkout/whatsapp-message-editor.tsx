import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WhatsAppMessageEditorProps {
  message: string;
  onMessageChange: (message: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export function WhatsAppMessageEditor({ message, onMessageChange, onSubmit, isSubmitting }: WhatsAppMessageEditorProps) {
  return (
    <section aria-labelledby="mensagem-whatsapp">
      <h2 id="mensagem-whatsapp" className="font-display text-xl font-semibold">Mensagem para o WhatsApp</h2>
      <textarea
        value={message}
        onChange={(event) => onMessageChange(event.target.value)}
        rows={12}
        className="mt-4 w-full resize-y border border-border bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-foreground"
      />
      <p className="mt-2 text-xs text-muted-foreground">
        Este texto é apenas a mensagem enviada no WhatsApp — os itens do pedido são sempre os do seu carrinho.
      </p>
      <Button className="mt-6 w-full sm:w-auto" onClick={onSubmit} disabled={isSubmitting}>
        <MessageCircle /> {isSubmitting ? "Enviando…" : "Enviar no WhatsApp"}
      </Button>
    </section>
  );
}
