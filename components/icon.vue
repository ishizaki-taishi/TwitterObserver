<template>
<div>
    <i :class="'fa fa-' + fa" aria-hidden="true"></i>
</div>
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
