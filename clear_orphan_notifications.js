const mysql = require('mysql2/promise');
(async () => {
  const conn = await mysql.createConnection({ host: '127.0.0.1', user: 'root', password: '', database: 'community' });
  const [res] = await conn.execute('DELETE FROM notification WHERE type="system" AND related_id IS NULL AND title LIKE "【公告】%"');
  console.log("Deleted orphan announcements:", res.affectedRows);
  process.exit();
})();
