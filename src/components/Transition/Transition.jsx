import { useSceneStore } from "../../store/sceneStore";

export default function Transition() {
  const isTransitioning = useSceneStore((state) => state.isTransitioning);

  return (
    <div
      className={`fixed inset-0 bg-black pointer-events-none z-50 transition-opacity duration-500 ease-in-out ${
        isTransitioning ? "opacity-100" : "opacity-0"
      }`}
    />
  );
}
