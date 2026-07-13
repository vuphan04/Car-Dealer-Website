const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { spawn } = require('node:child_process');

const rootDir = path.resolve(__dirname, '..');
const runtimeDir = path.join(rootDir, '.tmp', `role-permissions-${process.pid}`);
const port = 3900 + (process.pid % 500);
const baseUrl = `http://127.0.0.1:${port}`;

fs.mkdirSync(runtimeDir, { recursive: true });

const server = spawn(process.execPath, ['server.js'], {
  cwd: rootDir,
  env: {
    ...process.env,
    PORT: String(port),
    OKXE_DATA_DIR: runtimeDir,
    ADMIN_EMAILS: 'admin.permissions@okxe.test',
    STAFF_EMAILS: 'staff.permissions@okxe.test',
    SESSION_SECRET: 'role-permissions-test-secret',
  },
  stdio: ['ignore', 'pipe', 'pipe'],
});

let serverOutput = '';
server.stdout.on('data', (chunk) => { serverOutput += chunk.toString(); });
server.stderr.on('data', (chunk) => { serverOutput += chunk.toString(); });

const waitForServer = async () => {
  const deadline = Date.now() + 15000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${baseUrl}/api/cars`);
      if (response.ok) return;
    } catch (_error) {
      // Server is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`Server did not start in time.\n${serverOutput}`);
};

const request = async (url, { method = 'GET', body, cookie } = {}) => {
  const response = await fetch(`${baseUrl}${url}`, {
    method,
    headers: {
      ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
      ...(cookie ? { Cookie: cookie } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({}));
  return { response, data };
};

const signup = (fullName, email) => request('/api/auth/signup', {
  method: 'POST',
  body: { fullName, email, password: 'Permission123!' },
});

const adminLogin = async (email) => {
  const { response, data } = await request('/api/auth/admin-login', {
    method: 'POST',
    body: { email, password: 'Permission123!' },
  });
  assert.equal(response.status, 200, data.message);
  const cookie = String(response.headers.get('set-cookie') || '').split(';')[0];
  assert.match(cookie, /^okxe_admin_session=/);
  return cookie;
};

const assertStatus = async (expectedStatus, url, options, label) => {
  const { response, data } = await request(url, options);
  assert.equal(response.status, expectedStatus, `${label}: ${data.message || response.statusText}`);
  return data;
};

(async () => {
  try {
    await waitForServer();
    assert.equal((await signup('Permission Admin', 'admin.permissions@okxe.test')).response.status, 201);
    assert.equal((await signup('Permission Staff', 'staff.permissions@okxe.test')).response.status, 201);
    assert.equal((await signup('Permission Customer', 'customer.permissions@okxe.test')).response.status, 201);

    const adminCookie = await adminLogin('admin.permissions@okxe.test');
    const staffCookie = await adminLogin('staff.permissions@okxe.test');

    const adminMe = await assertStatus(200, '/api/auth/admin-me', { cookie: adminCookie }, 'Admin profile');
    const staffMe = await assertStatus(200, '/api/auth/admin-me', { cookie: staffCookie }, 'Staff profile');
    assert.equal(adminMe.user.canAccessAdmin, true);
    assert.equal(adminMe.user.isAdmin, true);
    assert.equal(staffMe.user.canAccessAdmin, true);
    assert.equal(staffMe.user.isAdmin, false);

    const staffCars = await assertStatus(200, '/api/admin/cars', { cookie: staffCookie }, 'Staff can view cars');
    assert.ok(staffCars.cars.length > 0, 'Seeded inventory must contain at least one car.');
    const firstCar = staffCars.cars[0];

    const staffCustomers = await assertStatus(200, '/api/admin/users', { cookie: staffCookie }, 'Staff can view customer contacts');
    const visibleCustomer = staffCustomers.users.find((user) => user.email === 'customer.permissions@okxe.test');
    assert.ok(visibleCustomer, 'Staff must see the customer contact created by the test.');
    assert.equal(Object.hasOwn(visibleCustomer, 'citizenId'), false, 'Staff response must not expose CCCD.');
    assert.equal(Object.hasOwn(visibleCustomer, 'birthDate'), false, 'Staff response must not expose birth date.');

    const staffKpi = await assertStatus(200, '/api/admin/sales-kpi-records', { cookie: staffCookie }, 'Staff can view personal KPI');
    assert.equal(staffKpi.readOnly, true);
    assert.ok(staffKpi.records.every((record) => Number(record.saleUserId) === Number(staffMe.user.id)));

    const adminKpi = await assertStatus(200, '/api/admin/sales-kpi-records', { cookie: adminCookie }, 'Admin can view all KPI');
    assert.equal(adminKpi.readOnly, false);

    const staffForbiddenChecks = [
      ['DELETE', `/api/cars/${firstCar.id}`, undefined, 'delete car'],
      ['PATCH', '/api/admin/deposit-payment/config', {}, 'change deposit config'],
      ['POST', '/api/admin/promotions', {}, 'create promotion'],
      ['POST', '/api/admin/blog-posts', {}, 'create blog post'],
      ['PATCH', '/api/admin/car-sell-requests/999999/approve', {}, 'approve car intake'],
      ['DELETE', '/api/admin/car-buy-requests/999999', undefined, 'delete buy request'],
      ['DELETE', '/api/admin/consultation-requests/999999', undefined, 'delete consultation'],
      ['DELETE', '/api/admin/test-drive-appointments/999999', undefined, 'delete test drive'],
      ['POST', '/api/admin/users', {}, 'manage users'],
    ];

    for (const [method, url, body, label] of staffForbiddenChecks) {
      await assertStatus(403, url, { method, body, cookie: staffCookie }, `Staff cannot ${label}`);
    }

    await assertStatus(403, `/api/cars/${firstCar.id}`, {
      method: 'PUT',
      cookie: staffCookie,
      body: {
        ...firstCar,
        priceText: firstCar.price,
        mileageText: firstCar.mileage,
        actionText: firstCar.actionText === 'Còn xe' ? 'Xe đã bán' : 'Còn xe',
      },
    }, 'Staff cannot change car status');

    const adminValidation = await request('/api/admin/promotions', {
      method: 'POST',
      body: {},
      cookie: adminCookie,
    });
    assert.equal(adminValidation.response.status, 400, 'Admin must pass authorization before payload validation.');

    const staffOperational = await request('/api/admin/consultation-requests/999999/status', {
      method: 'PATCH',
      body: { status: 'contacted', statusNote: 'Đã liên hệ kiểm thử phân quyền.' },
      cookie: staffCookie,
    });
    assert.notEqual(staffOperational.response.status, 403, 'Staff must retain consultation workflow permission.');

    console.log('Role permission integration tests passed.');
  } finally {
    server.kill();
    await new Promise((resolve) => server.once('exit', resolve));
    fs.rmSync(runtimeDir, { recursive: true, force: true });
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
