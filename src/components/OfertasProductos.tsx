import React, { useEffect } from "react";
import { useProductsApi } from "../components/ProductsApi";

const SYSTEM_PROMPT = `Eres un asesor experto en compras internacionales con casillero digital. Tu trabajo es recomendar  5 productos REALES con ofertas del momento disponibles en tiendas confiables ubicadas y para envío a EE.UU como Amazon, eBay, Walmart o Best Buy según lo que el usuario desea comprar.

                  Devuelve la respuesta en **formato JSON limpio y válido**, así:

                  [
                    {
                      "nombre": "Nombre del producto",
                      "url_img":"ulr de la imagen del producto",;
                      "link": "URL directa del producto",
                      "precio_usd": 129.99,
                      "precio_cop": 519960,
                    },
                    ...
                  ]

                  REGLAS:
                  - No inventes URLs falsas, usa productos reales.
                  - El precio en COP es una conversión estimada (1 USD = 4000 COP).
                  - Las características y ventajas deben ser concretas, no genéricas.
                  - No incluyas explicaciones ni texto fuera del JSON.
                  - Cada producto debe ser breve y visualmente útil.`;

export default function SearchComponent() {
  const { products, loading, error, searchProduct } = useProductsApi(SYSTEM_PROMPT);

  useEffect(() => {
    const pregunta = "Dame 5 ofertas de productos que esten actualmente en descuento y que sean populares en Amazon, eBay o Walmart.";
    searchProduct(pregunta);
  }, []);

  return (
    <>
      {loading && <p className="text-gray-500">Cargando...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {products.length > 0 && (
        <div className="grid md:grid-cols-3 gap-6">
          {products.map((p, i) => (
            <div key={i} className="p-4 border rounded bg-white shadow">
              <h4 className="font-bold">{p.nombre}</h4>
              <p>USD {p.precio_usd.toFixed(2)} — COP {p.precio_cop.toLocaleString()}</p>
              <a href={p.link} target="_blank" className="text-blue-600 underline text-sm">Ver producto</a>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
