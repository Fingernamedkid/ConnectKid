import dotenv from 'dotenv';
import { MongoClient,ServerApiVersion } from 'mongodb';
import { encryptPassword, decryptPassword } from './password.js';
import { ObjectId } from 'mongodb';
// -----------------------------------------          Config          ----------------------------------------------
// const conversationSchema = {
//   _id: ObjectId,
//   participants: [Number], 
//   lastMessage: {
//     content: String,
//     sender: Number,
//     timestamp: Date
//   },
//   createdAt: Date,
//   updatedAt: Date
// }



// const messageSchema = {
//   _id: ObjectId,
//   conversationId: ObjectId,
//   sender: Number, 
//   content: String,
//   timestamp: Date,
//   read: Boolean
// }
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
let conversations;
let messages; 
export async function run() {
    try {
      await client.connect();
      await client.db(bd).command({ ping: 1 });
      db = client.db(bd).collection(coll);
      conversations = client.db(bd).collection('conversations');
      messages = client.db(bd).collection('messages')
      await conversations.createIndex({ participants: 1 });
      await messages.createIndex({ conversationId: 1 });
      await messages.createIndex({ sender: 1 });
      await messages.createIndex({ timestamp: -1 });
      console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } catch(exception){
        console.log(exception)
    }
  }

//   export async function run() {
//     try {
//         await client.connect();
//         await client.db(bd).command({ ping: 1 });
        
//         // Initialiser les collections
//         const database = client.db(bd);
//         usersCollection = database.collection(coll);
//         conversationsCollection = database.collection('conversations');
//         messagesCollection = database.collection('messages');

//         // Créer les index nécessaires
//         await conversationsCollection.createIndex({ participants: 1 });
//         await messagesCollection.createIndex({ conversationId: 1 });
//         await messagesCollection.createIndex({ sender: 1 });
//         await messagesCollection.createIndex({ timestamp: -1 });

//         console.log("Pinged your deployment. You successfully connected to MongoDB!");
        
//         // Rendre la collection users disponible pour les fonctions existantes
//         db = usersCollection;
        
//     } catch(exception) {
//         console.log(exception);
//     }
// }
// -----------------------------------------          Functions          ----------------------------------------------

export async function getUserByUsernameOrEmailAndPassword(usernameOrEmail, password) {
  console.log(`Database : get user with username/email : ${usernameOrEmail} and password : ${password}`);
  const rows = await db.find({$or:[{username:usernameOrEmail}, {email:usernameOrEmail}]}).toArray();
  console.log(rows[0]);
  if (rows.length > 0) {
    const user = rows[0];
    console.log()
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
        image64: userData.profilePic
      }
    };
    await db.updateOne(query, update);
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

// async function testCreateUser() {
//   try {
//       await run(); // Ensure DB connection
//       const user = await createUser('test@example.com', 'testuser', 'password123');
//       console.log('User created successfully:', user);
//   } catch (err) {
//       console.error('Error creating user:', err);
//   }
// }



export async function createConversation(participant1Id, participant2Id) {
  console.log("Creation d'une conversation")
  // let largestId = await conversations.find({}).sort({ _id: -1 }).limit(1).toArray();
  // let conversationId = largestId.length > 0 ? largestId[0]._id + 1 : 1;
  
  const existingConv = await conversations.findOne({
    participants: { 
      $all: [parseInt(participant1Id), parseInt(participant2Id)] 
    }
  });

  if (existingConv) {
    return existingConv;
  }

  const newConversation = {
    participants: [parseInt(participant1Id), parseInt(participant2Id)],
    lastMessage: null,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const result = await conversations.insertOne(newConversation);
  return result;
}


export async function sendMessage(senderId, conversationId, content) {

  const message = {
    conversationId: conversationId,
    sender: parseInt(senderId),
    content: content,
    timestamp: new Date(),
    read: false
  };

  await messages.insertOne(message);


  await conversations.updateOne(
    { _id: conversationId },
    { 
      $set: {
        lastMessage: {
          content: content,
          sender: parseInt(senderId),
          timestamp: new Date()
        },
        updatedAt: new Date()
      }
    }
  );

  return message;
}


export async function getConversationMessages(conversationId, limit = 50) {

  
  return await messages.find({ conversationId: conversationId })
    .sort({ timestamp: -1 })
    .limit(limit)
    .toArray();
}


export async function getUserConversations(userId) {

  
  return await conversations.find({
    participants: parseInt(userId)
  }).sort({ updatedAt: -1 }).toArray();
}


export async function markMessagesAsRead(conversationId, userId) {

  await messages.updateMany(
    {
      conversationId: conversationId,
      sender: { $ne: parseInt(userId) },
      read: false
    },
    { $set: { read: true } }
  );
}

// async function testCreateUser() {
//   try {
//       await run(); 
//       const user = await getConversationMessages('67b57730fa7746c098680521', 10);
//       console.log('MESSAGES created successfully:', user);
//   } catch (err) {
//       console.error('Error creating user:', err);
//   }
// }
// testCreateUser();

async function testGetMessages() {
  try {
    await run();
    const conversationId = '67b57730fa7746c098680521';
    const conversation1 = new ObjectId(conversationId);
    const messages = await getConversationMessages(conversation1, 10);
    
    console.log(`Total messages found: ${messages.length}`);
    
    messages.forEach((msg, index) => {
      console.log(`Message ${index + 1}:`, new Date(msg.timestamp).toISOString());
      console.log(msg.content?.substring(0, 50));
    });

  } catch (err) {
    console.error('Error in test:', err);
    throw err;
  }
}

testGetMessages()
  .then(() => console.log('Test completed'))
  .catch(err => console.error('Test failed:', err));