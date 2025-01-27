import express from 'express';
import {getUserByUsernameOrEmailAndPassword, getUserInfo, createUser, getUserByUsernameOrEmail,findLargestStepsofUserwitId, getTop10UsersByStepsLastTwoWeeks, getUserById, updateUserProfile, deleteUserById, run,addtrips, getTop10UsersByLeastStepsLastTwoWeeks } from './database.js';
import jwt from 'jsonwebtoken';
import cors from 'cors'
import bodyParser from 'body-parser';
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

    // Check if username or email and password are provided
    if (!usernameOrEmail || !password) {
        return res.status(400).json({ error: "Username or email and password are required." });
    }

    try {
        // Modify the user retrieval function to accept either username or email
        console.log(`End point request with user/email : ${usernameOrEmail} and pass : ${password}`)

        const user = await getUserByUsernameOrEmailAndPassword(usernameOrEmail, password);
        if (!user) {
            return res.status(401).json({ error: "Invalid username/email or password." });
        }
        const userId = user._id
        
        const token = jwt.sign({ userId }, SECRET_KEY, { expiresIn: '1h' });
        console.log(token)
        // Return user data (ensure sensitive data like password is not returned)
        res.status(200).json({
            id: user._id,
            username: user.username,
            email: user.email,
            token
            // Add any other fields you want to include in the response
        });
    } catch (error) {
        console.error('Error retrieving user: ', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


app.post("/users", async (req, res) => {
    const { username, password, email } = req.body;

    // Check for missing fields
    if (!username || !password || !email) {
        return res.status(400).json({ error: "Username, password, and email are required." });
    }

    try {
        // Check if the username or email already exists
        const existingUser = await getUserByUsernameOrEmail(username, email);
        if (existingUser) {
            return res.status(409).json({ error: "Username or email already exists." });
        }

        // Proceed to create the user
        const newUser = await createUser( email, username, password );
        const token = jwt.sign({ userId:newUser._id }, SECRET_KEY, { expiresIn: '1h' });
        console.log(token)
        // Return the newly created user information
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



app.get("/users/:id", async (req, res) => {
    try {
        const token = req.headers['authorization']?.split(' ')[1];
        if (!token) return res.status(403).send('Forbidden');
        
        const userId = req.params.id; 

        // Check for missing fields
        if (!userId) {
            return res.status(400).json({ error: "Request missing parameters" });
        }

        // Verify the token
        const decoded = jwt.verify(token, SECRET_KEY); // Synchronous verification
        if (!decoded?.userId) {
            return res.status(401).json({ error: "Forbidden: badToken" });
        }
        
        if (decoded.userId != userId) {
            return res.status(409).json({ error: "Forbidden: you are not allowed to get this info" });
        }
        // get user data
        const user = await getUserById(userId);
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
            description: user.description || "",
            steps: steps || 0
        });
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            return res.status(401).send('Invalid token'); // Handle JWT-specific errors
        }
        console.error('Error fetching profile Data: ', error);
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

        // Verify the token
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
app.post("/trip", async (req, res) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(403).send('Forbidden');
    const tripData = req.body;
    if(!tripData){
        return res.status(409).json({ error: "Request missing userData" });
    }
    const decoded = jwt.verify(token, SECRET_KEY); 
    if (!decoded?.userId) {
        return res.status(401).json({ error: "Forbidden: badToken" });
    }
    
    if (decoded.userId != tripData.id) {
        return res.status(409).json({ error: "Forbidden: you are not allowed to get this info" });
    }
    try {
        if (!tripData?.listcoordnate || !tripData?.id || !tripData?.steps) {
            return res.status(400).json({ error: "Request body missing parameters" });
        }

        const user = await addtrips(tripData.id,tripData.listcoordnate,tripData.steps);
        if (!user) {
            return res.status(404).json({ error: `Error while updating data`});
        }

        res.status(200).json({
            message:"Success"
        });
    } catch (error) {
        console.error('Error updating profile Data: ', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});
app.get("/userInfo/:id", async (req, res) => {
    try {
        const token = req.headers['authorization']?.split(' ')[1];
        if (!token) return res.status(403).send('Forbidden');
        
        const userId = req.params.id; 

        // Check for missing fields
        if (!userId) {
            return res.status(400).json({ error: "Request missing parameters" });
        }
        console.log("Getting userinfo of", userId);

        // Verify the token
        const decoded = jwt.verify(token, SECRET_KEY); // Synchronous verification
        if (!decoded?.userId) {
            return res.status(401).json({ error: "Forbidden: badToken" });
        }

        // Allow fetching user info without requiring the user ID in the token to match the user ID in the request parameters
        const user = await getUserInfo(userId);
        if (!user) {
            return res.status(404).json({ error: `Aucun utilisateur pour l'id : ${userId}` });
        }
        let steps = 0;
        if (user.routes && user.routes.length !== 0) {
            steps = user.routes[user.routes.length - 1].steps;
        }
        let routes = [];
        console.log("decoded",decoded.userId)
        console.log("userId",userId)    
        if (userId == decoded.userId){
            routes = user.routes;
        }else{
            steps = await findLargestStepsofUserwitId(userId);
        }
        // Return the information
        res.status(200).json({
            id: user._id,
            username: user.username || "",
            image64: user.image64 || "",
            description: user.description || "",
            steps: steps || 0,
            routes: routes || []
        });
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            return res.status(401).send('Invalid token'); // Handle JWT-specific errors
        }
        console.error('Error fetching profile Data: ', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});
app.get("/top10", async (req, res) =>{
    try {
        const token = req.headers['authorization']?.split(' ')[1];
        if (!token) return res.status(403).send('Forbidden');
        
        // Verify the token
        const decoded = jwt.verify(token, SECRET_KEY); // Synchronous verification
        if (!decoded?.userId) {
            return res.status(401).json({ error: "Forbidden: badToken" });
        }
        const top10 = await getTop10UsersByStepsLastTwoWeeks();
        res.status(200).json(top10);
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            return res.status(401).send('Invalid token'); // Handle JWT-specific errors
        }
        console.error('Error fetching top10 Data: ', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

app.get("/top10-leaststeps", async (req, res) => {
    try {
        // Extract the token from the Authorization header
        const token = req.headers['authorization']?.split(' ')[1];
        
        // If no token is provided, return Forbidden status
        if (!token) return res.status(403).send('Forbidden');
        
        // Verify the token and decode it
        const decoded = jwt.verify(token, SECRET_KEY); // Synchronous token verification
        if (!decoded?.userId) {
            return res.status(401).json({ error: "Forbidden: badToken" });
        }
        
        // Fetch the top 10 users with the least steps (overall)
        const top10LeastSteps = await getTop10UsersByLeastStepsLastTwoWeeks();
        
        // Send the result as a response
        res.status(200).json(top10LeastSteps);
    } catch (error) {
        // Handle errors from JWT verification or other parts of the code
        if (error instanceof jwt.JsonWebTokenError) {
            return res.status(401).send('Invalid token'); // JWT error handling
        }
        
        console.error('Error fetching top10 least steps data: ', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// Lorsqu'une erreur se produit dans l'application (par exemple, une exception non gérée), Express appelle automatiquement
// ce middleware d'erreur avec l'objet d'erreur (err), ce qui permet de la gérer de manière centralisée et uniforme.
app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(1045).send('Something broke!')
})
const uri = "<connection string uri>";

// Lance le serveur et lui indique quel port utiliser 
app.listen(8080, () => {
    console.log('Server is running on port 8080')
})