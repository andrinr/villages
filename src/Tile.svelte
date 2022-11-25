
<script lang="ts">
    export let title = '';
    export let description = '';

</script>

<main>
	<div class="tile">
		<div class="title">
            <h1>{title}</h1>
        </div>
        <div class="content">
            <p>{description}</p>
        </div>
	</div>
</main>

<style>
	.tile {
        z-index: 20;
        position: absolute;
        width: 50vw;
    }
</style>