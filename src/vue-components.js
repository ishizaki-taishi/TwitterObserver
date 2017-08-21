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



        async created() {

            const app = Vue.app;

            await new Promise((resolve) => setTimeout(resolve, 100));


            const context = this.$el.getContext('2d');

            const id = this.$el.getAttribute('tweet-id');

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

                    // label: 'tedt',
                    // labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
                    datasets: [{
                        label: '# of retweets',
                        data: counts,
                        backgroundColor: ['rgba(255, 99, 132, 0.2)'],
                        borderColor: ['rgba(255,99,132,1)'],

                        /*
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.2)',
                            'rgba(54, 162, 235, 0.2)',
                            'rgba(255, 206, 86, 0.2)',
                            'rgba(75, 192, 192, 0.2)',
                            'rgba(153, 102, 255, 0.2)',
                            'rgba(255, 159, 64, 0.2)'
                        ],
                        borderColor: [
                            'rgba(255,99,132,1)',
                            'rgba(54, 162, 235, 1)',
                            'rgba(255, 206, 86, 1)',
                            'rgba(75, 192, 192, 1)',
                            'rgba(153, 102, 255, 1)',
                            'rgba(255, 159, 64, 1)'
                        ],
                        */
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
