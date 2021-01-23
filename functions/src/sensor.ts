import * as admin from 'firebase-admin';

export class SensorMeasurement {
    constructor(
        public time: admin.firestore.Timestamp,
        public co2: number,
        public temperature: number,
        public humidity: number) {}

    static fromDocument(data: {time: admin.firestore.Timestamp, co2: number, temperature: number, humidity: number}): SensorMeasurement {
        return new SensorMeasurement(
            data.time,
            data.co2,
            data.temperature,
            data.humidity
        );
    }
}

export class Sensor {
    constructor(
        public id: string,
        public name: string,
        public description: string,
        public comment: string,
        public measurements: SensorMeasurement[]
    ) {}


    static fromDocument(id: string, data: admin.firestore.DocumentData | undefined): Sensor {
        return new Sensor(id, data?.name, data?.description, data?.comment, data?.measurements);
    }
}
