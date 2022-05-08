
const url =  process.env.DATABSE_URL || 'localhost';
const port =  process.env.DATABSE_PORT || '27017';
const database =  process.env.DATABSE_DB || 'test';


const connectionString = `mongodb://${url}:${port}/${database}`
export {
    url,
    port,
    database,
    connectionString
}