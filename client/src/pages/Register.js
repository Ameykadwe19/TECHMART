const Register = () => {

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const [message, setMessage] = useState(null); // { type: 'success' | 'error', text: string }
  const [message, setMessage] = useState(null);

  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage(null); // clear old messages
    setMessage(null);

    setLoading(true); // Start spinner

    try {
      console.log('Sending registration data:', formData);

      const { data } = await API.post('/auth/register', formData);

      console.log('Registration response:', data);

      if (data.token) {
        localStorage.setItem('token', data.token);

        // Log the token content
        try {
          const payload = JSON.parse(atob(data.token.split('.')[1]));
          console.log('Token payload after registration:', payload);
        } catch (err) {
          console.error('Error parsing token:', err);
        }

        setMessage({
          type: 'success',
          text: 'Registration successful! Redirecting to login page...'
        });

        setTimeout(() => navigate('/login'), 1500);
      } else {
        setMessage({
          type: 'error',
          text: 'Registration failed: ' + (error.response?.data?.message || error.message)
        });
      }

    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Registration failed: ' + (error.response?.data?.message || error.message)
      });
    } finally {
      setLoading(false); // Stop spinner
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
