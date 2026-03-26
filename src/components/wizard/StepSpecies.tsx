import type { Character } from '../../types/character.ts';
import { useContentStore } from '../../stores/content-store.ts';
import { useCharacterStore } from '../../stores/character-store.ts';
import { useUIStore } from '../../stores/ui-store.ts';

export function StepSpecies({ character }: { character: Character }) {
  const speciesMap = useContentStore((s) => s.species);
  const speciesList = Object.values(speciesMap);
  const updateCharacter = useCharacterStore((s) => s.updateCharacter);
  const nextStep = useUIStore((s) => s.nextWizardStep);

  function handleSelect(speciesId: string) {
    const species = useContentStore.getState().species[speciesId];
    updateCharacter(character.id, {
      speciesId,
      languages: species?.languages ?? ['Common'],
      speciesAsi: species?.abilityScoreBonuses,
    });
  }

  function handleDoubleClick(speciesId: string) {
    handleSelect(speciesId);
    nextStep();
  }

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Choose Your Species</h3>
      <div className="grid grid-cols-2 gap-3">
        {speciesList.map((sp) => {
          const selected = character.speciesId === sp.id;
          return (
            <button
              key={sp.id}
              onClick={() => handleSelect(sp.id)}
              onDoubleClick={() => handleDoubleClick(sp.id)}
              className={`text-left p-4 rounded-lg border-2 transition-colors ${
                selected
                  ? 'border-red-700 bg-red-50'
                  : 'border-stone-200 hover:border-stone-400'
              }`}
            >
              <div className="font-semibold">{sp.name}</div>
              <div className="text-sm text-stone-500 mt-1">
                Speed {sp.speed} ft · {Array.isArray(sp.size) ? sp.size.join(' or ') : sp.size}
                {sp.source === 'homebrew' && (
                  <span className="ml-2 text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">Homebrew</span>
                )}
              </div>
              <div className="text-xs text-stone-400 mt-2">
                {sp.traits.map((t) => t.name).join(', ')}
              </div>
            </button>
          );
        })}
      </div>
      {character.speciesId && (
        <div className="mt-4 p-4 bg-stone-50 rounded-lg">
          <h4 className="font-semibold mb-2">Traits</h4>
          {useContentStore.getState().species[character.speciesId]?.traits.map((t) => (
            <div key={t.id} className="mb-2">
              <span className="font-medium">{t.name}.</span>{' '}
              <span className="text-sm text-stone-600">{t.description}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
