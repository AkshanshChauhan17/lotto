import { useEffect, useState } from "react";
import { api } from "../../Fx/api_connector";

export default function TicketsTable() {
    const [tickets, setTickets] = useState([]);
    const [filteredTickets, setFilteredTickets] = useState([]);
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

    const fetchTickets = () => {
        api.get("/tickets?page=1&limit=50", null, localStorage.token)
            .then((res) => {
                setTickets(res);
                setFilteredTickets(res);
            })
            .catch((err) => console.error(err));
    };

    useEffect(() => {
        fetchTickets();
    }, []);

    // handle filter change
    useEffect(() => {
        let data = [...tickets];
        if (statusFilter !== "ALL") {
            data = data.filter((t) => t.status === statusFilter);
        }
        setFilteredTickets(data);
    }, [statusFilter, tickets]);

    // handle sorting
    const handleSort = (key) => {
        let direction = "asc";
        if (sortConfig.key === key && sortConfig.direction === "asc") {
            direction = "desc";
        }
        setSortConfig({ key, direction });

        const sorted = [...filteredTickets].sort((a, b) => {
            if (a[key] < b[key]) return direction === "asc" ? -1 : 1;
            if (a[key] > b[key]) return direction === "asc" ? 1 : -1;
            return 0;
        });
        setFilteredTickets(sorted);
    };

    return (
        <div className="tickets-table-container">
            <div className="table-header">
                <h2 className="table-title">Tickets</h2>

                <div className="controls">
                    {/* Filter */}
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="ALL">All</option>
                        <option value="PENDING">Pending</option>
                        <option value="VOID">Void</option>
                        <option value="COMPLETED">Completed</option>
                    </select>

                    {/* Reload Button */}
                    <button onClick={fetchTickets} className="reload-btn">
                        Reload
                    </button>
                </div>
            </div>

            <table className="tickets-table">
                <thead>
                    <tr>
                        <th onClick={() => handleSort("id")}>ID</th>
                        <th onClick={() => handleSort("serial")}>Serial</th>
                        <th onClick={() => handleSort("customer_id")}>Customer</th>
                        <th onClick={() => handleSort("game_id")}>Game</th>
                        <th onClick={() => handleSort("total_amount")}>Total Amount</th>
                        <th onClick={() => handleSort("status")}>Status</th>
                        <th onClick={() => handleSort("purchase_time")}>Purchase Time</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredTickets.length > 0 ? (
                        filteredTickets.map((ticket) => (
                            <tr key={ticket.id}>
                                <td>{ticket.id}</td>
                                <td>{ticket.serial}</td>
                                <td>{ticket.customer_id}</td>
                                <td>{ticket.game_id}</td>
                                <td>${ticket.total_amount}</td>
                                <td className={`status ${ticket.status.toLowerCase()}`}>
                                    {ticket.status}
                                </td>
                                <td>{new Date(ticket.purchase_time).toLocaleString()}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="7" className="no-data">
                                No tickets found
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}