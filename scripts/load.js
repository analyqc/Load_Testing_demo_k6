import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.2/index.js';

/**
 * Prueba de carga — GET https://jsonplaceholder.typicode.com/posts/1
 * Uso: k6 run scripts/load.js
 */
const errorRate = new Rate('errors');
const responseTime = new Trend('response_time');

export const options = {
  stages: [
    { duration: '30s', target: 10 },
    { duration: '1m', target: 10 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    errors: ['rate<0.05'],
    http_req_duration: ['p(95)<800'],
  },
};

const targetUrl =
  __ENV.TARGET_URL || 'https://jsonplaceholder.typicode.com/posts/1';

export default function () {
  const res = http.get(targetUrl);
  const body = res.json();
  const ok = check(res, {
    'status es 200': (r) => r.status === 200,
    'json post válido': () =>
      body !== null &&
      typeof body.userId === 'number' &&
      typeof body.id === 'number',
  });
  errorRate.add(!ok);
  responseTime.add(res.timings.duration);
  sleep(1);
}

export function handleSummary(data) {
  const quick = {
    vusMax: data.metrics.vus_max?.values?.max,
    httpReqs: data.metrics.http_reqs?.values?.count,
    failedRate: data.metrics.http_req_failed?.values?.rate,
    p95Duration: data.metrics.http_req_duration?.values?.['p(95)'],
  };
  return {
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
    'results/load-summary.json': JSON.stringify(quick, null, 2),
  };
}
