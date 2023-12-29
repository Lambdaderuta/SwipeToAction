import type { Meta, StoryObj } from '@storybook/react';

import { SwipeToActionItem,  SwipeToActionRoot, VARIANT } from '~/components/SwipeToAction';

import styles from './SwipeToAction.module.css';

const createNumberArray = (length: number): number[] =>
  Array.from({ length }, (_, number) => number);

const meta = {
  title: 'Components/Shared/SwipeToAction',
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

const data = createNumberArray(5);

const SwipeToActionStory = () => {
  const bottomNode = <div className={styles.bottomNode}>Какой-то контент</div>;

  return (
    <div className={styles.container}>
      <SwipeToActionRoot variant={VARIANT.SINGULAR}>
        {data.map((el) => (
          <SwipeToActionItem
            key={el}
            id={el.toString()}
            direction={'left'}
            breakpointsToKeep={[0, 50, 250]}
            bottomNode={bottomNode}
          >
            <div className={styles.element}>{el}</div>
          </SwipeToActionItem>
        ))}
      </SwipeToActionRoot>
    </div>
  );
};

export const SwipeToAction: Story = {
  render: () => <SwipeToActionStory />,
};
