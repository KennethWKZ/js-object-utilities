// Compares two values deeply in one walk. Binary values (`Buffer` is a `Uint8Array`) compare by bytes, dates by time, sets and maps by their contents, and arrays only equal arrays. `seen` pairs the objects already being compared, so a cycle doesn't recurse forever.
const main = (a: any, b: any, seen: Map<any, any>): boolean => {
	if (a === b) {
		return true;
	}
	if (typeof a !== "object" || typeof b !== "object" || a === null || b === null) {
		// NaN is the only value that isn't equal to itself.
		return typeof a === "number" && typeof b === "number" && Number.isNaN(a) && Number.isNaN(b);
	}
	if (seen.get(a) === b) {
		return true;
	}
	seen.set(a, b);

	if (a instanceof Uint8Array || b instanceof Uint8Array) {
		return a instanceof Uint8Array && b instanceof Uint8Array && a.length === b.length && a.every((byte, index) => byte === b[index]);
	}
	if (a instanceof Date || b instanceof Date) {
		return a instanceof Date && b instanceof Date && a.getTime() === b.getTime();
	}
	if (a instanceof Set || b instanceof Set) {
		if (!(a instanceof Set && b instanceof Set) || a.size !== b.size) {
			return false;
		}
		const bValues = [...b];
		return [...a].every((value) => b.has(value) || bValues.some((bValue) => main(value, bValue, seen)));
	}
	if (a instanceof Map || b instanceof Map) {
		return a instanceof Map && b instanceof Map && a.size === b.size && [...a].every(([key, value]) => b.has(key) && main(value, b.get(key), seen));
	}
	if (Array.isArray(a) !== Array.isArray(b)) {
		return false;
	}

	const aKeys = Object.keys(a);
	return aKeys.length === Object.keys(b).length && aKeys.every((key) => Object.prototype.hasOwnProperty.call(b, key) && main(a[key], b[key], seen));
};

export = (a: any, b: any): boolean => main(a, b, new Map());
