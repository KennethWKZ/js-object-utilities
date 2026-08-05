const {expect} = require("chai");
const utils = require("../dist/index");

describe("utils.delete", () => {
	it("Should be a function", () => {
		expect(utils.delete).to.be.a("function");
	});

	it("Should leave Object.prototype alone for prototype keys", () => {
		const originalToString = Object.prototype.toString;
		const result = utils.delete({}, "__proto__.toString");
		expect(result).to.eql({});
		expect(Object.prototype.toString).to.equal(originalToString);
	});

	const tests = [
		{
			"input": [{}, "hello"],
			"output": {}
		},
		{
			"input": [{}, "hello.test"],
			"output": {}
		},
		{
			"input": [{"hello": "world"}, "hello"],
			"output": {}
		},
		{
			"input": [{"hello": "world", "test": "data"}, "test"],
			"output": {"hello": "world"}
		},
		{
			"input": [["world", "universe"], "0"],
			"output": ["universe"]
		},
		{
			"input": [["world", "universe"], 0],
			"output": ["universe"]
		},
		{
			"input": [{"hello": ["world", "universe"]}, "hello.0"],
			"output": {"hello": ["universe"]}
		},
		{
			"input": [{"name": "Bob", "address": {"country": "world", "zip": 12345}}, "address.country"],
			"output": {"name": "Bob", "address": {"zip": 12345}}
		},
		{
			"input": [{"name": "Bob", "friends": ["Bob", "Tim"]}, "friends.0"],
			"output": {"name": "Bob", "friends": ["Tim"]}
		},
		{
			"input": [{"id": 1, "friends": [{"name": "Bob", "id": 1}, {"name": "Tim"}]}, "friends.1.name"],
			"output": {"id": 1, "friends": [{"name": "Bob", "id": 1}, {}]}
		},
		{
			"input": [{"hello": "world", "test": "data"}, ["test", "hello"]],
			"output": {}
		},
		{
			"input": [{"hello": "world", "test": "data", "random": "thing"}, ["test", "hello"]],
			"output": {"random": "thing"}
		},
		{
			"input": [{"hello": "world", "test": {"data1": "first", "data2": "item"}}, ["hello", "test.data1"]],
			"output": {"test": {"data2": "item"}}
		},
		{
			"input": [{}, "__proto__.toString"],
			"output": {}
		},
		{
			"input": [{}, "__proto__"],
			"output": {}
		},
		{
			"input": [{}, "prototype", "Hello"],
			"output": {}
		},
		{
			"input": [{}, "constructor", "Hello"],
			"output": {}
		}
	];

	tests.forEach((test) => {
		it(`Should return ${test.output} for ${test.input}`, () => {
			expect(utils.delete(...test.input)).to.eql(test.output);
		});
	});
});
