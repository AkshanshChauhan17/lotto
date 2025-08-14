import { useState } from "react";
import { api } from "../../Fx/api_connector";
import { Link } from "react-router-dom";

export default function Login({isLoginFun}) {
  const [formData, setFormData] = useState({
    name: "",
    pin: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const res = await api.post("/auth/login", formData);

      setMessage(`✅ Logged in successfully: ${JSON.stringify(res)}`);

      if (res.token) {
        localStorage.setItem("token", res.token);
        isLoginFun(true);
      }
    } catch (err) {
      setMessage(`❌ Login failed: ${err.message}`);
      isLoginFun(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Email:
          <input
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </label>
        <br />
        <label>
          PIN:
          <input
            name="pin"
            type="password"
            value={formData.pin}
            onChange={handleChange}
            required
          />
        </label>
        <br />
        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
      <div className="to-reg">Register here : <Link to={"/register"}>Register</Link></div>
      {message && <p style={{ marginTop: "1rem" }}>{message}</p>}
    </div>
  );
}