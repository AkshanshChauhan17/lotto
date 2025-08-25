import React, { useState } from "react";
import "./scss/Locations.scss";

export default function Locations() {
  const [stores] = useState([
    {
      id: 1,
      name: "Lucky Lotto Center",
      address: "123 Main Street, New Delhi",
      phone: "+91 98765 43210",
      open: "9:00 AM - 9:00 PM",
    },
    {
      id: 2,
      name: "Golden Ticket Hub",
      address: "45 MG Road, Mumbai",
      phone: "+91 91234 56789",
      open: "10:00 AM - 10:00 PM",
    },
    {
      id: 3,
      name: "Fortune Point",
      address: "7 Park Avenue, Bangalore",
      phone: "+91 99887 66554",
      open: "8:30 AM - 8:30 PM",
    },
    {
      id: 4,
      name: "Dream Big Kiosk",
      address: "21 Market Street, Pune",
      phone: "+91 90909 80808",
      open: "11:00 AM - 7:00 PM",
    },
  ]);

  return (
    <div className="locations-root">
      <h2 className="title">📍 Our Store Locations</h2>

      <div className="location-grid">
        {stores.map((store) => (
          <div className="location-card" key={store.id}>
            <h3>{store.name}</h3>
            <p className="address">{store.address}</p>
            <p className="phone">☎ {store.phone}</p>
            <p className="open">🕒 {store.open}</p>
            <button className="map-btn">View on Map</button>
          </div>
        ))}
      </div>
    </div>
  );
}