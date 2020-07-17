import mongoose = require("mongoose");
import {Binary} from 'mongodb';

export class MUUID extends mongoose.SchemaType {
    subtype: any = Binary.SUBTYPE_UUID;

    constructor(key: string, options?: any) {
        super(key, options, 'MUUID');
    }

    cast(uuid: any): string | Binary {
        if (uuid instanceof Binary || uuid._bsontype === 'Binary') {
            if (uuid.sub_type === Binary.SUBTYPE_UUID_OLD) {
                let hex: string = uuid.toString('hex');
                let msb: string = hex.substr(0, 16);
                let lsb: string = hex.substr(16, 16);
                msb = msb.substr(14, 2) + msb.substr(12, 2) + msb.substr(10, 2) + msb.substr(8, 2) + msb.substr(6, 2) + msb.substr(4, 2) + msb.substr(2, 2) + msb.substr(0, 2);
                lsb = lsb.substr(14, 2) + lsb.substr(12, 2) + lsb.substr(10, 2) + lsb.substr(8, 2) + lsb.substr(6, 2) + lsb.substr(4, 2) + lsb.substr(2, 2) + lsb.substr(0, 2);
                hex = msb + lsb;
                return hex.substr(0, 8) + '-' + hex.substr(8, 4) + '-' + hex.substr(12, 4) + '-' + hex.substr(16, 4) + '-' + hex.substr(20, 12);

            } else if (uuid.sub_type === Binary.SUBTYPE_UUID) {
                let hex: string = uuid.toString('hex');
                return hex.substr(0, 8) + '-' + hex.substr(8, 4) + '-' + hex.substr(12, 4) + '-' + hex.substr(16, 4) + '-' + hex.substr(20, 12);

            } else {
                throw new Error("UUID is neither subtype 0x03 or 0x04");
            }
        } else if (typeof uuid === "string") {
            this.MUUIDToBinary(uuid)
        }
        return "Invalid UUI";
    }

    MUUIDToBinary(uuid: string): Binary {
        if (!this.validateUuid(uuid)) throw new Error("Invalid UUID String.");
        const normalized = this.normalize(uuid);
        if (!normalized) throw new Error("Invalid Hex String.");
        return new Binary(Buffer.from(normalized, 'hex'), this.subtype);
    }

    private validateUuid(uuid: string): boolean {
        return !!/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.exec(uuid);
    }

    private normalize(string: string): string {
        const stripped: string = string.replace(/-/g, '').toLowerCase();
        if (!stripped.match(/^[a-f0-9]{32}$/)) throw new Error("Invalid UUID.");
        return stripped;
    }
}

export function assignSchemaType() {
    // @ts-ignore
    mongoose.Schema.Types.MUUID = MUUID;
}

/* Credit: The subtype 3 conversion was taken from: https://github.com/mongodb/mongo-csharp-driver/blob/579a295c734ca96ce88682b155a2656310f7a76e/uuidhelpers.js
 * The uuid validator and normalize function was taken from here: https://github.com/cdimascio/uuid-mongodb/blob/17c840a8fef2f465c4e20f928dd96bcaf1e3bac1/lib/index.js
 * Otherwise:
 * Author: gmax9803 (https://github.com/gmax9803)
 */