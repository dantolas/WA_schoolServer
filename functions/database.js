import mysql  from 'mysql2/promise';
const config = require("../config.json")

export async function query(sql, params) {
    try{
    
        const connection     = await mysql.createConnection(config.db);
        const [rows,] = await connection.execute(sql, params);
        return rows
    }catch(e){
        throw e
    }
}