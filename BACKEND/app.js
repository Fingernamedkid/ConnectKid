import express from 'express';
import {getUserByUsernameOrEmailAndPassword,getUserContacts, updateUserStatus,createUser,getUserById, getDevices, findUserByPairId,deleteDevice, getContactslocation, addDevice, saveLocation,updateUserProfile, deleteUserById, getUserByUsernameOrEmail, pairUser, run, createConversation, getUserConversations, sendMessage, getConversationMessages, markMessagesAsRead} from './database.js';
import jwt from 'jsonwebtoken';
import cors from 'cors'
import e from 'express';
import { ObjectId } from 'mongodb';
import { WebSocketServer } from 'ws';
import dotenv from 'dotenv';

dotenv.config({ path: './.env' });
const SECRET_KEY = 'your_secret_key'; // Use a strong secret key in production
const PORT = process.env.PORT || 8080;
const app = express();
run();


// Use CORS middleware
app.use(cors());

app.use(express.json({ limit: '100mb' }));  // For parsing JSON payloads
app.use(express.urlencoded({ limit: '100mb', extended: true }))
const server = app.listen(PORT, () => {
    console.log('Server is running on port 8080')
})  

const wss = new WebSocketServer({ server });
console.log("Websocket server started on port 8080");
wss.on('connection', (ws, req) => {
    const token = req.url.split('?token=')[1];
    if (!token) {
      ws.close();
      return;
    }
    let decoded;
    try {
      decoded = jwt.verify(token, SECRET_KEY);
    } catch (error) {
      ws.close();
      return;
    }
    const userId = decoded.userId;
    ws.userId = userId;
    updateUserStatus(userId, true);
    const interval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'ping' }));
        }
    }, 30000); 
    ws.on('close', () => {
      clearInterval(interval);
      updateUserStatus(userId, false);
      console.log("Connection closed");
    });
  });

    const notifyUser = (userId, message, type) => {
    wss.clients.forEach((client) => {
        console.log("Message userId: ", client);
        if (client.userId === userId && client.readyState === WebSocket.OPEN) {
            console.log("Sending message to user: ", userId);
            client.send(JSON.stringify({ type: type, ...message }));
        }
    });
};

app.post("/users/signin", async (req, res) => {
    const { usernameOrEmail, password } = req.body;
    console.log("Post : users/signin")
    console.log(usernameOrEmail);
    if (!usernameOrEmail || !password) {
        return res.status(400).json({ error: "Username or email and password are required." });
    }
    try {
        console.log(`End point request with user/email : ${usernameOrEmail} and pass : ${password}`)
        const user = await getUserByUsernameOrEmailAndPassword(usernameOrEmail, password);
        if (!user) {
            return res.status(401).json({ error: "Invalid username/email or password." });
        }
        const userId = user._id
        
        const token = jwt.sign({ userId }, SECRET_KEY, { expiresIn: '1h' });
        console.log(token)
        res.status(200).json({
            id: user._id,
            username: user.username,
            email: user.email,
            token
        });
    } catch (error) {
        console.error('Error retrieving user: ', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get("/contacts", async (req, res) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(403).send('Forbidden');
    const decoded = jwt.verify(token, SECRET_KEY); // Synchronous verification
    if (!decoded?.userId) {
        return res.status(401).json({ error: "Unauthorized: Invalid token" });
    }
    try {
        const contacts = await getUserContacts(decoded.userId);
        if (!contacts) {
            return res.status(404).json({ error: `Aucun conctact d'utilisateur pour l'id : ${decoded.userId}`});
        }
        res.status(200).json({
            contacts: contacts
        });
    } catch (error) {
        console.error('Error fetching contacts: ', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
  });
  
app.post("/users", async (req, res) => {
    const { username, password, email, type, phonenum  } = req.body;
    if (!username || !password || !email) {
        return res.status(400).json({ error: "Username, password, and email are required." });
    }

    try {
        const existingUser = await getUserByUsernameOrEmail(username, email);
        if (existingUser) {
            return res.status(409).json({ error: "Username or email already exists." });
        }
        const newUser = await createUser( email, username, password, type, phonenum );
        const token = jwt.sign({ userId:newUser._id }, SECRET_KEY, { expiresIn: '1h' });
        console.log(token)
        res.status(201).json({
            id: newUser._id,
            username: newUser.username,
            email: newUser.email,
            token
            
        });
    } catch (error) {
        console.error('Error during signup: ', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

app.post("/users/pair", async (req, res) => {
    try{
        
        const token = req.headers['authorization']?.split(' ')[1];
        if (!token) return res.status(403).send('Forbidden');
        const decoded = jwt.verify(token, SECRET_KEY); // Synchronous verification
        
        console.log("decoding:" ,decoded.userId)
        const user = await getUserById(decoded.userId);
        if (!user) {
            return res.status(404).json({ error: `Aucun utilisateur pour l'id : ${decoded.userId}`});
        }
        const { pairId } = req.body;
        if (!pairId) {
            return res.status(400).json({ error: "Pair ID is required." });
        }
        const pair = await findUserByPairId(pairId);
        if (!pair) {
            return res.status(404).json({ error: `Aucun utilisateur pour l'id : ${pairId}`});
        }
        if (pair.pairId == user.pairId) {
            return res.status(409).json({ error: "User is already paired." });
        }
        const pairUserres = await pairUser(decoded.userId, pair._id);
        if (!pairUserres) {
            return res.status(404).json({ error: `Aucun utilisateur pour l'id : ${pairId}`});
        }else{
        res.status(200).json({ message: "Success"}

        );

    }
    }catch (error) {
        
        console.error('Error fetching profile Data: ', error);
        res.status(500).json({ error: 'Internal server error.' });
    } 
});

app.get("/users/:id", async (req, res) => {
    try {
        const token = req.headers['authorization']?.split(' ')[1];
        if (!token) return res.status(403).send('Forbidden');
        const userId = req.params.id; 
        if (!userId) {
            return res.status(400).json({ error: "Request missing parameters" });
        }
        const decoded = jwt.verify(token, SECRET_KEY); 
        if (!decoded?.userId) {
            return res.status(401).json({ error: "Forbidden: badToken" });
        }
        
         if (decoded.userId != userId) {
            return res.status(409).json({ error: "Forbidden: you are not allowed to get this info" });
         }
        // get user data
        const user = await getUserById(userId);
        console.log(userId);
        if (!user) {
            return res.status(404).json({ error: `Aucun utilisateur pour l'id : ${_id}`});
        }
        console.log("Found user: ",user)
        let steps = 0;
        if (user.routes && user.routes.length !== 0) {
            steps = user.routes[user.routes.length - 1].steps
        }
        console.log(steps)
        // Return the information
        res.status(200).json({
            id: user._id,
            username: user.username || "",
            email: user.email || "",
            image64: user.image64 || "",
            phonenum: user.phonenum || "",
            pairId: user.pairId || "",
            type: user.type || ""
        });
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            return res.status(401).send('Invalid token'); // Handle JWT-specific errors
        }
        console.error('Error fetching profile Data: ', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});
app.get("/usercontact/:id", async (req, res) => {
    try {
        const token = req.headers['authorization']?.split(' ')[1];
        if (!token) return res.status(403).send('Forbidden');
        const userId = req.params.id; 
        if (!userId) {
            return res.status(400).json({ error: "Request missing parameters" });
        }
        const decoded = jwt.verify(token, SECRET_KEY); 
        if (!decoded?.userId) {
            return res.status(401).json({ error: "Forbidden: badToken" });
        }
        
        // if (decoded.userId != userId) {
        //     return res.status(409).json({ error: "Forbidden: you are not allowed to get this info" });
        // }
        // get user data
        const user = await getUserById(userId);
        console.log(userId);
        if (!user) {
            return res.status(404).json({ error: `Aucun utilisateur pour l'id : ${_id}`});
        }
        console.log("Found user: ",user)
        let steps = 0;
        if (user.routes && user.routes.length !== 0) {
            steps = user.routes[user.routes.length - 1].steps
        }
        console.log(steps)
        // Return the information
        res.status(200).json({
            id: user._id,
            username: user.username || "",
            image64: user.image64 || "",
            phonenum: user.phonenum || "",
            pairId: user.pairId || "",
            type: user.type || "",
            status: user.status || ""
        });
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            return res.status(401).send('Invalid token'); // Handle JWT-specific errors
        }
        console.error('Error fetching profile Data: ', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

app.get("/contacts", async (req, res) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(403).send('Forbidden');
    const decoded = jwt.verify(token, SECRET_KEY); // Synchronous verification
    if (!decoded?.userId) {
        return res.status(401).json({ error: "Unauthorized: Invalid token" });
    }
    try {
        const contacts = await getUserContacts(decoded.userId);
        if (!contacts) {
            return res.status(404).json({ error: `Aucun conctact d'utilisateur pour l'id : ${decoded.userId}`});
        }
        res.status(200).json({
            contacts: contacts
        });
    } catch (error) {
        console.error('Error fetching contacts: ', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});
app.get("/users/image/:id", async (req, res) => {
    try {
        const userId = req.params.id; 
        if (!userId) {
            return res.status(400).json({ error: "Request missing parameters" });
        }
        const token = req.headers['authorization']?.split(' ')[1];
        if (!token) return res.status(403).send('Forbidden');
        const decoded = jwt.verify(token, SECRET_KEY);
        if (!decoded?.userId) {
            return res.status(401).json({ error: "Unauthorized: Invalid token" });
        }
        const user = await getUserById(userId);
        if (!user) {
            return res.status(404).json({ error: `Aucun utilisateur pour l'id : ${userId}`});
        }
        res.status(200).json({
            image64: user.image64
        });
    } catch (error) {
        console.error('Error fetching image: ', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
}
);

app.put("/users/:id", async (req, res) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(403).send('Forbidden');
    const userId = req.params.id; 
    const userData  = req.body;
    console.log(req.body)
    if(!userData || userId != userData?.id){
        return res.status(409).json({ error: "Request missing userData" });

    }
    // Verify the token
    const decoded = jwt.verify(token, SECRET_KEY); // Synchronous verification
    if (!decoded?.userId) {
        return res.status(401).json({ error: "Forbidden: badToken" });
    }
    
    if (decoded.userId != userId) {
        return res.status(409).json({ error: "Forbidden: you are not allowed to get this info" });
    }
    try {
        // Check for missing fields
        if (!userData?.id || !userData?.username || !userData?.email || !userData?.profilePic) {
            return res.status(400).json({ error: "Request body missing parameters" });
        }

        // alter user data
        const user = await updateUserProfile(userData);
        if (!user) {
            return res.status(404).json({ error: `Error while updating data`});
        }

        // Return the information
        res.status(200).json({
            message:"Success"
        });
    } catch (error) {
        console.error('Error updating profile Data: ', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

app.delete("/users/:id", async (req, res) => {
    try {
        const token = req.headers['authorization']?.split(' ')[1];
        if (!token) return res.status(403).send('Forbidden');
        
        const userId = req.params.id; 
        
        // Verify the token
        const decoded = jwt.verify(token, SECRET_KEY); // Synchronous verification
        if (!decoded?.userId) {
            return res.status(401).json({ error: "Unauthorized: Invalid token" });
        }
        
        if (decoded.userId != userId) {
            return res.status(403).json({ error: "Forbidden: you are not allowed to delete this user" });
        }

        const user = await deleteUserById(userId);
        if (!user) {
            return res.status(404).json({ error: `Aucun utilisateur pour l'id : ${id}`});
        }

        // Return the information
        res.status(200).json({
            message:"Success"
        });
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            return res.status(401).send('Invalid token'); // Handle JWT-specific errors
        }
        console.error('Error deleting user: ', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

app.post("/users/authenticate", async (req, res) => {
    try {
        const token = req.headers['authorization']?.split(' ')[1];
        if (!token) return res.status(403).send('Forbidden');
        const decoded = jwt.verify(token, SECRET_KEY); // Synchronous verification
        if (!decoded?.userId) {
            return res.status(409).json({ error: "Forbidden: badToken" });
        }
        res.status(200).json({
            id: decoded.userId,
        });
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            return res.status(401).json({ error: 'Token expired' });
        }
        console.error('Error during authenticate: ', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});
app.post('/conversation/add', async (req, res ) =>{
    try{
        const {participant1, participant2} = req.body;
        console.log(participant1, participant2)
        const token = req.headers['authorization']?.split(' ')[1]; 
        if(!token) return res.status(403).send('Forbidden');
        const decoded = jwt.verify(token, SECRET_KEY);
        if (!decoded?.userId) {
            return res.status(409).json({ error: "Forbidden: badToken" });
        }
        const conversation = await createConversation(participant1, participant2);
        res.status(200).json([{
           message : "Succès",
           conversation: conversation
        }])
        
    } catch(error){
        console.error('Error fetching creating a conversation: ', error);
        res.status(500).json({ error: 'Internal server error.' });

    }
})
app.get('/conversation/:id', async (req, res) =>{
    try{
        const userId = req.params.id;    
        const token = req.headers['authorization']?.split(' ')[1];
        if(!token) return res.status(403).send('Forbidden');
        const decoded = jwt.verify(token, SECRET_KEY);
        if (!decoded?.userId) {
           return res.status(409).json({ error: "Forbidden: badToken" });
        }
        const conversation =await getUserConversations(userId);
        res.status(200).json(conversation.map(conv => ({
            id: conv._id,
            participants: conv.participants,
            lastMessage: conv.lastMessage,  
            createdAt: conv.createdAt,
            updatedAt: conv.updatedAt
        })));
    } catch(error){
        console.error('Error fetching fetching a conversation: ', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
})
app.post('/messages/send',async (req, res) =>{
    try {
        const {senderId, conversationId, content} = req.body;    
        const token = req.headers['authorization']?.split(' ')[1]; 
        if(!token) return res.status(403).send('Forbidden');
        const decoded = jwt.verify(token, SECRET_KEY);
        if (!decoded?.userId) {
            return res.status(409).json({ error: "Forbidden: badToken" });
        }
        console.log("senderId:", senderId);
        if (!senderId) {
            console.error("senderId is undefined or null");
            return; 
        }
        const objectId = ObjectId.isValid(conversationId) ? new ObjectId(conversationId) : conversationId;
        console.log(conversationId)
        const message =  await sendMessage(parseInt(senderId), objectId, content);
        res.status(200).json(message)
        // Notify participants
        notifyUser(senderId, { content: content }, 'message');
    } catch (error) {
        console.error('Error fetching sending a message: ', error);
        res.status(500).json({ error: 'Internal server error.' });
        
    }
})
app.get('/messages/:id', async (req, res) => {
    try {
    const conversationId  = req.params.id;
    const token = req.headers['authorization']?.split(' ')[1];
    if(!token) return res.status(403).send('Forbidden');
    const decoded = jwt.verify(token, SECRET_KEY);
    if (!decoded?.userId) {
        return res.status(409).json({ error: "Forbidden: badToken" });
    }
    const objectId = ObjectId.isValid(conversationId) ? new ObjectId(conversationId) : conversationId;  
    console.log("Fetching messages for conversation:", objectId);
    const messages = await getConversationMessages(objectId, 50);
    res.status(200).json(messages); 
    } catch (error) {
        console.error('Error fetching getting a message: ', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
})
app.put('/messages/read', (req, res) => {
    try {
        const { conversationId , userId} = req.body;
        const token = req.headers['authorization']?.split(' ')[1];
        if(!token) return res.status(403).send('Forbidden');
        const decoded = jwt.verify(token, SECRET_KEY);
        if (!decoded?.userId) {
            return res.status(409).json({ error: "Forbidden: badToken" });
        }
        const messages = markMessagesAsRead(conversationId, userId);
        res.status(200).json([{
            message : 'Message lue'
        }])
        } catch (error) {
            console.error('Error fetching reading a message: ', error);
            res.status(500).json({ error: 'Internal server error.' });
        }
})

app.post("/pairDevice", async (req, res) => {
    try {
        const { pair_id, device_id } = req.body;
        if (!pair_id || !device_id) {
            return res.status(400).json({ error: "Pair ID and Device ID are required." });
        }
        const result = await addDevice(pair_id, device_id);
        if (!result) {
            return res.status(500).json({ error: "Failed to pair device." });
        }
        res.status(200).json({ message: "Device paired successfully.", user_id: pair_id });
    } catch (error) {
        console.error('Error pairing device: ', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});
app.get("/device", async (req, res) => {
    try {
        const token = req.headers['authorization']?.split(' ')[1];
        if (!token) return res.status(403).send('Forbidden');
        const decoded = jwt.verify(token, SECRET_KEY); // Synchronous verification
        if (!decoded?.userId) {
            return res.status(401).json({ error: "Unauthorized: Invalid token" });
        }
        const userpaidid = await getUserById(decoded.userId);
        if (!userpaidid) {
            return res.status(404).json({ error: `No user found with id: ${decoded.userId}` });
        }
        const devices = await getDevices(userpaidid.pairId);
        if (!devices) {
            return res.status(404).json({ error: `No devices found for user id: ${decoded.userId}` });
        }
        res.status(200).json({ devices });
    } catch (error) {
        console.error('Error fetching devices: ', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

app.delete("/device", async (req, res) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) return res.status(403).send('Forbidden');
        const decoded = jwt.verify(token, SECRET_KEY);
        if (!decoded?.userId) {
            return res.status(409).json({ error: "Forbidden: badToken" });
        }
        const { device_id } = req.body;
        console.log(req.body)
        if (!device_id) {
            return res.status(400).json({ error: "Device ID is required." });
        }

        const userpaidid = await getUserById(decoded.userId);
        if (!userpaidid) {
            return res.status(404).json({ error: `No user found with id: ${decoded.userId}` });
        }

        const result = await deleteDevice(userpaidid.pairId, device_id);
        if (!result) {
            return res.status(500).json({ error: "Failed to delete device." });
        }

        res.status(200).json({ message: "Device deleted successfully." });
    } catch (error) {
        console.error('Error deleting device: ', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});
app.get("/location", async (req, res) => {
    try {
        const token = req.headers['authorization']?.split(' ')[1];
        if (!token) return res.status(403).send('Forbidden');
        const decoded = jwt.verify(token, SECRET_KEY); // Synchronous verification
        if (!decoded?.userId) {
            return res.status(401).json({ error: "Unauthorized: Invalid token" });
        }
        const location = await getContactslocation(decoded.userId);
        if (!location) {
            return res.status(404).json({ error: `No location found for user id: ${decoded.userId}` });
        }
        res.status(200).json({ location });
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            return res.status(409).json({ message: 'Token expired' });
        }
        console.error('Error fetching location: ', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});
app.post("/location", async (req, res) => {
    try {
        const { user_id, lat, lon, velocity, device_id } = req.body;
        if (!user_id || !lat || !lon || !velocity || !device_id) {
            return res.status(400).json({ error: "User ID, latitude, longitude, velocity, and device ID are required." });
        }
        const userId = user_id;
        const result = await saveLocation(userId, lat, lon, velocity);
        if (!result) {
            return res.status(500).json({ error: "Failed to save location." });
        }
        res.status(200).json({ message: "Location saved successfully." });
    } catch (error) {
        console.error('Error saving location: ', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});
app.post("/alert", async (req, res) => {
    try {
        const { user_id, device_id} = req.body;
        if (!user_id || !device_id) {
            return res.status(400).json({ error: "User ID and device ID are required." });
        }
        const user = await findUserByPairId(user_id);
        if (!user) {
            return res.status(404).json({ error: `No user found with id: ${user_id}` });
        }
        let contact = user.contact
        if (!contact) {
            return res.status(404).json({ error: `No contact found for user id: ${user_id}` });
        }
        let message = user.username + "is in danger"
        console.log("Alerting contacts: ", contact);
        for (let i = 0; i < contact.length; i++) {
            console.log("Alerting contact: ", contact[i]);
            notifyUser(contact[i], { content: message }, 'alert');
        }
        return res.status(200).json({ message: "Alert sent successfully." });
    } catch (error) {
        console.error('Error fetching location: ', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(1045).send('Something broke!')
})


