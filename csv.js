import fs from 'fs';
import csv from 'csv-parser';
import mysql from 'mysql2';

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '0212',
    database: 'csv_db'
});

connection.connect((error) => {
    if (error) throw error;

    console.log('Conectado exitosamente a la db');
})

fs.createReadStream('data.csv')
    .pipe(csv())
    .on('data', (row) => {

        console.log(row);
        console.log('--');

    })
    .on('end', () => {
        console.log('CSV único procesado.');
        connection.end();
    });
