<script lang="ts">
  import { onMount } from "svelte";
  import { watchResize } from "svelte-watch-resize";
  import { VillageAnimation } from "./animation/villageAnimation";
  import Tile from "./components/Tile.svelte";
  import Button from "./components/Button.svelte";

  // @ts-ignore
  import * as data from "./content.json";
  let contentId = 0;
  let buttons: HTMLElement;

  const contentIDCallback = (id: number) => {
    contentId = id;
  };

  let villageAnimation: VillageAnimation;

  const resize = (element : HTMLElement) => {
    if (villageAnimation){
      villageAnimation.resize(element);
    }
  };
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
    const canvas: HTMLCanvasElement = document.getElementById("three") as HTMLCanvasElement;
    const wrapper: HTMLElement = document.getElementById("wrapper");
    buttons = document.getElementById("buttons");
    villageAnimation = new VillageAnimation(canvas, wrapper, contentIDCallback);
  });
</script>

<main>
  <div class="visualization">
    <div id="wrapper" class="wrapper" use:watchResize={resize}>
      <canvas id="three" />
      <div class="wrapper-content">
        <div class='tile'>
          <Tile
            title={data.content[contentId].title}
            description={data.content[contentId].description}
          >
            <div class="buttons">
              <div class="button">
                <Button iconSource="icons/home-line.svg" callback={backtoMain} />
              </div>
        
              <div class="button">
                <Button iconSource="icons/arrow-left-s-line.svg" callback={decreementContentId} />
              </div>
        
              <div class="button">
                <Button iconSource="icons/arrow-right-s-line.svg" callback={increementContentId} />
              </div>
            </div>
          </Tile>
        </div>
      </div> 
    </div>
  </div>
</main>

<svelte:window on:keydown={onKeyDown} />

<style>

  .wrapper {
    position: absolute;
    transition: 0.3s ease-in-out;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
  }

  #three {
    position: relative;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
  }

  .wrapper-content {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 100;
  }

  .tile {
    margin: 20px;
    z-index: 100;
  }

  @media only screen and (max-width: 768px) {
    .wrapper-content {
      top: auto;
      bottom: 0;
      width: 100%;
    }

    .tile {
      margin: 10px;
      z-index: 100;
    }
  }

  .buttons {
    position: absolute;
    bottom: 0;
    display: flex;
    justify-content: flex-start;
    padding-top: 30px;
    margin-bottom: 30px;
  }

  .button {
    position: relative;
    margin-right: 10px;
    z-index: 100;
  }

  .visualization {
    overflow: hidden;
  }
</style>
