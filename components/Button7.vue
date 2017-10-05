
<template>
<span>

    <div class="form-inline rainbow" style="display:inline-block;border-radius:6px">
        <button @click="$click" role="button" class="btn" style="margin: 2px;background: #fff;border-radius: 4px;">
            <span style="color:#000"><slot></slot></span>
        </button>
    </div>

</span>
</template>


<script>
// import 'bootstrap-vue/lib/components';
// import 'bootstrap-vue/lib/directives';

import { mapGetters } from 'vuex';
import store from '../src/store';

import { bBtn } from 'bootstrap-vue/lib/components';


import Vue from 'vue';


export default {

    methods: {
        $click() {
            if (this.$props.click) this.$props.click();
        }
    },

    props: {
        click: Function
    }

}
</script>


<style>
.rainbow {
    background: linear-gradient(60deg, rgb(247, 149, 51), rgb(243, 112, 85), rgb(239, 78, 123), rgb(161, 102, 171), rgb(80, 115, 184), rgb(16, 152, 173), rgb(7, 179, 155), rgb(111, 186, 130));
}
</style>
