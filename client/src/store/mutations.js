import Vue from 'vue';

import {
    GET_DEVICES,
    GET_DEVICE_TYPES,
    TAB_CHANGE
} from './mutation-types';

import { SEARCH, GET_TWEETS, GET_RETWEETERS, GET_OEMBED } from './mutation-types';

export default {

    [SEARCH](state, keyword) {
        state.keyword = keyword;
    },

    [GET_TWEETS](state, tweets) {

        console.log(tweets);
        state.tweets = tweets;
    },

    [GET_RETWEETERS](state, { retweeters, tweetId }) {
        Vue.set(state.tweets.filter((tweet) => tweet.id === tweetId)[0], 'retweeters', retweeters);
    },

    [GET_OEMBED](state, { oembed, tweetId }) {
        Vue.set(state.tweets.filter((tweet) => tweet.id === tweetId)[0], 'oembed', oembed);
    }

}
