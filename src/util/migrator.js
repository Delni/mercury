import Initial from '../migrations/201809072146-Initial'

/**
 * List all migrations to iterate over them.
 * Initial is a special case which shall be excluded when migrating old databases to migratable ones.
 * Migrations names must start (or only be) a number (for parseInt)
 * @type {{name, up, down}[]}
 */
const migrationScripts = [Initial]

export default {
  /**
   * Migrates to the latest database state.
   * @param db Database on with the migrations shall run.
   */
  migrate (db) {
    let currentVersion = null
    try {
      currentVersion = db.exec('SELECT name FROM version_history ORDER BY name DESC LIMIT 1')
      currentVersion = currentVersion.length > 0 ? parseInt(currentVersion[0]) : 0
    } catch (e) {
      console.error('Error while reading from version_history: ' + e)
      if (e.message.includes('no such table: version_history')) {
        // create version history if table is not existent
        // insert initial
        db.run('CREATE TABLE version_history (name varchar(128))')

        // skip initial migration and insert it manually if db is valid
        if (checkOldDb(db)) {
          console.log('Database matches old database schema. Migrating to new schema.')
          db.run(`INSERT INTO version_history (name) VALUES ('${Initial.name}')`)
        } else {
          migrateScript(db, Initial)
        }
      }
      return // don't continue when errors occur
    }

    let newMigrations = migrationScripts.filter(x => parseInt(x.name) > currentVersion)

    newMigrations.forEach(migration => {
      migrateScript(db, migration)
    })
  }
}

/**
 * Checks with simple count selects whether the db is and old one (without migration logic) or a new migratable one.
 * @param db Database to test.
 * @returns {boolean} Whether the database is old or new.
 */
function checkOldDb (db) {
  // sql to check if only old tables + version_history exist
  const tablesSql = `SELECT count(1) AS count FROM sqlite_master WHERE name NOT IN ('sqlite_sequence') AND sql LIKE 'CREATE TABLE%'`
  const versionsSql = `SELECT count(1) AS count FROM version_history`
  const result1 = db.exec(tablesSql)[0]
  const result2 = db.exec(versionsSql)[0]
  return result1.count === 5 && result2.count === 0
}

/**
 * Tries to migrate up or down for the given migration object.
 * @param db Database
 * @param obj Migration object. Must contain 'name', 'up' and 'down' properties. See Initial as example.
 * @param isDown Is this a down migration?
 */
function migrateScript (db, obj, isDown = false) {
  if (!isDown) {
    db.run(`
      BEGIN TRANSACTION;
      
      ${obj.up};
      
      INSERT INTO version_history (name) VALUES ('${obj.name}');
      
      COMMIT;
    `)
  } else {
    db.run(`
      BEGIN TRANSACTION;
      
      ${obj.down};
      
      DELETE FROM version_history WHERE name = ('${obj.name}');
      
      COMMIT;
    `)
  }
}
