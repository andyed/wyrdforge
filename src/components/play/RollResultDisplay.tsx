import type { DieRollResult } from '../../types/play.ts';
import { formatModifier } from '../../utils/dice.ts';
import { DiceAnimation } from './DiceAnimation.tsx';

interface Props {
  roll: DieRollResult;
  isRolling: boolean;
}

export function RollResultDisplay({ roll, isRolling }: Props) {
  const diceTotal = roll.dice.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="text-center">
      {/* Roll label */}
      <div className="text-sm text-stone-500 mb-1">{roll.label}</div>

      {/* Advantage indicator */}
      {roll.advantage && (
        <div className={`text-xs font-medium mb-2 ${
          roll.advantage === 'advantage' ? 'text-green-600' : 'text-red-600'
        }`}>
          {roll.advantage === 'advantage' ? 'Advantage' : 'Disadvantage'}
          {roll.d20Results && (
            <span className="text-stone-400 ml-1">
              ({roll.d20Results[0]} / {roll.d20Results[1]} → used {roll.usedD20})
            </span>
          )}
        </div>
      )}

      {/* Animated dice */}
      <DiceAnimation
        dice={roll.dice}
        isRolling={isRolling}
        isCriticalHit={roll.isCriticalHit}
        isCriticalFail={roll.isCriticalFail}
      />

      {/* Total */}
      <div className={`text-5xl font-black mt-2 transition-opacity duration-300 ${isRolling ? 'opacity-30' : 'opacity-100'}`}>
        {roll.isCriticalHit && <span className="wyrd-text text-3xl">NAT 20! </span>}
        {roll.isCriticalFail && <span className="text-red-500 text-3xl">NAT 1! </span>}
        <span className={roll.isCriticalHit ? 'wyrd-text' : roll.isCriticalFail ? 'text-red-500' : 'text-white'}>
          {roll.total}
        </span>
      </div>

      {/* Breakdown */}
      {!isRolling && (
        <div className="text-sm text-stone-500 mt-1">
          {diceTotal !== roll.total && (
            <>
              {diceTotal}
              {roll.flatModifier !== 0 && ` ${formatModifier(roll.flatModifier)}`}
              {roll.temporaryBonusFlat != null && roll.temporaryBonusFlat !== 0 && (
                <span className="text-purple-500"> {formatModifier(roll.temporaryBonusFlat)} temp</span>
              )}
              {roll.temporaryBonusDice && roll.temporaryBonusDice.length > 0 && (
                <span className="text-purple-500"> + bonus dice</span>
              )}
              {' = '}{roll.total}
            </>
          )}
        </div>
      )}
    </div>
  );
}
