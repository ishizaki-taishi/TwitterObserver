<template>
<v-card>

    <v-layout justify-center align-center>

        <v-flex xs3>

            <div class="twi_con">
                <Tweet :id="tweet.id"></Tweet>
            </div>
        </v-flex>

        <v-flex xs8 offset-sm1>

            <h2>{{ tweet.id }}</h2>

            <v-btn color="error" dark large @click.native.stop="dialog = true" @click="lottery">抽選</v-btn>
            <v-btn color="error" dark large @click.native.stop="dialog = true" @click="lotteryN">Large Button</v-btn>
            <v-divider></v-divider>

            <v-btn color="green" dark large>Spreadsheet</v-btn>



            <app-table :users="tweet.retweeters"></app-table>
        </v-flex>


        <v-layout row justify-center>

            <v-dialog v-model="dialog">
                <v-card>
                    <v-card-title class="headline">Use Google's location service?</v-card-title>
                    <v-card-text>Let Google help apps determine location. This means sending anonymous location data to Google, even when no apps are running.</v-card-text>
                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn color="green darken-1" flat="flat" @click.native="dialog = false">Disagree</v-btn>
                        <v-btn color="green darken-1" flat="flat" @click.native="dialog = false">Agree</v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
        </v-layout>


    </v-layout>

</v-card>
</template>


<script>
import AppTable from './Table.vue';
import Tweet from 'vue-tweet-embed';

export default {
    props: {
        tweet: Object
    },
    components: {
        AppTable,
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
