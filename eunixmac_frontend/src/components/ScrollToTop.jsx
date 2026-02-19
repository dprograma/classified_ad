import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);

  useEffect(() => {
    // Intercept all form submissions and scroll to top after they complete
    const handleFormSubmit = () => {
      // Use setTimeout to scroll after React re-renders from the submission
      setTimeout(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      }, 100);
    };

    document.addEventListener('submit', handleFormSubmit);
    return () => document.removeEventListener('submit', handleFormSubmit);
  }, []);

  return null;
};

export default ScrollToTop;
