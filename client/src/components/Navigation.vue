<template>
<div app>
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

        <v-divider></v-divider>

        <v-list-tile :key="1" @click="">
            <v-list-tile-action>
                <v-icon color="red darken-2">home</v-icon>
            </v-list-tile-action>
            <v-list-tile-content>
                <v-list-tile-title>ホーム</v-list-tile-title>
            </v-list-tile-content>
        </v-list-tile>


        <v-divider></v-divider>

        <v-subheader class="mt-3 grey--text text--darken-1">TWEETS</v-subheader>

        <v-list-tile v-for="item in tweets" :key="item.title" @click="">
            <v-list-tile-action>
                <v-icon>info</v-icon>
            </v-list-tile-action>
            <v-list-tile-content>
                <v-list-tile-title>{{ item.id }}</v-list-tile-title>
            </v-list-tile-content>
        </v-list-tile>

        <v-divider></v-divider>

        <v-list-tile @click="">
            <v-list-tile-action>
                <v-icon>mood_bad</v-icon>
            </v-list-tile-action>
            <v-list-tile-content>
                <v-list-tile-title>ブラックリスト</v-list-tile-title>
            </v-list-tile-content>
        </v-list-tile>

        <v-divider></v-divider>

        <v-list-tile @click="" v-for="item in items">
            <v-list-tile-action>
                <v-icon>{{ item.icon }}</v-icon>
            </v-list-tile-action>
            <v-list-tile-content>
                <v-list-tile-title>{{ item.text }}</v-list-tile-title>
            </v-list-tile-content>
        </v-list-tile>


    </v-list>

</div>
</template>


<script>
export default {

    props: {
        tweets: Array
    },

    data() {
        return {
            items: [




                { icon: 'settings', text: '設定' },
                { icon: 'help', text: 'ヘルプ' },
                { icon: 'help', text: 'ハッシュタグ' }
            ]
        };
    }

}
</script>
