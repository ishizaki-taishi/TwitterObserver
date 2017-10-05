<template>
<div>


    <b-navbar type="light" variant="light" fixed="top">

        <b-navbar-brand href="#">Header</b-navbar-brand>

        <b-nav-form>
            <b-form-input class="mr-sm-2" type="text" placeholder="Search"></b-form-input>
            <b-button variant="outline-success" class="my-2 my-sm-0" type="submit">Search</b-button>
        </b-nav-form>
    </b-navbar>



</div>
</template>


<script>
import { bNav, bNavbar, bNavItem, bCollapse } from 'bootstrap-vue/lib/components';
export default {};
</script>

<style>
.navbar {
    border-bottom: solid 1px #999;
}
</style>
