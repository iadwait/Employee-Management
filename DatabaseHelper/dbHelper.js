// This File for Database Helper
const mysql = require('mysql');

const connection = mysql.createConnection({
    host: process.env.DATABASE_HOSTNAME,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
});

// Make Database Connection
connection.connect((err) => {
    if (err) {
        console.log(err);
    } else {
        console.log('Database connected Successfully !!');
    }
});

module.exports = connection;