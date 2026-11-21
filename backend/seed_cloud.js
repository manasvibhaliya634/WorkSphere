const mysql = require('mysql2/promise');
require('dotenv').config();

async function seedCloud() {
  console.log('Connecting to TiDB Cloud:', process.env.DB_HOST);
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'worksphere',
    ssl: { minVersion: 'TLSv1.2', rejectUnauthorized: true }
  });

  console.log('Checking departments...');
  const [deptRows] = await conn.execute('SELECT COUNT(*) as count FROM departments');
  if (deptRows[0].count === 0) {
    console.log('Seeding departments...');
    await conn.execute(`
      INSERT INTO departments (id, department_name, department_code, description, manager_name) VALUES
      (1, 'Executive Management', 'EXEC', 'Corporate governance, strategy and leadership', 'Vikramaditya Rao'),
      (2, 'Human Resources', 'HR', 'Talent acquisition, employee relations, compliance and payroll', 'Pooja Sharma'),
      (3, 'Engineering & Tech', 'ENG', 'Product design, software architecture, and cloud infrastructure', 'Arjun Verma'),
      (4, 'Marketing & Sales', 'MKT', 'Client acquisition, digital marketing and business growth', 'Neha Gupta'),
      (5, 'Finance & Accounts', 'FIN', 'Auditing, taxation, financial planning and risk management', 'Rajesh Patel')
    `);
    console.log('✔ 5 departments seeded.');
  } else {
    console.log(`✔ Departments already exist (${deptRows[0].count}).`);
  }

  const [tables] = await conn.execute('SHOW TABLES');
  console.log('Current Tables in TiDB Cloud:');
  for (const t of tables) {
    const tableName = Object.values(t)[0];
    const [countRow] = await conn.execute(`SELECT COUNT(*) as count FROM ${tableName}`);
    console.log(`  - ${tableName}: ${countRow[0].count} records`);
  }

  await conn.end();
  console.log('🎉 TiDB Cloud is 100% seeded and ready!');
}

seedCloud().catch(err => {
  console.error('Seed error:', err.message);
  process.exit(1);
});
