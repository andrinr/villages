<script lang="ts">

  export let iconSource: string;
  export let callback: (event) => void;

</script>

<button class="button" style="background-image: url({iconSource});" on:click={callback}/>

<style>
  .button {
    position: relative;
    z-index: 100;
    width: 35px;
    height: 35px;
    outline: none;
    border: none;
    background-size: cover;
    background-repeat: no-repeat;
    transition: 0.1s ease-in-out;
    background-color: transparent;
    cursor: pointer;
  }

  .button:hover {
    transform: scale(1.1);
  }

  @media screen and (orientation: portrait) {
    .button {
      width: 30px;
      height: 30px;
    }
  }
</style>
