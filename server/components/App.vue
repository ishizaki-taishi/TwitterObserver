<template>
<div>

    <app-header></app-header>

    <b-jumbotron></b-jumbotron>


    <b-container>
        <b-row>
            <b-col>


                <b-card class="text-center">

                    <b-input-group>
                        <b-form-input type="text"></b-form-input>
                        <b-input-group-button>
                            <b-btn variant="success">Search</b-btn>
                        </b-input-group-button>
                    </b-input-group>



                </b-card>



            </b-col>
        </b-row>
    </b-container>


    <br>



    <app-card v-for="tweet in cards" :tweet="tweet"></app-card>


    <app-icon fa="github"></app-icon>


    <div style="height:200px;background:#000"></div>

</div>
</template>


<script>
import store from '../src/store';


import AppHeader from './Header.vue';
import AppIcon from './Icon.vue';
import AppCard from './Card.vue';


import { mapGetters } from 'vuex';


import { GET_TWEETS } from '../src/mutation-types';


export default {
    computed: mapGetters(['tweets', 'cards']),

    components: {
        AppIcon,
        AppCard,

        AppHeader

    },

    created() {

        store.dispatch(GET_TWEETS);

    },

};
</script>

<style>
</style>
