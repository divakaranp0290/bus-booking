// backend/tools/lock-test.js
const axios = require('axios');

const URL = process.env.API_URL || 'http://localhost:3000/api/booking/lock';
const busId = process.env.BUS_ID || 'BUS123';
const seatNo = process.env.SEAT_NO || 'A1';
const CONCURRENCY = Number(process.env.CONC || 40);

async function run() {
  const tasks = [];
  for (let i = 0; i < CONCURRENCY; i++) {
    tasks.push(axios.post(URL, { busId, seats: [seatNo], ttlMinutes: 5 }).then(r => ({ ok: true, data: r.data })).catch(e => ({ ok: false, status: e.response?.status, data: e.response?.data })));
  }
  const results = await Promise.all(tasks);
  let success = 0, conflict = 0, other = 0;
  results.forEach(r => {
    if (r.ok && r.data && r.data.lockRef) success++;
    else if (!r.ok && r.status === 409) conflict++;
    else other++;
  });
  console.log('Results:', { total: results.length, success, conflict, other });
  console.log(JSON.stringify(results, null, 2));
}

run().catch(console.error);
