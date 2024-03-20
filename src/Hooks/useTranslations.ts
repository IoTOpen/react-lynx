type translationEntry = {
    count: number
    key: string
} | string

export const useTranslations = (entries: translationEntry[], t: (entry: translationEntry, options?: any) => string) => {
    const translations = entries.map((ent: translationEntry) => {
        if (typeof ent === 'string') {
            return {[ent]: t(ent)};
        }
        return ({[ent.key]: t(ent.key, {count: ent.count})});
    });
    return Object.assign({}, ...translations);
};
