import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { resolvePath } from './util.js';

sqlite3.verbose();

const db = await open({
  filename: resolvePath('/db.sqlite'),
  driver: sqlite3.Database,
});

console.log(db);

export default db;