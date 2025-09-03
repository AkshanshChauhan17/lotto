import { useEffect, useRef, useState } from "react";
import { api } from "../../Fx/api_connector";
import { toPng } from "html-to-image";
import Bx from "./Bx";
import html2canvas from "html2canvas";

export default function TicketDetailModal({ id, onClose }) {
    const [ticket, setTicket] = useState(null);
    const ref = useRef();
    useEffect(() => {
        api.get(`/tickets/${id}`, null, localStorage.token)
            .then((e) => setTicket(e))
            .catch((err) => {
                if (err) throw err;
            })
    }, [id]);

    if (ticket === null) {
        return <p></p>;
    }

    const captureElement = async () => {
        const element = ref.current;

        const canvas = await html2canvas(element, {
            scrollX: 0,
            scrollY: 0,
            width: element.scrollWidth,
            height: element.scrollHeight,
            windowWidth: element.scrollWidth,
            windowHeight: element.scrollHeight,
        });

        const dataURL = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = dataURL;
        link.download = "element.png";
        link.click();
    };


    const handleInstall = () => {
        if (ref.current === null) return;
        toPng(ref.current, { f }).then((dataUrl) => {
            const link = document.createElement("a");
            link.download = ticket.serial;
            link.href = dataUrl;
            link.click();
        });
    };

    return (
        <div className="modal-overlay" ref={ref}>
            <div className="modal-card">
                <button className="close-btn" onClick={onClose}>×</button>
                <h2>Ticket Details</h2>
                <button onClick={captureElement}>Print</button>

                <div className="ticket-info">
                    <p><strong>Serial:</strong> {ticket.serial}</p>
                    <p><strong>Status:</strong>
                        <span className={`status ${ticket.status.toLowerCase()}`}>
                            {ticket.status}
                        </span>
                    </p>
                    <p><strong>Total Amount:</strong> ${ticket.total_amount}</p>
                    <p><strong>Purchase Time:</strong> {new Date(ticket.purchase_time).toLocaleString()}</p>
                    <p><strong>Customer ID:</strong> {ticket.customer_id}</p>
                    <p><strong>Game ID:</strong> {ticket.game_id}</p>
                    <p><strong>Store ID:</strong> {ticket.store_id}</p>
                    <p><strong>Staff ID:</strong> {ticket.staff_id}</p>
                </div>

                <h3>Bet Lines</h3>
                <div className="lines">
                    {ticket.lines.map((linee) => (
                        <Bx line={linee} tkt={ticket.serial} />
                    ))}
                </div>
            </div>
        </div>
    );
}