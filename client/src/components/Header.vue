<template>
    <header>
        <span class="menu" v-on:click="showExpandedMenu = !showExpandedMenu">
            <i class="fas fa-ellipsis-h"></i>
            <span>Menu</span>
        </span>
        <span class="logo">
            <router-link to="/">AreYouHereYet</router-link>
        </span>
        <span class="share-popup" v-on:click="$emit('toggleShare')">
            <i class="fas fa-share-alt"></i>
            <span>Share</span>
            <span class="share-count">{{numberOfUsers}}</span>
        </span>
        <div class="content" v-if="showExpandedMenu">
            <div v-on:click="$emit('toggleAbout')">About</div>
        </div>
    </header>
</template>

<script lang="ts">

import { Component, Prop, Vue } from 'vue-property-decorator';

@Component({
    props: {
        numberOfUsers: {
            type: Number,
            default: () => {
                return 0;
            }
        }
    }
})
export default class Header extends Vue {
    private showExpandedMenu: boolean = false;


  created() {}
  mounted() {}
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
    @import './../styles/_colors';

    header, .content {
        background-color: $primary;
        display: flex;
        align-items: center;
        justify-content: space-between;
        color: white;
        cursor: pointer;
    }

    header {
        @media(min-width: 600px) {
            padding: 10px 5%;
        }
        position: relative;
        padding: 10px 5px;
        .menu,
        .share-popup {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            position: relative;
        }

    }
    a {
        color: white;
        text-decoration: none;
    }
    .content {
        position: absolute;
        top: 50px;
        left: 0;
        right: 0;
        flex-direction: column;
        div {
            border: 1px solid white;
            width: 100%;
            text-align: center;
            padding: 10px 0;
        }
        @media(min-width: 600px) {
            width: 12%;
        }
    }
    .share-count {
        position: absolute;
        top: -5px;
        right: -2px;
        font-size: 10px;
        border-radius: 50%;
        background-color: #fff;
        padding: 2px 5px;
        color: #000;
        @media (min-width: 600px) {
            top: -8px;
            right: -10px;
            font-size: 14px;
        }
    }
</style>
