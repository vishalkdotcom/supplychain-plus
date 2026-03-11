import { POST } from './app/api/jobs/calculate-risk/route';

async function run() {
  try {
    const req = new Request("http://localhost:3000/api/jobs/calculate-risk", {
      method: "POST",
      body: JSON.stringify({})
    });
    const res = await POST(req);
    const json = await res.json();
    console.log(json);
    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}

run();