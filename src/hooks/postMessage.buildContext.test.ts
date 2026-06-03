import { Context, PermissionLevel } from '@lnco-ai/sdk';

import { describe, expect, it } from 'vitest';

import { buildContext } from './postMessage.js';

describe('buildContext', () => {
  it('preserves screenCalibration when provided', () => {
    const context = buildContext({
      apiHost: 'https://graasp.org',
      accountId: 'account-id',
      itemId: 'item-id',
      context: Context.Player,
      permission: PermissionLevel.Write,
      screenCalibration: {
        scale: 1.25,
        fontSize: 'large',
      },
    });

    expect(context.screenCalibration).toEqual({
      scale: 1.25,
      fontSize: 'large',
    });
  });

  it('preserves participantId and participantCode when provided', () => {
    const context = buildContext({
      apiHost: 'https://graasp.org',
      accountId: 'account-id',
      itemId: 'item-id',
      context: Context.Player,
      permission: PermissionLevel.Write,
      screenCalibration: {
        participantId: 'participant-uuid',
        participantCode: 'ABC123',
      },
    });

    expect(context.screenCalibration).toEqual({
      participantId: 'participant-uuid',
      participantCode: 'ABC123',
    });
  });

  it('preserves all screenCalibration fields together', () => {
    const context = buildContext({
      apiHost: 'https://graasp.org',
      accountId: 'account-id',
      itemId: 'item-id',
      context: Context.Player,
      permission: PermissionLevel.Write,
      screenCalibration: {
        scale: 1.5,
        fontSize: 'extra-large',
        participantId: 'participant-uuid',
        participantCode: 'ABC123',
      },
    });

    expect(context.screenCalibration).toEqual({
      scale: 1.5,
      fontSize: 'extra-large',
      participantId: 'participant-uuid',
      participantCode: 'ABC123',
    });
  });

  it('keeps backward compatibility when calibration is absent', () => {
    const context = buildContext({
      apiHost: 'https://graasp.org',
      accountId: 'account-id',
      itemId: 'item-id',
      context: Context.Player,
      permission: PermissionLevel.Write,
    });

    expect(context.screenCalibration).toBeUndefined();
  });
});
