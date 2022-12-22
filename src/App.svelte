<script lang="ts">
  import { onMount } from "svelte";
  import { VillageAnimation } from "./animation/villageAnimation";
  import Tile from "./components/Tile.svelte";
  import Button from "./components/Button.svelte";

  // @ts-ignore
  import * as data from "./content.json";
  let contentId = 0;
  let buttons: HTMLElement;

  const contentIDCallback = (id: number) => {
    contentId = id;
    if (buttons) {
      buttons.style.display = id == 0 ? "none" : "block";
    }
  };

  let villageAnimation: VillageAnimation;

  const getAndSetCamera = () => {
    villageAnimation.animateCamera(contentId, 2000);
  };

  const increementContentId = () => {
    contentId = (contentId + 1) % data.content.length;
    getAndSetCamera();
  };

  const decreementContentId = () => {
    // Make sure there are no negative numbers
    contentId = (contentId - 1 + data.content.length) % data.content.length;
    getAndSetCamera();
  };

  const backtoMain = () => {
    contentId = 0;
    getAndSetCamera();
  };

  function onKeyDown(e) {
    switch (e.keyCode) {
      case 39:
        increementContentId();
        break;
      case 37:
        decreementContentId();
        break;
    }
  }

  onMount(async () => {
    const parentDiv: HTMLElement = document.getElementById("three");
    buttons = document.getElementById("buttons");
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

    <div id="buttons">
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
    bottom: 20px;
    left: 20px;
    z-index: 100;
    transform: rotate(180deg);
    /* width: 30px;
    height: 30px; */
  }

  .button-right {
    background: url("/next-01.png");
    position: absolute;
    bottom: 20px;
    right: 20px;
    z-index: 100;
  }

  .button-back {
    position: absolute;
    top: 20px;
    right: 20px;
    z-index: 100;
  }

  @media screen and (orientation: portrait) {
    .button-left {
      left: 5px;
      top: 50%;
      transform: translateY(-50%), rotate(180deg);
      bottom: auto;
    }

    .button-right {
      right: 5px;
      top: 50%;
      transform: translateY(-50%);
      bottom: auto;
    }
  }

  .visualization {
    overflow: hidden;
  }
</style>
