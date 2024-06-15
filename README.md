# Simp

~~As Svelte but worse~~

~~n+1 frontend framework~~

~~my yet another abandoned project~~

Simple frontend framework for building web applications.


## Example

```html
<script>
    let count = 0
</script>

<button on:click="{{ count = count - 1 }}">Decrement</button>
<p class="counter">{{ count }}</p>
<button on:click="{{ count = count + 1 }}">Increment</button>
```

## Demo

You can find [Live Demo](https://simp-1-g6602270.deta.app/) with [example.simp](./example.simp) on Deta Space.
