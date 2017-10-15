<template>
<v-toolbar fixed dark clipped-left app>

    <v-toolbar-title v-text="'Twittery'"></v-toolbar-title>
    <v-spacer></v-spacer>

    <v-toolbar-items class="hidden-sm-and-down">
        <v-btn flat @click="reload">localhost:3000</v-btn>
    </v-toolbar-items>

    <v-text-field solo prepend-icon="search" placeholder="Search" style="max-width:20rem"></v-text-field>

</v-toolbar>
</template>


<script>
export default {
    methods: {
        reload() {
            location.replace('http://localhost:3000');
        }
    }
}
</script>
