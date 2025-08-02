const express = require('express')
const http = require('http');
const app = express()
app.use(express.json());
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);

const path = require('path');
const fs = require('fs');


let messages = [];
const port = 3000
global.AmountOfUsers = 0;

if (fs.existsSync(path.join(__dirname, 'messages.json'))) {
    messages = JSON.parse(fs.readFileSync(path.join(__dirname, 'messages.json')));
    console.log("Successfully Loaded Previous Messages!");

}
else{
    console.log("No previous messages found!");
}

app.use(express.static(path.join(__dirname, '../client')));

app.post("/", (req,res) =>{
    res.sendFile(path.join(__dirname, '../client/index.html'));
});

app.get('/assignUsername', (req, res) => {
    global.AmountOfUsers++;
    res.json({ username: "guest" + global.AmountOfUsers });
    console.log(`A user has connected! Total users: ${global.AmountOfUsers}`);
});

app.get('/AllMessages', (req,res) => {
    res.json(messages);
});

app.post("/AllMessages", (req, res) => {
    if(!req.body){
        return res.status(400).send({status : 'failed'});
    }

    console.log(req.body);
    messages.push(req.body);

    io.emit('new_message', req.body);

    fs.writeFileSync(path.join(__dirname, 'messages.json'), JSON.stringify(messages, null, 2));
    res.status(200).send({status : 'recieved'});
})

app.post('/Account', (req, res) => {
    console.log(req.body);
    console.log("Creating account...");
    let accounts = [];
    accounts.push(req.body);
    fs.writeFileSync(path.join(__dirname, 'accounts.json'), JSON.stringify(accounts,null,2));
    console.log("Account created!");
    res.status(200).send({status: 'Account created!'});
});

app.post('/Login', (req, res) => {
    console.log(req.body);
    
    let acounts = JSON.parse(fs.readFileSync(path.join(__dirname, 'accounts.json')));

    for (const account of acounts) {
        if (account.username === req.body.username && account.password === req.body.password) {
            return res.status(200).send({status: 'Account found!'});
        }
    }
    // If no account matches, send a failure response
    res.status(401).send({status: 'Invalid credentials'});

});
server.listen(port, () => {
  console.log(`listening on port ${port}`)
  
})

io.on('connection', (socket) => {

    socket.on('disconnect', () => {
        global.AmountOfUsers--;
        console.log(`A user disconnected! Total users: ${global.AmountOfUsers}`);
    });
});
