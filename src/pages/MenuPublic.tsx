import { useParams } from "react-router-dom";
import { useState, useEffect, useRef, useMemo } from "react";
import axios from "axios";
import { API_BASE_URL } from "@/lib/constants";

/* ── Types matching the backend MenuResponse ── */
interface MenuDish {
  id: string;
  name: string;
  description: string | null;
  price: number;
  sale_price: number | null;
  image_url: string | null;
  tags: string[] | null;
  featured: boolean;
  position: number;
}

interface MenuCategory {
  id: string;
  name: string;
  description: string | null;
  position: number;
  dishes: MenuDish[];
}

interface MenuData {
  restaurant_id: string;
  restaurant_name: string;
  restaurant_slug: string;
  description: string | null;
  logo_url: string | null;
  phone: string | null;
  address: string | null;
  hours: Record<string, unknown> | null;
  categories: MenuCategory[];
}

const MenuPublic = () => {
  const { slug } = useParams<{ slug: string }>();
  const [menu, setMenu] = useState<MenuData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const ALL_CATEGORIES = "__all__";
  const [activeCategory, setActiveCategory] = useState<string>(ALL_CATEGORIES);
  const catRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    axios
      .get<MenuData>(`${API_BASE_URL}/menu/${slug}`)
      .then((r) => {
        setMenu(r.data);
        setActiveCategory(ALL_CATEGORIES);
      })
      .catch(() => setError("No se encontró el menú"))
      .finally(() => setLoading(false));
  }, [slug]);

  const filteredCategories = useMemo(() => {
    if (!menu) return [];
    if (activeCategory === ALL_CATEGORIES) return menu.categories;
    return menu.categories.filter((c) => c.id === activeCategory);
  }, [menu, activeCategory]);

  const handleCategoryClick = (id: string) => {
    setActiveCategory(id);
    // If selecting a specific category, scroll to top of content
    if (id !== ALL_CATEGORIES) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
      </div>
    );
  }

  if (error || !menu) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-6 text-center">
        <p className="text-5xl mb-4">🍽</p>
        <h1 className="text-xl font-bold text-gray-800">Menú no encontrado</h1>
        <p className="mt-2 text-sm text-gray-500">
          El menú que buscas no existe o no está disponible.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ─── Header ─── */}
      <header className="sticky top-0 z-20 bg-white shadow-sm">
        <div className="mx-auto max-w-lg px-4 py-4 flex items-center gap-3">
          {menu.logo_url ? (
            <img
              src={menu.logo_url}
              alt={menu.restaurant_name}
              className="h-10 w-10 rounded-full object-cover border"
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center text-lg">
              🍽
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h1 className="font-bold text-gray-900 truncate text-lg leading-tight">
              {menu.restaurant_name}
            </h1>
            {menu.description && (
              <p className="text-xs text-gray-500 truncate">{menu.description}</p>
            )}
          </div>
        </div>

        {/* Category filter pills */}
        {menu.categories.length > 1 && (
          <nav className="border-t border-gray-100 overflow-x-auto scrollbar-hide">
            <div className="flex gap-1 px-4 py-2 mx-auto max-w-lg">
              <button
                onClick={() => handleCategoryClick(ALL_CATEGORIES)}
                className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  activeCategory === ALL_CATEGORIES
                    ? "bg-orange-500 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Todas
              </button>
              {menu.categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryClick(cat.id)}
                  className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                    activeCategory === cat.id
                      ? "bg-orange-500 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </nav>
        )}
      </header>

      {/* ─── Menu Content ─── */}
      <main className="mx-auto max-w-lg px-4 pb-20 pt-4">
        {filteredCategories.map((cat) => (
          <section
            key={cat.id}
            ref={(el) => { catRefs.current[cat.id] = el; }}
            className="mb-8 scroll-mt-28"
          >
            <h2 className="mb-1 text-base font-bold text-gray-800">{cat.name}</h2>
            {cat.description && (
              <p className="mb-3 text-xs text-gray-500">{cat.description}</p>
            )}
            <div className="space-y-3">
              {cat.dishes.map((dish) => (
                <div
                  key={dish.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex"
                >
                  {/* Text content */}
                  <div className="flex-1 p-3 min-w-0">
                    <div className="flex items-start gap-1.5">
                      <h3 className="font-semibold text-gray-900 text-sm leading-tight">
                        {dish.name}
                      </h3>
                      {dish.featured && (
                        <span className="inline-block bg-orange-100 text-orange-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                          ⭐
                        </span>
                      )}
                    </div>
                    {dish.description && (
                      <p className="mt-1 text-xs text-gray-500 line-clamp-2">
                        {dish.description}
                      </p>
                    )}
                    {/* Tags */}
                    {dish.tags && dish.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {dish.tags.map((tag) => (
                          <span
                            key={tag}
                            className="bg-gray-100 text-gray-500 text-[10px] px-1.5 py-0.5 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    {/* Price */}
                    <div className="mt-2 flex items-center gap-2">
                      {dish.sale_price ? (
                        <>
                          <span className="font-bold text-orange-600 text-sm">
                            ${Number(dish.sale_price).toFixed(2)}
                          </span>
                          <span className="text-xs text-gray-400 line-through">
                            ${Number(dish.price).toFixed(2)}
                          </span>
                        </>
                      ) : (
                        <span className="font-bold text-gray-900 text-sm">
                          ${Number(dish.price).toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                  {/* Image */}
                  {dish.image_url && (
                    <div className="w-24 h-24 flex-shrink-0">
                      <img
                        src={dish.image_url}
                        alt={dish.name}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  )}
                </div>
              ))}
              {cat.dishes.length === 0 && (
                <p className="text-xs text-gray-400 italic py-2">
                  No hay platos disponibles en esta categoría.
                </p>
              )}
            </div>
          </section>
        ))}
      </main>

      {/* ─── Footer with contact info ─── */}
      <footer className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-100 py-2 text-center z-10">
        <div className="mx-auto max-w-lg px-4 flex items-center justify-center gap-4 text-xs text-gray-500">
          {menu.phone && <a href={`tel:${menu.phone}`} className="hover:text-orange-500">📞 {menu.phone}</a>}
          {menu.address && <span>📍 {menu.address}</span>}
          {!menu.phone && !menu.address && (
            <span className="text-gray-400">Powered by LiveMenu</span>
          )}
        </div>
      </footer>
    </div>
  );
};

export default MenuPublic;
