<script lang="ts">
  import { onMount } from "svelte";
  export let title = "";
  export let description = "";

  onMount(async () => {
    const parentDiv: HTMLElement = document.getElementById("tile");
    const childDiv: HTMLElement = document.getElementById("content");
    const portraitQuery = window.matchMedia("(orientation: portrait)");

    console.log(parentDiv);
    console.log(childDiv);

    parentDiv.scrollTop = childDiv.offsetTop;
    parentDiv.scrollTop = childDiv.offsetTop - parentDiv.offsetHeight / 2;

    let isTileCentered = false;

    portraitQuery.addListener((event) => {
      if (event.matches) {
        // Add a click event listener to the element
        document.getElementById("tile").addEventListener("click", () => {
          console.log("Click!");
          // Get the current position of the item
          const currentPosition = parentDiv.getBoundingClientRect();

          parentDiv.style.transform = isTileCentered
            ? "translateY(82%)"
            : "translateY(0%)";

          isTileCentered = !isTileCentered;
        });
      }
    });
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
    z-index: 20;
    position: absolute;
    left: 20px;
    right: 20px;
    /* bottom: 130px;
    top: 20px; */
    bottom: auto;
    height: 50%;
    top: 30px;
    width: 50vw;
    max-width: 300px;
    opacity: 0.8;
    border-radius: 10px;
    backdrop-filter: blur(50px);
    -webkit-backdrop-filter: blur(10px);

    background-color: rgb(255, 255, 255);
    overflow: scroll;
    scroll-behavior: smooth;
    /* overflow: hidden; */

    -ms-overflow-style: none; /* IE and Edge */
    scrollbar-width: none; /* Firefox */
  }

  @media screen and (orientation: portrait) {
    #tile {
      position: absolute;
      height: auto;
      bottom: 70px;
      top: 70px;
      margin: auto;
      width: 80vw;
      max-width: 1000px;
      transition: transform 0.5s ease-in-out;
      transform: translateY(82%);
      /* overflow: scroll;
      scroll-behavior: smooth; */
    }
  }

  /* @-webkit-keyframes animateToCenter {
  from {
    -webkit-transform: rotate(0deg) scale(1) skew(0deg) translate(100px);
  }
  to {
    -webkit-transform: rotate(0deg) scale(2) skew(0deg) translate(100px);
  }
} */

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
  }
</style>
