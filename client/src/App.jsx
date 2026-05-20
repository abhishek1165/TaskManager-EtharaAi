import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import AppRouter from './routes/AppRouter';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCurrentUser } from './redux/slices/authSlice';
import { Toaster } from './components/ui/Toaster';

function AppContent() {
  const dispatch = useDispatch();
  const { token, theme } = useSelector((state) => ({
    token: state.auth.token,
    theme: state.ui.theme,
  }));

  // Apply theme to document root
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  // Verify token & fetch user on mount
  useEffect(() => {
    if (token) {
      dispatch(fetchCurrentUser());
    }
  }, [token, dispatch]);

  return (
    <>
      <AppRouter />
      <Toaster />
    </>
  );
}

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </Provider>
  );
}

export default App;
