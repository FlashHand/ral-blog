<template>
<!--	<img src="../../static/main.jpg" alt="">-->
	<div class="home">
		<SearchBox/>

	</div>

</template>

<script>
import SearchBox from '@SearchBox'

export default {
	name: "Home",
	components: { SearchBox }
}
</script>

<style lang="less" scoped>
@import "./Home.less";
</style>
