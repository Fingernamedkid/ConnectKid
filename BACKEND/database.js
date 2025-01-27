import mysql from 'mysql2';
import dotenv from 'dotenv';
import { MongoClient,ServerApiVersion ,ObjectId} from 'mongodb';

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
      // Connect the client to the server	(optional starting in v4.7)
      await client.connect();
      // Send a ping to confirm a successful connection
      await client.db("mobile").command({ ping: 1 });
      db = client.db(bd).collection(coll);
      console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } catch(exception){
        console.log(exception)
    }
  }

// -----------------------------------------         Queries         ----------------------------------------------


export async function getUserByUsernameOrEmailAndPassword(usernameOrEmail, password) {
    //DEBUG
    console.log(`Database : get user with username/email : ${usernameOrEmail} and password : ${password}`)
    //
    const rows = await db.find({$or:[{username:usernameOrEmail}, {email:usernameOrEmail}],password:password}).toArray();
    
    console.log(rows[0])
    return rows[0];
} 

export async function getUserByUsernameAndPassword(username, password){
    //DEBUG
    console.log(`Database : get users with username: ${username} and password : ${password}`)
    //
    const rows = await pool.query(`SELECT * FROM users WHERE username=? and password=?`,[username,password])
    return rows[0]
}

export async function getUserByUsernameOrEmail(username, email) {
    // DEBUG
    console.log(`Database : get users with username: ${username} OR email : ${email}`);
    //
    const rows = await db.find({$or:[{username: username}, {email: email}]}).toArray();
    console.log(rows[0]);
    return rows[0];
}

export async function createUser(email, username, password) {
  // DEBUG
  console.log(`Database : creating user with email: ${email}, username: ${username} and password : ${password}`);
  
  let largestId = await db.find({}).sort({ _id: -1 }).limit(1).toArray();
  
  let userId = largestId.length > 0 ? largestId[0]._id + 1 : 1;
  
  let user = { 
      _id: userId,
      email:email, 
      username:username,
      password:password,
      routes:[],
      description:"",
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
        description: userData.description,
        image64: userData.profilePic
      }
    };
    await db.updateOne(query, update);
    return true
}

export async function deleteUserById(id){
    //DEBUG
    const result = await db.deleteOne({ _id: parseInt(id) });

    // Return the number of deleted documents (equivalent to affectedRows in SQL)
    return result.deletedCount;
}

export async function addtrips(id,locations,steps){
    //DEBUG
    console.log(`Database : add trips for user with id : ${id}`)
    //
    const query = { _id: id };
    const update = {
      $push: {
        routes: {
          steps: steps,
          date: new Date(),
          locations: locations,
        },
      },
    };
    await db.updateOne(query, update);
    
    return true
}
export async function gettrips(id,offset){
  //DEBUG
  console.log(`Database : find trips of user with id : ${id}`)
  //
  const res = db.aggregate([
    { $match: { _id: id } },
    { $unwind: "$routes" },
    { $sort: { "routes.date": -1 } },
    { $skip: offset },
    { $limit: 10 },
  ]);
  return res.toArray();
}


export async function getUserInfo(id){
  //DEBUG
  console.log(`Database : finding user info with Id : ${id}`)
  const res = await db.find({ _id: parseInt(id) }).project({ password: 0 }).toArray();
  return res[0];
}

export async function getTop10UsersByStepsLastTwoWeeks() {
  const today = new Date();
  const twoWeeksAgo = new Date(today);
  twoWeeksAgo.setDate(today.getDate() - 14);

  const pipeline = [
    { $unwind: "$routes" },
    {
      $match: {
        "routes.date": {
          $gte: twoWeeksAgo,
          $lte: today
        }
      }
    },
    { $sort: { "routes.steps": -1 } },
    { $limit: 10 },
    {
      $project: {
        _id: 1,
        username: 1,
        image64: 1,
        steps: "$routes.steps" 
      }
    }
  ];
  
  const result = await db.aggregate(pipeline).toArray();
  return result;
}
export async function getTop10UsersByLeastStepsLastTwoWeeks() {
  const today = new Date();
  const twoWeeksAgo = new Date(today);
  twoWeeksAgo.setDate(today.getDate() - 14);

  const pipeline = [
    { $unwind: "$routes" },
    {
      $match: {
        "routes.date": {
          $gte: twoWeeksAgo,
          $lte: today
        }
      }
    },
    { $sort: { "routes.steps": 1 } },
    { $limit: 10 },
    {
      $project: {
        _id: 1,
        username: 1,
        image64: 1,
        steps: "$routes.steps"
      }
    }
  ];

  const result = await db.aggregate(pipeline).toArray();
  return result;
}
export async function findLargestStepsofUserwitId(id) {
  console.log(`Database : find largest steps of user with id : ${id}`);

  const pipeline = [
    { $match: { _id: parseInt(id) } }, 
    { $unwind: "$routes" },  
    { $sort: { "routes.steps": -1 } },  
    { $limit: 1 },  
    {
      $project: {
        steps: "$routes.steps"  
      }
    }
  ];
  const result = await db.aggregate(pipeline).toArray();
  console.log(result)
  return result[0]?.steps;
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
