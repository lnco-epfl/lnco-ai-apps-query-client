import { Context, PermissionLevel } from '@graasp/sdk';

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
        customField: 'future-compatible',
      },
    });

    expect(context.screenCalibration).toEqual({
      scale: 1.25,
      fontSize: 'large',
      customField: 'future-compatible',
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
