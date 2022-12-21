<script lang="ts">
  export let isArrow: boolean = true;
  export let callback: (event) => void;
</script>

<!-- class="{pointLeft ? 'button-left' : 'button-right'} button" -->
<button class={isArrow ? "button-arrow" : "button-back"} on:click={callback}>
  <!-- <img src="./next-01.png" alt="next-01" /> -->
</button>

<style>
  .button-arrow {
    background: url("/next-01.png");
    position: relative;
    border-radius: 10px;
    z-index: 100;
    width: 40px;
    height: 40px;
    outline: none;
    border: none;
    background-size: cover;
    background-repeat: no-repeat;
    box-shadow: 0 0 0 rgba(0, 0, 0, 0);
    background-color: rgba(255, 255, 255, 0.8);
    transition: box-shadow 0.1s ease-in-out;
  }
  .button-back {
    background: url("/cancel.png");
    position: relative;
    border-radius: 10px;
    z-index: 100;
    width: 40px;
    height: 40px;
    outline: none;
    border: none;
    background-size: cover;
    background-repeat: no-repeat;
    box-shadow: 0 0 0 rgba(0, 0, 0, 0);
    background-color: rgba(255, 255, 255, 0.8);
    transition: box-shadow 0.1s ease-in-out;
  }

  @media screen and (orientation: portrait) {
    .button-arrow {
      width: 30px;
      height: 30px;
    }

    .button-back {
      width: 30px;
      height: 30px;
    }
  }
</style>
