<template>
    <div class="notification">
        <slot></slot>
    </div>
</template>

<script lang="ts">

import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class Notification extends Vue {
  created() {}
  mounted() {}
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
    @import './../styles/_colors';
    .notification {
        color: white;
        text-align: center;
        background-color: $primary-solid;
        border-radius: 4px;
        width: 80%;
        margin: 10px auto;
        box-shadow: 0 3px 6px hsla(0, 0, 0, 0.16);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
    }
</style>
