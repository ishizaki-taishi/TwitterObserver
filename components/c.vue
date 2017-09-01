<style>
.red {
    color: #f00;
}
</style>

<template>
<div>
    <h1 class="red">{{msg}}</h1>
</div>
</template>

<script>
export default {
    name: 'c',

    data() {
        return {
            msg: 'Hello world!'
        }
    }
}
</script>
