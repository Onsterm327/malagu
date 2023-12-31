import { LoaderDefinition } from 'webpack';

export interface EventLoaderOptions {
    event: string;
}

const eventLoader: LoaderDefinition<EventLoaderOptions> = function (source, sourceMap) {
    const { event } = this.getOptions();
    const newSource = `module.exports = function() {
        global.short.on('${event}', async context => {
            ${source}
        });
    }`;
    this.callback(undefined, newSource, sourceMap);
};

export default eventLoader;
