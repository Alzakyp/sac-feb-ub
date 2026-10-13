import assert from 'node:assert/strict';
import { POST } from '../app/api/backoffice/logout/route';

async function main() {
  const response = await POST();
  assert.equal(response.status, 200);
  const cookie = response.headers.get('set-cookie') || '';
  assert.match(cookie, /sac_session=/);
  assert.match(cookie, /Max-Age=0/i);
  assert.match(cookie, /Path=\//i);
  console.log('Logout route test passed.');
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
