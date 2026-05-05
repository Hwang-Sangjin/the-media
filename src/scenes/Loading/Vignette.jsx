export default function Vignette() {
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        background:
          "radial-gradient(ellipse at center, transparent 30%, rgba(0, 0, 0, 0.45) 80%, rgba(0, 0, 0, 0.7) 100%)",
      }}
    />
  );
}
