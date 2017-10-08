<template>
<v-data-table v-bind:pagination.sync="pagination" v-model="selected" :headers="headers" select-all :items="users" hide-actions class="elevation-1">

    <template slot="items" scope="props">
            <td>
                <v-checkbox primary hide-details v-model="props.selected"></v-checkbox>
            </td>

            <!--{{ users[0] }}-->

            <td class="text-xs-right">{{ props.item.name }}</td>
            <td class="text-xs-right">{{ props.item.screen_name }}</td>
            <td class="text-xs-right">{{ props.item.created_at }}</td>


        </template>
</v-data-table>
</template>

<script>
import { mapGetters } from 'vuex';

export default {

    props: {
        users: Array
    },

    computed: {
        aa(a) { return this.users; }
    },

    data: () => ({
        selected: [],

        pagination: {
            sortBy: 'name'
        },

        headers: [
            { text: 'screen_name' },
            { text: 'screen_name' },
            { text: 'createdAt' },
        ]


    }),

    //    computed: mapGetters(['headers', 'devices', 'currentDevices']),

    components: {},
}
</script>
