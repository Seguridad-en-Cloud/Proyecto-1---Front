import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { restaurantsApi } from "@/api/restaurants";
import type { CreateRestaurantRequest, UpdateRestaurantRequest } from "@/api/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ImageUploader } from "@/components/ImageUploader";
import { Pencil, Trash2, Plus, Store } from "lucide-react";
import { toast } from "sonner";

const Settings = () => {
  const queryClient = useQueryClient();
  const { data: restaurant, isLoading } = useQuery({
    queryKey: ["restaurant"],
    queryFn: restaurantsApi.get,
    retry: false,
  });

  const [dialog, setDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["restaurant"] });

  const createMut = useMutation({
    mutationFn: (data: CreateRestaurantRequest) => restaurantsApi.create(data),
    onSuccess: () => { invalidate(); toast.success("Restaurante creado"); setDialog(false); },
    onError: () => toast.error("Error al crear. ¿Ya tienes un restaurante?"),
  });

  const updateMut = useMutation({
    mutationFn: (data: UpdateRestaurantRequest) => restaurantsApi.update(data),
    onSuccess: () => { invalidate(); toast.success("Restaurante actualizado"); setDialog(false); },
    onError: () => toast.error("Error al actualizar"),
  });

  const deleteMut = useMutation({
    mutationFn: () => restaurantsApi.delete(),
    onSuccess: () => { invalidate(); toast.success("Restaurante eliminado"); },
  });

  const openCreate = () => {
    setIsEditing(false);
    setName("");
    setDescription("");
    setAddress("");
    setPhone("");
    setLogoUrl(null);
    setDialog(true);
  };

  const openEdit = () => {
    if (!restaurant) return;
    setIsEditing(true);
    setName(restaurant.name);
    setDescription(restaurant.description ?? "");
    setAddress(restaurant.address ?? "");
    setPhone(restaurant.phone ?? "");
    setLogoUrl(restaurant.logo_url ?? null);
    setDialog(true);
  };

  const handleSave = () => {
    const data = { name, description, address, phone, logo_url: logoUrl ?? undefined };
    if (isEditing) {
      updateMut.mutate(data);
    } else {
      createMut.mutate(data);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">Configuración</h1>
        {!restaurant && (
          <Button onClick={openCreate} size="sm">
            <Plus className="mr-1 h-4 w-4" /> Restaurante
          </Button>
        )}
      </div>

      {isLoading ? (
        <Card className="h-40 animate-pulse bg-muted" />
      ) : restaurant ? (
        <Card className="transition-shadow hover:shadow-md">
          <CardHeader className="flex flex-row items-start justify-between">
            <div className="flex items-center gap-3">
              {restaurant.logo_url ? (
                <img src={restaurant.logo_url} alt="Logo" className="h-12 w-12 rounded-lg object-cover border" />
              ) : (
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Store className="h-6 w-6 text-primary" />
                </div>
              )}
              <CardTitle className="font-heading text-base">{restaurant.name}</CardTitle>
            </div>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" onClick={openEdit}>
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => deleteMut.mutate()}>
                <Trash2 className="h-3.5 w-3.5 text-destructive" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{restaurant.description}</p>
            {restaurant.address && <p className="mt-2 text-xs text-muted-foreground">📍 {restaurant.address}</p>}
            {restaurant.phone && <p className="text-xs text-muted-foreground">📞 {restaurant.phone}</p>}
            {restaurant.slug && <p className="text-xs text-muted-foreground">🔗 Menú: /m/{restaurant.slug}</p>}
          </CardContent>
        </Card>
      ) : (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">No tienes restaurante registrado.</p>
          <Button className="mt-4" onClick={openCreate}>
            Crear mi restaurante
          </Button>
        </Card>
      )}

      <Dialog open={dialog} onOpenChange={setDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-heading">
              {isEditing ? "Editar restaurante" : "Nuevo restaurante"}
            </DialogTitle>
            <DialogDescription>
              {isEditing ? "Modifica los datos de tu restaurante" : "Completa los datos para crear tu restaurante"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {isEditing && (
              <div>
                <Label>Logo del restaurante</Label>
                <div className="mt-1">
                  <ImageUploader
                    value={logoUrl}
                    onChange={setLogoUrl}
                    prefix="logos"
                    placeholder="Subir logo"
                    className="h-28 w-28"
                  />
                </div>
              </div>
            )}
            {!isEditing && (
              <p className="text-sm text-muted-foreground">Podrás agregar el logo después de crear el restaurante.</p>
            )}
            <div>
              <Label>Nombre</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Mi Restaurante" />
            </div>
            <div>
              <Label>Descripción</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Cocina peruana..." />
            </div>
            <div>
              <Label>Dirección</Label>
              <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Calle 123" />
            </div>
            <div>
              <Label>Teléfono</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+57 300 123 4567" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={!name.trim()}>
              {isEditing ? "Guardar" : "Crear"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Settings;
