import React, { useState } from 'react';

import { toEther } from '../../utils/index.js';

const Goals = (props) => {

  const {
    weiPerRound,
    goals
  } = props;

  const [goalIndex, setGoalIndex] = useState(0);

  const goToNextGoal = () => {
    if (goalIndex >= 0 && goalIndex <= goals.length - 2) {
      setGoalIndex(goalIndex + 1);
    }
  }

  const goToPreviousGoal = () => {
    if (goalIndex >= 1 && goalIndex <= goals.length - 1) {
      setGoalIndex(goalIndex - 1);
    }
  }

  return (
    <div className='card'>

      <div className='card__heading card__heading__goals'>
        <p>Goals</p>
        <div className='card__heading__goals__buttons'>
          <button
            onClick={goToPreviousGoal}
            type='button'
            className='btn btn--s'
            disabled={!(goalIndex >= 1 && goalIndex <= goals.length - 1)}
          >
            <i className='lni lni-chevron-left'></i>
          </button>
          <button
            onClick={goToNextGoal}
            type='button'
            className='btn btn--s'
            disabled={!(goalIndex >= 0 && goalIndex <= goals.length - 2)}
          >
            <i className='lni lni-chevron-right'></i>
          </button>
        </div>
      </div>

      <Goal
        goal={goals[goalIndex]}
        goalIndex={goalIndex}
        goalsLength={goals.length}
        weiPerRound={weiPerRound}
      />

    </div>
  );
}

const Goal = (props) => {

  const {
    goal,
    goalIndex,
    goalsLength,
    weiPerRound,
  } = props;

  return (
    <div className='card__content'>
      <p><b>{goal[0]}</b> ETH per round</p>
      <progress value={toEther(weiPerRound)} max={goal[0]}></progress>
      <p>{goal[1]}</p>
      <p className='card__content__goals__small'>{`${goalIndex + 1} of ${goalsLength}`}</p>
    </div>
  );

}

export default Goals;