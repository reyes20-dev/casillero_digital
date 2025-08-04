import React, { useEffect, useState } from "react";
import { useProductsApi } from "../hooks/ProductsApi";
import { SYSTEM_PROMPT } from "../prompts/systemPrompts";

type Product = {
  nombre: string;
  url_img: string;
  link: string;
  precio_usd: number;
  precio_cop: number;
};

type CachedProducts = {
  products: Product[];
  timestamp: number;
};

const CACHE_KEY = 'featured_products_cache';
const CACHE_DURATION = 5 * 24 * 60 * 60 * 1000; // 5 días en milisegundos

export default function SearchComponent() {
  const { products, loading, error, searchProduct } = useProductsApi(SYSTEM_PROMPT);
  const [cachedProducts, setCachedProducts] = useState<Product[]>([]);
  const [isLoadingFromCache, setIsLoadingFromCache] = useState(true);

  // Función para obtener productos del cache
  const getCachedProducts = (): Product[] | null => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return null;

      const cachedData: CachedProducts = JSON.parse(cached);
      const now = Date.now();
      
      // Verificar si el cache ha expirado
      if (now - cachedData.timestamp > CACHE_DURATION) {
        localStorage.removeItem(CACHE_KEY);
        return null;
      }

      return cachedData.products;
    } catch (error) {
      console.error('Error al leer el cache:', error);
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
  };

  // Función para guardar productos en cache
  const setCacheProducts = (products: Product[]) => {
    try {
      const cacheData: CachedProducts = {
        products,
        timestamp: Date.now()
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Error al guardar en cache:', error);
    }
  };

  // Función para buscar productos frescos
  const fetchFreshProducts = () => {
    const pregunta = "Dame 4 ofertas de productos que esten actualmente en descuento y que sean populares en Amazon, eBay o Walmart (que sean enlaces reales y vigentes)";
    searchProduct(pregunta);
  };

  useEffect(() => {
    // Intentar cargar desde cache primero
    const cached = getCachedProducts();
    
    if (cached && cached.length > 0) {
      setCachedProducts(cached);
      setIsLoadingFromCache(false);
      console.log('✅ Productos cargados desde cache');
    } else {
      // Si no hay cache válido, hacer petición fresh
      console.log('🔄 Cache expirado o vacío, buscando productos frescos...');
      fetchFreshProducts();
      setIsLoadingFromCache(false);
    }
  }, []);

  // Guardar en cache cuando lleguen productos frescos de la API
  useEffect(() => {
    if (products.length > 0 && !loading && !error) {
      setCachedProducts(products);
      setCacheProducts(products);
      console.log('💾 Productos guardados en cache por 5 días');
    }
  }, [products, loading, error]);

  // Función para forzar actualización del cache
  const refreshProducts = () => {
    localStorage.removeItem(CACHE_KEY);
    setCachedProducts([]);
    fetchFreshProducts();
  };

  const displayProducts = cachedProducts.length > 0 ? cachedProducts : products;
  const isLoading = loading && cachedProducts.length === 0;

  if (isLoading || isLoadingFromCache) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="ml-3 text-gray-600 text-sm">Cargando ofertas...</p>
      </div>
    );
  }

  if (error && cachedProducts.length === 0) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600 font-medium text-sm">⚠️ {error}</p>
        <button 
          onClick={refreshProducts}
          className="mt-2 text-blue-600 text-sm hover:underline"
        >
          Intentar de nuevo
        </button>
      </div>
    );
  }

  if (displayProducts.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 text-sm">No se encontraron productos en oferta</p>
        <button 
          onClick={refreshProducts}
          className="mt-2 text-blue-600 text-sm hover:underline"
        >
          Buscar ofertas
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-4 mt-[70px]">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-1xl font-bold text-gray-800 mb-1 ml-[490px]">
            Ofertas Destacadas
          </h2>
          <p className="text-sm text-gray-600 ml-[440px]">Los mejores descuentos internacionales</p>
        </div>
        <button 
          onClick={refreshProducts}
          className="text-xs text-blue-600 hover:underline flex items-center gap-1"
          title="Actualizar ofertas"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Actualizar
        </button>
      </div>

      {/* Products Grid */}
      <div className="mt-[50px]">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 justify-items-center">
          {displayProducts.map((product, index: number) => (
            <div key={index} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200 overflow-hidden w-[230px]">
              {/* Product Image */}
              <div className="relative h-36 bg-gray-50 flex items-center justify-center">
                {product.url_img ? (
                  <img 
                    src={product.url_img} 
                    alt={product.nombre}
                    className="w-full h-full object-contain p-2"
                    onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                      const target = e.target as HTMLImageElement;
                      const nextElement = target.nextElementSibling as HTMLElement;
                      target.style.display = 'none';
                      if (nextElement) {
                        nextElement.style.display = 'flex';
                      }
                    }}
                  />
                ) : null}
                <div className="hidden w-full h-full bg-gray-50 flex-col items-center justify-center">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mb-1">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                  <span className="text-xs text-gray-400">Producto</span>
                </div>
                
                {/* Sale Badge */}
                <div className="absolute top-1.5 left-1.5 bg-red-500 text-white px-1.5 py-0.5 rounded text-xs font-medium">
                  OFERTA
                </div>
              </div>

              {/* Product Info */}
              <div className="p-3">
                <h3 className="font-medium text-gray-800 text-xs mb-2 leading-tight h-8 overflow-hidden">
                  {product.nombre}
                </h3>

                {/* Price Section */}
                <div className="mb-3">
                  <div className="flex items-center gap-1 mb-0.5">
                    <span className="text-base font-bold text-blue-600">
                      ${product.precio_usd.toFixed(2)}
                    </span>
                    <span className="text-xs text-gray-500 bg-blue-50 px-1 py-0.5 rounded">
                      USD
                    </span>
                  </div>
                  <div className="text-xs font-medium text-gray-600">
                    ${product.precio_cop.toLocaleString()} COP
                  </div>
                </div>

                {/* Action Button */}
                <a
                  href={product.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-1.5 px-2 rounded text-xs text-center block transition-colors duration-200"
                >
                  Ver Oferta
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}