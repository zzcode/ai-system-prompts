import test from 'node:test';
import assert from 'node:assert/strict';
import { externalServicesEnabled } from '../src/config/advertising.js';

test('advertising and analytics are excluded from development and preview deployments', () => {
  for (const env of [{ DEV: true }, { VERCEL_ENV: 'preview' }, { VERCEL_ENV: 'development' }, { PUBLIC_EXTERNAL_SERVICES: 'off', VERCEL_ENV: 'production' }]) {
    assert.equal(externalServicesEnabled(env), false);
  }
});

test('production builds retain advertising unless explicitly disabled', () => {
  assert.equal(externalServicesEnabled({ DEV: false }), true);
  assert.equal(externalServicesEnabled({ DEV: false, VERCEL_ENV: 'production' }), true);
});
