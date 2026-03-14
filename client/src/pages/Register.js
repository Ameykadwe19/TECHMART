const Register = () => {

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const [message, setMessage] = useState(null);

  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    try {
      const { data } = await API.post('/auth/register', formData);

      if (data.token) {
        localStorage.setItem('token', data.token);

        setMessage({
          type: 'success',
          text: 'Registration successful! Redirecting to login page...'
        });

        setTimeout(() => navigate('/login'), 1500);
      }

    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Registration failed: ' + (error.response?.data?.message || error.message)
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="password"
        placeholder="Password"
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        required
      />

      <button
        type="submit"
        disabled={loading}
        className={`w-full p-3 rounded-lg text-white ${loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'}`}
      >
        {loading ? 'Registering...' : 'Register'}
      </button>

      <p className="mt-4 text-center">
        Already have account? <Link to="/login" className="text-blue-600">Login</Link>
      </p>
    </form>
  );
};

export default Register;
