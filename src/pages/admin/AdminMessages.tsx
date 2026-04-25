import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { fetchContactMessages, markMessageRead, deleteMessage } from "@/lib/api/site";
import { Trash2, Mail, MailOpen, Phone } from "lucide-react";
import { toast } from "sonner";

export default function AdminMessages() {
  const { data: messages = [], refetch } = useQuery({ queryKey: ["admin_messages"], queryFn: fetchContactMessages });

  const unreadCount = messages.filter((m) => !m.is_read).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Zprávy a dotazy</h1>
        <Badge variant="secondary">{unreadCount} nepřečtených</Badge>
      </div>
      {messages.length === 0 && <p className="text-sm text-muted-foreground">Žádné zprávy.</p>}
      <div className="space-y-2">
        {messages.map((m) => (
          <Card key={m.id} className={m.is_read ? "" : "border-primary/40 bg-primary/5"}>
            <CardContent className="space-y-2 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{m.name} <span className="text-sm font-normal text-muted-foreground">&lt;{m.email}&gt;</span></p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(m.created_at).toLocaleString("cs-CZ")}
                    {m.phone && <> · <Phone className="inline h-3 w-3" /> {m.phone}</>}
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" onClick={async () => { await markMessageRead(m.id, !m.is_read); refetch(); }} aria-label="Přečteno">
                    {m.is_read ? <Mail className="h-4 w-4" /> : <MailOpen className="h-4 w-4" />}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={async () => {
                    if (!confirm("Smazat zprávu?")) return;
                    await deleteMessage(m.id);
                    toast.success("Smazáno");
                    refetch();
                  }} aria-label="Smazat">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <p className="whitespace-pre-line text-sm text-foreground">{m.message}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
