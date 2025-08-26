import { toPng } from "html-to-image";
import QrCodeExample from "../Games/QR/QrCode";
import { useRef } from "react";

export default function Bx({ line, tkt }) {
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

    return <div className="line-card" ref={ref}>
        <div key={line.id} className="line">
            <p><strong>Bet Type:</strong> {line.bet_type}</p>
            <p><strong>Numbers:</strong> {line.numbers}</p>
            <p><strong>Stake:</strong> ${line.stake}</p>
            <p><strong>Status:</strong> {line.status}</p>
            <p><strong>Win Amount:</strong> ${line.win_amount}</p>
        </div>
        <QrCodeExample data={tkt} oc={handleDownload} />
    </div>
}