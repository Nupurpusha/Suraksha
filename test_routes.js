(async () => {
  const base = 'http://localhost:5000';
  function log(name, obj) { console.log('\n--- ' + name + ' ---'); console.log(JSON.stringify(obj, null, 2)); }

  try {
    // GET /
    let res = await fetch(base + '/');
    const rootText = await res.text();
    log('GET /', { status: res.status, body: rootText });

    // Register
    res = await fetch(base + '/api/users/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test User', email: 'test@example.com', password: 'Password123!' })
    });
    const reg = await res.json().catch(() => null);
    log('POST /api/users/register', { status: res.status, body: reg });

    let bearer = (reg && reg.token) ? reg.token : null;

    // If registration didn't return a token, try login
    if (!bearer) {
      res = await fetch(base + '/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@example.com', password: 'Password123!' })
      });
      const login = await res.json().catch(() => null);
      log('POST /api/auth/login', { status: res.status, body: login });
      bearer = login && login.token ? login.token : null;
    }

    // Public: POST /api/queries
    res = await fetch(base + '/api/queries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Visitor', email: 'vis@example.com', message: 'Hello', type: 'contact' })
    });
    const q = await res.json().catch(() => null);
    log('POST /api/queries', { status: res.status, body: q });

    // Public: POST /api/chat
    res = await fetch(base + '/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'How do I report an incident?' })
    });
    const chat = await res.json().catch(() => null);
    log('POST /api/chat', { status: res.status, body: chat });

    if (bearer) {
      // Protected: POST /api/reports
      res = await fetch(base + '/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-auth-token': bearer },
        body: JSON.stringify({ title: 'Test Report', description: 'Testing', location: 'Test Location', dateOfIncident: new Date().toISOString(), type: 'Other', otherType: 'Test', isAnonymous: false })
      });
      const rep = await res.json().catch(() => null);
      log('POST /api/reports', { status: res.status, body: rep });

      // Protected: POST /api/sos
      res = await fetch(base + '/api/sos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-auth-token': bearer },
        body: JSON.stringify({ latitude: 12.34, longitude: 56.78 })
      });
      const sos = await res.json().catch(() => null);
      log('POST /api/sos', { status: res.status, body: sos });
    } else {
      console.log('\nNo bearer token available; protected endpoints skipped.');
    }

  } catch (err) {
    console.error('TEST SCRIPT ERROR', err);
  }
})();
