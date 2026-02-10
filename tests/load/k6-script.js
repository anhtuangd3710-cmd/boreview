/**
 * K6 Load Test Script
 * Run: k6 run tests/load/k6-script.js
 */

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const pageLoadTime = new Trend('page_load_time');

// Test configuration
export const options = {
  stages: [
    // Ramp-up
    { duration: '1m', target: 50 },
    // Stay at 50 users
    { duration: '3m', target: 50 },
    // Ramp-up to 100 users
    { duration: '1m', target: 100 },
    // Stay at 100 users
    { duration: '3m', target: 100 },
    // Spike to 200 users
    { duration: '30s', target: 200 },
    // Stay at 200 users
    { duration: '1m', target: 200 },
    // Ramp-down
    { duration: '1m', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests should be < 500ms
    http_req_failed: ['rate<0.01'], // Error rate should be < 1%
    errors: ['rate<0.05'], // Custom error rate < 5%
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
  group('Homepage', () => {
    const start = Date.now();
    const res = http.get(`${BASE_URL}/`);
    pageLoadTime.add(Date.now() - start);

    const success = check(res, {
      'status is 200': (r) => r.status === 200,
      'contains Bơ Review': (r) => r.body.includes('Bơ Review'),
    });

    errorRate.add(!success);
  });

  sleep(1);

  group('Blog Page', () => {
    const res = http.get(`${BASE_URL}/blog`);

    check(res, {
      'blog status is 200': (r) => r.status === 200,
      'contains posts section': (r) => r.body.includes('Bài viết'),
    });
  });

  sleep(1);

  group('API - Get Posts', () => {
    const res = http.get(`${BASE_URL}/api/posts`);

    const success = check(res, {
      'api status is 200': (r) => r.status === 200,
      'returns JSON': (r) => r.headers['Content-Type']?.includes('application/json'),
    });

    errorRate.add(!success);
  });

  sleep(0.5);

  group('Static Pages', () => {
    const pages = ['/about', '/contact', '/privacy'];
    const page = pages[Math.floor(Math.random() * pages.length)];

    const res = http.get(`${BASE_URL}${page}`);

    check(res, {
      'static page loads': (r) => r.status === 200,
    });
  });

  sleep(1);
}

// Stress test scenario
export function stressTest() {
  group('Stress - Heavy API Usage', () => {
    // Simulate heavy API usage
    for (let i = 0; i < 5; i++) {
      http.get(`${BASE_URL}/api/posts`);
    }
  });

  group('Stress - Concurrent Page Loads', () => {
    http.batch([
      ['GET', `${BASE_URL}/`],
      ['GET', `${BASE_URL}/blog`],
      ['GET', `${BASE_URL}/about`],
    ]);
  });

  sleep(0.5);
}

// Spike test scenario
export function spikeTest() {
  group('Spike - Sudden Load', () => {
    const responses = http.batch([
      ['GET', `${BASE_URL}/`],
      ['GET', `${BASE_URL}/blog`],
      ['GET', `${BASE_URL}/api/posts`],
      ['GET', `${BASE_URL}/about`],
      ['GET', `${BASE_URL}/contact`],
    ]);

    responses.forEach((res, index) => {
      check(res, {
        [`request ${index + 1} succeeded`]: (r) => r.status === 200,
      });
    });
  });

  sleep(0.2);
}

// Soak test for memory leaks
export function soakTest() {
  const res = http.get(`${BASE_URL}/`);
  check(res, {
    'soak test: page loads': (r) => r.status === 200,
  });
  sleep(2);
}

