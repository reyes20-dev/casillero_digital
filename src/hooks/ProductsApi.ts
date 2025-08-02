import { useState } from "react";

export type Product = {
  nombre: string;
  url_img: string;
  link: string;
  precio_usd: number;
  precio_cop: number;
};

export const useProductsApi = (systemPrompt: String) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const searchProduct = async (userQuery: String) => {
        if (!userQuery.trim()) return;

        setLoading(true);
        setError("");

        try {
            const API_KEY = import.meta.env.PUBLIC_OPENAI_API_KEY;
             
            const response = await fetch("https://api.openai.com/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${API_KEY}`,
                },
                body: JSON.stringify({
                    model: "gpt-3.5-turbo",
                   messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: `Busca productos relacionados con: ${userQuery}` },
                ],
                max_tokens: 800,
                temperature: 0.7,
            }),
        });
 if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;

      try {
        const parsed = JSON.parse(content);
        setProducts(Array.isArray(parsed) ? parsed : []);
      } catch (parseError) {
        setProducts([
          {
            nombre: "Error al parsear producto",
            url_img: "",
            link: "",
            precio_usd: 0,
            precio_cop: 0,
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

  return { products, loading, error, searchProduct };
};