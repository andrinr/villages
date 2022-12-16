<script lang="ts">
    export let pointLeft : boolean = true;
    export let callback : (event) => void;
</script>

<button class="{pointLeft ? 'button-left' : 'button-right'} button" on:click={callback}>
    <!-- <img src="./next-01.png" alt="next-01" /> -->
</button>

<style>
.button {
    position: relative;
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
    transition: box-shadow 0.1s ease-in-out;
    /* transition: background-color 0.4s ease-in-out; */
  }

  .button-left {
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