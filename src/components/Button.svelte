<script lang="ts">

  export let text: string;
  export let callback: (event) => void;

</script>

<button class="button" on:click={callback}>
  {text}
</button>

<style>
  .button {
    background-color: #333;
    cursor: pointer;
    border-radius: 4px;
    border: none;
    color: white;
    padding:10px 20px;
    margin: 4px;
    text-align: center;
    text-decoration: none;
    display: inline-block;
    font-size: 16px;
  }

  .button:hover {
    transform: scale(1.03);
  }

</style>
