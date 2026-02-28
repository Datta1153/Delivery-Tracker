// Script to exercise backend API features
import dotenv from 'dotenv';
import { execSync } from 'child_process';
// `fetch` is available globally in Node 18+


dotenv.config();
const API = process.env.API_URL || 'http://localhost:5000/api';

const log = console.log;

async function run() {
  log('--- seeding admin user');
  try {
    execSync('npm run seed', { cwd: './backend', stdio: 'inherit' });
  } catch (e) {
    log('seed script ended');
  }

  // login admin
  let token;
  {
    const res = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@deliverytracker.com', password: 'Admin@123' }),
    });
    const text = await res.text();
    log('login admin status', res.status, 'raw', text);
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      log('failed to parse JSON', e.message);
      throw e;
    }
    log('login admin', res.status, data.success ? 'OK' : data.message);
    token = data.token;
  }

  // create staff
  let staffEmail = 'staff1@example.com';
  {
    const res = await fetch(`${API}/auth/create-staff`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name: 'Staff One', email: staffEmail, password: 'password123' }),
    });
    const text = await res.text();
    log('create staff raw', res.status, text);
    let d;
    try { d = JSON.parse(text); } catch(e) { log('parse error create staff', e.message); }
    log('create staff', res.status, d?.message || d);
  }

  // create package as admin
  let pkg;
  {
    const res = await fetch(`${API}/packages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        senderName: 'Alice',
        senderAddress: '123 A St',
        recipientName: 'Bob',
        recipientAddress: '456 B Ave',
        description: 'Test package',
        weight: 2.5,
      }),
    });
    const text = await res.text();
    log('create package raw', res.status, text);
    let d;
    try { d = JSON.parse(text); } catch(e) { log('parse error create package', e.message); }
    log('create package', res.status, d?.message);
    pkg = d?.package;
  }

  // list packages
  {
    const res = await fetch(`${API}/packages`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const text = await res.text();
    log('list packages raw', res.status, text);
    let d;
    try { d = JSON.parse(text); } catch(e) { log('parse error list packages', e.message); }
    log('list packages', res.status, 'count', d?.total);
  }

  // update status
  {
    const res = await fetch(`${API}/packages/${pkg._id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status: 'shipped', location: 'Warehouse' }),
    });
    const text = await res.text();
    log('update status raw', res.status, text);
    let d;
    try { d = JSON.parse(text); } catch(e) { log('parse error update status', e.message); }
    log('update status', res.status, d?.message);
  }

  // public track
  {
    const res = await fetch(`${API}/track/${pkg.trackingNumber}`);
    const text = await res.text();
    log('public track raw', res.status, text);
    let d;
    try { d = JSON.parse(text); } catch(e) { log('parse error public track', e.message); }
    log('public track', res.status, d?.success ? 'found' : d?.message);
  }

  // reports
  {
    const res = await fetch(`${API}/reports/delivery-stats`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const text = await res.text();
    log('reports raw', res.status, text);
    let d;
    try { d = JSON.parse(text); } catch(e) { log('parse error reports', e.message); }
    log('reports', res.status, d?.stats?.length);
  }

  // delete package
  {
    const res = await fetch(`${API}/packages/${pkg._id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    const text = await res.text();
    log('delete package raw', res.status, text);
    let d;
    try { d = JSON.parse(text); } catch(e) { log('parse error delete package', e.message); }
    log('delete package', res.status, d?.message);
  }

  log('all steps done');
}

run().catch(err => console.error(err));
