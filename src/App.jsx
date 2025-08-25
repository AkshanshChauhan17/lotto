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

function App() {
  const [isLogin, setIsLogin] = useState(false);
  const [customerDetails, setCustomerDetails] = useState({});
  const nav = useNavigate();
  const [updateNumber, setUpdateNumber] = useState(1002002);

  useEffect(() => {
    var token = localStorage.getItem("token");

    async function fetchData() {
      try {
        if (!isLogin && token) {
          const { isLogin: loginStatus, user } = await api.post("/auth/verify", {}, token);
          setIsLogin(loginStatus);
          if (loginStatus && user?.id) {
            localStorage.setItem("guid", user.id);
          }
        }

        const currentGuid = localStorage.getItem("guid");
        if (!currentGuid) return nav("/");
        const customer = await api.get(`/customers/${currentGuid}`, null,  token);
        setCustomerDetails(customer);
      } catch {
        nav("/");
      }
    }

    fetchData();
  }, [updateNumber]);

  if (!isLogin) {
    return <Routes>
      <Route path={"/"} element={<Navigate to={"/login"} />} />
      <Route path={"/login"} element={<Login isLoginFun={setIsLogin} />} />
      <Route path={"/register"} element={<Register isLoginFun={setIsLogin} />} />
    </Routes>
  }
  return (
    <div className="main">
      <Navigation cud={customerDetails} />
      <Routes>
        <Route path={"/popup"} element={<PopUpBlast />} />
        <Route path={"/login"} element={<Navigate to={"/"} />} />
        <Route path={"/"} element={<Navigate to={"/game/lotto-dice"} />} />
        <Route path={"/tickets"} element={<TicketsTable />} />
        <Route path={"/history"} element={<GameHistory />} />
        <Route path={"/store"} element={<TicketsTable />} />
        <Route path={"/web"} element={<TicketsTable />} />
        <Route path={"/location"} element={<Locations />} />
        {
          game_navigation.map((e, i) => {
            return <Route path={e.url} key={i} element={<Game cd={customerDetails} upNum={setUpdateNumber} />} />
          })
        }
      </Routes>
    </div>
  )
}

export default App
