import type { Character } from '../../types/character.ts';
import { useContentStore } from '../../stores/content-store.ts';
import { useCharacterStore } from '../../stores/character-store.ts';
import { useUIStore } from '../../stores/ui-store.ts';
import { SKILL_LABELS } from '../../types/rules.ts';
import { AsiPicker } from '../homebrew/AsiPicker.tsx';
import type { AsiChoice } from '../../types/content.ts';

export function StepBackground({ character }: { character: Character }) {
  const backgroundsMap = useContentStore((s) => s.backgrounds);
  const backgroundsList = Object.values(backgroundsMap);
  const updateCharacter = useCharacterStore((s) => s.updateCharacter);
  const feats = useContentStore((s) => s.feats);
  const nextStep = useUIStore((s) => s.nextWizardStep);

  function handleSelect(bgId: string) {
    const bg = useContentStore.getState().backgrounds[bgId];
    if (!bg) return;
    updateCharacter(character.id, {
      backgroundId: bgId,
      skillProficiencies: [...bg.skillProficiencies],
      toolProficiencies: [bg.toolProficiency],
      backgroundAsi: bg.abilityScoreBonuses,
      featIds: [bg.originFeatId],
    });
  }

  function handleAsiChange(asi: AsiChoice) {
    updateCharacter(character.id, { backgroundAsi: asi });
  }

  const selectedBg = character.backgroundId
    ? useContentStore.getState().backgrounds[character.backgroundId]
    : null;

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Choose Your Background</h3>
      <div className="grid grid-cols-2 gap-3">
        {backgroundsList.map((bg) => {
          const selected = character.backgroundId === bg.id;
          const originFeat = feats[bg.originFeatId];
          return (
            <button
              key={bg.id}
              onClick={() => handleSelect(bg.id)}
              onDoubleClick={() => { handleSelect(bg.id); nextStep(); }}
              className={`text-left p-4 rounded-lg border-2 transition-colors ${
                selected
                  ? 'border-red-700 bg-red-50'
                  : 'border-stone-200 hover:border-stone-400'
              }`}
            >
              <div className="font-semibold">
                {bg.name}
                {bg.source === 'homebrew' && (
                  <span className="ml-2 text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">Homebrew</span>
                )}
              </div>
              <div className="text-sm text-stone-500 mt-1">
                {bg.skillProficiencies.map((s) => SKILL_LABELS[s]).join(', ')}
              </div>
              <div className="text-xs text-stone-400 mt-1">
                Origin Feat: {originFeat?.name ?? '—'}
              </div>
            </button>
          );
        })}
      </div>

      {selectedBg && (
        <div className="mt-4 p-4 bg-stone-50 rounded-lg space-y-3">
          <div>
            <span className="font-medium">Skills:</span>{' '}
            {selectedBg.skillProficiencies.map((s) => SKILL_LABELS[s]).join(', ')}
          </div>
          <div>
            <span className="font-medium">Tool:</span> {selectedBg.toolProficiency}
          </div>
          <div>
            <span className="font-medium">Origin Feat:</span>{' '}
            {feats[selectedBg.originFeatId]?.name ?? '—'}
            <p className="text-sm text-stone-500 mt-1">
              {feats[selectedBg.originFeatId]?.description}
            </p>
          </div>
          <div>
            <span className="font-medium">Ability Score Bonuses:</span>
            <div className="mt-2">
              <AsiPicker value={character.backgroundAsi} onChange={handleAsiChange} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
