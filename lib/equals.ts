// Compares two values deeply in one walk. Binary values (`Buffer` is a `Uint8Array`) compare by bytes, dates by time, sets and maps by their contents, and arrays only equal arrays.
const main = (a: any, b: any, seen: Map<any, Set<any>>): boolean => {
	if (a === b) {
		return true;
	}
	if (typeof a !== "object" || typeof b !== "object" || a === null || b === null) {
		// NaN is the only value that isn't equal to itself.
		return typeof a === "number" && typeof b === "number" && Number.isNaN(a) && Number.isNaN(b);
	}
	// `seen` holds every pair on the current comparison path (one object can be paired with several others at once), so a cycle counts as equal instead of recursing forever.
	let partners = seen.get(a);
	if (partners && partners.has(b)) {
		return true;
	}
	if (!partners) {
		partners = new Set();
		seen.set(a, partners);
	}
	partners.add(b);
	const result = compareObjects(a, b, seen);
	// Drop the pair on the way back up: a pair from a comparison that failed inside a Set must not count as equal for the next Set element.
	partners.delete(b);
	if (partners.size === 0) {
		seen.delete(a);
	}
	return result;
};

const compareObjects = (a: any, b: any, seen: Map<any, Set<any>>): boolean => {
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
		// An element both Sets hold matches itself. Each other element must match its own element of `b`, so a matched element is removed and can't match a second one.
		const unmatched = [...b].filter((bValue) => !a.has(bValue));
		return [...a].every((value) => {
			if (b.has(value)) {
				return true;
			}
			const index = unmatched.findIndex((bValue) => main(value, bValue, seen));
			if (index === -1) {
				return false;
			}
			unmatched.splice(index, 1);
			return true;
		});
	}
	if (a instanceof Map || b instanceof Map) {
		if (!(a instanceof Map && b instanceof Map) || a.size !== b.size) {
			return false;
		}
		// An entry whose key both Maps hold matches that key's entry in `b` when the values are equal. Each other entry must match its own entry of `b` by key and value (keys can be objects that are equal without being the same object), so a matched entry is removed and can't match a second one.
		const matchedKeys = new Set();
		const rest = [...a].filter(([key, value]) => {
			if (b.has(key) && main(value, b.get(key), seen)) {
				matchedKeys.add(key);
				return false;
			}
			return true;
		});
		const unmatched = [...b].filter(([bKey]) => !matchedKeys.has(bKey));
		return rest.every(([key, value]) => {
			const index = unmatched.findIndex(([bKey, bValue]) => main(key, bKey, seen) && main(value, bValue, seen));
			if (index === -1) {
				return false;
			}
			unmatched.splice(index, 1);
			return true;
		});
	}
	if (Array.isArray(a) !== Array.isArray(b)) {
		return false;
	}
	// `Object.keys` leaves out `length` and holes, so arrays that differ only in trailing holes would otherwise compare equal.
	if (Array.isArray(a) && a.length !== b.length) {
		return false;
	}

	const aKeys = Object.keys(a);
	return aKeys.length === Object.keys(b).length && aKeys.every((key) => Object.prototype.hasOwnProperty.call(b, key) && main(a[key], b[key], seen));
};

export = (a: any, b: any): boolean => main(a, b, new Map());
