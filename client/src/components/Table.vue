<template>
<div>
    <v-text-field append-icon="search" label="Search" single-line hide-details v-model="search"></v-text-field>


    <v-divider></v-divider>

    <v-data-table class="elevation-0" v-bind:pagination.sync="pagination" v-model="selected" :headers="headers" select-all :items="users" hide-actions>

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
    <div class="text-xs-center pt-2">
        <v-pagination v-model="pagination.page" :length="pages"></v-pagination>
    </div>
</div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {

    props: {
        users: Array
    },

    computed: {

        pages() {
            return this.pagination.rowsPerPage ? Math.ceil(this.users.length / this.pagination.rowsPerPage) : 0
        }

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
