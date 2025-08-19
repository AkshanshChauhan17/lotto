import { useEffect, useState } from "react";
import { api } from "../../Fx/api_connector";

export default function TicketDetailModal({ id, onClose }) {
    const [ticket, setTicket] = useState(null);
    useEffect(()=>{
        api.get(`/tickets/${id}`, null, localStorage.token)
            .then((e)=>setTicket(e))
            .catch((err)=>{
                if(err) throw err;
            })
    }, [id]);

    if(ticket === null) {
        return <p></p>;
    }
    return (
        <div className="modal-overlay">
            <div className="modal-card">
                <button className="close-btn" onClick={onClose}>×</button>
                <h2>Ticket Details</h2>

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
                    {ticket.lines.map((line) => (
                        <div key={line.id} className="line-card">
                            <p><strong>Bet Type:</strong> {line.bet_type}</p>
                            <p><strong>Numbers:</strong> {line.numbers}</p>
                            <p><strong>Stake:</strong> ${line.stake}</p>
                            <p><strong>Status:</strong> {line.status}</p>
                            <p><strong>Win Amount:</strong> ${line.win_amount}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}