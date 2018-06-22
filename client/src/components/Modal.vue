<template>
    <div class="modal-wrapper">
        <div v-if="blurBackground" class="background"></div>
        <div class="modal">
            <i v-if="canClose" class="fas fa-times" v-on:click="$emit('close')"></i>
            <slot></slot>
        </div>
    </div>
</template>

<script lang="ts">

import { Component, Prop, Vue } from 'vue-property-decorator';

@Component({
    props: {
        blurBackground: {
            type: Boolean,
            default: () => {
                return true
            }
        },
        canClose: {
            type: Boolean,
            default: () => {
                return true
            }
        }
    },
})
export default class Modal extends Vue {
    // title: string;
    // blurBackground: boolean;

    created() {}
    mounted() {}
}
</script>

<style scoped lang="scss">
    @import './../styles/_colors';

    .modal {
        color: white;
        text-align: center;
        background-color: $primary-solid;
        border-radius: 20px;
        box-shadow: 0 3px 6px hsla(0, 0, 0, 0.16);
        position: absolute;
        left: 50%;
        top: 40%;
        transform: translate(-50%, -50%);
        min-height: 25%;
        min-width: 85%;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        padding: 10px 0;
        i {
            text-align: right;
            right: 20px;
            position: relative;
            top: 0;
            width: 100%;
            cursor: pointer;
        }

        @media (min-width: 600px) {
            min-width: 500px;
            padding: 10px 40px;
        }
    }
    .background {
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        background: black;
        opacity: 0.6;
    }
</style>
