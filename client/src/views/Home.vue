<template>
  <main class="home">
    <Header
      v-on:toggleShare="showShareModal = !showShareModal"
      v-on:toggleAbout="showAboutModal = !showAboutModal"
      v-on:toggleContact="showContactModal = !showContactModal"
      :numberOfUsers="connectedUsers.length"
    />
    <div class="notifications" v-if="notifications.length">
      <Notification v-for="notification of notifications">
        <p>{{notification}}</p>
      </Notification>
    </div>
    <Modal v-if="showNameModal && hasLocationEnabled"
    class="name-modal"
    v-bind:canClose="false"
    v-on:close="showNameModal = false"
    >
      <h3>
        Enter a name that <br/>others will see
      </h3>
      <form v-on:submit="submitName()">
        <input v-model="user.name" type="text" style="margin-bottom: 15px;"/>
      </form>
      <button v-on:click="submitName()" v-bind:disabled="!user.name">Next</button>
    </Modal>
    <Modal v-if="showShareModal && hasLocationEnabled"
    class="share-modal"
    v-on:close="showShareModal = false"
    >
      <h3>
        Send the URL to share your live location with someone
      </h3>
      <!-- <input v-bind:value="'?q=' + user.groupId" type="text" id="share-url" data-clipboard-target="#share-url" readonly placeholder="New Share URL"/> -->
      <p id="share-url" data-clipboard-target="#share-url">{{baseURL + '?q=' + user.groupId}}</p>
      <p>{{ hasCopiedUrl ? 'Copied!' : 'Click the box to copy' }}</p>
      <p v-if="connectedUsers.length">Sharing your location with <b>{{connectedUsers.length}}</b> {{connectedUsers.length > 1 ? 'people' : 'person'}}</p>
      <ul class="users" v-if="connectedUsers.length">
        <li v-for="user of connectedUsers"> {{user.name}} </li>
      </ul>
      <button v-on:click="showShareModal = false">Got It</button>

    </Modal>
    <Modal v-if="!hasLocationEnabled" :canClose="false">
      <h3>Sorry!</h3>
      <p>This app needs location enabled to work</p>
    </Modal>
    <Modal v-if="showAboutModal" v-on:close="showAboutModal = false">
      <h3>About</h3>
      <p><b>AreYouHereYet</b> is a little project to help people find each other in real time, quickly, and easily. </p>
      <p>No fancy bells & whistles. </p>
      <p>Just share a URL, and you're good to go.</p>
      <p><a>GitHub</a> <span class="divider"></span> <a href="mailto:matthewpua@gmail.com" target="_blank" rel="noopener">Email Me</a></p>
    </Modal>
    <MapWrapper
    :canGetLocation="canGetLocation"
    :users="[user, ...connectedUsers]"
    v-on:update-location="updateSelfLocation"
    v-on:deny-geolocation="hasLocationEnabled = false"
    />
  </main>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import MapWrapper from '@/components/MapWrapper.vue'; // @ is an alias to /src
import Header from '@/components/Header.vue';
import Modal from '@/components/Modal.vue';
import Notification from '@/components/Notification.vue';
import { User } from '../class/user';
import SocketClient from './../services/socket.service';
import { merge } from 'rxjs';

declare var ClipboardJS: any;

@Component({
  components: {
  Header,
    MapWrapper,
    Modal,
    Notification
  },
})
export default class Home extends Vue {
  showNameModal: boolean = true;
  showShareModal: boolean = false;
  showAboutModal: boolean = false;

  connectedUsers: User[] = [];

  user: User = new User();
  private socket: SocketClient;
  private notifications: string[] = [];
  private hasCopiedUrl: boolean = false;
  private baseURL = process.env.VUE_APP_BASE_URL;
  private canGetLocation: boolean = false;
  private hasLocationEnabled: Boolean = true;
  constructor() {
    super();
    this.socket = new SocketClient();
  }

  created() {
    this.socket.connectToServer();
    this.socket.locationUpdateSubscription.subscribe((user: User) => {
      if (user.position && user.id !== this.user.id) {
        const userPosition = this.connectedUsers.findIndex((trackedUser) => trackedUser.id === user.id);
        this.connectedUsers[userPosition].position = user.position;
      }
    });

    this.socket.newMemberSubscription.subscribe((user) => {
      this.socket.updateMemberList(this.user);
    })

    merge(this.socket.newMemberSubscription, this.socket.memberUpdateSubscription)
    .subscribe((user) => {
      if (this.connectedUsers.map((user: any) => user.id).indexOf(user.id) < 0) {
        this.connectedUsers.push(user);
        const notification = user.name + ' has started sharing their location!';
        this.notifications.push(notification);
        // TODO: make this not look like garbage
        setTimeout(() => {
          this.notifications.splice(this.notifications.indexOf(notification), 1);
        }, 3000);
      }
      else console.log('user: ' + user.name + ' already being tracked');
    })

    // if they have a query param, they're joining an existing group
    const shareUrl = this.$route.query.q;
    if (shareUrl) {
      this.user.groupId = shareUrl;
    }
  }

  mounted() {
    const clipboard = new ClipboardJS('#share-url', );
    clipboard.on('success', (e: any) => {
      this.hasCopiedUrl = true;
      setTimeout(() => {
        this.hasCopiedUrl = false;
      }, 2000);
    });
  }

  private submitName() {
    this.showNameModal = false;
    if (!this.user.groupId) {
      this.socket.requestNewGroup(this.user).then((user) => {
        this.user = user;
        this.showShareModal = true;
      });
    } else {
      // If they're joining a room, we should just go straight to the map and let them see
      // the notifications of who's sharing their location
      this.socket.joinRoom(this.user).then((user) => {
        this.user = user;
        this.showShareModal = false;
      });
    }
    this.canGetLocation = true;
  }

  /**
    Set the user position to the updated location and broadcast this on the socket to all connected users
   */
  private updateSelfLocation(position: {latitude: number, longitude: number}) {
    this.user.position = {lat: position.latitude, lng: position.longitude};
    this.socket.locationUpdateSubscription.next(this.user);
    if (this.user.name) {
      this.socket.broadcastLocation(this.user);
    }
  }


}
</script>
<style  scoped lang="scss">
  .notifications {
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 100%;
    width: 100%;
    @media (min-width: 600px) {
      position: absolute;
      width: 25%;
      right: 0;
    }
  }

  #share-url {
    background-color: white;
    color: black;
    padding: 8px;
    border-radius: 8px;
    margin: 0;
    max-width: 80%;
    cursor: pointer;
  }

  button {
    padding: 5px 20px;
  }

  .users {
    text-align: left;
    width: 70%;
    // max-height: 40px;
    // overflow-y: scroll;
  }

  a {
    font-weight: bold;
    text-decoration: none;
    color: white;
  }
  .divider {
    width: 1px;
    border: 1px solid rgba(255, 255, 255, 0.378);
    margin: 0 15px;
  }
</style>
