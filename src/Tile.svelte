<script lang="ts">
  export let title = "";
  export let description = "";
  export let leftButton;
</script>

<main>
  <div class="tile">
    <div class="content">
      <div class="title">
        <h1>{title}</h1>
      </div>
      <div class="description">
        <p>{description}</p>
      </div>
    </div>
  </div>
  <button class="button button-left" bind:this={leftButton}>
    <!-- <img src="./next-01.png" alt="next-01" /> -->
  </button>
  <button class="button button-right">
    <!-- <img src="./next-01.png" alt="next-01" /> -->
  </button>
  <div />
</main>

<style>
  @import url("https://fonts.googleapis.com/css2?family=Space+Grotesk&display=swap");

  @font-face {
    font-family: "Satoshi";
    src: url("public/Satoshi-Variable.ttf") format("ttf");
  }

  .content {
    margin: 20px;
    color: #121212;
  }

  p {
    font-family: "Satoshi", sans-serif;
    /* color: red; */
  }

  .button {
    position: absolute;
    bottom: 40px;
    border-radius: 10px;
    z-index: 100;
    width: 65px;
    height: 65px;
    outline: none;
    border: none;
    background: url("/next-01.png");
    /* background-color: red; */
    background-size: cover;
    background-repeat: no-repeat;
    box-shadow: 0 0 0 rgba(0, 0, 0, 0);
    background-color: rgba(255, 255, 255, 0.8);
    transition: box-shadow 0.4s ease-in-out;
    /* transition: background-color 0.4s ease-in-out; */
  }

  .button-left {
    left: 40px;
    transform: rotate(180deg);
  }

  .button-right {
    right: 40px;
  }

  .button:hover {
    box-shadow: 0 0 15px rgba(0, 0, 0, 0.5);
  }

  .button:active {
    background-color: rgb(166, 166, 166);
    box-shadow: 0 0 15px rgba(0, 0, 0, 0.5);
  }

  .tile {
    z-index: 20;
    position: absolute;
    margin: 20px;
    width: 50vw;
    max-width: 300px;
    opacity: 0.8;
    border-radius: 10px;
    backdrop-filter: blur(50px);
    -webkit-backdrop-filter: blur(10px);

    /* font-family: "Roboto", sans-serif; */
    font-family: "Space Grotesk", sans-serif;

    font-weight: 400;
    background-color: rgb(255, 255, 255);
  }
</style>
