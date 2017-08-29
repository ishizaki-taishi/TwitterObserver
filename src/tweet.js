export default class Tweet {

    constructor() {

        this.id = Math.random();
        this.retweeters = [];

    }

    static from(data) {

        const tweet = new Tweet();

        tweet.id = data.id;
        tweet.spreadsheetId = null; // data.spreadsheet_id;
        tweet.oembed = data.oembed;

        tweet.chart = {
            data: {}
        };

        tweet.view = {

            isShowOptions: false,

            ffRatioCheck: false,
            ffRatioBorder: null,

            followerCountCheck: false,
            followerCountBorder: null,

            time: null


        };

        return tweet;

    }

}
