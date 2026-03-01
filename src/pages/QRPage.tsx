import { useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { restaurantsApi } from "@/api/restaurants";
import { QRCodeSVG } from "qrcode.react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Download, Copy } from "lucide-react";
import { toast } from "sonner";

const SIZE_MAP: Record<string, number> = { S: 160, M: 240, L: 360, XL: 480 };

const QRPage = () => {
  const { data: restaurant } = useQuery({
    queryKey: ["restaurant"],
    queryFn: restaurantsApi.get,
    retry: false,
  });
  const qrRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<string>("M");
  const [fgColor, setFgColor] = useState<string>("#000000");
  const [bgColor, setBgColor] = useState<string>("#FFFFFF");

  const menuUrl = restaurant?.slug
    ? `${window.location.origin}/menu/${restaurant.slug}`
    : "";

  const handleDownloadPng = () => {
    const svg = qrRef.current?.querySelector("svg");
    if (!svg) return;
    const serializer = new XMLSerializer();
    const svgStr = serializer.serializeToString(svg);
    const canvas = document.createElement("canvas");
    const px = SIZE_MAP[size] * 2;
    canvas.width = px;
    canvas.height = px;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      ctx?.drawImage(img, 0, 0, px, px);
      const a = document.createElement("a");
      a.download = `livemenu-qr-${restaurant?.slug ?? "menu"}-${size}.png`;
      a.href = canvas.toDataURL("image/png");
      a.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgStr)));
  };

  const handleDownloadSvg = () => {
    const svg = qrRef.current?.querySelector("svg");
    if (!svg) return;
    const serializer = new XMLSerializer();
    const svgStr = serializer.serializeToString(svg);
    const blob = new Blob([svgStr], { type: "image/svg+xml" });
    const a = document.createElement("a");
    a.download = `livemenu-qr-${restaurant?.slug ?? "menu"}-${size}.svg`;
    a.href = URL.createObjectURL(blob);
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const copyUrl = () => {
    navigator.clipboard.writeText(menuUrl);
    toast.success("URL copiada al portapapeles");
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
      <div>
        <h1 className="font-heading text-2xl font-bold">Código QR</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Descarga tu QR e imprímelo para que tus clientes vean tu menú digital.
        </p>
      </div>

      {menuUrl ? (
        <>
          {/* QR Preview */}
          <Card>
            <CardHeader className="text-center pb-2">
              <CardTitle className="font-heading text-lg">
                {restaurant?.name}
              </CardTitle>
              <CardDescription>
                Escanea el código para ver el menú
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              <div ref={qrRef} className="rounded-xl bg-white p-4 shadow-inner border">
                <QRCodeSVG value={menuUrl} size={SIZE_MAP[size]} level="H" fgColor={fgColor} bgColor={bgColor} />
              </div>

              {/* URL display */}
              <div className="flex items-center gap-2 w-full max-w-md">
                <code className="flex-1 text-xs bg-muted rounded px-3 py-2 truncate">
                  {menuUrl}
                </code>
                <Button variant="outline" size="icon" onClick={copyUrl} title="Copiar URL">
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              </div>

              {/* Controls */}
              <div className="grid grid-cols-2 sm:grid-cols-4 items-end gap-3 w-full max-w-md">
                <div>
                  <Label className="text-xs">Tamaño</Label>
                  <Select value={size} onValueChange={setSize}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="S">S — 200×200</SelectItem>
                      <SelectItem value="M">M — 400×400</SelectItem>
                      <SelectItem value="L">L — 800×800</SelectItem>
                      <SelectItem value="XL">XL — 1200×1200</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Color QR</Label>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Input type="color" value={fgColor} onChange={(e) => setFgColor(e.target.value)} className="h-9 w-10 p-0.5 cursor-pointer" />
                    <span className="text-xs text-muted-foreground">{fgColor}</span>
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Fondo</Label>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="h-9 w-10 p-0.5 cursor-pointer" />
                    <span className="text-xs text-muted-foreground">{bgColor}</span>
                  </div>
                </div>
              </div>

              {/* Download buttons */}
              <div className="flex flex-wrap gap-2 w-full max-w-md">
                <Button onClick={handleDownloadPng} className="gap-2 flex-1">
                  <Download className="h-4 w-4" /> Descargar PNG
                </Button>
                <Button onClick={handleDownloadSvg} variant="outline" className="gap-2 flex-1">
                  <Download className="h-4 w-4" /> Descargar SVG
                </Button>
              </div>
            </CardContent>
          </Card>


        </>
      ) : (
        <Card className="p-8 text-center">
          <p className="text-lg mb-2">📱</p>
          <p className="text-muted-foreground">Crea un restaurante primero para generar tu QR.</p>
          <Button className="mt-4" variant="outline" asChild>
            <a href="/settings">Ir a configuración</a>
          </Button>
        </Card>
      )}
    </div>
  );
};

export default QRPage;
