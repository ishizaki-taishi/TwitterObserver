<template>
<div>




    <b-table :fields="fields" :items="items" :small="true" :per-page="perPage" :current-page="currentPage"></b-table>

    <b-pagination align="center" :total-rows="totalRows" :per-page="perPage" v-model="currentPage" />




</div>
</template>

<script>
export default {

    computed: {
        totalRows() {
            console.warn(this);
            return this.items ? this.items.length : 0;
        }
    },

    props: {
        items: Array,

        currentPage: Number,

        perPage: {
            default: 10
        }
    },

    data() {
        return {

            fields: {


                name: { label: 'Name', sortable: true },
                screen_name: { label: 'ScreenName', sortable: true },

                created_at: { label: 'CreatedAt', sortable: true },

            },

        };

    }
}
</script>

<style>
table {
    table-layout: fixed;
}
</style>
