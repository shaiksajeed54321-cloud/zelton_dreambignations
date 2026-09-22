import { useEffect, useRef, useState } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import "./Carousel.css";

export default function Carousel({ images }: { images: string[] }) {
  const [index, setIndex] = useState(0);
  const hovering = useRef(false);

  useEffect(() => {
    if (images.length <= 1) return;
    const id = setInterval(() => {
      if (!hovering.current) setIndex((i) => (i + 1) % images.length);
    }, 3200);
    return () => clearInterval(id);
  }, [images.length]);

  const go = (dir: number) => setIndex((i) => (i + dir + images.length) % images.length);

  return (
    <div
      className="carousel"
      onMouseEnter={() => (hovering.current = true)}
      onMouseLeave={() => (hovering.current = false)}
    >
      <div className="carousel__viewport">
        <div className="carousel__track" style={{ transform: `translateX(-${index * 100}%)` }}>
          {images.map((src) => (
            <img src={src} alt="" key={src} loading="lazy" />
          ))}
        </div>
      </div>

      {images.length > 1 && (
        <>
          <button className="carousel__arrow carousel__arrow--prev" onClick={() => go(-1)} aria-label="Previous">
            <FiChevronLeft />
          </button>
          <button className="carousel__arrow carousel__arrow--next" onClick={() => go(1)} aria-label="Next">
            <FiChevronRight />
          </button>
          <div className="carousel__dots">
            {images.map((src, i) => (
              <button
                key={src}
                className={`carousel__dot ${i === index ? "is-active" : ""}`}
                onClick={() => setIndex(i)}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
