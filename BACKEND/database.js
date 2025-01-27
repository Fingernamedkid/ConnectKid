import mysql from 'mysql2';
import dotenv from 'dotenv';


// -----------------------------------------          Config          ----------------------------------------------

dotenv.config();

const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
}).promise()


// -----------------------------------------         Queries         ----------------------------------------------


export async function getUserByUsernameOrEmailAndPassword(usernameOrEmail, password) {
    //DEBUG
    console.log(`Database : get user with username/email : ${usernameOrEmail} and password : ${password}`)
    //
    const [users] = await pool.query(`SELECT * FROM users WHERE (username=? OR email=?) AND password=?;`,[usernameOrEmail,usernameOrEmail,password])
    
    
    return users[0];
} 

export async function getUserByUsernameAndPassword(username, password){
    //DEBUG
    console.log(`Database : get users with username: ${username} and password : ${password}`)
    //
    const [rows] = await pool.query(`SELECT * FROM users WHERE username=? and password=?`,[username,password])
    return rows[0]
}

export async function getUserByUsernameOrEmail(username, email){
    //DEBUG
    console.log(`Database : get users with username: ${username} OR email : ${email}`)
    //
    const [rows] = await pool.query(`SELECT * FROM users WHERE username=? OR email=?`,[username,email])
    return rows[0]
}
export async function createUser(email, username, password){
    //DEBUG
    console.log(`Database : creating user with email: ${email}, username: ${username} and password : ${password}`)
    //
    const querry = await pool.query(`INSERT INTO users (username,email,password) VALUES (?,?,?);`,[username,email,password])
    const [rows] = await pool.query(`SELECT id, username, email FROM users WHERE username=? and email=?`,[username,email])
    return rows[0]
}

export async function getUserById(id){
    //Renvoi toutes les informations de l'utilisateur avec cet id
    //DEBUG
    console.log(`Database : get users by Id : ${id}`)
    //
    const [rows] = await pool.query(`SELECT * FROM users WHERE id=?`,[id])
    return rows[0]
}

export async function updateUserProfile(userData){
    //Modifie les données de l'utilisateur avec userData = {id,username,email,profilePic}
    //DEBUG
    console.log(`Database : update users with userData.id : ${userData.id}`)
    //
    const [rows] = await pool.query(`   UPDATE users
                                        SET 
                                            username = ?,
                                            email = ?,
                                            profilePic = ?

                                        WHERE id = ?;`,[userData.username,userData.email,userData.profilePic,userData.id])
    return true
}

export async function deleteUserById(id){
    //DEBUG
    console.log(`Database : delete users with id : ${id}`)
    //
    const status = await pool.query(`   DELETE FROM users
                                        WHERE id = ?;`,[id])
    return status[0].affectedRows
}


export async function getBlocks() {
    //DEBUG
    //
    const [blocks] = await pool.query(`SELECT username * FROM record;`)
    
    
    return blocks;
} 
// console.log(await getBlocks())
