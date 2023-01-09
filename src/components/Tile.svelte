<script lang="ts">
  import { onMount } from "svelte";
  export let title = "";
  export let description = "";

  onMount(async () => {
    const parentDiv: HTMLElement = document.getElementById("tile");
    const childDiv: HTMLElement = document.getElementById("content");
  });
</script>

<main>
  <div id="tile">
    <div id="content">
      <div class="title">
        <h1>{title}</h1>
      </div>
      <div class="description">
        <p>{description}</p>
      </div>
      <slot />
    </div>
  </div>
  <div />
</main>

<style>
  @import url("https://fonts.googleapis.com/css2?family=Space+Grotesk&display=swap");

  @font-face {
    font-family: "MyFont";
    src: url("/fonts/Chillax-Variable.ttf") format("truetype");
    font-weight: 500;
  }

  #tile {
    border-radius: 10px;
    max-width: 400px;
    height: 50vh;
    background-color: rgb(255, 255, 255);
    opacity: 0.6;
    overflow: scroll;
    scroll-behavior: smooth;
    /* overflow: hidden; */

    -ms-overflow-style: none; /* IE and Edge */
    scrollbar-width: none; /* Firefox */
  }

  /* Hide scrollbar for Chrome, Safari and Opera */
  #tile::-webkit-scrollbar {
    display: none;
  }

  #content {
    margin: 20px;
    color: #121212;
  }

  .title {
    font-family: "MyFont";
    font-weight: 700;
  }

  .description {
    font-family: "Space Grotesk", sans-serif;
    font-weight: 100;
    margin-bottom: 50px;
    white-space: pre-wrap;
  }

  @media (orientation: portrait) {
    #tile {
      max-width: 100%;
      width: 100%;
      height: 100%;
      padding-bottom: 20px;
    }
    h1 {
      font-size: 1.3rem;
    }
    p {
      font-size: 0.8rem;
    }

    .description {
      margin-bottom: 30px;
    }
  }
</style>
