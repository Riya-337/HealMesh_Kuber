/**
 * SplineBackground
 * Full-bleed Spline 3D scene embedded as an iframe.
 * Sits absolutely behind all content — pointer-events are disabled so
 * interactive UI on top still works normally.
 */
export function SplineBackground({ className = "" }: { className?: string }) {
  return (
    <div
      className={`absolute inset-0 overflow-hidden ${className}`}
      aria-hidden="true"
    >
      <iframe
        src="https://my.spline.design/scifihudcopycopy-JFmDf82644UKz72x39DuJEWK-dX7/"
        frameBorder="0"
        title="HealMesh 3D Sci-Fi HUD"
        allow="autoplay"
        style={{
          width: "100%",
          height: "100%",
          border: "none",
          pointerEvents: "none", // let UI on top be clickable
          display: "block",
        }}
      />
      {/* Dark overlay to keep text readable on top of the scene */}
      <div className="absolute inset-0 bg-foreground/55" />
    </div>
  );
}
