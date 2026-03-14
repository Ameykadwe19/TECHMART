
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api"; // apna axios instance

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [message, setMessage] = useState(null); 
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    try {
      console.log("Sending registration data:", formData);

      const { data } = await API.post("/auth/register", formData);

      console.log("Registration response:", data);

      if (data.token) {
        localStorage.setItem("token", data.token);

        // decode token (optional)
        try {
          const payload = JSON.parse(atob(data.token.split(".")[1]));
          console.log("Token payload:", payload);
        } catch (err) {
          console.error("Token decode error:", err);
        }

        setMessage({
          type: "success",
          text: "Registration successful! Redirecting to login...",
        });

        setTimeout(() => navigate("/login"), 1500);
      } else {
        setMessage({
          type: "error",
          text: "Registration failed. Please try again.",
        });
      }
    } catch (error) {
      console.error("Registration error:", error);

      setMessage({
        type: "error",
        text:
          "Registration failed: " +
          (error.response?.data?.message || error.message),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">
          Create Account
        </h2>

        {message && (
          <div
            className={`p-3 mb-4 text-center rounded ${
              message.type === "success"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg"
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg"
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className={`w-full p-3 rounded-lg text-white ${
              loading
                ? "bg-blue-400"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <p className="mt-4 text-center">
          Already have account?{" "}
          <Link to="/login" className="text-blue-600">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
```
