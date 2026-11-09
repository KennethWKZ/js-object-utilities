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

	describe("Circular and shared references", () => {
		it("Should not descend into a direct self reference", () => {
			const object = {"name": "Bob"};
			object.self = object;
			expect(utils.entries(object)).to.eql([["name", "Bob"], ["self", object]]);
		});

		it("Should stop an indirect cycle at the first repeated ancestor", () => {
			const a = {"name": "a"};
			const b = {"name": "b", a};
			a.b = b;
			expect(utils.entries(a)).to.eql([["name", "a"], ["b", b], ["b.name", "b"], ["b.a", a]]);
		});

		it("Should stop a deep back reference to the root", () => {
			const root = {"level1": {"level2": {}}};
			root.level1.level2.root = root;
			expect(utils.entries(root).map((entry) => entry[0])).to.eql(["level1", "level1.level2", "level1.level2.root"]);
		});

		it("Should not descend into an array that contains itself", () => {
			const list = [1];
			list.push(list);
			expect(utils.entries({list}).map((entry) => entry[0])).to.eql(["list", "list.0", "list.1"]);
		});

		it("Should descend into every sibling that shares the same object", () => {
			const address = {"city": "Austin"};
			expect(utils.entries({"billing": address, "shipping": address})).to.eql([["billing", address], ["billing.city", "Austin"], ["shipping", address], ["shipping.city", "Austin"]]);
		});

		it("Should descend into an object repeated within an array", () => {
			const item = {"id": 1};
			expect(utils.entries({"items": [item, item]}).map((entry) => entry[0])).to.eql(["items", "items.0", "items.0.id", "items.1", "items.1.id"]);
		});
	});
});
