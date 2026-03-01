import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { UtensilsCrossed, QrCode, BarChart3, ArrowRight } from "lucide-react";

const features = [
  {
    icon: UtensilsCrossed,
    title: "Menú Digital",
    description: "Crea y gestiona tu menú en tiempo real. Tus clientes siempre ven la versión más actual.",
  },
  {
    icon: QrCode,
    title: "Acceso por QR",
    description: "Genera códigos QR únicos para cada mesa o ubicación de tu restaurante.",
  },
  {
    icon: BarChart3,
    title: "Analíticas",
    description: "Conoce qué platos son los más populares y optimiza tu oferta con datos reales.",
  },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between">
          <span className="font-heading text-2xl font-bold text-primary">
            🍽 LiveMenu
          </span>
          <div className="flex gap-3">
            <Button variant="ghost" asChild>
              <Link to="/login">Iniciar sesión</Link>
            </Button>
            <Button asChild>
              <Link to="/register">Crear cuenta</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="container py-20 md:py-32">
        <div className="mx-auto max-w-3xl text-center animate-fade-in">
          <h1 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Tu menú digital,
            <span className="block text-primary">al alcance de un QR</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground md:text-xl">
            LiveMenu transforma la experiencia gastronómica. Crea menús atractivos, 
            compártelos con un código QR y descubre qué les encanta a tus clientes.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button size="lg" asChild className="gap-2 text-base">
              <Link to="/register">
                Empezar gratis <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="text-base">
              <Link to="/login">Ya tengo cuenta</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-border bg-muted/30 py-20">
        <div className="container">
          <h2 className="font-heading text-center text-3xl font-bold">
            Todo lo que necesitas
          </h2>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {features.map((f) => (
              <div
                key={f.title}
                className="rounded-xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <f.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-heading text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} LiveMenu. Todos los derechos reservados.
        </div>
      </footer>
    </div>
  );
};

export default Index;
