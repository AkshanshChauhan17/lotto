import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import "./App.scss";
import Navigation from "./Components/Navigation";
import Game from "./Pages/Game";
import { game_navigation } from "./data/navs";
import { useEffect, useState } from "react";
import Register from "./Components/Auth/Register";
import Login from "./Components/Auth/Login";
import { api } from "./Fx/api_connector";
import PopUpBlast from "./Components/Animations/PopUpBlast";
import TicketsTable from "./Components/Tables/Tickets";
import GameHistory from "./Components/Tables/History";
import Locations from "./Components/Games/Location";
import UserDetails from "./Components/User/UserInfo";

function App() {
  const [isLogin, setIsLogin] = useState(false);
  const [customerDetails, setCustomerDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updateNumber, setUpdateNumber] = useState(0);
  const nav = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    async function init() {
      try {
        setLoading(true);

        const { isLogin: loginStatus, user } = await api.post("/auth/verify", {}, token);
        if (!loginStatus || !user?.id) {
          setIsLogin(false);
          setLoading(false);
          nav("/login");
          return;
        }

        setIsLogin(true);
        localStorage.setItem("guid", user.id);

        const customer = await api.get(`/customers/${user.id}`, null, token);
        setCustomerDetails(customer);
      } catch (err) {
        console.error("Auth/Fetch failed:", err);
        setIsLogin(false);
        nav("/login");
      } finally {
        setLoading(false);
      }
    }

    init();
  }, [updateNumber, nav]);

  if (loading) {
    return <div className="loader">Loading...</div>;
  }

  if (!isLogin) {
    return (
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login isLoginFun={setIsLogin} />} />
        <Route path="/register" element={<Register isLoginFun={setIsLogin} />} />
      </Routes>
    );
  }

  return (
    <div className="main">
      <Navigation cud={customerDetails} />
      <Routes>
        <Route path="/popup" element={<PopUpBlast />} />
        <Route path="/login" element={<Navigate to="/" />} />
        <Route path="/" element={<Navigate to="/game/lotto-dice" />} />
        <Route path="/tickets" element={<TicketsTable />} />
        <Route path="/history" element={<GameHistory />} />
        <Route path="/store" element={<TicketsTable />} />
        <Route path="/web" element={<TicketsTable />} />
        <Route path="/location" element={<Locations />} />
        <Route path="/info" element={<UserDetails />} />
        {game_navigation.map((e, i) => (
          <Route
            path={e.url}
            key={i}
            element={<Game cd={customerDetails} upNum={setUpdateNumber} />}
          />
        ))}
      </Routes>
    </div>
  );
}

export default App;