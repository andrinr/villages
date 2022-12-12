<script lang="ts">
  // Svelte imports
  import { onMount } from "svelte";
  import { VillageAnimation } from "./animation/villageAnimation";
  import Tile from "./Tile.svelte";

  // @ts-ignore
  import * as data from "./content.json";
  let contentId = 0;

  let villageAnimation: VillageAnimation;

  const getAndSetCamera = () => {
    villageAnimation.animateCamera(contentId, 2000);
  };

  function onKeyDown(e) {
    switch (e.keyCode) {
      case 38:
        contentId = (contentId + 1) % data.content.length;
        getAndSetCamera();
        break;
      case 40:
        // Make sure there are no negative numbers
        contentId = (contentId - 1 + data.content.length) % data.content.length;
        getAndSetCamera();
        break;
    }
  }

  onMount(async () => {
    const parentDiv: HTMLElement = document.getElementById("three");
    villageAnimation = new VillageAnimation(parentDiv);

    // console.log(data);
  });
</script>

<main>
  <div class="visualization">
    <Tile
      title={data.content[contentId].title}
      description={data.content[contentId].description}
    />
    <div id="three" />
  </div>
</main>

<svelte:window on:keydown={onKeyDown} />

<style>
  #three {
    position: absolute;
    width: 100vw;
    height: 100vh;
    top: 0;
    left: 0;
  }

  .tile {
    z-index: 1;
  }

  #sample-content {
    text-align: center;
    opacity: 0.9;
    border-radius: 5px;
    z-index: 10;
    position: absolute;
    padding: 10px;
    background-color: white;
    overscroll-behavior: none;
  }

  .visualization {
    overflow: hidden;
  }
</style>
