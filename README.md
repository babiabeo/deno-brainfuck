# deno-brainfuck

A [Brainfuck][bf] interpreter written in TypeScript and Deno.

## Usage

```
./brainfuck <BRAINFUCK_FILE>
```

## Build from source

You need [Deno][deno] to compile TypeScript into an executable. If you don't
have it, install it.

Then clone this repo and execute the following:

```sh
git clone https://github.com/babiabeo/deno-brainfuck
cd deno-brainfuck
deno task compile
```

You should see an executable `brainfuck` in the current directory. To test it,
run:

```sh
./brainfuck examples/hello_world.bf
# Hello World!
```

[bf]: https://en.wikipedia.org/wiki/Brainfuck
[deno]: https://deno.com/
