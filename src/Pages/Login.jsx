import "../assets/styles/Login.css";

function Login() {
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Login form submitted");
  };

  return (
    <div className="login-container">
      <div className="intro-text">
        <div className="text-content">
          <h1>Web-Based Inventory & Sales Management System</h1>
          <p>
            This system provides role-based access, product management, stock
            updates, and reporting to improve business efficiency.
          </p>
        </div>
      </div>
      <div className="login-form">
        <form onSubmit={handleSubmit}>
          <h2>Employee Login</h2>
          <input type="email" name="email" placeholder="Email" required />
          <input
            type="password"
            name="password"
            placeholder="Password"
            required
          />
          <button type="submit">Login</button>
        </form>
      </div>
    </div>
  );
}

export default Login;
