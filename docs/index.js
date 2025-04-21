import { ReactiveVariable } from './runtime.js';
const x = 10;
let count = new ReactiveVariable("count", 0);
let todos = new ReactiveVariable("todos", []);
let newTodo = new ReactiveVariable("newTodo", '');
const addNewTodo = () => {
    todos.set([...todos.get(), newTodo.get()]);
    newTodo.set('');
};
const div1 = document.createElement("div");
    div1.setAttribute("class", "wrapper");
    const textNode2 = document.createTextNode("\n    ");
    div1.appendChild(textNode2);
    const section3 = document.createElement("section");
        section3.setAttribute("class", "section");
        const textNode4 = document.createTextNode("\n        ");
        section3.appendChild(textNode4);
        const div5 = document.createElement("div");
            div5.setAttribute("class", "title-wrapper");
            const textNode6 = document.createTextNode("\n            ");
            div5.appendChild(textNode6);
            const h17 = document.createElement("h1");
                h17.setAttribute("class", "title");
                const textNode8 = document.createTextNode("Simp");
                h17.appendChild(textNode8);
            div5.appendChild(h17);
            const textNode9 = document.createTextNode("\n            ");
            div5.appendChild(textNode9);
            const h310 = document.createElement("h3");
                h310.setAttribute("class", "subtitle");
                const textNode11 = document.createTextNode("Make web simple again.");
                h310.appendChild(textNode11);
            div5.appendChild(h310);
            const textNode12 = document.createTextNode("\n        ");
            div5.appendChild(textNode12);
        section3.appendChild(div5);
        const textNode13 = document.createTextNode("\n        ");
        section3.appendChild(textNode13);
        const div14 = document.createElement("div");
            div14.setAttribute("class", "counter-wrapper");
            const textNode15 = document.createTextNode("\n            ");
            div14.appendChild(textNode15);
            const button16 = document.createElement("button");
                button16.setAttribute("class", "counter-btn");
                button16.addEventListener("click", (event) => { count.set(count.get() - 1); });
                const textNode17 = document.createTextNode("Decrement");
                button16.appendChild(textNode17);
            div14.appendChild(button16);
            const textNode18 = document.createTextNode("\n            ");
            div14.appendChild(textNode18);
            const p19 = document.createElement("p");
                p19.setAttribute("class", "counter");
                const textNode20 = document.createTextNode("{{ count }}");
                    count.subscribe((newValue) => { textNode20.textContent = count.get(); });
                p19.appendChild(textNode20);
            div14.appendChild(p19);
            const textNode21 = document.createTextNode("\n            ");
            div14.appendChild(textNode21);
            const button22 = document.createElement("button");
                button22.setAttribute("class", "counter-btn");
                button22.addEventListener("click", (event) => { count.set(count.get() + 1); });
                const textNode23 = document.createTextNode("Increment");
                button22.appendChild(textNode23);
            div14.appendChild(button22);
            const textNode24 = document.createTextNode("\n        ");
            div14.appendChild(textNode24);
        section3.appendChild(div14);
        const textNode25 = document.createTextNode("\n        ");
        section3.appendChild(textNode25);
        const div26 = document.createElement("div");
            div26.setAttribute("class", "todo-wrapper");
            const textNode27 = document.createTextNode("\n            ");
            div26.appendChild(textNode27);
            const h228 = document.createElement("h2");
                const textNode29 = document.createTextNode("Todo List:");
                h228.appendChild(textNode29);
            div26.appendChild(h228);
            const textNode30 = document.createTextNode("\n\n            ");
            div26.appendChild(textNode30);
            const input31 = document.createElement("input");
                input31.setAttribute("class", "todo-input");
                newTodo.subscribe((newValue) => {
                    input31["value"] = newValue;
                });
                input31.addEventListener("input", (event) => {
                    const newValue = input31["value"];
                    newTodo.set(newValue);
                });
            div26.appendChild(input31);
            const textNode32 = document.createTextNode("\n\n            ");
            div26.appendChild(textNode32);
            const button33 = document.createElement("button");
                button33.setAttribute("class", "counter-btn");
                button33.addEventListener("click", (event) => { addNewTodo(); });
                const textNode34 = document.createTextNode("Add");
                button33.appendChild(textNode34);
            div26.appendChild(button33);
            const textNode35 = document.createTextNode("\n\n            ");
            div26.appendChild(textNode35);
            const ul36 = document.createElement("ul");
                const textNode37 = document.createTextNode("\n                ");
                ul36.appendChild(textNode37);
                
                    const foreach38 = document.createElement("div");
                    foreach38.setAttribute("style", "display: contents");
                    let todo = new ReactiveVariable("todo", undefined);
                    const foreach38_createItem = (todo_value) => {
                    
                        let todo = new ReactiveVariable("todo", todo_value);
                        const textNode39 = document.createTextNode("\n                    ");
                        foreach38.appendChild(textNode39);
                        const li40 = document.createElement("li");
                            li40.setAttribute("class", "todo-item");
                            const textNode41 = document.createTextNode("{{ todo }}");
                                todo.subscribe((newValue) => { textNode41.textContent = todo.get(); });
                            li40.appendChild(textNode41);
                        foreach38.appendChild(li40);
                        const textNode42 = document.createTextNode("\n                ");
                        foreach38.appendChild(textNode42);
                        todo.invoke();
                    };
                    todos.subscribe((newValue) => { foreach38.innerHTML = ''; for (const item of newValue) foreach38_createItem(item) });
    
                ul36.appendChild(foreach38);
                const textNode43 = document.createTextNode("\n            ");
                ul36.appendChild(textNode43);
            div26.appendChild(ul36);
            const textNode44 = document.createTextNode("\n        ");
            div26.appendChild(textNode44);
        section3.appendChild(div26);
        const textNode45 = document.createTextNode("\n    ");
        section3.appendChild(textNode45);
    div1.appendChild(section3);
    const textNode46 = document.createTextNode("\n    ");
    div1.appendChild(textNode46);
    const footer47 = document.createElement("footer");
        footer47.setAttribute("class", "footer");
        const textNode48 = document.createTextNode("\n        ");
        footer47.appendChild(textNode48);
        const p49 = document.createElement("p");
            const textNode50 = document.createTextNode("2024 butvinm");
            p49.appendChild(textNode50);
        footer47.appendChild(p49);
        const textNode51 = document.createTextNode("\n        ");
        footer47.appendChild(textNode51);
        const p52 = document.createElement("p");
            const a53 = document.createElement("a");
                a53.setAttribute("class", "github-link");
                a53.setAttribute("href", "https://github.com/butvinm/simp.git");
                const textNode54 = document.createTextNode("GitHub");
                a53.appendChild(textNode54);
            p52.appendChild(a53);
        footer47.appendChild(p52);
        const textNode55 = document.createTextNode("\n    ");
        footer47.appendChild(textNode55);
    div1.appendChild(footer47);
    const textNode56 = document.createTextNode("\n");
    div1.appendChild(textNode56);
document.body.appendChild(div1);
const style = document.createElement('style');style.textContent = `
    html {
        font-family: monospace;
    }

    body {
        margin: 0;
        padding: 0;
        width: 100vw;
        height: 100vh;
    }

    .wrapper {
        display: flex;
        justify-content: space-between;
        align-items: stretch;
        flex-direction: column;
        height: 100%;
        width: 100%;
    }

    .section {
        flex-grow: 1;
        padding: 10rem;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: center;
        gap: 3rem;
    }

    .title-wrapper {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    }

    .title {
        font-size: 12rem;
        margin: 0;
    }

    .subtitle {
        color: crimson;
    }

    .counter-wrapper {
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        gap: 3rem;
    }

    .counter-btn {
        padding: 1rem;
        font-size: 1.5rem;
        background-color: #ffffff;
        border: 3px solid black;
        border-radius: 5px;
        cursor: pointer;
    }

    .counter {
        font-size: 3rem;
        color: crimson;
    }

    .todo-input {
        padding: 1rem;
        font-size: 1.5rem;
        background-color: #ffffff;
        border: 3px solid black;
        border-radius: 5px;
        cursor: pointer;
    }

    .todo-item {
        font-size: 1.5rem;
    }

    .footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0 1rem;
    }

    .github-link {
        color: black;
        text-decoration: none;
    }
`;document.head.appendChild(style);
addEventListener("load", () => {
    count.invoke();
    todos.invoke();
    newTodo.invoke();
    todo.invoke();
});
