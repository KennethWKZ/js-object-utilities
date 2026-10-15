const {expect} = require("chai");
const utils = require("../dist/index");

describe("utils.entries", () => {
	it("Should be a function", () => {
		expect(utils.entries).to.be.a("function");
	});

	const tests = [
		{
			"input": {"hello": "world"},
			"output": [["hello", "world"]]
		},
		{
			"input": {"hello": undefined},
			"output": [["hello", undefined]]
		},
		{
			"input": {"hello": null},
			"output": [["hello", null]]
		},
		{
			"input": {"hello": "world", "test": "data"},
			"output": [["hello", "world"], ["test", "data"]]
		},
		{
			"input": {"name": "Bob", "address": {"country": "world", "zip": 12345}},
			"output": [["name", "Bob"], ["address", {"country": "world", "zip": 12345}], ["address.country", "world"], ["address.zip", 12345]]
		},
		{
			"input": {"name": "Bob", "friends": ["Bob", "Tim"]},
			"output": [["name", "Bob"], ["friends", ["Bob", "Tim"]], ["friends.0", "Bob"], ["friends.1", "Tim"]]
		},
		{
			"input": {"id": 1, "friends": [{"name": "Bob", "id": 1}, {"name": "Tim"}]},
			"output": [["id", 1], ["friends", [{"name": "Bob", "id": 1}, {"name": "Tim"}]], ["friends.0", {"name": "Bob", "id": 1}], ["friends.0.name", "Bob"], ["friends.0.id", 1], ["friends.1", {"name": "Tim"}], ["friends.1.name", "Tim"]]
		},
		{
			"input": {"hello": Buffer.from("world")},
			"output": [["hello", Buffer.from("world")]]
		}
	];

	tests.forEach((test) => {
		it(`Should return ${test.output} for ${test.input}`, () => {
			expect(utils.entries(test.input)).to.eql(test.output);
		});
	});
	describe("Binary values", () => {
		it("Should not descend into a Buffer", () => {
			const content = Buffer.from("abc");
			expect(utils.entries({content})).to.eql([["content", content]]);
		});

		it("Should not descend into a Uint8Array", () => {
			const content = new Uint8Array([1, 2, 3]);
			expect(utils.entries({content})).to.eql([["content", content]]);
		});

		it("Should not descend into a nested Uint8Array", () => {
			const content = new Uint8Array([1]);
			expect(utils.entries({"file": {content}})).to.eql([["file", {content}], ["file.content", content]]);
		});

		it("Should not throw for a large Uint8Array", () => {
			const content = new Uint8Array(400000);
			expect(utils.entries({content})).to.eql([["content", content]]);
		});
	});
});
