import { useQuery } from "@tanstack/react-query";
import { restaurantsApi } from "@/api/restaurants";
import { categoriesApi } from "@/api/categories";
import { dishesApi } from "@/api/items";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Store,
  LayoutList,
  UtensilsCrossed,
  QrCode,
  BarChart3,
  CheckCircle2,
  Circle,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

/** Onboarding step definition */
interface Step {
  key: string;
  label: string;
  description: string;
  icon: React.ElementType;
  href: string;
  btnLabel: string;
}

const STEPS: Step[] = [
  {
    key: "restaurant",
    label: "Crea tu restaurante",
    description: "Configura el nombre, descripción, logo y datos de contacto.",
    icon: Store,
    href: "/settings",
    btnLabel: "Configurar restaurante",
  },
  {
    key: "categories",
    label: "Agrega categorías",
    description: "Organiza tu menú: Entradas, Platos fuertes, Bebidas, etc.",
    icon: LayoutList,
    href: "/menu-editor",
    btnLabel: "Crear categorías",
  },
  {
    key: "dishes",
    label: "Añade tus platos",
    description: "Agrega platos con foto, precio y descripción a cada categoría.",
    icon: UtensilsCrossed,
    href: "/menu-editor",
    btnLabel: "Agregar platos",
  },
  {
    key: "qr",
    label: "Genera tu código QR",
    description: "Descarga el QR para tus mesas. Tus clientes escanean y ven tu menú.",
    icon: QrCode,
    href: "/qr",
    btnLabel: "Generar QR",
  },
];

const Dashboard = () => {
  const { user } = useAuth();

  const { data: restaurant, isLoading: loadingRest } = useQuery({
    queryKey: ["restaurant"],
    queryFn: restaurantsApi.get,
    retry: false,
  });

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: categoriesApi.list,
    enabled: !!restaurant,
    retry: false,
  });

  const { data: dishesData } = useQuery({
    queryKey: ["dishes", "count"],
    queryFn: () => dishesApi.list({ limit: 1 }),
    enabled: !!restaurant,
    retry: false,
  });

  // Compute progress
  const hasRestaurant = !!restaurant;
  const hasCategories = (categories?.length ?? 0) > 0;
  const hasDishes = (dishesData?.total ?? 0) > 0;
  const allReady = hasRestaurant && hasCategories && hasDishes;

  const completedMap: Record<string, boolean> = {
    restaurant: hasRestaurant,
    categories: hasCategories,
    dishes: hasDishes,
    qr: allReady,
  };

  const completedCount = Object.values(completedMap).filter(Boolean).length;
  const progressPercent = (completedCount / STEPS.length) * 100;
  const currentStepIndex = STEPS.findIndex((s) => !completedMap[s.key]);
  const currentStep = currentStepIndex >= 0 ? currentStepIndex : STEPS.length;

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="font-heading text-2xl font-bold md:text-3xl">
          ¡Hola{user?.email ? `, ${user.email.split("@")[0]}` : ""}!
        </h1>
        <p className="mt-1 text-muted-foreground">
          {allReady
            ? "Tu menú digital está listo. Gestiona tu contenido desde aquí."
            : "Sigue estos pasos para tener tu menú digital funcionando."}
        </p>
      </div>

      {/* Progress */}
      {!loadingRest && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Progreso de configuración</span>
              <span className="text-sm text-muted-foreground">{completedCount}/{STEPS.length} pasos</span>
            </div>
            <Progress value={progressPercent} className="h-2" />
            {allReady && (
              <p className="mt-3 text-sm text-green-600 font-medium flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" /> ¡Todo listo! Tu menú digital está activo.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Onboarding Steps */}
      {!loadingRest && !allReady && (
        <div className="space-y-3">
          {STEPS.map((step, idx) => {
            const done = completedMap[step.key];
            const isCurrent = idx === currentStep;
            const Icon = step.icon;

            return (
              <Card
                key={step.key}
                className={`transition-all ${
                  isCurrent ? "ring-2 ring-primary shadow-md" : done ? "opacity-75" : "opacity-50"
                }`}
              >
                <CardContent className="flex items-start gap-4 py-5">
                  <div className="flex flex-col items-center pt-0.5">
                    {done ? (
                      <CheckCircle2 className="h-6 w-6 text-green-500" />
                    ) : isCurrent ? (
                      <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                        {idx + 1}
                      </div>
                    ) : (
                      <Circle className="h-6 w-6 text-muted-foreground/40" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <h3 className={`font-heading font-semibold text-sm ${done ? "line-through text-muted-foreground" : ""}`}>
                        {step.label}
                      </h3>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{step.description}</p>
                  </div>
                  <div className="flex-shrink-0">
                    {done ? (
                      <span className="text-xs text-green-600 font-medium">Completado</span>
                    ) : isCurrent ? (
                      <Button size="sm" asChild className="gap-1">
                        <Link to={step.href}>{step.btnLabel} <ArrowRight className="h-3 w-3" /></Link>
                      </Button>
                    ) : (
                      <Button size="sm" variant="ghost" disabled>{step.btnLabel}</Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Quick actions — visible when setup complete */}
      {allReady && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="transition-shadow hover:shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <UtensilsCrossed className="h-4 w-4 text-primary" /> Editar Menú
              </CardTitle>
              <CardDescription className="text-xs">Agrega o modifica platos y categorías</CardDescription>
            </CardHeader>
            <CardContent>
              <Button size="sm" asChild className="w-full"><Link to="/menu-editor">Ir al editor</Link></Button>
            </CardContent>
          </Card>
          <Card className="transition-shadow hover:shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <QrCode className="h-4 w-4 text-primary" /> Código QR
              </CardTitle>
              <CardDescription className="text-xs">Descarga e imprime tu código QR</CardDescription>
            </CardHeader>
            <CardContent>
              <Button size="sm" variant="outline" asChild className="w-full"><Link to="/qr">Ver QR</Link></Button>
            </CardContent>
          </Card>
          <Card className="transition-shadow hover:shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" /> Analíticas
              </CardTitle>
              <CardDescription className="text-xs">Revisa los escaneos de tu menú</CardDescription>
            </CardHeader>
            <CardContent>
              <Button size="sm" variant="outline" asChild className="w-full"><Link to="/analytics">Ver datos</Link></Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Restaurant card */}
      {restaurant && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="font-heading text-base flex items-center gap-2">
                <Store className="h-4 w-4 text-primary" /> {restaurant.name}
              </CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/settings" className="gap-1 text-xs">Editar <ExternalLink className="h-3 w-3" /></Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            {restaurant.description && <p className="text-sm text-muted-foreground line-clamp-2">{restaurant.description}</p>}
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground pt-1">
              {restaurant.address && <span>📍 {restaurant.address}</span>}
              {restaurant.phone && <span>📞 {restaurant.phone}</span>}
              {restaurant.slug && (
                <span>🔗 <a href={`/m/${restaurant.slug}`} target="_blank" rel="noopener" className="text-primary underline">/m/{restaurant.slug}</a></span>
              )}
            </div>
            <div className="flex gap-4 pt-3">
              <div className="text-center">
                <p className="text-lg font-heading font-bold">{categories?.length ?? 0}</p>
                <p className="text-[10px] text-muted-foreground">Categorías</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-heading font-bold">{dishesData?.total ?? 0}</p>
                <p className="text-[10px] text-muted-foreground">Platos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;
