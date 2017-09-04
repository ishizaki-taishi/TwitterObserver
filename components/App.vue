<template>
<div>


    <b-navbar toggleable="md" type="light" variant="light">
        <b-navbar-brand href="#">-</b-navbar-brand>


        <!--
        <b-nav is-nav-bar>
            <b-nav-form>
                <b-form-input size="sm" class="mr-sm-2" type="text" placeholder="Search" />
                <b-button size="sm" class="my-2 my-sm-0" type="submit">Search</b-button>
            </b-nav-form>
        </b-nav>
        -->


        <b-nav is-nav-bar class="ml-auto">
            <b-nav-form>
                <b-form-input class="mr-sm-2" type="text" placeholder="Search"></b-form-input>
                <b-button variant="outline-success" class="my-2 my-sm-0" type="submit">Search</b-button>
            </b-nav-form>

        </b-nav>



    </b-navbar>


    <app-card v-for="tweet in tweets" :tweet="tweet"></app-card>


    <app-iconn fa="github"></app-iconn>


    <div style="height:200px">-end-</div>

</div>
</template>


<script>
import Vuex from 'vuex';

import store from '../src/store';

import C from './c.vue';
import AppIconn from './icon.vue';

import AppCard from './Card.vue';

import {
    bAlert,
    bBtn,
    bCollapse,

    bNav,
    bNavbar,
    bNavForm,
    bNavbarBrand,

    bNavToggle,

    bFormInput


} from 'bootstrap-vue/lib/components';

import {
    bToggle,
    bToggleable,
    bScrollspy
} from 'bootstrap-vue/lib/directives';


import { mapGetters } from 'vuex';


import { GET_T } from '../src/mutation-types';


// console.log(mapGetters(['tweets']), mapGetters);

export default {
    computed: mapGetters(['tweets']),

    components: {
        C,
        bNav,
        AppIconn,
        AppCard,

    },

    created() {

        store.dispatch(GET_T);

    },

};
</script>

<style>
</style>
