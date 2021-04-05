const express = require('express');
const path = require('path');
const app = express();
const http = require('http');
const httpServer = http.createServer(app);
const SocketIO = require("socket.io");
const io = SocketIO(httpServer);
// Set Ports
app.set('port', process.env.PORT || 5000);

// Open Ports
httpServer.listen(5000, () => {console.log("Signaling Server Running...")})
// Define Middlewares
app.use(express.static(path.join(__dirname,'..','build')));
app.use(express.static("public"));
// Renders the deployed build folder
app.use((req, res, next) => {
  res.sendFile(path.join(__dirname, "..", "build", "index.html"));
});
// Checks if Signaling server is running in the navigator
app.get('/', (req, res) => {
  res.send("Signaling Server Running...")
})

const videochats = {};

io.on("connection", socket => {
    socket.on("registerVideochatID", videochatID => {
      (videochats[videochatID]) ? (videochats[videochatID].push(socket.id)) : videochats[videochatID] = [socket.id]
      const remoteUser = videochats[videochatID].find(id => id !== socket.id);
      (remoteUser) ? (socket.emit("remotePeerJoined", remoteUser), socket.to(remoteUser).emit("localPeerJoined", socket.id)) : null
    });
    socket.on("SDPOffer", offerData => io.to(offerData.callee).emit("SDPOffer", offerData));
    socket.on("SDPAnswer", answerData => io.to(answerData.callee).emit("SDPAnswer", answerData));
    socket.on("ICECandidate", ICECandidateData => io.to(ICECandidateData.callee).emit("ICECandidate", ICECandidateData.candidate));
});



