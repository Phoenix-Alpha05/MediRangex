import { createContext, useContext, useState, type ReactNode } from 'react';

type ViewMode = 'desktop' | 'mobile';

interface ViewModeContextValue {
  viewMode: ViewMode;
  setViewMode: (m: ViewMode) => void;
}

const ViewModeContext = createContext<ViewModeContextValue>({
  viewMode: 'desktop',
  setViewMode: () => {},
});

export function ViewModeProvider({ children }: { children: ReactNode }) {
  const [viewMode, setViewModeState] = useState<ViewMode>(() => {
    return (localStorage.getItem('mrx_view_mode') as ViewMode) ?? 'desktop';
  });

  const setViewMode = (m: ViewMode) => {
    setViewModeState(m);
    localStorage.setItem('mrx_view_mode', m);
    window.dispatchEvent(new CustomEvent('viewmodechange', { detail: m }));
  };

  return (
    <ViewModeContext.Provider value={{ viewMode, setViewMode }}>
      {children}
    </ViewModeContext.Provider>
  );
}

export const useViewMode = () => useContext(ViewModeContext);
