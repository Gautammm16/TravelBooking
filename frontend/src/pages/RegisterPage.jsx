import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../services/auth';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    passwordConfirm: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.passwordConfirm) {
      return setError('Passwords do not match');
    }
    
    setLoading(true);
    try {
      await register(formData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <h1>Register</h1>
      <form onSubmit={handleSubmit}>
        <label>
          First Name:
          <input
            type="text"
            value={formData.firstName}
            onChange={e => setFormData({...formData, firstName: e.target.value})}
            required
          />
        </label>
        <label>
          Last Name:
          <input
            type="text"
            value={formData.lastName}
            onChange={e => setFormData({...formData, lastName: e.target.value})}
            required
          />
        </label>
        <label>
          Email:
          <input
            type="email"
            value={formData.email}
            onChange={e => setFormData({...formData, email: e.target.value})}
            required
          />
        </label>
        <label>
          Password:
          <input
            type="password"
            value={formData.password}
            onChange={e => setFormData({...formData, password: e.target.value})}
            required
          />
        </label>
        <label>
          Confirm Password:
          <input
            type="password"
            value={formData.passwordConfirm}
            onChange={e => setFormData({...formData, passwordConfirm: e.target.value})}
            required
          />
        </label>
        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
      <p>Already have an account? <a href="/login">Login here</a></p>
    </div>
  );
};

export default RegisterPage;