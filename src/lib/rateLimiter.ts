export class RateLimiter {
    private timestamps: number[] = [];
    private readonly limit: number;
    private readonly interval: number;

    constructor(limit: number, interval: number) {
        this.limit = limit;
        this.interval = interval;
    }

    canMakeRequest(): boolean {
        const now = Date.now();
        this.timestamps = this.timestamps.filter(t => now - t < this.interval);
        if (this.timestamps.length < this.limit) {
            this.timestamps.push(now);
            return true;
        }
        return false;
    }
}

export const urlCheckRateLimiter = new RateLimiter(5, 60000); // 5 requests per minute
