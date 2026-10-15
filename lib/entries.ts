import {GeneralObjectOrValue} from "./types";

// Tracks the objects on the current recursion path so a cycle is detected in O(1) per node. Each node is removed on the way back up, so sibling references to the same (non-cyclic) object are still descended into.
const main = <T>(object: GeneralObjectOrValue<T>, existingKey: string, ancestors: Set<unknown>): [string, GeneralObjectOrValue<T>][] => {
	const accumulator: [string, GeneralObjectOrValue<T>][] = [];
	ancestors.add(object);
	Object.entries(object).forEach(([key, value]) => {
		const keyWithExisting = `${existingKey ? `${existingKey}.` : ""}${key}`;
		accumulator.push([keyWithExisting, value]);

		if (typeof value === "object" && !(value instanceof Buffer) && value !== null && !ancestors.has(value)) {
			main(value, keyWithExisting, ancestors).forEach((entry) => accumulator.push(entry));
		}
	});
	ancestors.delete(object);
	return accumulator;
};

export = <T>(object: GeneralObjectOrValue<T>, existingKey = ""): [string, GeneralObjectOrValue<T>][] => main(object, existingKey, new Set());
