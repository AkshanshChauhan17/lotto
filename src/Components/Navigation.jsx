import { Link } from "react-router-dom";
import { main_navigation } from "../data/navs";
import { AiOutlineUser } from "react-icons/ai";

const money = 44;

export default function Navigation() {
    return <div className="nav solid-black-bg">
        <div className="left-logo">LOTTO Games 888</div>
        <div className="links">
            {
                main_navigation.map((e, i)=>{
                    return <Link to={e.url} key={i} className="link">{e.name}</Link>
                })
            }
        </div>
        <div className="right">
            <div className="total-balance">${money}</div>
            <div className="user-profile">
                <AiOutlineUser className="user-icon" color="black"/>
            </div>
        </div>
    </div>
}