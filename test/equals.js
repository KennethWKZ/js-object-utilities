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

	describe("Binary values", () => {
		const binaryTests = [
			{"name": "equal nested Uint8Arrays", "input": [{"content": new Uint8Array([1, 2])}, {"content": new Uint8Array([1, 2])}], "output": true},
			{"name": "nested Uint8Arrays with different bytes", "input": [{"content": new Uint8Array([1])}, {"content": new Uint8Array([2])}], "output": false},
			{"name": "nested Uint8Arrays with different lengths", "input": [{"content": new Uint8Array([1])}, {"content": new Uint8Array([1, 2])}], "output": false},
			{"name": "nested Uint8Arrays in the other order", "input": [{"content": new Uint8Array([1, 2])}, {"content": new Uint8Array([1])}], "output": false},
			{"name": "equal nested Buffers", "input": [{"content": Buffer.from("abc")}, {"content": Buffer.from("abc")}], "output": true},
			{"name": "nested Buffers with different bytes", "input": [{"content": Buffer.from("abc")}, {"content": Buffer.from("abd")}], "output": false},
			{"name": "a nested Uint8Array and a nested object", "input": [{"content": new Uint8Array([1])}, {"content": {"0": 1}}], "output": false},
			{"name": "a nested object and a nested Uint8Array", "input": [{"content": {"0": 1}}, {"content": new Uint8Array([1])}], "output": false},
			{"name": "equal top-level Uint8Arrays", "input": [new Uint8Array([1, 2]), new Uint8Array([1, 2])], "output": true},
			{"name": "top-level Uint8Arrays with different bytes", "input": [new Uint8Array([1, 2]), new Uint8Array([1, 3])], "output": false},
			{"name": "a top-level Uint8Array and an array", "input": [new Uint8Array([1]), [1]], "output": false}
		];

		binaryTests.forEach((test) => {
			it(`Should return ${test.output} for ${test.name}`, () => {
				expect(utils.equals(...test.input)).to.eql(test.output);
			});
		});

		it("Should compare large Uint8Arrays without throwing", () => {
			expect(utils.equals({"content": new Uint8Array(400000)}, {"content": new Uint8Array(400000)})).to.eql(true);
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

		it("Should not reuse a pair from a failed Set element comparison", () => {
			const one = {"v": 1};
			const two = {"v": 2};
			const shared = {"n": two, "z": 9};
			// Comparing `{"n": one, "z": 0}` with `shared` fails, and must not leave `one` and `two` recorded as equal for the next element.
			const a = new Set([shared, {"n": one, "z": 0}]);
			const b = new Set([shared, {"n": two, "z": 0}]);
			expect(utils.equals(a, b)).to.eql(false);
		});

		it("Should compare a self cycle with a two object cycle in both orders", () => {
			const a = {};
			a.next = a;
			const b = {};
			const c = {};
			b.next = c;
			c.next = b;
			expect(utils.equals(a, b)).to.eql(true);
			expect(utils.equals(b, a)).to.eql(true);
		});

		it("Should not match two Set elements to the same element of the other Set", () => {
			expect(utils.equals(new Set([{"v": 1}, {"v": 1}]), new Set([{"v": 1}, {"v": 2}]))).to.eql(false);
			expect(utils.equals(new Set([{"v": 1}, {"v": 2}]), new Set([{"v": 1}, {"v": 1}]))).to.eql(false);
		});

		it("Should not match a Set element to an element the other Set shares with it", () => {
			const shared = {"v": 1};
			expect(utils.equals(new Set([{"v": 1}, shared]), new Set([shared, {"v": 2}]))).to.eql(false);
			expect(utils.equals(new Set([shared, {"v": 1}]), new Set([shared, {"v": 2}]))).to.eql(false);
		});

		it("Should match Set elements that are equal in a different order", () => {
			const shared = {"v": 3};
			expect(utils.equals(new Set([{"v": 1}, shared, {"v": 2}]), new Set([{"v": 2}, {"v": 1}, shared]))).to.eql(true);
		});
	});
});
