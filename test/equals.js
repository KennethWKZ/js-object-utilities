const {expect} = require("chai");
const utils = require("../dist/index");

describe("utils.equals", () => {
	it("Should be a function", () => {
		expect(utils.equals).to.be.a("function");
	});

	const tests = [
		{
			"input": [{"hello": "world"}, {"hello": "world"}],
			"output": true
		},
		{
			"input": [{"hello": "world"}, {"hello": "universe"}],
			"output": false
		},
		{
			"input": [{"hello": "universe"}, {"hello": "world"}],
			"output": false
		},
		{
			"input": [{"hello": {"item": "world"}}, {"hello": "world"}],
			"output": false
		},
		{
			"input": [{"hello": {"item": "world"}}, {"hello": {"item": "universe"}}],
			"output": false
		},
		{
			"input": [{"hello": {"item": "world"}}, {"hello": {"item": "world"}}],
			"output": true
		},
		{
			"input": [[1, 2, 3], [1, 2, 3]],
			"output": true
		},
		{
			"input": [[2, 1, 3], [1, 2, 3]],
			"output": false
		},
		{
			"input": [[2, 1], [2, 1, 3]],
			"output": false
		},
		{
			"input": [[2, 1, 3], [2, 1]],
			"output": false
		},
		{
			"input": [1, 1],
			"output": true
		},
		{
			"input": [1, 2],
			"output": false
		},
		{
			"input": ["hello", "hello"],
			"output": true
		},
		{
			"input": ["hello", "world"],
			"output": false
		},
		{
			"input": ["hello", 1],
			"output": false
		}
	];

	tests.forEach((test) => {
		it(`Should return ${test.output} for ${JSON.stringify(test.input)}`, () => {
			expect(utils.equals(...test.input)).to.eql(test.output);
		});
	});

	describe("Values that aren't plain objects", () => {
		const cases = [
			["null and null", null, null, true],
			["null and an object", null, {}, false],
			["an object and null", {}, null, false],
			["null and an empty object as values", {"a": null}, {"a": {}}, false],
			["an array and an object", [], {}, false],
			["an object with index keys and an array", {"0": 1}, [1], false],
			["an undefined value and a missing key", {"a": undefined}, {}, false],
			["NaN and NaN", NaN, NaN, true],
			["equal Buffers", Buffer.from("ab"), Buffer.from("ab"), true],
			["different Buffers", Buffer.from("ab"), Buffer.from("ac"), false],
			["equal nested Buffers", {"k": Buffer.from("ab")}, {"k": Buffer.from("ab")}, true],
			["different nested Buffers", {"k": Buffer.from("ab")}, {"k": Buffer.from("ac")}, false],
			["different nested Uint8Arrays", {"k": new Uint8Array([1])}, {"k": new Uint8Array([2])}, false],
			["a Uint8Array and an array", new Uint8Array([1]), [1], false],
			["equal nested Dates", {"d": new Date(1)}, {"d": new Date(1)}, true],
			["different nested Dates", {"d": new Date(1)}, {"d": new Date(2)}, false],
			["equal nested Sets", {"s": new Set(["a", "b"])}, {"s": new Set(["b", "a"])}, true],
			["different nested Sets", {"s": new Set(["a"])}, {"s": new Set(["b"])}, false],
			["Sets of equal objects", new Set([{"a": 1}]), new Set([{"a": 1}]), true],
			["Sets of different sizes", new Set(["a"]), new Set(["a", "b"]), false],
			["a Set and an array", new Set(["a"]), ["a"], false],
			["equal Maps", new Map([["a", {"b": 1}]]), new Map([["a", {"b": 1}]]), true],
			["different Maps", new Map([["a", 1]]), new Map([["a", 2]]), false]
		];
		cases.forEach(([label, a, b, output]) => {
			it(`Should return ${output} for ${label}`, () => {
				expect(utils.equals(a, b)).to.eql(output);
			});
		});

		it("Should compare objects that contain themselves", () => {
			const a = {"name": "a"};
			a.self = a;
			const b = {"name": "a"};
			b.self = b;
			expect(utils.equals(a, b)).to.eql(true);
		});
	});
});
