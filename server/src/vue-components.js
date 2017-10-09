export default function createVueComponents(Vue) {

    Vue.component('app-icon', {
        props: ['fa'],
        template: '#icon-template'
    });

    Vue.component('app-container', {
        template: '#container-template'
    });

    Vue.component('app-space', {
        template: '#space-template'
    });

    Vue.component('app-graph', {

        template: '#graph-template',

        props: ['twid'],




        async beforeUpdate() {

            /*
            chart.data.labels.push(label);
            chart.data.datasets.forEach((dataset) => {
                dataset.data.push(data);
            });
            chart.update();

            // グラフのデータを更新する
            */

        },

        async created() {

            const app = Vue.app;

            await new Promise((resolve) => setTimeout(resolve, 100));


            const context = this.$el.getContext('2d');

            const id = this.$el.getAttribute('tweet-id');

            console.warn('Created: ', id, this.$el);

            const tweet = app.$data.tweets.filter((tweet) => tweet.id === id)[0];




            await new Promise((resolve) => {
                const clear = setInterval(() => {
                    if (!tweet.retweeters || !tweet.retweeters.length) return;
                    resolve();
                    clearInterval(clear);
                }, 100);
            });

            const retweeters = tweet.retweeters;


            const counts = Array.from({ length: 24 }).fill(0);


            retweeters.forEach((user) => {

                const hour = (new Date(user.createdAt)).getHours();

                ++counts[hour];

            });


            const chart = new Chart(context, {
                type: 'line',
                data: {

                    labels: Array.from({ length: 24 }).map((_, index) => index),

                    datasets: [{
                        label: '# of retweets',
                        data: counts,
                        backgroundColor: ['rgba(255, 99, 132, 0.2)'],
                        borderColor: ['rgba(255,99,132,1)'],
                        borderWidth: 1
                    }]

                },
                options: {
                    scales: {
                        yAxes: [{
                            ticks: {
                                beginAtZero: true
                            }
                        }]
                    }
                }
            });


        }

    });



};
