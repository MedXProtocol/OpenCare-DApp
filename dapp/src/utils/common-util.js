export const promisify = (inner) =>
    new Promise((resolve, reject) =>
    inner((err, res) => {
        if (err) { reject(err) }

        resolve(res);
    })
);

export const isNotEmptyString = (value) => {
    return value && value !== "";
}