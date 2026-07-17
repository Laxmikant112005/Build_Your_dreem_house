const request = require('supertest');
const express = require('express');

// Very small smoke test example. Replace with real app import in real tests.

describe('Example test', () => {
  let app;
  beforeAll(() => {
    app = express();
    app.get('/_health', (req, res) => res.status(200).json({ ok: true }));
  });

  test('health endpoint returns 200', async () => {
    const res = await request(app).get('/_health');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });
});
