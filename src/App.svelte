<script lang="ts">
  import { onMount } from "svelte";
  import { watchResize } from "svelte-watch-resize";
  import { VillageAnimation } from "./animation/villageAnimation";
  import Tile from "./components/Tile.svelte";
  import Icon from "./components/Icon.svelte";
  import Button from "./components/Button.svelte";
  import Loader from "./components/Loader.svelte";

  // @ts-ignore
  import * as data from "./content.json";
  let contentId = 0;
  let buttons: HTMLElement;

  let horizontal = window.innerWidth > window.innerHeight;

  const contentIDCallback = (id: number) => {
    contentId = id;
  };

  let villageAnimation: VillageAnimation;

  const resize = (element: HTMLElement) => {
    if (villageAnimation) {
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

  const loadedScene = () => {
    console.log("loaded scene");
    document.getElementById("loading-screen").style.display = "none";
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
    const canvas: HTMLCanvasElement = document.getElementById(
      "three"
    ) as HTMLCanvasElement;
    const wrapper: HTMLElement = document.getElementById("wrapper");
    buttons = document.getElementById("buttons");
    villageAnimation = new VillageAnimation(canvas, wrapper, contentIDCallback, loadedScene);
  });
</script>

<main>
  <div id="wrapper" class="wrapper" use:watchResize={resize}>
    <canvas id="three" />
    <div class="loading-screen" id="loading-screen">
      <div class=loader>
        <Loader />
      </div>
    </div>

    <div class="navigation">
      {#each data.content as content, i}
        <Button callback={() => {contentId = i; getAndSetCamera();}} text={content.title} />
      {/each}
    </div>

    <div class="navigation-mobile">
      <Button callback={backtoMain} text="Home" />
    </div>

    <div class="wrapper-content">
      <div class="tile">
        <Tile
          title={data.content[contentId].title}
          subtitle={data.content[contentId].subtitle}
          description={data.content[contentId].description}
          slug={data.content[contentId].slug}
        >
          <div class="buttons">
            <div class="button">
              <Icon iconSource="icons/home-line.svg" callback={backtoMain} />
            </div>

            <div class="button">
              <Icon
                iconSource="icons/arrow-left-s-line.svg"
                callback={decreementContentId}
              />
            </div>

            <div class="button">
              <Icon
                iconSource="icons/arrow-right-s-line.svg"
                callback={increementContentId}
              />
            </div>
          </div>
        </Tile>
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

  .hidden {
    display: none;
  }

  .wrapper-content {
    position: absolute;
    top: 50%;
    -ms-transform: translateY(-50%);
    transform: translateY(-50%);
    left: 0;
    z-index: 100;
  }

  .navigation {
    position: absolute;
    bottom: 0;
    left: 0;
    z-index: 100;
    padding: 10px;
  }

  .loading-screen{
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    z-index: 200;
    background-color: #ffffff;
  }

  .loader {
    /* Center vertically and horizontally */
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  .tile {
    margin-left: 60px;
    z-index: 100;
  }
  .buttons {
    position: absolute;
    bottom: 0;
    display: flex;
    justify-content: flex-start;
    padding-top: 30px;
    margin-bottom: 10px;
  }

  .button {
    position: relative;
    margin-right: 10px;
    z-index: 100;
  }

  .minimize-button {
    position: absolute;
    top: 0;
    right: 0;
    z-index: 100;
  }

  .navigation-mobile {
    position: absolute;
    top: 0;
    right: 0;
    z-index: 100;
    padding: 10px;
    display: none;
  }

  @media (orientation: portrait) {

    .navigation {
      display: none;
    }

    .navigation-mobile {
      display: block;
    }

    .wrapper-content {
      top: auto;
      bottom: 0;
      width: 100%;
      transform: none;
      -ms-transform: none;
    }

    .tile {
      margin: 10px;
      z-index: 100;
    }

    .buttons {
      padding-top: 10px;
    }
  }
</style>
