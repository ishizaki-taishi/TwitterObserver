<style>
.red {
    color: #f00;
}
</style>

<template>
<div>

    <h1 class="red">{{msg}}</h1>
    <c></c>

</div>
</template>

<script>
import C from './c.vue';

export default {
    data() {
        return {
            msg: 'Hello world!'
        }
    },


    components: {
        C
    }
}
</script>
