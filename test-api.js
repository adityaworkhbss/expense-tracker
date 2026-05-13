const API_BASE_URL = 'http://localhost:3000';
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlYWE4OGEwYS0wZTcwLTRhYTEtODdmZC0wZDA2ZjgxNTZhODQiLCJlbWFpbCI6ImFkbWluQGV4cGVuc2UtdHJhY2tlci5jb20iLCJpYXQiOjE3Nzg2MTgyMDQsImV4cCI6MTc3OTIyMzAwNH0.M6PeIQxyVlmva_2CORxfcv53xC4kzTHF8qQraO7dPqE';

async function test() {
  try {
    console.log('Testing /analytics/excel-dashboard...');
    const res = await fetch(`${API_BASE_URL}/analytics/excel-dashboard`, {
      headers: { Authorization: `Bearer ${TOKEN}` }
    });
    const data = await res.json();
    console.log('Dashboard Response Status:', res.status);
    if (res.status !== 200) {
      console.log('Error Data:', JSON.stringify(data, null, 2));
    } else {
      console.log('Dashboard Data Keys:', Object.keys(data));
      console.log('Summary Data:', JSON.stringify(data.summary, null, 2));
    }
  } catch (err) {
    console.error('Error:', err.message);
  }
}

test();
