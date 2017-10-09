<template>
<span>
    <i :class="'fa fa-' + fa" aria-hidden="true"></i>
</span>
</template>

<script>
export default {
    props: {
        fa: {
            type: String,
            default () {
                return '';
            }
        },
    },

}
</script>

<style>
</style>
