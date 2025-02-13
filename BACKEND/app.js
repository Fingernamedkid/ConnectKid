import express from 'express';
import {getUserByUsernameOrEmailAndPassword,getUserContacts, createUser,getUserById, findUserByPairId, getUserByUsernameOrEmail, pairUser, run} from './database.js';
import jwt from 'jsonwebtoken';
import cors from 'cors'
import e from 'express';

const SECRET_KEY = 'your_secret_key'; // Use a strong secret key in production

const app = express();
run();
// Use CORS middleware
app.use(cors());

app.use(express.json({ limit: '100mb' }));  // For parsing JSON payloads
app.use(express.urlencoded({ limit: '100mb', extended: true }))

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
            pairId: user.pairId || ""
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
        if (!userData?.id || !userData?.username || !userData?.email || !userData?.profilePic || !userData?.description) {
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
        console.error('Error during authenticate: ', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});
app.get("/leds", async (req, res) => {
    try {
        const token = req.headers['authorization']?.split(' ')[1];
        if (!token) return res.status(403).send('Forbidden');
        const decoded = jwt.verify(token, SECRET_KEY); // Synchronous verification
        if (!decoded?.userId) {
            return res.status(409).json({ error: "Forbidden: badToken" });
        }
        const response = await fetch('http://192.168.0.18:5000/led');
        const data = await response.json();
        console.log(data);
        return res.status(200).json({ state: data.state });
    } catch (error) {
        console.error('Error during authenticate: ', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});
app.post("/leds", async (req, res) => {
    try {
        const {state} = req.body;
        const token = req.headers['authorization']?.split(' ')[1];
        if (!token) return res.status(403).send('Forbidden');
        const decoded = jwt.verify(token, SECRET_KEY); // Synchronous verification
        if (!decoded?.userId) {
            return res.status(409).json({ error: "Forbidden: badToken" });
        }
        const response = await fetch('http://192.168.0.18:5000/led', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json'
            },
            body: JSON.stringify({ state })
        });

        if (!response.ok) {
            return res.status(response.status).json({ error: 'Failed to update LED state' });
        }

        const responseData = "Success";
        res.status(200).json(responseData);
    } catch (error) {
        console.error('Error during authenticate: ', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
}
);

app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(1045).send('Something broke!')
})



export default app;