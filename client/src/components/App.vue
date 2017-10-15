<template>
<v-app light>

    <v-navigation-drawer app permanent light enable-resize-watcher class="grey lighten-4">
        <app-navigation app :tweets="tweets"></app-navigation>
    </v-navigation-drawer>

    <app-header></app-header>

    <main fill-height>
        <v-content>
            <v-container>

                <v-layout justify-center align-center v-for="tweet in tweets">

                    <v-flex xs12>

                        <app-card :tweet="tweet"></app-card>

                    </v-flex>


                </v-layout>

                <br>

            </v-container>
        </v-content>
    </main>


    <v-btn fab bottom right class="pink" dark fixed @click.stop="dialog = !dialog">
        <v-icon>add</v-icon>
    </v-btn>

</v-app>
</template>

<script>
import { mapGetters } from 'vuex';
import store from '../store/store';
import { GET_TWEETS } from '../store/mutation-types';

import AppTable from './Table.vue';
import AppHeader from './Header.vue';
import AppNavigation from './Navigation.vue';
import AppCard from './Card.vue';


export default {
    data() {
        return {
            clipped: false,
            drawer: true,
            fixed: false,
            items: [
                { icon: 'bubble_chart', title: '1' }
            ],
            miniVariant: false,
            right: true,
            rightDrawer: false,
        }
    },

    components: {
        AppTable,
        AppHeader,
        AppNavigation,
        AppCard,
    },


    computed: mapGetters(['tweets', 'cards']),

    created() {
        store.dispatch(GET_TWEETS);


        for (const el of document.querySelectorAll('.twitter-tweet')) {
            //    twttr.widgets.load(el);
        }

    },

}
</script>

<style>
.twi_con {
    overflow: hidden;
}

twitterwidget {
    transform: scale(1.01) rotate(0deg) !important;
    margin: 0 !important;
}
</style>
