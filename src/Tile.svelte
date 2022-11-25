
<script lang="ts">
    export let title = '';
    export let description = '';

</script>

<main>
	<div class="tile">
        <div class="content">
            <div class="title">
                <h1>{title}</h1>
            </div>
            <div class="content">
                <p>{description}</p>
            </div>
        </div>
	</div>
</main>

<style>
    .content {
        margin: 20px;
    }
	.tile {
        z-index: 20;
        position: absolute;
        margin: 20px;
        width: 50vw;
        max-width: 300px;
        background-color: aliceblue;
        opacity: 0.8;
        border-radius: 10px;
        backdrop-filter: blur(50px);
        -webkit-backdrop-filter: blur(10px);
    }
</style>