export function LogInfo(msg?: any, ...optionalParams: any[]) {
    const blue = "\x1b[34m%s\x1b[0m"; // 设置蓝色
    const reset = "\x1b[0m"; // 重置颜色
    // 检查msg是否为对象，如果是，则使用JSON.stringify进行展开
    const message = typeof msg === "object" ? JSON.stringify(msg, null, 2) : msg;

    if (optionalParams.length > 0) {
        // 对于optionalParams中的每个对象，也应用相同的检查
        const params = optionalParams.map((param) =>
            typeof param === "object" ? JSON.stringify(param, null, 2) : param,
        );
        console.log(blue, `${new Date().toLocaleString()}`, message, ...params);
    } else {
        console.log(blue, `${new Date().toLocaleString()} ${message}${reset}`);
    }
}

export function LogError(msg?: any, ...optionalParams: any[]) {
    const red = "\x1b[31m%s\x1b[0m"; // 设置红色
    const reset = "\x1b[0m"; // 重置颜色
    if (optionalParams.length > 0) {
        console.error(red, `${new Date().toLocaleString()} `, msg, ...optionalParams);
    } else {
        console.error(red, `${new Date().toLocaleString()} ${msg}${reset}`);
    }
}

export function wrapAsync<T extends any[], R>(fn: (...args: T) => R): (...args: T) => Promise<R> {
    return (...args: T) => {
        return new Promise<R>((resolve, reject) => {
            try {
                const result = fn(...args);
                resolve(result);
            } catch (error) {
                reject(error);
            }
        });
    };
}

export function SleepSec(seconds: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
}

export function GetRandomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function GetRandomFloat(min: number, max: number): number {
    return Math.random() * (max - min) + min;
}
