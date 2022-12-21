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
    font-family: "MyFont";
    src: url("/fonts/Chillax-Variable.ttf") format("truetype");
    font-weight: 500;
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

    background-color: rgb(255, 255, 255);
  }

  .content {
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
</style>
