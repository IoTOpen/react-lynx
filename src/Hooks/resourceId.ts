export const parseResourceId = (value: number | string, name: string): number => {
    const id = typeof value === 'string' ? Number.parseInt(value) : value;

    if (Number.isNaN(id)) {
        throw new Error(`invalid ${name}`);
    }

    return id;
};
