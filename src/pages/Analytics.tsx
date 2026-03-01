import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { analyticsApi } from "@/api/analytics";
import type { AnalyticsParams } from "@/api/analytics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Eye, TrendingUp, Download } from "lucide-react";
import { toast } from "sonner";

const COLORS = [
  "hsl(15, 90%, 55%)",
  "hsl(160, 50%, 45%)",
  "hsl(38, 92%, 50%)",
  "hsl(210, 60%, 50%)",
  "hsl(280, 60%, 50%)",
];

const Analytics = () => {
  const [granularity, setGranularity] = useState<"day" | "week" | "month">("day");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");

  // Convert local dates to UTC ISO strings so the backend filters match
  // the user's local day, not UTC midnight.
  const fromISO = fromDate ? new Date(`${fromDate}T00:00:00`).toISOString() : undefined;
  const toISO = toDate ? new Date(`${toDate}T23:59:59.999`).toISOString() : undefined;

  const params: AnalyticsParams = {
    granularity,
    ...(fromISO ? { from: fromISO } : {}),
    ...(toISO ? { to: toISO } : {}),
  };

  const { data: analytics, isLoading } = useQuery({
    queryKey: ["analytics", granularity, fromDate, toDate],
    queryFn: () => analyticsApi.get(params),
  });

  const handleExport = async () => {
    try {
      const blob = await analyticsApi.exportCsv({
        ...(fromISO ? { from: fromISO } : {}),
        ...(toISO ? { to: toISO } : {}),
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "analytics_export.csv";
      a.click();
      URL.revokeObjectURL(url);
      toast.success("CSV descargado");
    } catch {
      toast.error("Error al exportar");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="font-heading text-2xl font-bold">Analíticas</h1>
        <div className="flex gap-2">
          <Select value={granularity} onValueChange={(v) => setGranularity(v as "day" | "week" | "month")}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Granularidad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Por día</SelectItem>
              <SelectItem value="week">Por semana</SelectItem>
              <SelectItem value="month">Por mes</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="mr-1 h-4 w-4" /> Exportar CSV
          </Button>
        </div>
      </div>

      {/* Date range filter */}
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <Label className="text-xs">Desde</Label>
          <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="mt-1 w-40" />
        </div>
        <div>
          <Label className="text-xs">Hasta</Label>
          <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="mt-1 w-40" />
        </div>
        {(fromDate || toDate) && (
          <Button variant="ghost" size="sm" onClick={() => { setFromDate(""); setToDate(""); }}>
            Limpiar filtros
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {[1, 2].map((i) => <Card key={i} className="h-32 animate-pulse bg-muted" />)}
        </div>
      ) : analytics ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm text-muted-foreground">Escaneos Totales</CardTitle>
                <Eye className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-heading font-bold">{analytics.total_scans}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm text-muted-foreground">Períodos analizados</CardTitle>
                <TrendingUp className="h-4 w-4 text-success" />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-heading font-bold">{analytics.scans_by_period?.length ?? 0}</p>
              </CardContent>
            </Card>
          </div>

          {/* Scans by period chart */}
          {analytics.scans_by_period?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="font-heading text-base">Escaneos por período</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.scans_by_period}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="period" className="text-xs fill-muted-foreground" />
                    <YAxis className="text-xs fill-muted-foreground" />
                    <Tooltip />
                    <Bar dataKey="count" fill="hsl(15, 90%, 55%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Scans by hour */}
          {analytics.scans_by_hour?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="font-heading text-base">Escaneos por hora del día</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={analytics.scans_by_hour}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="hour" className="text-xs fill-muted-foreground" />
                    <YAxis className="text-xs fill-muted-foreground" />
                    <Tooltip />
                    <Bar dataKey="count" fill="hsl(160, 50%, 45%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Top user agents */}
          {analytics.top_user_agents?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="font-heading text-base">Dispositivos más frecuentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center md:flex-row md:gap-8">
                  <ResponsiveContainer width={200} height={200}>
                    <PieChart>
                      <Pie
                        data={analytics.top_user_agents}
                        dataKey="count"
                        nameKey="user_agent"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                      >
                        {analytics.top_user_agents.map((_, idx) => (
                          <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="mt-4 space-y-2 md:mt-0">
                    {analytics.top_user_agents.map((ua, idx) => (
                      <div key={ua.user_agent} className="flex items-center gap-2 text-sm">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                        />
                        <span className="truncate max-w-[200px]">{ua.user_agent}</span>
                        <span className="text-muted-foreground">({ua.count})</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      ) : (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">No hay datos de analíticas aún.</p>
        </Card>
      )}
    </div>
  );
};

export default Analytics;
