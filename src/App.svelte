<script lang="ts">
  // Svelte imports
  import { onMount } from "svelte";
  import { VillageAnimation } from "./animation/villageAnimation";
  import Tile from "./components/Tile.svelte";
  import Button from "./components/Button.svelte";

  // @ts-ignore
  import * as data from "./content.json";
  let contentId = 0;

  const contentIDCallback = (id: number) => {
    contentId = id;
  };

  let villageAnimation: VillageAnimation;

  const getAndSetCamera = () => {
    villageAnimation.animateCamera(contentId, 2000);
  };

  const increementContentId = () => {
    contentId = (contentId + 1) % data.content.length;
    // console.log(contentId);
    getAndSetCamera();
  };

  const decreementContentId = () => {
    // Make sure there are no negative numbers
    contentId = (contentId - 1 + data.content.length) % data.content.length;
    // console.log(contentId);
    getAndSetCamera();
  };

  const backtoMain = () => {
    contentId = 0;
    getAndSetCamera();
  };

  function onKeyDown(e) {
    switch (e.keyCode) {
      case 38:
        increementContentId();
        break;
      case 40:
        decreementContentId();
        break;
    }
  }

  onMount(async () => {
    const parentDiv: HTMLElement = document.getElementById("three");
    villageAnimation = new VillageAnimation(parentDiv, contentIDCallback);
  });
</script>

<main>
  <div class="visualization">
    <Tile
      title={data.content[contentId].title}
      description={data.content[contentId].description}
    />
    <div id="three" />

    <div class="button-back">
      <Button isArrow={false} callback={backtoMain} />
    </div>

    <div class="button-left">
      <Button isArrow={true} callback={decreementContentId} />
    </div>

    <div class="button-right">
      <Button isArrow={true} callback={increementContentId} />
    </div>
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

  .button-left {
    position: absolute;
    bottom: 40px;
    left: 40px;
    z-index: 100;
    transform: rotate(180deg);
    /* width: 30px;
    height: 30px; */
  }

  .button-right {
    background: url("/next-01.png");
    position: absolute;
    bottom: 40px;
    right: 40px;
    z-index: 100;
  }

  .button-back {
    position: absolute;
    top: 40px;
    right: 40px;
    z-index: 100;
  }

  .visualization {
    overflow: hidden;
  }
</style>
