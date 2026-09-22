import { GALLERY_BLOCKS } from "../data/content";
import Carousel from "./Carousel";
import "./Gallery.css";

export default function Gallery() {
  return (
    <section className="section gallery">
      <div className="container gallery__blocks">
        {GALLERY_BLOCKS.map((block) => (
          <div className="gallery__block" key={block.heading + block.suffix}>
            <p className="gallery__caption">
              <span className="gallery__caption-strong">{block.heading}</span>
              <span className="gallery__caption-suffix"> {block.suffix}</span>
            </p>
            <Carousel images={block.images} />
          </div>
        ))}
      </div>
    </section>
  );
}
