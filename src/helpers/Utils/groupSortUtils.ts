export const DefaultGroupSort = {
	FIELD: 'Update Date',
	DIRECTION: 'desc',
} as const;

export const getSortTimeValue = (dateValue?: string | null): number | null => {
	if (!dateValue) return null;
	const parsed = Date.parse(dateValue);
	return Number.isNaN(parsed) ? null : parsed;
};

export const idTiebreak = <T>(a: T, b: T, idKey: string): number => {
	const aId = (a as unknown as Record<string, unknown>)[idKey];
	const bId = (b as unknown as Record<string, unknown>)[idKey];

	if (typeof aId === 'number' && typeof bId === 'number') {
		return bId - aId;
	}

	const aStr = aId === null || aId === undefined ? '' : String(aId);
	const bStr = bId === null || bId === undefined ? '' : String(bId);
	return bStr.localeCompare(aStr);
};

export const compareByUpdateDate = <T extends { UpdateDate?: string | null }>(
	a: T,
	b: T,
	direction: string,
	idKey: string = 'GroupID'
): number => {
	const aDate = getSortTimeValue(a.UpdateDate);
	const bDate = getSortTimeValue(b.UpdateDate);

	if (aDate === null && bDate === null) return idTiebreak(a, b, idKey);
	if (aDate === null) return 1;
	if (bDate === null) return -1;

	const diff = direction === 'asc' ? aDate - bDate : bDate - aDate;
	if (diff !== 0) return diff;
	return idTiebreak(a, b, idKey);
};

export const sortGroupsByUpdateDate = <T extends { UpdateDate?: string | null }>(
	list: T[],
	direction: string = DefaultGroupSort.DIRECTION,
	idKey: string = 'GroupID'
): T[] => {
	return [...list].sort((a, b) => compareByUpdateDate(a, b, direction, idKey));
};
