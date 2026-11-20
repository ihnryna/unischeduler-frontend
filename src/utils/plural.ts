/**
 * Ukrainian plural form for a count: `forms` are [one, few, many],
 * e.g. pluralUk(1, ['пара', 'пари', 'пар']) → 'пара', 3 → 'пари', 5 / 11 / 0 → 'пар'.
 */
export function pluralUk(count: number, forms: readonly [string, string, string]): string {
    const n = Math.abs(Math.trunc(count))
    const lastTwo = n % 100
    const last = n % 10

    if (lastTwo >= 11 && lastTwo <= 14) return forms[2]
    if (last === 1) return forms[0]
    if (last >= 2 && last <= 4) return forms[1]
    return forms[2]
}

/** "3 пари", "1 заняття" — the count followed by its plural form. */
export function countUk(count: number, forms: readonly [string, string, string]): string {
    return `${count} ${pluralUk(count, forms)}`
}
