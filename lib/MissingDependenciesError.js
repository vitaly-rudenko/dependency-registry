class MissingDependenciesError extends Error {
    constructor(dependencyNames) {
        super(`Missing dependenc${dependencyNames.length > 1 ? 'ies' : 'y'}: "${dependencyNames.join('", "')}"`);
    }
}

module.exports = MissingDependenciesError;
