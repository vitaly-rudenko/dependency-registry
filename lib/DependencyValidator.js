const MissingDependenciesError = require('./MissingDependenciesError');

class DependencyValidator {
    require(dependencies) {
        const missingDependencyNames = [];

        for (const [dependencyName, dependency] of Object.entries(dependencies)) {
            if (dependency === undefined) {
                missingDependencyNames.push(dependencyName);
            }
        }

        if (missingDependencyNames.length > 0) {
            throw new MissingDependenciesError(missingDependencyNames);
        }
    }
}

module.exports = DependencyValidator;
