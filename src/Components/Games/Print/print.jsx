import { useRef } from "react";


export default function Print() {
  const ref = useRef();

  const handleDownload = () => {
    if (ref.current === null) return;
    toPng(ref.current).then((dataUrl) => {
      const link = document.createElement("a");
      link.download = "output.png";
      link.href = dataUrl;
      link.click();
    });
  };

  return (
    <div>
      <div ref={ref} style={{ padding: "20px", background: "lightblue" }}>
        <h1>Hello JSX to Image!</h1>
      </div>
      <button onClick={handleDownload}>Download as PNG</button>
    </div>
  );
}