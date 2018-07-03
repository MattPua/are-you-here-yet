'use strict'
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

const port = 3000;
io.on('connection', function (socket) {
    socket.on('disconnect', function () {
        io.emit('user disconnected');
    });

    socket.on('new-group', function(name, fn) {
        const newGroupId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15); //((Math.floor(Math.random() * 100)));
        fn(newGroupId);
        console.log('new group with id: ' + newGroupId + ' for user with name: ' + name);
        socket.join(newGroupId);
    });

    socket.on('join-room', function(id, user, fn) {
        socket.join(id);
        fn(id);
        console.log('new user joining into room: ' + id + ' with name : ' + user.name + ' with position: ' + user.position);
        // Broadcast to everyone on the channel that a new member has joined
        socket.broadcast.to(id).emit('new-member', user);
    });

    socket.on('update-member-list', function(user) {
        console.log('updating member list for group: ' + user.groupId + ' with member: ' + user.name);
        // socket.broadcast.to(groupId).emit('member-update', {name: name});
        socket.broadcast.to(user.groupId).emit('member-update', user);
    });

    socket.on('location-update', function(user) {
        console.log('retrieving data for user: ' + user.name + ' part of group: ' + user.groupId + ' at position: {' + user.position.lat + ', ' + user.position.lng + '}' );
        socket.broadcast.to(user.groupId).emit('member-location', user);
    });

});
http.listen(port, function(){
  console.log('listening on *:' + port);
});



        // io.in(id).clients((error, clients) => {
        //     if (error) throw error;
        //     console.log(clients); // => [Anw2LatarvGVVXEIAAAD]
        // });

class User {
    constructor(name, id, position, groupId) {
        this.name = name;
        this.id = id;
        this.position = position;
        this.groupId = groupIdl
    }
}
    
class Position {
    construtor(lat, lng) {
        this.lat = lat;
        this.lng = lng;
    }
}