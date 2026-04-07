import http from 'k6/http';
import { check, sleep } from 'k6';

/**
 * Smoke test rápido — GET equivalente a:
 * curl https://jsonplaceholder.typicode.com/posts/1
 *
 * Otra URL: k6 run -e TARGET_URL=https://api.example/items/99 scripts/smoke.js
 */
export const options = {
  vus: 1,
  duration: '30s',
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<800'],
  },
};

const targetUrl =
  __ENV.TARGET_URL || 'https://jsonplaceholder.typicode.com/posts/1';

export default function () {
  const res = http.get(targetUrl);
  const body = res.json();
  check(res, {
    'status es 200': (r) => r.status === 200,
    'Content-Type JSON': (r) =>
      (r.headers['Content-Type'] || '').includes('application/json'),
    'json post válido (userId, id, title)': () =>
      body !== null &&
      typeof body.userId === 'number' &&
      typeof body.id === 'number' &&
      typeof body.title === 'string',
  });
  sleep(1);
}
