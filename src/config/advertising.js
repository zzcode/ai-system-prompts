// Verified against the AdSense code generator; shared by both display placements.
export const adClient = 'ca-pub-1994527331032191';
export const displayAdSlot = '8332051975';

export function externalServicesEnabled(env) {
  return env.PUBLIC_EXTERNAL_SERVICES !== 'off'
    && !env.DEV
    && (!env.VERCEL_ENV || env.VERCEL_ENV === 'production');
}
