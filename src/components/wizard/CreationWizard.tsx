import { useUIStore, WIZARD_STEPS } from '../../stores/ui-store.ts';
import { useCharacterStore } from '../../stores/character-store.ts';
import { useContentStore } from '../../stores/content-store.ts';
import { StepSpecies } from './StepSpecies.tsx';
import { StepBackground } from './StepBackground.tsx';
import { StepClass } from './StepClass.tsx';
import { StepAbilities } from './StepAbilities.tsx';
import { StepEquipment } from './StepEquipment.tsx';
import { StepReview } from './StepReview.tsx';
import { computeMaxHP } from '../../selectors/hit-points.ts';
import { computeFinalScores } from '../../selectors/ability-scores.ts';
import { trackCharacterCreated } from '../../utils/analytics.ts';

const STEP_LABELS: Record<string, string> = {
  species: 'Species',
  background: 'Background',
  class: 'Class',
  abilities: 'Abilities',
  equipment: 'Equipment',
  spells: 'Spells',
  review: 'Review',
};

export function CreationWizard() {
  const { wizardStep, setWizardStep, nextWizardStep, prevWizardStep, setView } = useUIStore();
  const character = useCharacterStore((s) =>
    s.activeCharacterId ? s.characters[s.activeCharacterId] ?? null : null
  );
  const updateCharacter = useCharacterStore((s) => s.updateCharacter);
  const classes = useContentStore((s) => s.classes);

  if (!character) return <p className="text-stone-500 py-10">No character selected.</p>;

  const stepIdx = WIZARD_STEPS.indexOf(wizardStep);
  const classDef = classes[character.classId];

  // Skip spells step for non-casters
  const isSpellStep = wizardStep === 'spells';
  const isCaster = classDef?.spellcasting != null;
  if (isSpellStep && !isCaster) {
    // Auto-skip
    if (stepIdx < WIZARD_STEPS.length - 1) {
      nextWizardStep();
    }
  }

  function handleFinalize() {
    if (!character) return;
    const cls = classes[character.classId];
    const finalScores = computeFinalScores(character);
    const maxHP = cls ? computeMaxHP(cls.hitDie, character.level, finalScores) : 10;

    updateCharacter(character.id, {
      status: 'active',
      hitPoints: { max: maxHP, current: maxHP, temp: 0 },
      savingThrowProficiencies: cls?.savingThrows ? [...cls.savingThrows] : [],
    });

    const species = useContentStore.getState().species[character.speciesId];
    const bg = useContentStore.getState().backgrounds[character.backgroundId];
    trackCharacterCreated(species?.name ?? 'unknown', cls?.name ?? 'unknown', bg?.name ?? 'unknown');

    setView('sheet');
  }

  return (
    <div>
      {/* Step indicator */}
      <div className="flex gap-1 mb-6">
        {WIZARD_STEPS.map((step, i) => {
          if (step === 'spells' && !isCaster) return null;
          const active = step === wizardStep;
          const done = i < stepIdx;
          return (
            <button
              key={step}
              onClick={() => setWizardStep(step)}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                active
                  ? 'bg-red-800 text-white'
                  : done
                  ? 'bg-stone-300 text-stone-700'
                  : 'bg-stone-200 text-stone-400'
              }`}
            >
              {STEP_LABELS[step]}
            </button>
          );
        })}
      </div>

      {/* Step content */}
      <div className="bg-white rounded-lg shadow-sm border border-stone-200 p-6">
        {wizardStep === 'species' && <StepSpecies character={character} />}
        {wizardStep === 'background' && <StepBackground character={character} />}
        {wizardStep === 'class' && <StepClass character={character} />}
        {wizardStep === 'abilities' && <StepAbilities character={character} />}
        {wizardStep === 'equipment' && <StepEquipment character={character} />}
        {wizardStep === 'review' && <StepReview character={character} onFinalize={handleFinalize} />}
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-4">
        <button
          onClick={prevWizardStep}
          disabled={stepIdx === 0}
          className="px-4 py-2 rounded bg-stone-200 text-stone-700 hover:bg-stone-300 disabled:opacity-40"
        >
          Back
        </button>
        {wizardStep !== 'review' ? (
          <button
            onClick={nextWizardStep}
            className="px-4 py-2 rounded bg-red-700 text-white hover:bg-red-600"
          >
            Next
          </button>
        ) : (
          <button
            onClick={handleFinalize}
            className="px-4 py-2 rounded bg-green-700 text-white hover:bg-green-600"
          >
            Finish & View Sheet
          </button>
        )}
      </div>
    </div>
  );
}
