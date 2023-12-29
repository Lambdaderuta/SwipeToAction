import React, { ReactElement, useRef, useEffect, ReactNode } from 'react';
import { useMemoizedFn, useUpdateEffect } from 'ahooks';

import { ValueOf } from '~/typings';

import { parseOffset, findClosestInteger } from './libs';
import { useSwipeToActionContext }  from './context';
import { SWIPE_DIRECTION, VARIANT } from './constants';

import styles from './styles.module.css';

interface Props {
  id: string;
  children: ReactElement;
  /** Направление свайпа */
  direction: SwipeDirection;
  /** Лист брейкпоинтов, к которым будет магнитится элемент после свайпа */
  breakpointsToKeep: number[];
  /** Контент для отрисовки под элементом свайпа */
  bottomNode?: ReactNode;
  /** cb функция на достижение оффсета */
  onMaxOffsetReach?: () => void;
}

export interface SwipeToActionItem {
  resetTransition: () => void;
}

export type SwipeDirection = ValueOf<typeof SWIPE_DIRECTION>;

const DEFAULT_TRANSLATE = 0;

const easeOutCubic = 'cubic-bezier(0.33, 1, 0.68, 1)';

export const SwipeToActionItem = ({
  id,
  children,
  direction,
  breakpointsToKeep,
  bottomNode,
  onMaxOffsetReach,
}: Props): ReactElement => {
  const swipeContainerRef = useRef<HTMLDivElement>(null);
  const transitionInProgressRef = useRef(false);
  const isVerticalScroll = useRef<boolean>();
  const prevClientX = useRef<number>(DEFAULT_TRANSLATE);
  const prevClientY = useRef<number>(DEFAULT_TRANSLATE);
  const isTranslateExceedRef = useRef<boolean>(false);
  const maxOffset = breakpointsToKeep?.at(-1) ?? 0;

  const { activeItemId, setActiveItemId, variant } = useSwipeToActionContext();

  const traslateToDefault = (): void => {
    if (!swipeContainerRef.current) {
      return;
    }
    swipeContainerRef.current.style.transform = `translateX(${DEFAULT_TRANSLATE}px)`;
    swipeContainerRef.current.style.willChange = 'auto';
  };

  const handleTouchStart = (event: React.TouchEvent): void => {
    if (!swipeContainerRef.current) {
      return;
    }

    setActiveItemId(id);

    const { clientX, clientY } = event.touches[0] || event.changedTouches[0];

    prevClientX.current = clientX;
    prevClientY.current = clientY;

    swipeContainerRef.current.style.transition = `transform 200ms ${easeOutCubic} 0s`;
    swipeContainerRef.current.style.willChange = 'transform';

    isVerticalScroll.current = false;
  };

  const updateTranslate = ({
    isPrevOffsetBigger,
    clientX,
  }: {
    isPrevOffsetBigger: boolean;
    clientX: number;
  }): void => {
    if (!swipeContainerRef.current) {
      return;
    }

    const prevOffset = parseOffset(swipeContainerRef.current!.style.transform);

    const deltaScalar =
      prevClientX.current > clientX ? prevClientX.current - clientX : clientX - prevClientX.current;

    const correctedPrevOffset = !isNaN(prevOffset) ? prevOffset : DEFAULT_TRANSLATE;

    const delta = isPrevOffsetBigger ? -deltaScalar : deltaScalar;

    const newTranslate = correctedPrevOffset + Math.ceil(delta);
    const isTranslateExceeded = Math.abs(newTranslate) >= maxOffset;
    const maxTranslate = isTranslateExceeded ? maxOffset : newTranslate;
    const translateSign = Math.sign(newTranslate);

    if (
      (direction === SWIPE_DIRECTION.LEFT && newTranslate > DEFAULT_TRANSLATE) ||
      (direction === SWIPE_DIRECTION.RIGHT && newTranslate < DEFAULT_TRANSLATE)
    ) {
      traslateToDefault();
      return;
    }

    if (isTranslateExceeded) {
      isTranslateExceedRef.current = true;
      return;
    }

    isTranslateExceedRef.current = false;
    transitionInProgressRef.current = true;
    swipeContainerRef.current!.style.transform = `translateX(${
      Math.abs(maxTranslate) * translateSign
    }px)`;

    !isTranslateExceeded && (prevClientX.current = clientX);
  };

  const handleTouchMove = useMemoizedFn((event: TouchEvent): void => {
    const { clientX, clientY } = event.touches[0] || event.changedTouches[0];

    const clientXDiff = Math.abs(prevClientX.current - clientX);
    const clientYDiff = Math.abs(prevClientY.current - clientY);
    const isVerticalIsDominant = clientYDiff > clientXDiff;

    if ((isVerticalIsDominant && !transitionInProgressRef.current) || isVerticalScroll.current) {
      isVerticalScroll.current = true;
      return;
    }

    event.preventDefault();

    const isPrevOffsetBigger = prevClientX.current > clientX;

    updateTranslate({ isPrevOffsetBigger, clientX });
  });

  const handleTouchEnd = (): void => {
    if (!swipeContainerRef.current) {
      return;
    }

    if (isTranslateExceedRef.current) {
      onMaxOffsetReach?.();
    }

    swipeContainerRef.current.style.willChange = 'auto';
    prevClientX.current = 0;
    transitionInProgressRef.current = false;

    if (!breakpointsToKeep?.length) {
      swipeContainerRef.current.style.transform = 'translateX(0px)';
      return;
    }

    const currentOffcet = parseOffset(swipeContainerRef.current!.style.transform);

    const absoluteCurrOffset = Math.abs(currentOffcet);

    if (!absoluteCurrOffset) {
      return;
    }

    const sign = Math.sign(currentOffcet);
    const target = findClosestInteger(breakpointsToKeep ?? [0], absoluteCurrOffset);

    if (target === breakpointsToKeep.at(-1)) {
      onMaxOffsetReach?.();
    }

    if (!swipeContainerRef.current) {
      return;
    }

    swipeContainerRef.current.style.transform = `translateX(${target * sign}px)`;
  };

  useEffect(() => {
    if (!swipeContainerRef.current) {
      return;
    }

    swipeContainerRef.current.addEventListener('touchmove', handleTouchMove, {
      passive: false,
    });

    const cleanUp = () =>
      swipeContainerRef?.current?.removeEventListener('touchmove', handleTouchMove);

    return () => {
      cleanUp();
    };
  }, [handleTouchMove]);

  useUpdateEffect(() => {
    if (variant === VARIANT.SINGULAR && activeItemId && activeItemId !== id) {
      traslateToDefault();
    }
  }, [activeItemId, id]);

  return (
    <div className={styles.swipeContainer}>
      <div
        className={styles.swipeElement}
        ref={swipeContainerRef}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>
      <div className={styles.bottomNode}>{bottomNode}</div>
    </div>
  );
};
