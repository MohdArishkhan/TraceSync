const Database = require('better-sqlite3');

const executeSqlTrace = (setupQuery, executionQuery, tableNamesToWatch = []) => {
    const db = new Database(':memory:');
    
    const trace = {
        before: {},
        after: {},
        result: null,
        executionPlan: []
    };

    try {
        if (setupQuery && setupQuery.trim() !== '') {
            db.exec(setupQuery);
        }

        tableNamesToWatch.forEach(tableName => {
            const stmt = db.prepare(`SELECT * FROM ${tableName}`);
            trace.before[tableName] = stmt.all();
        });

        const explainStmt = db.prepare(`EXPLAIN QUERY PLAN ${executionQuery}`);
        trace.executionPlan = explainStmt.all();

        const isSelect = executionQuery.trim().toUpperCase().startsWith('SELECT');

        if (isSelect) {
            const stmt = db.prepare(executionQuery);
            trace.result = stmt.all();
        } else {
            db.exec(executionQuery);
        }

        tableNamesToWatch.forEach(tableName => {
            const stmt = db.prepare(`SELECT * FROM ${tableName}`);
            trace.after[tableName] = stmt.all();
        });

        db.close();
        return trace;

    } catch (error) {
        if (db.open) db.close();
        throw {
            error: "SQL Execution Error",
            details: error.message
        };
    }
};

module.exports = { executeSqlTrace };