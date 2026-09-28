const { pool } = require('../config/db');
(async function(){
  try {
    const [sizes] = await pool.query("SHOW COLUMNS FROM sizes");
    const [colors] = await pool.query("SHOW COLUMNS FROM colors");
    console.log('SIZES:', sizes);
    console.log('COLORS:', colors);
  } catch (e) {
    console.error('ERROR', e.message);
  } finally {
    await pool.end();
  }
})();
