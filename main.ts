const CELLS = 30000;

// deno-fmt-ignore
enum OP {
    INC_VAL = 0x2B, // +
    DEC_VAL = 0x2D, // -
    INC_PTR = 0x3E, // >
    DEC_PTR = 0x3C, // <
    JMP_FWD = 0x5B, // [
    JMP_BWD = 0x5D, // ]
    OUTPUT  = 0x2E, // .
    INPUT   = 0x2C, // ,
}

interface Instruction {
    op: OP;
    matching?: number;
}

function lexer(buf: Uint8Array): Instruction[] {
    const program: Instruction[] = [];
    const jumps: number[] = [];

    for (let i = 0; i < buf.length; ++i) {
        switch (buf[i]) {
            case OP.INC_VAL:
            case OP.DEC_VAL:
            case OP.INC_PTR:
            case OP.DEC_PTR:
            case OP.INPUT:
            case OP.OUTPUT:
                program.push({ op: buf[i] });
                break;
            case OP.JMP_FWD:
                jumps.push(program.length);
                program.push({ op: OP.JMP_FWD });
                break;
            case OP.JMP_BWD: {
                const matching = jumps.pop();
                if (matching === undefined) {
                    throw new SyntaxError("Unmatching '[' command");
                }

                program[matching].matching = program.length;
                program.push({ op: OP.JMP_BWD, matching });
                break;
            }
        }
    }

    if (jumps.length > 0) {
        throw new SyntaxError("Unmatching ']' command");
    }

    return program;
}

async function execute(program: Instruction[]) {
    const data = new Uint8Array(CELLS);
    let ptr = 0;

    for (let i = 0; i < program.length; ++i) {
        switch (program[i].op) {
            case OP.INC_VAL:
                ++data[ptr];
                break;
            case OP.DEC_VAL:
                --data[ptr];
                break;
            case OP.INC_PTR: {
                if (ptr === CELLS) {
                    throw new Error("Overflowed");
                }
                ++ptr;
                break;
            }
            case OP.DEC_PTR: {
                if (ptr < 0) {
                    throw new Error("Overflowed");
                }
                --ptr;
                break;
            }
            case OP.JMP_FWD: {
                const matching = program[i].matching!;
                i = data[ptr] === 0 ? matching : program[matching].matching!;
                break;
            }

            case OP.JMP_BWD: {
                const matching = program[i].matching!;
                i = data[ptr] !== 0 ? matching : program[matching].matching!;
                break;
            }
            case OP.OUTPUT: {
                const out = new Uint8Array(1);
                out[0] = data[ptr];
                await Deno.stdout.write(out);
                break;
            }
            case OP.INPUT: {
                const inp = new Uint8Array(1);
                await Deno.stdin.read(inp);
                data[ptr] = inp[0];
                break;
            }
        }
    }
}

async function main() {
    const file = Deno.args[0];
    const content = await Deno.readFile(file);
    const program = lexer(content);

    await execute(program);
}

if (import.meta.main) {
    await main();
}
