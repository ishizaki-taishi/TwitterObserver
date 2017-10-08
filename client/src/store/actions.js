import {

    GET_DEVICES,
    GET_DEVICE_TYPES,

    TAB_CHANGE

} from './mutation-types';

import { SEARCH, GET_TWEETS, GET_RETWEETERS, GET_OEMBED } from './mutation-types';

import { request } from '../socket';

export default {

    [GET_DEVICES]({ commit }) {
        commit(GET_DEVICES);
    },

    [GET_DEVICE_TYPES]({ commit }) {
        commit(GET_DEVICE_TYPES);
    },

    [TAB_CHANGE]({ commit }, { type }) {
        commit(TAB_CHANGE, type);
    },


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

}
