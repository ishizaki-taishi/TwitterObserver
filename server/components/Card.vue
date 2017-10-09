<template>
<div>

    <b-container>
        <b-row>
            <b-col cols="4">



                <b-modal v-model="showResult" title="TITLE">
                    test
                </b-modal>


                <!--<b-card :header="title" class="text-center">-->

                <b-card class="text-center">

                    <h2>{{ title }}</h2>

                    <hr>

                    <b-button variant="outline-success">
                        Spreadsheet
                    </b-button>

                    <b-button variant="outline-danger">
                        Delete
                    </b-button>


                    <b-button @click="showResult = !showResult">
                        Open Modal
                    </b-button>


                    <hr>

                    <app-button7 :click="click" :test="uid">text1</app-button7>
                    <app-button7 :click="random" :test="uid">text2</app-button7>

                    <hr>

                    <div style="margin-top:-.7rem;margin-bottom:-.7rem">

                        <app-icon fa="cog"></app-icon><span style="color:#666"> 詳細設定</span>

                    </div>

                    <hr>

                    <b-btn v-b-toggle="uid" variant="primary">Toggle Collapse</b-btn>

                    <hr>

                    <b-collapse :id="uid" class="mt-2">
                        <p class="card-text">Collapse contents Here</p>

                        <hr>

                    </b-collapse>

                    <div v-html="tweet.oembed"></div>


                </b-card>




            </b-col>

            <b-col cols="8">


                <app-table :items="tweet.retweeters" :currentPage="0"></app-table>


                <div class="log">

                    <div v-if="!tweet.retweeters">
                        Loading...
                    </div>
                    <div v-else v-for="retweeter in tweet.retweeters">
                        {{ retweeter.name }} <span style="color:#437BD7">@{{retweeter.screen_name}}</span>
                    </div>

                </div>






            </b-col>


        </b-row>
    </b-container>

    <br>


</div>
</template>


<script>
// import 'bootstrap-vue/lib/components';
// import 'bootstrap-vue/lib/directives';

import { mapGetters } from 'vuex';
import store from '../src/store';

import AppIcon from './Icon.vue';

import AppButton7 from './Button7.vue';

import AppTable from './Table.vue';

let _uid = 0;

export default {

    name: 'app-card',

    computed: {
        uid: () => 'card-uid-' + (_uid++).toString(),
        title: () => Math.random().toString(),

        random(state) {


        }
    },


    props: {

        spreadsheetId: String,

        showResult: Number,


        //title: String,

        tweet: Object,
    },

    components: {
        AppIcon,
        AppButton7,
        AppTable
    },

    methods: {
        click() {
            alert(this.$props.tweet.id);
        },


        handleOk() {
            this.handleSubmit();
        },

        handleSubmit() {
            this.$refs.modal1.hide();
        }

    }

}
</script>


<style>
.log {
    max-height: 10vh;
    overflow: auto;
    background-color: #f7f8fb;
    border: 1px solid #eef1f6;
    border-radius: 4px;
    padding: 1rem;
    font-size: 1rem;
}
</style>
