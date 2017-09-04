<style>
.red {
    color: #f00;
}
</style>

<template>
<div id="cheap-module-eval-source-map">

    <b-alert variant="success" show>{{ msg }}</b-alert>

    <c></c>

</div>
</template>

<script>
import C from './c.vue';

import {
    bAlert,
    bBtn,
    bCollapse
} from 'bootstrap-vue/lib/components';

import {
    bToggle,
    bScrollspy
} from 'bootstrap-vue/lib/directives';


export default {
    data() {
        return {
            msg: 'Hello world!'
        }
    },


    components: {
        C
    }
}
</script>
