import { query } from './lib/db/postgres';

async function run() {
  try {
    const res1 = await query('SELECT id, client_id FROM survey_mdlsurvey LIMIT 5');
    console.log("survey_mdlsurvey:", res1.rows);
    
    const res2 = await query('SELECT id, client_key, name FROM clients_clientinfo LIMIT 5');
    console.log("clients_clientinfo:", res2.rows);

    const res3 = await query('SELECT count(*) FROM survey_mdlsurvey s INNER JOIN clients_clientinfo c ON s.client_id = c.id');
    console.log("join on c.id count:", res3.rows[0]);

    const res4 = await query('SELECT count(*) FROM survey_mdlsurvey s INNER JOIN clients_clientinfo c ON s.client_id = c.client_key');
    console.log("join on c.client_key count:", res4.rows[0]);

    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}

run();