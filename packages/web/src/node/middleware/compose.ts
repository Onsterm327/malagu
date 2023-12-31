import { Context } from '../context';
import { Middleware } from './middleware-provider';

export function compose(middlewares: Middleware[]) {
    return (ctx: Context, next: Middleware) => {
        let index = -1;
        const dispatch = (i: number): Promise<void> => {
            if (i <= index) {
                return Promise.reject(new Error('next() called multiple times'));
            }
            index = i;
            let middleware = middlewares[i];
            if (i === middlewares.length) {
                middleware = next;
            }
            if (!middleware) {
                return Promise.resolve();
            }
            return middleware.handle(ctx, (): Promise<void> => dispatch(i + 1));
        };
        return dispatch(0);
    };
}
