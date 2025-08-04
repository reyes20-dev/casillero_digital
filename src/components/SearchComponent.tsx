import React, { useState } from "react";
import { search_promt } from "../prompts/systemPrompts";

type Product = {
  nombre: string;
  link: string;
  precio_usd: number;
  precio_cop: number;
  caracteristicas?: string[];
  ventajas?: string[];
  desventajas?: string[];
  alternativas?: string[];
};

export default function SearchComponent() {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const searchProducts = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError("");

    try {
      const API_KEY = import.meta.env.PUBLIC_OPENAI_API_KEY;

      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${API_KEY}`,
          },
          body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [
              {
                role: "system",
                content: search_promt,
              },
              {
                role: "user",
                content: `Busca productos relacionados con: ${searchQuery}`,
              },
            ],
            max_tokens: 800,
            temperature: 0.7,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content;

      try {
        const productsData = JSON.parse(content);
        setProducts(Array.isArray(productsData) ? productsData : []);
      } catch (parseError) {
        setProducts([
          {
            nombre: "Error al parsear producto",
            link: "",
            precio_usd: 0,
            precio_cop: 0,
            caracteristicas: [],
            ventajas: [],
            desventajas: [],
            alternativas: [],
          },
        ]);
      }
    } catch (err) {
      setError("Error al buscar productos: " + (err instanceof Error ? err.message : String(err)));
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (!loading && query.trim()) {
      searchProducts(query);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    <>
      <div className="bg-white rounded-3xl shadow-lg p-6 max-w-5xl mx-auto mt-[-70px] relative z-10">
        <h2 className="text-gray-700 text-center mb-4">¿Qué producto deseas buscar?</h2>
        <div className="flex gap-4 mb-6">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyPress}
            disabled={loading}
            placeholder="Escribe el nombre del producto que deseas buscar..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSearch}
            disabled={loading}
            className={`px-4 py-2 rounded-lg font-semibold ${
              loading
                ? "bg-gray-400 text-white cursor-not-allowed"
                : "bg-blue-700 text-white hover:bg-blue-800 cursor-pointer"
            }`}
          >
            {loading ? "Buscando..." : "Buscar"}
          </button>
        </div>
        {error && <div className="mt-4 text-red-700 text-center">{error}</div>}
        {loading && <div className="mt-4 text-center">Buscando productos...</div>}
      </div>
      {products.length > 0 && (
        <div className="max-w-5xl mx-auto mt-10">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-800">Resultados de búsqueda</h3>
            <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
              Recomendaciones
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {products.map((product, index) => (
              <div
                key={index}
                className="flex flex-col h-full p-4 border border-gray-200 rounded-lg shadow-sm bg-gray-50 w-full"
              >
                <h4 className="text-base font-semibold text-gray-700 mb-2">{product.nombre}</h4>
                <p className="text-sm text-gray-600 mb-2">
                  USD {product.precio_usd.toFixed(2)} (COP {product.precio_cop.toLocaleString()})
                </p>
                <a
                  href={product.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline mb-4 block text-sm"
                >
                  Ver producto
                </a>
                {product.caracteristicas && product.caracteristicas.length > 0 && (
                  <div className="mb-2">
                    <h5 className="font-semibold text-gray-700 text-sm">Características</h5>
                    <ul className="list-disc pl-5 text-gray-600 text-sm">
                      {product.caracteristicas.map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {product.alternativas && product.alternativas.length > 0 && (
                  <div>
                    <h5 className="font-semibold text-gray-700 text-sm">Alternativas</h5>
                    <ul className="list-disc pl-5 text-gray-600 text-sm">
                      {product.alternativas.map((a, i) => (
                        <li key={i}>{a}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}