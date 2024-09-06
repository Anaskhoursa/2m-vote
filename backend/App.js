require('dotenv').config();

const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');
const { connectDb1, users } = require('./db/db');
const cors = require('cors');
const { router } = require('./routes/routes');
const { connectDb2 } = require('./db/db2');
const WebSocket = require('ws')
const { Types } = require('mongoose'); 


const app = express();
const port = process.env.PORT;
const host = '0.0.0.0'

app.use(express.json());
app.use(cors());
app.use('/api', router);

connectDb1;
connectDb2;

app.listen(port, host, () => {
    console.log(`Server listening to port ${port}`);
});

const wss = new WebSocket.Server({ port: 9090 });

wss.on('connection', async (ws, req) => {
    const userID = req.url.split('/').pop();
    
    
        const objectId = new Types.ObjectId(userID); 
        await users.updateOne({_id: objectId}, {$set: {isConnected: true}});
        
        ws.send('online');
        
        ws.on('close', async () => {
            await users.updateOne({_id: objectId}, {$set: {isConnected: false}});
        });
    
});



