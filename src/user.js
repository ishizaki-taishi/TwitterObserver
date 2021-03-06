export default class User {

    constructor() {

        this.name = '';
        this.screenName = '';

        this.followCount = 0;
        this.followerCount = 0;

    }

    static from(data) {

        const user = new User();

        user.id = data.id_str || data.id;
        user.name = data.name;
        user.screenName = data.screen_name;
        user.followCount = data.friends_count;
        user.followerCount = data.followers_count;

        user.createdAt = data.created_at;

        // user.ffRatio = (user.followerCount / user.followCount).toFixed(2);

        return user;

    }

    get ffRatio() {
        return this.followerCount / this.followCount;
    }

}
