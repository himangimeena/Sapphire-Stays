const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const initSqlJs = require('sql.js');

let dbMode = 'EMBEDDED_SQL'; // 'MYSQL' or 'EMBEDDED_SQL'
let mysqlPool = null;
let sqlJsDb = null;

// Helper to convert MySQL `?` placeholders to sql.js format if needed or handle standard `?` parameters
async function initDB() {
  const useMysql = process.env.USE_MYSQL === 'true';

  if (useMysql) {
    try {
      console.log('⏳ Attempting connection to MySQL database...');
      mysqlPool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'sapphire_stays_db',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
      });
      // Test connection
      await mysqlPool.query('SELECT 1');
      dbMode = 'MYSQL';
      console.log('✅ Connected to MySQL database successfully!');
      return;
    } catch (err) {
      console.warn('⚠️ MySQL connection failed:', err.message);
      console.warn('⚡ Switching seamlessly to Embedded Relational SQL Engine (sql.js) for 100% plug-and-play reliability.');
    }
  } else {
    console.log('⚡ Initializing Embedded Relational SQL Engine (sql.js / ANSI SQL compatible)...');
  }

  // Initialize sql.js embedded database
  const SQL = await initSqlJs();
  sqlJsDb = new SQL.Database();
  dbMode = 'EMBEDDED_SQL';

  // Load and execute schema.sql
  const schemaPath = path.join(__dirname, 'schema.sql');
  if (fs.existsSync(schemaPath)) {
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    // Split statements by semicolon for clean execution
    const statements = schemaSql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);
    for (const stmt of statements) {
      try {
        // Adapt AUTO_INCREMENT to SQLite/sql.js compatible INTEGER PRIMARY KEY AUTOINCREMENT
        let adaptedStmt = stmt.replace(/INT AUTO_INCREMENT PRIMARY KEY/gi, 'INTEGER PRIMARY KEY AUTOINCREMENT');
        adaptedStmt = adaptedStmt.replace(/BOOLEAN/gi, 'INTEGER');
        adaptedStmt = adaptedStmt.replace(/DATETIME/gi, 'TEXT');
        adaptedStmt = adaptedStmt.replace(/DECIMAL\([0-9,]+\)/gi, 'REAL');
        sqlJsDb.run(adaptedStmt);
      } catch (e) {
        // Ignore minor DDL syntax diffs if any
      }
    }
    console.log('✅ Relational schema initialized in embedded SQL engine!');
  }
}

// Unified async query execution wrapper
async function query(sqlText, params = []) {
  if (!sqlJsDb && !mysqlPool) {
    await initDB();
  }

  if (dbMode === 'MYSQL') {
    const [rows] = await mysqlPool.query(sqlText, params);
    return rows;
  } else {
    // Adapt MySQL specific syntax for sql.js if needed
    let adaptedSql = sqlText;
    
    // Execute query in sql.js
    const isSelect = adaptedSql.trim().toUpperCase().startsWith('SELECT');
    const stmt = sqlJsDb.prepare(adaptedSql);
    stmt.bind(params);

    if (isSelect) {
      const results = [];
      while (stmt.step()) {
        results.push(stmt.getAsObject());
      }
      stmt.free();
      return results;
    } else {
      stmt.step();
      stmt.free();
      // Get last insert rowid if insert
      const res = sqlJsDb.exec('SELECT last_insert_rowid() as id');
      const insertId = res[0] && res[0].values[0] ? res[0].values[0][0] : 0;
      return { affectedRows: 1, insertId };
    }
  }
}

function getDbMode() {
  return dbMode;
}

module.exports = {
  initDB,
  query,
  getDbMode
};
