import { createContext, useContext } from 'react';
import type { Variant } from '..';

interface SwipeToActionContext {
  activeItemId: string | undefined;
  setActiveItemId: (value: string) => void;
  variant: Variant;
}

const SwipeToActionContext = createContext<SwipeToActionContext>({} as SwipeToActionContext);
export const SwipeToActionProvider = SwipeToActionContext.Provider;
export const useSwipeToActionContext = (): SwipeToActionContext => useContext(SwipeToActionContext);
