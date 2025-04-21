# Simp

~~As Svelte but worse~~

~~n+1 frontend framework~~

~~my yet another abandoned project~~

Simple frontend framework for building web applications.


## Example

**Counter:**

```html
<script>
    let count = 0
</script>

<button on:click="{{ count = count - 1 }}">Decrement</button>
<p>{{ count }}</p>
<button on:click="{{ count = count + 1 }}">Increment</button>
```

**Todo list:**

```html
<script>
    let todos = []
    let newTodo = ''

    const addNewTodo = () => {
        todos = [...todos, newTodo];
        newTodo = ''
    }
</script>

<h2>Todo List:</h2>

<input bind:value="{{ newTodo }}">

<button on:click="{{ addNewTodo() }}">Add</button>

<ul>
    <foreach items="{{ todos }}" item="{{ todo }}">
        <li>{{ todo }}</li>
    </foreach>
</ul>
```

## Usage


First, you need to build **simp** itself:
```shell
tsc
```

Then you can use compiled **simp** CLI to build `.simp` files:

```shell
npm run node-sanity dist/simp.js example.simp outputDir
```

## Demo

Website built from the [example.simp](./example.simp) is hosted on the project [GitHub Page](https://butvinm.github.io/simp/)
