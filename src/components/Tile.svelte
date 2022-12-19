<script lang="ts">
  export let title = "";
  export let description = "";
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

  @media screen and (orientation: portrait) {
    .tile {
      position: absolute;
      width: 300px;
      height: auto;
      left: 0px;
      right: 0px;
      bottom: 20px;
      margin: auto;
    }
  }
</style>
