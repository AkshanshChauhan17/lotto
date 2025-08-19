import { useState, useEffect, useRef } from "react";
import Confetti from "react-confetti";

export default function PopUpBlast() {
  const [show, setShow] = useState(false);
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const audioRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener("resize", handleResize);

    setShow(true);
    if (audioRef.current) {
      audioRef.current.volume = 1.0;
      audioRef.current.play().catch(err =>
        console.log("Audio play blocked:", err)
      );
    }

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="popup">
      {show && (
        <Confetti
          width={dimensions.width}
          height={dimensions.height}
          recycle={false}
          numberOfPieces={300}
          initialVelocityY={15}
          tweenDuration={2000}
          confettiSource={{
            x: dimensions.width / 2 - 500,
            y: dimensions.height / 2 - 500,
            w: 1000,
            h: 1000,
          }}
        />
      )}
      <audio ref={audioRef} src="/pop.mp3" preload="auto" />
    </div>
  );
}