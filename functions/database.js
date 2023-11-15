import mysql  from 'mysql2/promise';
import config from "../config.json" with { type: "json" };

export async function query(sql, params) {
    try{
    
        const connection     = await mysql.createConnection(config.db);
        const [rows,] = await connection.execute(sql, params);
        return rows
    }catch(e){
        throw e
    }
}
