import { Link } from "react-router-dom";
import { main_navigation } from "../data/navs";
import { AiOutlineUser } from "react-icons/ai";

export default function Navigation({cud}) {
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
            { cud?.bonus_amount ? <div className="total-balance" style={{fontSize: 16}}>${cud?.bonus_amount} bonus</div> : null }
            <div className="total-balance">${cud?.balance}</div>
            <div className="user-profile">
                <AiOutlineUser className="user-icon" color="black"/>
            </div>
        </div>
    </div>
}