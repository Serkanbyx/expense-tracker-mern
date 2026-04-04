import { createContext, useContext, useEffect, useReducer } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

const ACTION_TYPES = {
  SET_LOADING: 'SET_LOADING',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  USER_LOADED: 'USER_LOADED',
  LOGOUT: 'LOGOUT',
};

const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  isLoading: true,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case ACTION_TYPES.SET_LOADING:
      return { ...state, isLoading: action.payload };

    case ACTION_TYPES.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
      };

    case ACTION_TYPES.USER_LOADED:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
      };

    case ACTION_TYPES.LOGOUT:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      };

    default:
      return state;
  }
};

const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const validateToken = async () => {
      const storedToken = localStorage.getItem('token');

      if (!storedToken) {
        dispatch({ type: ACTION_TYPES.SET_LOADING, payload: false });
        return;
      }

      try {
        const { data } = await api.get('/auth/me');
        dispatch({ type: ACTION_TYPES.USER_LOADED, payload: data.user });
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        dispatch({ type: ACTION_TYPES.LOGOUT });
      }
    };

    validateToken();
  }, []);

  const login = async (email, password) => {
    dispatch({ type: ACTION_TYPES.SET_LOADING, payload: true });

    const { data } = await api.post('/auth/login', { email, password });

    localStorage.setItem('token', data.token);
    dispatch({ type: ACTION_TYPES.LOGIN_SUCCESS, payload: data });
  };

  const register = async (name, email, password) => {
    dispatch({ type: ACTION_TYPES.SET_LOADING, payload: true });

    const { data } = await api.post('/auth/register', {
      name,
      email,
      password,
    });

    localStorage.setItem('token', data.token);
    dispatch({ type: ACTION_TYPES.LOGIN_SUCCESS, payload: data });
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    dispatch({ type: ACTION_TYPES.LOGOUT });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};

export { AuthContext, AuthProvider, useAuth };
