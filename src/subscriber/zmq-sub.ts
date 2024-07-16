import { Subscriber } from "zeromq";
import { LogError, LogInfo } from "../utils/util";

export interface ZMQConfig {
    address: string;
    topics: string[];
    reconnectInterval?: number;
}

export class ZMQSubscriber {
    private sock: Subscriber;
    private isRunning: boolean = false;

    constructor(private config: ZMQConfig) {
        this.sock = new Subscriber();
        this.config.reconnectInterval = this.config.reconnectInterval ?? 1000 * 60 * 10;
    }

    public async start(): Promise<void> {
        this.isRunning = true;
        while (this.isRunning) {
            try {
                await this.connect();
                await this.listen();
            } catch (error) {
                LogError("ZMQ Subscriber encountered an error:", error);
                LogInfo(`Reconnecting in ${this.config.reconnectInterval}ms...`);
                await this.sleep(this.config.reconnectInterval!);
            }
        }
    }

    private async connect(): Promise<void> {
        this.sock.connect(this.config.address);
        this.config.topics.forEach((topic) => this.sock.subscribe(topic));
        LogInfo(`Connected to ${this.config.address} and listening for topics: ${this.config.topics.join(", ")}`);
    }

    private async listen(): Promise<void> {
        for await (const [topicBuffer, messageBuffer] of this.sock) {
            const topic = topicBuffer.toString();
            const message = messageBuffer.toString("hex");
            this.handleMessage(topic, message);
        }
    }

    private handleMessage(topic: string, message: string): void {
        LogInfo(`Received message on topic ${topic}: ${message}`);

        switch (topic) {
            case "hashblock":
                this.handleNewBlock(message);
                break;
            case "hashtx":
                this.handleNewTransaction(message);
                break;
            case "rawblock":
                this.handleNewRawBlock(message);
                break;
            case "rawtx":
                this.handleNewRawTransaction(message);
                break;
            case "sequence":
                this.handleNewSequence(message);
                break;
            default:
                LogError(`Unknown topic: ${topic}`);
        }
    }

    private handleNewBlock(blockHash: string): void {
        LogInfo(`New block detected: ${blockHash}`);
    }

    private handleNewTransaction(txHash: string): void {
        LogInfo(`New transaction detected: ${txHash}`);
    }

    private handleNewRawBlock(rawBlock: string): void {
        LogInfo(`New raw block detected: ${rawBlock}`);
    }

    private handleNewRawTransaction(rawTx: string): void {
        LogInfo(`New raw transaction detected: ${rawTx}`);
    }

    private handleNewSequence(sequence: string): void {
        LogInfo(`New sequence detected: ${sequence}`);
    }

    private sleep(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    public stop(): void {
        this.isRunning = false;
        this.sock.close();
    }
}

async function main() {
    const zmqConfig: ZMQConfig = {
        address: "tcp://127.0.0.1:39634",
        topics: ["hashblock", "hashtx", "rawblock", "rawtx", "sequence"],
        reconnectInterval: 1000 * 60 * 10,
    };

    const subscriber = new ZMQSubscriber(zmqConfig);
    await subscriber.start();
}

main().catch((error) => LogError("ZMQ Subscriber encountered an error:", error));
