import dotenv from 'dotenv';
import { MongoClient,ServerApiVersion } from 'mongodb';
import { encryptPassword, decryptPassword } from './password.js';
// -----------------------------------------          Config          ----------------------------------------------

dotenv.config({ path: './setup.env' });
const uri = process.env.URL
const bd = process.env.DATABASE
const coll = process.env.COLLECTION
const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });
let db;
export async function run() {
    try {
      await client.connect();
      await client.db(bd).command({ ping: 1 });
      db = client.db(bd).collection(coll);
      console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } catch(exception){
        console.log(exception)
    }
  }

// -----------------------------------------          Functions          ----------------------------------------------

export async function getUserByUsernameOrEmailAndPassword(usernameOrEmail, password) {
  console.log(`Database : get user with username/email : ${usernameOrEmail} and password : ${password}`);
  const rows = await db.find({$or:[{username:usernameOrEmail}, {email:usernameOrEmail}]}).toArray();
  console.log(rows[0]);
  if (rows.length > 0) {
    const user = rows[0];
    const passworddecrypt = decryptPassword(user.password);
    console.log(passworddecrypt);
    console.log(password);
    if (passworddecrypt === password) {
      console.log(user);
      return user;
    }
  }
  console.log("No user found or password mismatch");
  return null;
}

export async function getUserByUsernameOrEmail(username, email) {
    console.log(`Database : get users with username: ${username} OR email : ${email}`);
    const rows = await db.find({$or:[{username: username}, {email: email}]}).toArray();
    console.log(rows[0]);
    return rows[0];
}
function generatePairid() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

export async function createUser(email, username, password, type, phonenum) {
  console.log(`Database : creating user with email: ${email}, username: ${username} and password : ${password}`);
  let largestId = await db.find({}).sort({ _id: -1 }).limit(1).toArray();
  let userId = largestId.length > 0 ? largestId[0]._id + 1 : 1;
  let pairId;
  while (true){
    pairId = generatePairid()
    if (!(await db.findOne({ pairId: pairId }))) {
      break;
    }
  }
  let user = { 
      _id: userId,
      email:email, 
      username:username,
      password: encryptPassword(password),
      pairId:pairId,
      type:type,
      status:"offline",
      contact:[],
      phonenum:phonenum,
      image64:""
  }
  await db.insertOne(user);
  let res = await getUserById(userId);
  console.log(res[0])
  return res
}

export async function getUserById(id) {
  console.log(`Database : get users by Id : ${id}`);
  id = parseInt(id);
  const rows = await db.find({_id: id}).toArray();

  if (rows.length === 0) {
      console.log(`No user found with id ${id}`);
      return null;
  }

  console.log("Got user with id " + id + ": ", rows[0]);
  return rows[0];
}

export async function updateUserProfile(userData){
    //Modifie les données de l'utilisateur avec userData = {id,username,email,profilePic}
    //DEBUG
    console.log(`Database : update users with userData.id : ${userData.id}`)
    //
    const query = { _id: parseInt(userData.id) };
    const update = {
      $set: {
        username: userData.username,
        email: userData.email,
        phonenum: userData.phonenum,
        image64: userData.profilePic
      }
    };
    await db.updateOne(query, update);
    return true
}
export async function findUserByPairId(pairId) {
  console.log(`Database : find user by pairId : ${pairId}`);
  const rows = await db.find({ pairId: pairId }).toArray();
  console.log(rows[0]);
  return rows[0];
}
export async function pairUser(id1,id2){
    //DEBUG
    console.log(`Database : pair users with id1 : ${id1} and id2 : ${id2}`)
    const user1 = await getUserById(id1);
    const user2 = await getUserById(id2);
    if (!user1.contact.includes(id2)) {
      await db.updateOne({ _id: parseInt(id1) }, { $push: { contact: id2 } });
    }
    if (!user2.contact.includes(id1)) {
      await db.updateOne({ _id: parseInt(id2) }, { $push: { contact: id1 } });
    }
    console.log("User paired successfully");
    return true
}
export async function getUserContacts(id){
    //DEBUG
    console.log(`Database : get user contacts with id : ${id}`)
    const user = await getUserById(id);
    let contacts = [];
    for (let i = 0; i < user.contact.length; i++) {
      let contact = await getUserById(user.contact[i]);
      contacts.push(contact);
    }
    console.log(contacts);
    return contacts;
}
export async function deleteUserById(id){
    //DEBUG
    const result = await db.deleteOne({ _id: parseInt(id) });

    // Return the number of deleted documents (equivalent to affectedRows in SQL)
    return result.deletedCount;
}

async function testCreateUser() {
  try {
      await run(); // Ensure DB connection
      const user = await createUser('test@example.com', 'testuser', 'password123');
      console.log('User created successfully:', user);
  } catch (err) {
      console.error('Error creating user:', err);
  }
}
