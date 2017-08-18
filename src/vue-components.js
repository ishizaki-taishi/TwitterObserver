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

    

};
