import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminAppearance from "./AdminAppearance";
import AdminPages from "./AdminPages";
import AdminContactInfo from "./AdminContactInfo";
import AdminMessages from "./AdminMessages";
import AdminProductsSettings from "./AdminProductsSettings";

export default function AdminSettings() {
  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl font-bold">Nastavení</h1>
      <Tabs defaultValue="appearance">
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="appearance">Vzhled</TabsTrigger>
          <TabsTrigger value="products">Produkty</TabsTrigger>
          <TabsTrigger value="pages">Stránky</TabsTrigger>
          <TabsTrigger value="contact">Kontaktní údaje</TabsTrigger>
          <TabsTrigger value="messages">Zprávy a dotazy</TabsTrigger>
        </TabsList>
        <TabsContent value="appearance" className="mt-4"><AdminAppearance /></TabsContent>
        <TabsContent value="products" className="mt-4"><AdminProductsSettings /></TabsContent>
        <TabsContent value="pages" className="mt-4"><AdminPages /></TabsContent>
        <TabsContent value="contact" className="mt-4"><AdminContactInfo /></TabsContent>
        <TabsContent value="messages" className="mt-4"><AdminMessages /></TabsContent>
      </Tabs>
    </div>
  );
}
