import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { jwtAuth } from '../features/userFeature/userSlice';
import { useAppDispatch } from '../App/hooks';
import { ChangeEvent, MouseEvent, useState } from 'react';
axios.defaults.withCredentials = true;

const LoginPage = () => {
  const navigate = useNavigate();

  const dispatch = useAppDispatch();
  const [data, setData] = useState<Record<'email' | 'password', string>>({
    email: '',
    password: '',
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.target.name;
    const name = e.target.name;
    const value = e.target.value;
    setData({ ...data, [name]: value });
  };

  const handleSubmit = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    try {
      await dispatch(jwtAuth([data.email, data.password]));
    } catch (err) {
      console.error(err);
    }
    navigate('/');
  };

  return (
    <form>
      <input type='text' name='email' onChange={handleChange} />
      <input type='password' name='password' onChange={handleChange} />
      <button type='submit' onClick={handleSubmit}>
        submit
      </button>
    </form>
  );
};

export default LoginPage;
