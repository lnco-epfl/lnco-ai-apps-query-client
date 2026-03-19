import { Context, LocalContext, PermissionLevel } from '@graasp/sdk';

import { setupServer } from 'msw/node';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { buildMSWMocks } from './handlers.js';

const appContextGet = vi.fn();
const appContextUpdate = vi.fn();
const appContextWhere = vi.fn();

vi.mock('./dexie-db.js', () => {
  class AppMocks {
    appContext = {
      get: appContextGet,
      update: appContextUpdate,
      where: appContextWhere,
    };

    on = vi.fn();
    resetDB = vi.fn();
  }

  return { AppMocks };
});

const apiHost = 'http://localhost:3000';

const buildContext = (accountId: string): LocalContext => ({
  apiHost,
  accountId,
  itemId: 'item-id',
  context: Context.Player,
  permission: PermissionLevel.Read,
});

describe('MSW mock context routes', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('reads context by accountId on GET /__mocks/context', async () => {
    const accountId = 'account-1';
    const context = buildContext(accountId);
    appContextGet.mockResolvedValue(context);

    const { handlers } = buildMSWMocks(context);
    const server = setupServer(...handlers);
    server.listen();

    try {
      const response = await fetch('http://localhost:3000/__mocks/context', {
        headers: { Authorization: `Bearer ${accountId}` },
      });

      expect(response.status).toBe(200);
      expect(appContextGet).toHaveBeenCalledWith(accountId);
      expect(appContextWhere).not.toHaveBeenCalled();

      const body = (await response.json()) as LocalContext;
      expect(body.accountId).toBe(accountId);
      expect(body.itemId).toBe('item-id');
    } finally {
      server.close();
    }
  });

  it('updates context by accountId on POST /__mocks/context', async () => {
    const accountId = 'account-2';
    const context = buildContext(accountId);
    const updatedContext = { ...context, dev: false };

    appContextUpdate.mockResolvedValue(1);
    appContextGet.mockResolvedValue(updatedContext);

    const { handlers } = buildMSWMocks(context);
    const server = setupServer(...handlers);
    server.listen();

    try {
      const response = await fetch('http://localhost:3000/__mocks/context', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accountId}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ dev: false }),
      });

      expect(response.status).toBe(200);
      expect(appContextUpdate).toHaveBeenCalledWith(accountId, { dev: false });
      expect(appContextGet).toHaveBeenCalledWith(accountId);
      expect(appContextWhere).not.toHaveBeenCalled();

      const body = (await response.json()) as LocalContext;
      expect(body.accountId).toBe(accountId);
      expect(body.dev).toBe(false);
    } finally {
      server.close();
    }
  });

  it('does not depend on memberId index in appContext routes', async () => {
    const accountId = 'account-3';
    const context = buildContext(accountId);
    appContextGet.mockResolvedValue(context);

    const { handlers } = buildMSWMocks(context);
    const server = setupServer(...handlers);
    server.listen();

    try {
      const getResponse = await fetch('http://localhost:3000/__mocks/context', {
        headers: { Authorization: `Bearer ${accountId}` },
      });
      expect(getResponse.status).toBe(200);

      const postResponse = await fetch('http://localhost:3000/__mocks/context', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accountId}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });
      expect(postResponse.status).toBe(200);

      expect(appContextWhere).not.toHaveBeenCalled();
    } finally {
      server.close();
    }
  });
});
