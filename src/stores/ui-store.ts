import { create } from 'zustand';

export type View = 'characters' | 'create' | 'sheet' | 'homebrew' | 'play';
export type WizardStep = 'species' | 'background' | 'class' | 'abilities' | 'equipment' | 'spells' | 'review';

export const WIZARD_STEPS: WizardStep[] = ['species', 'background', 'class', 'abilities', 'equipment', 'spells', 'review'];

interface UIState {
  currentView: View;
  wizardStep: WizardStep;
  modalOpen: string | null;

  setView: (view: View) => void;
  setWizardStep: (step: WizardStep) => void;
  nextWizardStep: () => void;
  prevWizardStep: () => void;
  openModal: (id: string) => void;
  closeModal: () => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  currentView: 'characters',
  wizardStep: 'species',
  modalOpen: null,

  setView: (view) => set({ currentView: view }),
  setWizardStep: (step) => set({ wizardStep: step }),

  nextWizardStep: () => {
    const idx = WIZARD_STEPS.indexOf(get().wizardStep);
    if (idx < WIZARD_STEPS.length - 1) {
      set({ wizardStep: WIZARD_STEPS[idx + 1] });
    }
  },

  prevWizardStep: () => {
    const idx = WIZARD_STEPS.indexOf(get().wizardStep);
    if (idx > 0) {
      set({ wizardStep: WIZARD_STEPS[idx - 1] });
    }
  },

  openModal: (id) => set({ modalOpen: id }),
  closeModal: () => set({ modalOpen: null }),
}));
