import { useEffect, useRef } from "react";
import { drawLineChart } from "../../utils/charts";

export default function LineChart({ points }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    drawLineChart(canvasRef.current, points);
  }, [points]);

  useEffect(() => {
    const handleResize = () => drawLineChart(canvasRef.current, points);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [points]);

  return <canvas ref={canvasRef} />;
}
