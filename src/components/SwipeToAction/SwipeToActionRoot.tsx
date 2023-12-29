import { ReactElement, useState, useMemo, memo } from 'react';

import { ValueOf } from '~/typings';

import { SwipeToActionProvider } from './context';
import { VARIANT } from './constants';

export type Variant = ValueOf<typeof VARIANT>;



interface Props {
  children: ReactElement | ReactElement[];
  variant: Variant;
}

export const SwipeToActionRoot = memo(({ children, variant }: Props): ReactElement => {
  const [activeItemId, setActiveItemId] = useState<string>();

  const contextValue = useMemo(
    () => ({
      activeItemId,
      setActiveItemId,
      variant,
    }),
    [activeItemId, variant],
  );

  return <SwipeToActionProvider value={contextValue}>{children}</SwipeToActionProvider>;
});

SwipeToActionRoot.displayName = 'SwipeToActionRoot';
