interface BannerProps {
    title: string;
    subtitle: string;
    imageUrl: string;
    linkUrl: string;
    imagenes:  string[];
}

export const Banner  = ({title,imagenes}:BannerProps) => {
  return (
    <div className="banner bg-[#d71515] text-2xl">
      <h1>{title}</h1>
      <p>Discover amazing content and connect with us.</p>
      {
        imagenes.map((image, index) => (
          <img key={index} src={image} alt={`Banner image ${index + 1}`} className="banner-image" />
        ))
      }
    </div>
  );
}