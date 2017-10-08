<template>
<div >
    <!--
            <v-toolbar flat>
                <v-list>
                    <v-list-tile>
                        <v-list-tile-title class="title">
                            Application
                        </v-list-tile-title>
                    </v-list-tile>
                </v-list>
            </v-toolbar>
            -->


    <v-divider></v-divider>
    <v-list dense class="pt-0">
        <v-list-tile v-for="item in tweets" :key="item.title" @click="">
            <v-list-tile-action>
                <v-icon>info</v-icon>
            </v-list-tile-action>
            <v-list-tile-content>
                <v-list-tile-title>{{ item.id }}</v-list-tile-title>
            </v-list-tile-content>
        </v-list-tile>
    </v-list>

</div>
</template>


<script>
export default {

    props: {
        tweets: Array
    }

}
</script>
