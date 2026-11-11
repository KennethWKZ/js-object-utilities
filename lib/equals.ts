import entries = require("./entries");

// `entries` treats binary values (`Buffer` is a `Uint8Array`) as leaves, so they are compared here by length and bytes.
const binaryEquals = (a: any, b: any): boolean => {
	return a instanceof Uint8Array && b instanceof Uint8Array && a.length === b.length && a.every((byte, index) => byte === b[index]);
};

export = (a: any, b: any): boolean => {
	if (a instanceof Uint8Array || b instanceof Uint8Array) {
		return binaryEquals(a, b);
	}
	if (typeof a !== "object" || typeof b !== "object") {
		return a === b;
	}

	const aEntries = entries(a);
	const bEntries = entries(b);
	const bEntriesMap = bEntries.reduce((res, value) => {
		const [key, val] = value;
		res[key] = val;
		return res;
	}, {});

	return aEntries.length === bEntries.length && aEntries.every((entry) => {
		const bValue = bEntriesMap[entry[0]];
		if (entry[1] instanceof Uint8Array || bValue instanceof Uint8Array) {
			return binaryEquals(entry[1], bValue);
		}
		return typeof entry[1] === "object" || bValue === entry[1];
	});
};
