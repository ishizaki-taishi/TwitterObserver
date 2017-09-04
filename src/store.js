import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);


import { SEARCH, GET_T } from './mutation-types';

const actions = {

    [SEARCH]({ commit, state }) {

    },

    async [GET_T]({ commit }) {

        const ts = [{ a: 0 }, { b: 1 }, { c: 2 }];

        commit(GET_T, ts);

    }

};

const mutations = {
    [SEARCH](state, keyword) {
        state.keyword = keyword;
    },

    [GET_T](state, tweets) {
        state.tweets = tweets;
    }

};


const getters = {

    tweets: (state) => state.tweets

};


const state = {
    input: "",
    tweets: []
};

export default new Vuex.Store({
    state,
    getters,
    actions,
    mutations
});
