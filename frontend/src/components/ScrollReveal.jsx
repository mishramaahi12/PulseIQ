import { useEffect, useRef } from "react";

function ScrollReveal({
  children,
  className = "",
  direction = "up",
  delay = 0,
  duration = 700,
  threshold = 0.15,
  once = true,
}) {
  const elementRef = useRef(null);

  useEffect(() => {
    const element = elementRef.current;

    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          element.classList.add("scroll-reveal-visible");

          if (once) {
            observer.unobserve(element);
          }
        } else if (!once) {
          element.classList.remove("scroll-reveal-visible");
        }
      },
      {
        threshold,
        rootMargin: "0px 0px -50px 0px",
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [once, threshold]);

  return (
    <div
      ref={elementRef}
      className={`scroll-reveal scroll-reveal-${direction} ${className}`}
      style={{
        "--reveal-delay": `${delay}ms`,
        "--reveal-duration": `${duration}ms`,
      }}
    >
      {children}
    </div>
  );
}

export default ScrollReveal;