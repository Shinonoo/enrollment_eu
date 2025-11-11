const db = require('./database'); // Your existing mysql2 connection

// Create a wrapper function
function query(sql, params) {
    console.log('Executing SQL:', sql);
    console.log('With parameters:', params);
    return db.query(sql, params);
}

// Export an object mimicking your original db module with query function wrapped
module.exports = {
    query
};
