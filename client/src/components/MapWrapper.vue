<template>
  <div class="map-wrapper">
    <div id="map">
    </div>
  </div>
</template>


<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import axios from 'axios';
import io from 'socket.io-client';
import { User, Position } from './../class/user';
import { guidGenerator } from './../class/helper';
import mapboxgl from 'mapbox-gl';

// declare var MapboxDirections: any;
declare var process: any; 
// declare namespace mapboxgl {
//   export class Marker {
//     constructor(x: any)
//     markerId: string;
//     userId: string | undefined;
//     setLngLat(x: any)
//     addTo(x: any)
//     setPopup(x: any)
//     addControl( x: any)
//   }
//   export class Popup {
//     constructor(x: any)
//     setHTML(x: any)
//   }
//   export class Map {
//     constructor(x:any)
//     flyTo(x: any)
//     addControl(x: any, y: any)
//   }
//   export class GeolocateControl {
//     constructor(x: any)
//   }
//   export class NavigationControl {
//     constructor()
//   }
// }


// const MapboxGeocoder = require('@mapbox/mapbox-gl-geocoder');
@Component({
    props: {
      users: {
        default: () => {
          return [];
        }
      },
      canGetLocation: {
        type: Boolean,
        default: () => {
          return false;
        }
      }
    }
})
export default class MapWrapper extends Vue {
  private map: mapboxgl.Map;
  private markers: mapboxgl.Marker[] = [];
  private hasCenteredMapOnUserLocation: boolean = false;

  private mapBoxConfig = {
    container: 'map', // container id
    style: 'mapbox://styles/mapbox/streets-v9',
    // style: 'mapbox://styles/mapbox/basic-v9',
    center: [-79.706967, 43.571177], // starting position
    zoom: 14 // starting zoom
  };
  private mapDirectionsConfig = {
    accessToken: process.env.VUE_APP_MAPBOX_KEY,
    unit: 'metric',
    interactive: false,
  };
  private mapGeolocationConfig = {
    positionOptions: {
      enableHighAccuracy: true,
    },
    trackUserLocation: true,
  }



  created() {
    this.$watch('users', (newVal, oldVal) => {
      this.updateMarkers(newVal);
    });
    this.$watch('canGetLocation', (newVal, oldVal) => {
      if (newVal) this.getCurrentLocationByNavigator();
    })
  }
  // After content placed in the page
  mounted() {
    mapboxgl.accessToken = process.env.VUE_APP_MAPBOX_KEY;
    this.setupMap();
    // this.getCurrentLocationByNavigator();
  }

  private setupMap() {
    this.map = new mapboxgl.Map(this.mapBoxConfig);
    this.map.addControl(new mapboxgl.NavigationControl(), 'bottom-right');
    this.map.addControl(new mapboxgl.GeolocateControl(this.mapGeolocationConfig), 'bottom-left');
    // this.map.addControl(new MapboxDirections(this.mapDirectionsConfig), 'top-left');
  
    // this.map.addControl(new MapboxGeocoder({
    //   accessToken: mapboxgl.accessToken,
    // }), 'top-left');
    // Add geolocate control to the map.

  }

  private getCurrentLocationByNavigator() {
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      // Let the subscribers know we are in the process of getting a location.
      navigator.geolocation.watchPosition(
        (position: any) => {
          if (!this.hasCenteredMapOnUserLocation) {
            // this.map.setZoom(14); // Zooming breaks the map apparently
            this.map.flyTo({center: [position.coords.longitude, position.coords.latitude]});
            this.hasCenteredMapOnUserLocation = true;
          }
          this.$emit('update-location', position.coords);
        },
        (error) => {
          console.error(error, 'could not find position using navigator');
          this.$emit('deny-geolocation');
        // Errors will fall here for either timeout, location not available or user denied geolocation.
        }, { timeout: 10000, enableHighAccuracy: true, maximumAge: 60000 },
      );
    } else {
      console.error('browser does not support geolocation');
    }
  }

  private createMarker(user: User, elementRef: any): mapboxgl.Marker {
    let marker = new mapboxgl.Marker(elementRef)
    marker.markerId = guidGenerator();
    marker.userId = user.id;
    if (user.position) marker = marker.setLngLat([user.position.lng, user.position.lat]);
    marker.setPopup(new mapboxgl.Popup({ closeOnClick: false, offset: 25}).setHTML('<h3>' + user.name + '</h3>'));
    marker.addTo(this.map);
    return marker;
  }


  private updateMarkers(users: User[]) {
    this.markers = users.filter((u: User) => u.position && u.position.lat).map((user) => {
      let marker: mapboxgl.Marker;
      if (this.markers.find(((m:mapboxgl.Marker) => m.userId === user.id))) {
        marker = this.markers.find((m:mapboxgl.Marker) => m.userId === user.id);
        marker.setLngLat([user.position.lng, user.position.lat]);
      }
      else {
        const markerElem = document.createElement('div');
        const innerMarker = document.createElement('div');
        const splitName: string[] = user.name ? user.name.split(' ') : [];
        markerElem.className = 'custom-marker';
        innerMarker.className = 'inner-content';
        innerMarker.textContent = splitName[0][0].toUpperCase() + (splitName.length > 1 ? splitName[1][0].toUpperCase() : '');
        markerElem.appendChild(innerMarker);
        marker = this.createMarker(user, markerElem);
      }
      return marker;
    });
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">

#map {
  position: absolute;
  top: 50px;
  bottom: 0;
  left: 0;
  right: 0;
  width: 100vw;
  z-index: -1;
  height: calc(100% - 50px);
}
.mapboxgl-map {
  .suggestions {
    padding-left: 0;
    background-color: white;
  }
}

.custom-marker {
  width: 35px;
  height: 35px;
  border-radius: 50%;
  cursor: pointer;
  background-color: #fff;
  border: 1px solid #000;
  .inner-content {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    font-weight: bold;
  }
  @keyframes pulse {
    from {
      width: 35px;
      height: 35px;
      background-color: black;
      color: white;
      border: 1px solid white;
    }
    to {
      height: 30px;
      width: 30px;
      color: black;
      background-color: white;
      border: 1px solid black;
    }
  }
  animation-duration: 1s;
  animation-name: pulse;
  animation-iteration-count: infinite;
  animation-direction: alternate;
}

.mapboxgl-popup {
  max-width: 200px;
}

.mapboxgl-popup-content {
  text-align: center;
  font-family: 'Open Sans', sans-serif;
}
</style>
