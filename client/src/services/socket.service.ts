import io from 'socket.io-client';
import {User} from '@/class/user';
import { Subject } from 'rxjs';

declare var process: any; 

export default class SocketClient {
    socket: SocketIOClient.Socket;

    newMemberSubscription: Subject<User> = new Subject();
    memberUpdateSubscription: Subject<User> = new Subject();    
    locationUpdateSubscription: Subject<User> = new Subject();  


/**
   * 1. Connect to Server
   * 2. Send request to server that you want to either
   * a) create a new group
   * b) connect to an existing group with a group ID
   *
   * 3a) Receive ACK from server and a new group ID to send messages to
   * 3b) Receive ACK from server and an confirmation that joined group with ID
   *
   * 4a) On new member join, start broadcasting location and receving location
   * 4b) Broadcast and receive locations
   */
  

    constructor() {
        this.socket = io.connect(process.env.VUE_APP_SOCKET_URL);
    }
    

    /**
     * Connect via SocketIO to server
    */
   connectToServer() {
        this.socket.on('connect', (data: {}) => {
            this.onNewMemberJoined();
            this.onMemberLocationUpdate();
        });
    }

    joinRoom(user: User): (Promise<User>) {
        return new Promise((resolve) => {
            // TODO: should be a promise?
            this.socket.emit('join-room', user.groupId, user, function(newGroupId: string) {
                console.log('join room for groupId: ' + user.groupId);
                resolve(user);
            });
        });
    }

    broadcastLocation(user: User) {
        this.socket.emit('location-update', user);
    }
    

    /**
       * Send a request to the server requesting to create a new socket group
    */
    requestNewGroup(user: User): (Promise<User>) {
        if (user.groupId) {
          console.log('User has already requested a group id Previously');
          // TODO: destroy old one, create new one
          return new Promise((resolve) => resolve(user));
        }

        return new Promise((resolve) => {
            this.socket.emit('new-group', user.name, function(newGroupId: string) {
              console.log('new group created, listening for group: ' + newGroupId);
              user.groupId = newGroupId;
              resolve(user);
            });
        })
      }
    
      /**
       * New member has joined this channel
       * Send back an update so that the new member knows who else is here
       */
    onNewMemberJoined() {
        // A new member has joined the channel
        this.socket.on('new-member', (user: User) => this.newMemberSubscription.next(user));
    
        // We're getting a notification from others they're part of this channel so we need to check
        // if we're tracking them or not
        this.socket.on('member-update', (user: User) => this.memberUpdateSubscription.next(user));
    }
    // when a nenw member joins, we should send a message back out saying we're part of this channel
    updateMemberList(user: User) {
        this.socket.emit('update-member-list', user);
    }

    
    /**
       * On receiving a new member location update
    */
    onMemberLocationUpdate() {
        this.socket.on('member-location', (user: User) => this.locationUpdateSubscription.next(user));
    }

}