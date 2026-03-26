import posthog from 'posthog-js';

const POSTHOG_KEY = 'phc_UtkQeyklDA8wNmaQ3ZTDYNl9wJ9ExUs3BF1dX22hcJY';

let initialized = false;

export function initAnalytics(): void {
  if (initialized) return;
  try {
    posthog.init(POSTHOG_KEY, {
      api_host: 'https://us.i.posthog.com',
      persistence: 'localStorage',
      capture_pageview: true,
      capture_pageleave: true,
      autocapture: false, // we track custom events explicitly
    });
    initialized = true;
  } catch {
    // Analytics failure should never break the app
  }
}

// --- Custom Events ---

export function trackCharacterCreated(species: string, cls: string, background: string): void {
  posthog.capture('character_created', { species, class: cls, background });
}

export function trackCharacterLevelUp(characterName: string, fromLevel: number, toLevel: number): void {
  posthog.capture('character_level_up', { character_name: characterName, from_level: fromLevel, to_level: toLevel });
}

export function trackPlayModeEntered(characterName: string, cls: string, level: number): void {
  posthog.capture('play_mode_entered', { character_name: characterName, class: cls, level });
}

export function trackDiceRoll(rollType: string, label: string, total: number, isCrit: boolean, isFail: boolean, advantage?: string): void {
  posthog.capture('dice_roll', { roll_type: rollType, label, total, is_crit: isCrit, is_fail: isFail, advantage: advantage ?? 'normal' });
}

export function trackHomebrewCreated(contentType: 'species' | 'background', name: string): void {
  posthog.capture('homebrew_created', { content_type: contentType, name });
}

export function trackHomebrewImported(itemCount: number): void {
  posthog.capture('homebrew_imported', { item_count: itemCount });
}

export function trackCharacterExported(characterName: string): void {
  posthog.capture('character_exported', { character_name: characterName });
}

export function trackCharacterImported(count: number): void {
  posthog.capture('character_imported', { count });
}

export function trackPartyCreated(name: string, memberCount: number): void {
  posthog.capture('party_created', { name, member_count: memberCount });
}

export function trackCustomActionCreated(actionName: string, rollType: string): void {
  posthog.capture('custom_action_created', { action_name: actionName, roll_type: rollType });
}

export function trackFavoriteRollSaved(label: string): void {
  posthog.capture('favorite_roll_saved', { label });
}

export function trackViewChanged(view: string): void {
  posthog.capture('$pageview', { view });
}
