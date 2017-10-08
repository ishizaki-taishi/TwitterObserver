export default {

    tweets: (state) => state.tweets,

    cards(state) {
        return [...state.tweets, ...state.tweets];
    }

}
