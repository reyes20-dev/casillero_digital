// src/data/banners.ts
export interface BannerItem {
  titulo: string;
  url: string;
  descripcion: string;
  tiempo: number;
  link: string;
}

export const banners: BannerItem[] = [
  {
    titulo: "¡Descuentos de Verano!",
    url: "https://img.freepik.com/psd-gratis/post-redes-sociales-templa-ofertas-fin-ano-ofertas-brasil_314999-1437.jpg?semt=ais_hybrid&w=740",
    descripcion: "Aprovecha hasta un 50% de descuento en productos seleccionados. Solo por tiempo limitado.",
    tiempo: 5000,
    link: "http://localhost:4321/",
  },
  {
    titulo: "Nuevo Lanzamiento: Serie X",
    url: "https://i.pinimg.com/474x/d7/47/f7/d747f70ce52b0df12c1542b280fa8d76.jpg",
    descripcion: "Descubre la nueva Serie X con tecnología de última generación. ¡Ya disponible!",
    tiempo: 5000,
    link: "http://localhost:4321/",
  },
  {
    titulo: "Envío Gratis",
    url: "https://img.freepik.com/psd-gratis/plantilla-redes-sociales-celebracion-dia-padre039s-feliz-dia-dos-pais-brasil_314999-2097.jpg?semt=ais_hybrid&w=740",
    descripcion: "Envío gratis por compras superiores a $100. Aplica para todo el país.",
    tiempo: 5000,
    link: "",
  },
  {
    titulo: "Promoción 2x1",
    url: "https://www.oboticario.com.co/cdn/shop/files/Banner-Depto-Heroes_9d442712-a523-45be-8fd7-c84a9d798b87_1600x.jpg?v=1740779227",
    descripcion: "Llévate dos productos y paga solo uno en nuestra categoría de hogar.",
    tiempo: 5000,
    link: "",
  },
];
