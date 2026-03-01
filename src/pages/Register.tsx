import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { AlertCircle } from "lucide-react";

const registerSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z
    .string()
    .min(8, "Mínimo 8 caracteres")
    .regex(/[a-zA-Z]/, "Debe contener al menos una letra")
    .regex(/\d/, "Debe contener al menos un número"),
  confirmPassword: z.string().min(1, "Confirma tu contraseña"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

type RegisterValues = z.infer<typeof registerSchema>;

const Register = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: "", password: "", confirmPassword: "" },
  });

  const onSubmit = async (values: RegisterValues) => {
    setLoading(true);
    setFormError(null);
    try {
      await registerUser({ email: values.email, password: values.password });
      toast.success("¡Cuenta creada exitosamente!");
      navigate("/dashboard");
    } catch {
      const msg = "No se pudo crear la cuenta. Es posible que el correo ya esté registrado.";
      setFormError(msg);
      toast.error(msg, { duration: Infinity });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md animate-fade-in">
        <CardHeader className="text-center">
          <div className="mb-2 font-heading text-2xl font-bold text-primary">🍽 LiveMenu</div>
          <CardTitle className="font-heading text-xl">Crear cuenta</CardTitle>
          <CardDescription>Registra tu restaurante y empieza a crear tu menú digital</CardDescription>
        </CardHeader>
        <CardContent>
          {formError && (
            <div className="mb-4 flex items-start gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <span>{formError}</span>
            </div>
          )}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correo electrónico</FormLabel>
                    <FormControl><Input placeholder="tu@email.com" type="email" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contraseña</FormLabel>
                    <FormControl><Input placeholder="Mínimo 8 caracteres" type="password" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmar contraseña</FormLabel>
                    <FormControl><Input placeholder="Repite tu contraseña" type="password" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Creando cuenta..." : "Registrarme"}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-sm text-muted-foreground">
            ¿Ya tienes cuenta?{" "}
            <Link to="/login" className="font-medium text-primary hover:underline">
              Inicia sesión
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Register;
