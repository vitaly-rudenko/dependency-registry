const DependencyRegistry = require('../lib/DependencyRegistry');
const DependencyValidator = require('../lib/DependencyValidator');
const Chromium = require('./Chromium');
const EventCapturer = require('./EventCapturer');
const EventCapturingManager = require('./EventCapturingManager');
const EventUrlBuilder = require('./EventUrlBuilder');
const Ffmpeg = require('./Ffmpeg');
const FfmpegWrapper = require('./FfmpegWrapper');
const ChromiumDriver = require('./vendor/ChromiumDriver');
const VideoDevice = require('./VideoDevice');

const dependencyRegistry = new DependencyRegistry();

// vendor / non-class instances
dependencyRegistry.registerNamedInstance('dependencyValidator', new DependencyValidator());

// class instances
dependencyRegistry.registerInstance(new EventUrlBuilder({ baseUrl: 'http://events-api' }));

// simple classes
dependencyRegistry.registerFactory(VideoDevice);
dependencyRegistry.registerFactory(Ffmpeg);

// vendor / non-classes / simple classes without dependencies
dependencyRegistry.registerSimpleProvider(
    'chromiumDriver', () => new ChromiumDriver()
);

// classes with complex dependencies
dependencyRegistry.registerComplexProvider(
    'customName',
    (dependencies) => () => new FfmpegWrapper(dependencies)
);
dependencyRegistry.registerComplexProvider(
    FfmpegWrapper,
    (dependencies) => () => new FfmpegWrapper(dependencies)
);
dependencyRegistry.registerComplexProvider(
    Chromium,
    (dependencies) => (options) => new Chromium(options, dependencies)
);
dependencyRegistry.registerComplexProvider(
    EventCapturer,
    (dependencies) => (options) => new EventCapturer(options, dependencies)
);

/**
 * Registered dependencies:
 * - dependencyValidator
 * - eventUrlBuilder
 * - videoDeviceFactory
 * - ffmpegFactory
 * - chromiumDriverProvider
 * - customNameProvider
 * - ffmpegWrapperProvider
 * - chromiumProvider
 * - eventCapturerProvider
 *
 * ```js
 * const { eventUrlBuilder, ffmpegFactory, chromiumProvider } = dependencyRegistry.export();
 *
 * console.log(
 *     eventUrlBuilder,
 *     ffmpegFactory.create(),
 *     chromiumProvider.create({ width: 1280, height: 720 })
 * );
 *
 * dependencies.unknownDependency // throws an error
 * const { unknownDependency } = dependencies; // throws an error
 * ```
 *
 * NOTE:
 * `DependencyRegistry#export()` returns a Proxy, so it's not a simple object.
 * You can't do things like `{ ... dependencies }`, `Object.entries(dependencies)`, etc.
 */

const eventCapturingManager = new EventCapturingManager(dependencyRegistry.export());

eventCapturingManager.startCapturing(
    'fake-event-id',
    {
        width: 1280,
        height: 720,
    }
);

setTimeout(() => {
    eventCapturingManager.stopCapturing('fake-event-id');
}, 2000);
