import { useLocation, useNavigate } from "react-router-dom"

export default function Help() {
    const location = useLocation();

    if (location.pathname === "/help/ba") {
        return <div className="help">
            <div className="heading">How to play bonus amount?</div>
            <img src="/bonus_help.png" alt="" />
        </div>
    }

    return <div className="help">
        <img src="./public/bonus_help.png" alt="" />
    </div>
}