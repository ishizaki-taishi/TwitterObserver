import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

import { SEARCH, GET_TWEETS, GET_RETWEETERS, GET_OEMBED } from './mutation-types';

import { request } from './socket';


const actions = {

    [SEARCH]({ commit, state }) {

    },

    async [GET_TWEETS]({ commit, dispatch }) {

        const tweets = await request(GET_TWEETS);

        commit(GET_TWEETS, tweets);

        for (const { id } of tweets) {
            dispatch(GET_RETWEETERS, id);
            dispatch(GET_OEMBED, id);
        }

    },

    async [GET_RETWEETERS]({ commit }, tweetId) {

        const retweeters = await request(GET_RETWEETERS, tweetId);

        commit(GET_RETWEETERS, { retweeters, tweetId });

    },

    async [GET_OEMBED]({ commit }, tweetId) {


        // HACK
        const $id = tweetId;
        tweetId = '884457192564314112';

        const oembed = await request(GET_OEMBED, tweetId);

        // HACK
        tweetId = $id;

        commit(GET_OEMBED, { oembed, tweetId });

    }


};

const mutations = {

    [SEARCH](state, keyword) {
        state.keyword = keyword;
    },

    [GET_TWEETS](state, tweets) {
        state.tweets = tweets;
    },

    [GET_RETWEETERS](state, { retweeters, tweetId }) {
        Vue.set(state.tweets.filter((tweet) => tweet.id === tweetId)[0], 'retweeters', retweeters);
    },

    [GET_OEMBED](state, { oembed, tweetId }) {
        Vue.set(state.tweets.filter((tweet) => tweet.id === tweetId)[0], 'oembed', oembed);
    }

};


const getters = {

    tweets: (state) => state.tweets,

    cards(state) {
        return [...state.tweets, ...state.tweets];
    }

};


const state = {

    tweets: []
};

export default new Vuex.Store({
    state,
    getters,
    actions,
    mutations,

    // プロダクションでないなら厳格モードで実行する
    strict: process.env.NODE_ENV !== 'production'

});
