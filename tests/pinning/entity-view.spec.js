// Pinning tests for the useEntityView façade.
//
// These tests lock the CURRENT behaviour of the visibility helpers
// so any future refactor has to either match the table or knowingly
// update it. They exercise only the pure helpers exported via
// `_internals` — no Vue / Pinia setup required.
//
// To run (once a test runner is wired up):
//   pnpm vitest tests/pinning/entity-view.spec.js
//
// Until then, this file is a living spec of the rules and reads as
// documentation.

import { describe, it, expect } from 'vitest';
import { _internals } from '../../src/composables/useEntityView.js';

const { computeVisible, computeFactionIds, computeIsOwn } = _internals;

function viewer(bucket, isDM = false) {
  return { bucket, isDM };
}

function entity(overrides = {}) {
  return {
    id: 'e1',
    kind: 'npc',
    visible_to: new Set(['*']),
    ...overrides
  };
}

describe('computeVisible', () => {
  it('DM sees everything, including dm-only and empty visibility', () => {
    expect(computeVisible(entity({ visible_to: new Set() }), viewer(null, true))).toBe(true);
    expect(computeVisible(entity({ visible_to: new Set(['dm']) }), viewer(null, true))).toBe(true);
    expect(computeVisible(entity({ visible_to: new Set(['*']) }), viewer(null, true))).toBe(true);
  });

  it('entity visible to * is visible to every signed-in player', () => {
    const e = entity({ visible_to: new Set(['*']) });
    expect(computeVisible(e, viewer('baker'))).toBe(true);
    expect(computeVisible(e, viewer('butcher'))).toBe(true);
  });

  it('entity restricted to one bucket is invisible to other players', () => {
    const e = entity({ visible_to: new Set(['baker']) });
    expect(computeVisible(e, viewer('baker'))).toBe(true);
    expect(computeVisible(e, viewer('butcher'))).toBe(false);
    expect(computeVisible(e, viewer('charlie'))).toBe(false);
  });

  it('entity with empty visibility is hidden from all players', () => {
    const e = entity({ visible_to: new Set() });
    expect(computeVisible(e, viewer('baker'))).toBe(false);
    expect(computeVisible(e, viewer('butcher'))).toBe(false);
  });

  it('null entity is never visible', () => {
    expect(computeVisible(null, viewer('baker'))).toBe(false);
    expect(computeVisible(null, viewer(null, true))).toBe(false);
  });
});

describe('computeIsOwn', () => {
  it('matches a player-kind entity whose bucket equals viewer', () => {
    const e = entity({ kind: 'player', bucket: 'baker' });
    expect(computeIsOwn(e, viewer('baker'))).toBe(true);
    expect(computeIsOwn(e, viewer('butcher'))).toBe(false);
  });

  it('matches a personal_for tag on the entity', () => {
    const e = entity({ kind: 'npc', personal_for: 'baker' });
    expect(computeIsOwn(e, viewer('baker'))).toBe(true);
    expect(computeIsOwn(e, viewer('butcher'))).toBe(false);
  });

  it('returns false when viewer has no bucket', () => {
    const e = entity({ kind: 'player', bucket: 'baker' });
    expect(computeIsOwn(e, viewer(null))).toBe(false);
  });
});

describe('computeFactionIds', () => {
  it('returns ids from entities.factionsOfEntity', () => {
    const stub = {
      factionsOfEntity: (id) => id === 'e1' ? [{ id: 'f1' }, { id: 'f2' }] : []
    };
    expect(computeFactionIds(entity(), stub)).toEqual(['f1', 'f2']);
  });

  it('returns [] when entity has no id', () => {
    expect(computeFactionIds({}, { factionsOfEntity: () => [] })).toEqual([]);
  });

  it('swallows thrown errors from the store', () => {
    const stub = { factionsOfEntity: () => { throw new Error('boom'); } };
    expect(computeFactionIds(entity(), stub)).toEqual([]);
  });
});
