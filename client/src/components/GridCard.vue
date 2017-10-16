<template>
<v-container grid-list-xl text-xs-center>
    <v-layout row wrap>
        <v-flex xs12>

            <div class="twi_con">
                <Tweet :id="tweet.id"></Tweet>
            </div>

        </v-flex>

        <v-flex xs12>

            <v-btn block flat color="secondary" dark>{{ tweet.id }}</v-btn>

        </v-flex>


    </v-layout>
</v-container>
</template>


<script>
import AppTable from './Table.vue';
import Tweet from 'vue-tweet-embed';

import AppLottery from './Lottery.vue';

export default {
    props: {
        tweet: Object
    },
    components: {
        AppTable,
        AppLottery,
        Tweet
    },

    data() {
        return {
            dialog: false
        }
    },

    methods: {
        lottery($event, n = 1) {

        },

        lotteryN() {
            this.lottery(10);
        }
    }
}
</script>
