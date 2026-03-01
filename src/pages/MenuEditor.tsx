import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { restaurantsApi } from "@/api/restaurants";
import { categoriesApi } from "@/api/categories";
import { dishesApi } from "@/api/items";
import type { Category, Dish, CreateDishRequest, CreateCategoryRequest, UpdateCategoryRequest, UpdateDishRequest } from "@/api/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ImageUploader } from "@/components/ImageUploader";
import { Plus, Pencil, Trash2, ImagePlus, ChevronUp, ChevronDown, Star, X } from "lucide-react";
import { toast } from "sonner";

const PREDEFINED_TAGS = ["vegetariano", "vegano", "sin gluten", "picante", "sin lácteos", "kosher", "orgánico"];

const MenuEditor = () => {
  const queryClient = useQueryClient();

  // Dialogs
  const [catDialog, setCatDialog] = useState(false);
  const [itemDialog, setItemDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingItem, setEditingItem] = useState<Dish | null>(null);
  const [targetCategoryId, setTargetCategoryId] = useState<string | null>(null);

  // Category form state
  const [catName, setCatName] = useState("");
  const [catDesc, setCatDesc] = useState("");

  // Dish form state
  const [itemName, setItemName] = useState("");
  const [itemDesc, setItemDesc] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [itemSalePrice, setItemSalePrice] = useState("");
  const [itemAvailable, setItemAvailable] = useState(true);
  const [itemFeatured, setItemFeatured] = useState(false);
  const [itemTags, setItemTags] = useState<string[]>([]);
  const [itemImageUrl, setItemImageUrl] = useState<string | null>(null);

  const { data: restaurant } = useQuery({
    queryKey: ["restaurant"],
    queryFn: restaurantsApi.get,
    retry: false,
  });

  const { data: categories, isLoading: catLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: categoriesApi.list,
    enabled: !!restaurant,
  });

  const { data: dishesData } = useQuery({
    queryKey: ["dishes"],
    queryFn: () => dishesApi.list({ limit: 100 }),
    enabled: !!restaurant,
  });

  const allItems = dishesData?.items ?? [];

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["categories"] });
    queryClient.invalidateQueries({ queryKey: ["dishes"] });
  };

  // Category mutations
  const createCat = useMutation({
    mutationFn: (data: CreateCategoryRequest) => categoriesApi.create(data),
    onSuccess: () => { invalidate(); toast.success("Categoría creada"); setCatDialog(false); },
  });
  const updateCat = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCategoryRequest }) => categoriesApi.update(id, data),
    onSuccess: () => { invalidate(); toast.success("Categoría actualizada"); setCatDialog(false); },
  });
  const deleteCat = useMutation({
    mutationFn: (id: string) => categoriesApi.delete(id),
    onSuccess: () => { invalidate(); toast.success("Categoría eliminada"); },
  });
  const reorderCat = useMutation({
    mutationFn: (ordered_ids: string[]) => categoriesApi.reorder(ordered_ids),
    onSuccess: () => { invalidate(); toast.success("Orden actualizado"); },
  });

  // Dish mutations
  const createItem = useMutation({
    mutationFn: (data: CreateDishRequest) => dishesApi.create(data),
    onSuccess: () => { invalidate(); toast.success("Plato creado"); setItemDialog(false); },
  });
  const updateItem = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDishRequest }) => dishesApi.update(id, data),
    onSuccess: () => { invalidate(); toast.success("Plato actualizado"); setItemDialog(false); },
  });
  const deleteItem = useMutation({
    mutationFn: (id: string) => dishesApi.delete(id),
    onSuccess: () => { invalidate(); toast.success("Plato eliminado"); },
  });
  const toggleAvail = useMutation({
    mutationFn: (id: string) => dishesApi.toggleAvailability(id),
    onSuccess: () => { invalidate(); },
  });

  // ── Category reorder helpers ──
  const moveCategoryUp = (idx: number) => {
    if (!categories || idx <= 0) return;
    const ids = categories.map((c) => c.id);
    [ids[idx - 1], ids[idx]] = [ids[idx], ids[idx - 1]];
    reorderCat.mutate(ids);
  };
  const moveCategoryDown = (idx: number) => {
    if (!categories || idx >= categories.length - 1) return;
    const ids = categories.map((c) => c.id);
    [ids[idx], ids[idx + 1]] = [ids[idx + 1], ids[idx]];
    reorderCat.mutate(ids);
  };

  const openAddCategory = () => {
    setEditingCategory(null);
    setCatName("");
    setCatDesc("");
    setCatDialog(true);
  };

  const openEditCategory = (cat: Category) => {
    setEditingCategory(cat);
    setCatName(cat.name);
    setCatDesc(cat.description ?? "");
    setCatDialog(true);
  };

  const handleSaveCategory = () => {
    if (editingCategory) {
      updateCat.mutate({ id: editingCategory.id, data: { name: catName, description: catDesc } });
    } else {
      createCat.mutate({ name: catName, description: catDesc });
    }
  };

  const openAddItem = (categoryId: string) => {
    setEditingItem(null);
    setTargetCategoryId(categoryId);
    setItemName("");
    setItemDesc("");
    setItemPrice("");
    setItemSalePrice("");
    setItemAvailable(true);
    setItemFeatured(false);
    setItemTags([]);
    setItemImageUrl(null);
    setItemDialog(true);
  };

  const openEditItem = (item: Dish) => {
    setEditingItem(item);
    setTargetCategoryId(item.category_id);
    setItemName(item.name);
    setItemDesc(item.description ?? "");
    setItemPrice(String(item.price));
    setItemSalePrice(item.sale_price ? String(item.sale_price) : "");
    setItemAvailable(item.available);
    setItemFeatured(item.featured);
    setItemTags(item.tags ?? []);
    setItemImageUrl(item.image_url ?? null);
    setItemDialog(true);
  };

  const handleSaveItem = () => {
    if (!targetCategoryId) return;
    const base = {
      name: itemName,
      description: itemDesc,
      price: parseFloat(itemPrice),
      sale_price: itemSalePrice ? parseFloat(itemSalePrice) : undefined,
      available: itemAvailable,
      featured: itemFeatured,
      tags: itemTags.length > 0 ? itemTags : undefined,
      category_id: targetCategoryId,
      image_url: itemImageUrl ?? undefined,
    };
    if (editingItem) {
      updateItem.mutate({ id: editingItem.id, data: base as UpdateDishRequest });
    } else {
      createItem.mutate(base as CreateDishRequest);
    }
  };

  const toggleTag = (tag: string) => {
    setItemTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const itemsByCategory = (catId: string) => allItems.filter((i) => i.category_id === catId);

  if (!restaurant) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Primero crea un restaurante en Configuración.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">Editor de Menú</h1>
        <Button onClick={openAddCategory} size="sm">
          <Plus className="mr-1 h-4 w-4" /> Categoría
        </Button>
      </div>

      {catLoading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => <Card key={i} className="h-24 animate-pulse bg-muted" />)}
        </div>
      ) : categories && categories.length > 0 ? (
        <Accordion type="multiple" className="space-y-3">
          {categories.map((cat, catIdx) => (
            <AccordionItem key={cat.id} value={String(cat.id)} className="rounded-lg border bg-card">
              <AccordionTrigger className="px-4 hover:no-underline">
                <div className="flex flex-1 items-center justify-between pr-4">
                  <span className="font-heading font-semibold">{cat.name}</span>
                  <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                    {/* Reorder buttons */}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => moveCategoryUp(catIdx)}
                      disabled={catIdx === 0}
                      title="Subir"
                    >
                      <ChevronUp className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => moveCategoryDown(catIdx)}
                      disabled={catIdx === categories.length - 1}
                      title="Bajar"
                    >
                      <ChevronDown className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => openEditCategory(cat)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteCat.mutate(cat.id)}>
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                {cat.description && (
                  <p className="mb-3 text-sm text-muted-foreground">{cat.description}</p>
                )}
                <div className="space-y-2">
                  {itemsByCategory(cat.id).map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 rounded-lg border border-border bg-background p-3"
                    >
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="h-14 w-14 rounded-md object-cover"
                        />
                      ) : (
                        <div className="flex h-14 w-14 items-center justify-center rounded-md bg-muted">
                          <ImagePlus className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="font-medium truncate">{item.name}</p>
                          {item.featured && <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{item.description}</p>
                        {item.tags && item.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {item.tags.map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="text-right flex-shrink-0">
                        {item.sale_price ? (
                          <>
                            <p className="font-heading font-semibold text-primary">
                              ${Number(item.sale_price).toFixed(2)}
                            </p>
                            <p className="text-xs text-muted-foreground line-through">
                              ${Number(item.price).toFixed(2)}
                            </p>
                          </>
                        ) : (
                          <p className="font-heading font-semibold text-primary">
                            ${Number(item.price).toFixed(2)}
                          </p>
                        )}
                      </div>
                      {/* Quick toggle availability */}
                      <Switch
                        checked={item.available}
                        onCheckedChange={() => toggleAvail.mutate(item.id)}
                        title={item.available ? "Marcar como no disponible" : "Marcar como disponible"}
                      />
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEditItem(item)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => deleteItem.mutate(item.id)}>
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" size="sm" className="mt-3 w-full" onClick={() => openAddItem(cat.id)}>
                  <Plus className="mr-1 h-4 w-4" /> Agregar plato
                </Button>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      ) : (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">No hay categorías. Crea la primera para empezar.</p>
        </Card>
      )}

      {/* Category Dialog */}
      <Dialog open={catDialog} onOpenChange={setCatDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-heading">
              {editingCategory ? "Editar categoría" : "Nueva categoría"}
            </DialogTitle>
            <DialogDescription>
              {editingCategory ? "Modifica los datos de la categoría" : "Crea una nueva categoría para organizar tu menú"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nombre</Label>
              <Input value={catName} onChange={(e) => setCatName(e.target.value)} placeholder="Ej: Entradas" />
            </div>
            <div>
              <Label>Descripción</Label>
              <Textarea value={catDesc} onChange={(e) => setCatDesc(e.target.value)} placeholder="Descripción opcional" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCatDialog(false)}>Cancelar</Button>
            <Button onClick={handleSaveCategory} disabled={!catName.trim()}>
              {editingCategory ? "Guardar" : "Crear"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Item Dialog */}
      <Dialog open={itemDialog} onOpenChange={setItemDialog}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading">
              {editingItem ? "Editar plato" : "Nuevo plato"}
            </DialogTitle>
            <DialogDescription>
              {editingItem ? "Modifica los datos del plato" : "Agrega un nuevo plato a tu menú"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Imagen del plato</Label>
              <div className="mt-1">
                <ImageUploader
                  value={itemImageUrl}
                  onChange={setItemImageUrl}
                  prefix="dishes"
                  placeholder="Subir foto del plato"
                  className="h-28 w-full"
                />
              </div>
            </div>
            <div>
              <Label>Nombre</Label>
              <Input value={itemName} onChange={(e) => setItemName(e.target.value)} placeholder="Ej: Ceviche" />
            </div>
            <div>
              <Label>Descripción</Label>
              <Textarea value={itemDesc} onChange={(e) => setItemDesc(e.target.value)} placeholder="Describe el plato" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Precio ($)</Label>
                <Input type="number" step="0.01" value={itemPrice} onChange={(e) => setItemPrice(e.target.value)} placeholder="0.00" />
              </div>
              <div>
                <Label>Precio oferta ($)</Label>
                <Input type="number" step="0.01" value={itemSalePrice} onChange={(e) => setItemSalePrice(e.target.value)} placeholder="Opcional" />
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch checked={itemAvailable} onCheckedChange={setItemAvailable} />
                <Label>Disponible</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={itemFeatured} onCheckedChange={setItemFeatured} />
                <Label className="flex items-center gap-1">
                  <Star className="h-3.5 w-3.5" /> Destacado
                </Label>
              </div>
            </div>
            <div>
              <Label>Etiquetas</Label>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {PREDEFINED_TAGS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                      itemTags.includes(tag)
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {tag}
                    {itemTags.includes(tag) && <X className="ml-1 h-3 w-3 inline" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setItemDialog(false)}>Cancelar</Button>
            <Button onClick={handleSaveItem} disabled={!itemName.trim() || !itemPrice}>
              {editingItem ? "Guardar" : "Crear"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MenuEditor;
