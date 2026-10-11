import { test } from 'node:test';
import assert from 'node:assert/strict';
import { QueryClient } from '@tanstack/react-query';
import { load } from './load-ts.mjs';

const token = (sub, sid, exp) => `header.${Buffer.from(JSON.stringify({ sub, sid, exp })).toString('base64url')}.signature`;

test('profile consumers and rotated tokens share one request, but different sessions do not', async () => {
  let calls = 0;
  const { profileQuery } = load('src/lib/profile-query.ts', {
    '@/features/profile/api/profile': { getProfile: async () => { calls++; return { user_name: `User ${calls}` }; } },
  });
  const client = new QueryClient();
  try {
    const first = profileQuery(token('user-1', 'session-1', 1));
    const [a, b] = await Promise.all([client.fetchQuery(first), client.fetchQuery(first)]);
    assert.equal(calls, 1);
    assert.deepEqual(a, b);
    await client.fetchQuery(profileQuery(token('user-1', 'session-1', 2)));
    assert.equal(calls, 1);
    await client.fetchQuery(profileQuery(token('user-2', 'session-2', 3)));
    assert.equal(calls, 2);
    await client.fetchQuery(profileQuery(token('user-1', 'session-3', 4)));
    assert.equal(calls, 3);
  } finally { client.clear(); }
});

test('a rate limited profile is requested once without automatic retries', async () => {
  const api = load('src/lib/api-client.ts');
  let calls = 0;
  const { profileQuery } = load('src/lib/profile-query.ts', {
    './api-client': api,
    '@/features/profile/api/profile': { getProfile: async () => { calls++; throw new api.ApiError('Wait', 429); } },
  });
  const client = new QueryClient();
  try {
    await assert.rejects(client.fetchQuery(profileQuery('access')), { status: 429 });
    assert.equal(calls, 1);
  } finally { client.clear(); }
});
