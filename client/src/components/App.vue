<template>
<v-app light>
    <v-navigation-drawer app permanent light enable-resize-watcher>
        <app-navigation :tweets="tweets"></app-navigation>
    </v-navigation-drawer>
    <!--

    <v-navigation-drawer persistent :mini-variant="miniVariant" :clipped="clipped" v-model="drawer" enable-resize-watcher>
        <v-list>
            <v-list-tile v-for="(item, i) in items" :key="i" value="true">
                <v-list-tile-action>
                    <v-icon light v-html="item.icon"></v-icon>
                </v-list-tile-action>
                <v-list-tile-content>
                    <v-list-tile-title v-text="item.title"></v-list-tile-title>
                </v-list-tile-content>
            </v-list-tile>
        </v-list>
    </v-navigation-drawer>

    -->


    <app-header></app-header>


    <main fill-height v-for="tweet in tweets">
        <v-content>
            <v-container>

                <v-layout justify-center align-center>

                    <v-flex xs12>

                        <v-card>

                            <v-layout justify-center align-center>

                                <v-flex xs3>

                                    <div class="twi_con">
                                        <Tweet :id="tweet.id"></Tweet>
                                    </div>
                                </v-flex>

                                <v-flex xs8 offset-sm1>

                                    <v-btn color="error" dark large>Large Button</v-btn>
                                    <v-btn color="error" dark large>Large Button</v-btn>
                                    <v-divider></v-divider>

                                    <v-btn color="green" dark large>Spreadsheet</v-btn>



                                    <app-table :users="tweet.retweeters"></app-table>
                                </v-flex>

                            </v-layout>

                        </v-card>

                    </v-flex>


                </v-layout>

            </v-container>
        </v-content>
    </main>


    <!--

        <v-container fluid>

            <v-layout>


                <v-flex xs12 sm6 offset-sm3>




                    <v-card v-if="false">





                        <v-card-title primary-title>
                            <div>
                                <h3 class="headline mb-0">text</h3>

                            </div>
                        </v-card-title>
                        <v-card-actions>
                            <v-btn flat class="orange--text">Share</v-btn>
                            <v-btn flat class="orange--text">Explore</v-btn>
                        </v-card-actions>
                    </v-card>
                </v-flex>

            </v-layout>


            test




<iframe src="http://localhost:3000" style="width:100%;height:50vh;"></iframe>-->

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

import Tweet from 'vue-tweet-embed'

console.log(Tweet);
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
        Tweet
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
