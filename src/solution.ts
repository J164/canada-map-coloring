// Types
const enum Color {
	Red = 'red',
	Yellow = 'yellow',
	Green = 'green',
	Blue = 'blue',
}

type Territory = {
	name: TerritoryName;
	adjacents: Territory[];
	possibleColors: Color[];
	color?: Color;
};

type TerritoryName = (typeof NAMES)[number];

// Assumptions
const NAMES = [
	'Yukon',
	'BritishColumbia',
	'NorthwestTerritories',
	'Alberta',
	'Saskatchewan',
	'Nunavut',
	'Manitoba',
	'Ontario',
	'Quebec',
	'NewfoundlandAndLabrador',
	'PrinceEdwardsIsland',
	'NewBrunswick',
	'NovaScotia',
] as const;

const ADJACENTS = [
	['Yukon', 'BritishColumbia'],
	['Yukon', 'NorthwestTerritories'],
	['BritishColumbia', 'NorthwestTerritories'],
	['BritishColumbia', 'Alberta'],
	['Alberta', 'NorthwestTerritories'],
	['Alberta', 'Saskatchewan'],
	['NorthwestTerritories', 'Saskatchewan'],
	['NorthwestTerritories', 'Nunavut'],
	['Saskatchewan', 'Manitoba'],
	['Nunavut', 'Manitoba'],
	['Manitoba', 'Ontario'],
	['Ontario', 'Quebec'],
	['Quebec', 'NewfoundlandAndLabrador'],
	['Quebec', 'PrinceEdwardsIsland'],
	['Quebec', 'NewBrunswick'],
	['NewBrunswick', 'PrinceEdwardsIsland'],
	['NewBrunswick', 'NovaScotia'],
	['NovaScotia', 'PrinceEdwardsIsland'],
] satisfies Array<[TerritoryName, TerritoryName]>;

const KNOWN_COLORS = [
	['Yukon', [Color.Yellow]],
	['BritishColumbia', [Color.Green, Color.Yellow]],
] satisfies Array<[TerritoryName, Color[]]>;

// Build the map
const territoryMap = new Map<TerritoryName, Territory>();

for (const territoryName of NAMES) {
	const knownColor = KNOWN_COLORS.find(([name]) => {
		return name === territoryName;
	});

	territoryMap.set(territoryName, {
		name: territoryName,
		adjacents: [],
		possibleColors: knownColor ? knownColor[1] : [Color.Red, Color.Yellow, Color.Green, Color.Blue],
	});
}

for (const adjacent of ADJACENTS) {
	const territory1 = territoryMap.get(adjacent[0]);
	const territory2 = territoryMap.get(adjacent[1]);

	if (!territory1 || !territory2) {
		throw new Error('Territory List Incomplete');
	}

	territory1.adjacents.push(territory2);
	territory2.adjacents.push(territory1);
}

const territories = [...territoryMap.values()];

territories.sort((territory1, territory2) => {
	if (territory1.possibleColors.length < territory2.possibleColors.length) {
		return -1;
	}

	if (territory1.possibleColors.length > territory2.possibleColors.length) {
		return 1;
	}

	if (territory1.adjacents.length < territory2.adjacents.length) {
		return -1;
	}

	if (territory1.adjacents.length < territory2.adjacents.length) {
		return 1;
	}

	return 0;
});

// Color in the map
function solve(index = 0): boolean {
	if (index >= territories.length) {
		return true;
	}

	const activeTerritory = territories[index];

	for (const color of activeTerritory.possibleColors) {
		if (
			activeTerritory.adjacents.some((territory) => {
				return territory.color === color;
			})
		) {
			continue;
		}

		activeTerritory.color = color;
		if (solve(index + 1)) {
			return true;
		}
	}

	return false;
}

// Print the results
console.log(
	solve()
		? territories
				.map((territory) => {
					if (!territory.color) {
						throw new Error(`${territory.name} was not assigned a color`);
					}

					return `${territory.name} is ${territory.color}`;
				})
				.join('\n')
		: 'no solution',
);

// Validate
for (const activeTerritory of territories) {
	const fail = activeTerritory.adjacents.find((territory) => {
		return territory.color === activeTerritory.color;
	});

	if (fail) {
		throw new Error(`${activeTerritory.name} and ${fail.name} share the color ${activeTerritory.color ?? 'undefined'}`);
	}
}
