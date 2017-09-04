<template>
<div>

    {{ tweet }}

</div>
</template>

<style>
</style>


<script>
// import 'bootstrap-vue/lib/components';
// import 'bootstrap-vue/lib/directives';

export default {

    name: 'app-card',

    props: {
        tweet: Object
    }

}
</script>
