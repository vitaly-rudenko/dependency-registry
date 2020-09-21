const DependencyRegistry = require('../lib/DependencyRegistry');
const Chromium = require('./Chromium');
const EventCapturer = require('./EventCapturer');
const EventCapturingManager = require('./EventCapturingManager');
const EventUrlBuilder = require('./EventUrlBuilder');
const Ffmpeg = require('./Ffmpeg');
const FfmpegWrapper = require('./FfmpegWrapper');
const ChromiumDriver = require('./vendor/ChromiumDriver');
const VideoDevice = require('./VideoDevice');

const dependencyRegistry = new DependencyRegistry();

dependencyRegistry.registerInstance(new EventUrlBuilder({ baseUrl: 'http://events-api' }));

dependencyRegistry.registerFactory(VideoDevice);
dependencyRegistry.registerFactory(Ffmpeg);
dependencyRegistry.registerFactory(ChromiumDriver);

// usage: ffmpegWrapperFactory.create()
dependencyRegistry.registerFactory(
    FfmpegWrapper, (dependencies) => new FfmpegWrapper(dependencies)
);

// usage: chromiumFactory.create(options)
dependencyRegistry.registerFactory(
    Chromium, (dependencies, options) => new Chromium(options, dependencies)
);

// usage: eventCapturerFactory.create(options)
dependencyRegistry.registerFactory(
    EventCapturer, (dependencies, options) => new EventCapturer(options, dependencies)
);

// More examples:

// dependencyRegistry.registerInstance('amqplib', amqplib)
// dependencyRegistry.registerInstance('fs', require('fs-extra'))

// usage: expressRouterFactory.create(...args)
// dependencyRegistry.registerFactory(
//     'expressRouterFactory',
//     (dependencies, ...args) => express.Router(...args)
// );

// usage: billingProvider.factory.create(10, 'days')
// dependencyRegistry.registerFactory(
//     BillingProvider,
//     (dependencies, amount, units) => new BillingProvider(amount, units, dependencies)
// );

/**
 * Registered dependencies:
 * - eventUrlBuilder
 * - videoDeviceFactory
 * - ffmpegFactory
 * - chromiumDriverFactory
 * - ffmpegWrapperFactory
 * - chromiumFactory
 * - eventCapturerFactory
 *
 * ```js
 * const { eventUrlBuilder, ffmpegFactory, chromiumFactory } = dependencyRegistry.export();
 *
 * console.log(
 *     eventUrlBuilder,
 *     ffmpegFactory.create(),
 *     chromiumFactory.create({ width: 1280, height: 720 })
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
