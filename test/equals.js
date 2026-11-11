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
});
