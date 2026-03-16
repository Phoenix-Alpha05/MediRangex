import { useEffect, useState } from 'react';

export function useIsMobile(breakpoint = 768): boolean {
  const [isMobile, setIsMobile] = useState(() => {
    if (localStorage.getItem('mrx_view_mode') === 'mobile') return true;
    return window.innerWidth <= breakpoint;
  });

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint}px)`);

    const check = () => {
      if (localStorage.getItem('mrx_view_mode') === 'mobile') {
        setIsMobile(true);
        return;
      }
      setIsMobile(mq.matches);
    };

    mq.addEventListener('change', check);
    window.addEventListener('viewmodechange', check);
    check();

    return () => {
      mq.removeEventListener('change', check);
      window.removeEventListener('viewmodechange', check);
    };
  }, [breakpoint]);

  return isMobile;
}
